import { Router, type Request, type Response } from 'express';
import { mistral } from '@ai-sdk/mistral';
import {
  streamText,
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  stepCountIs,
  type UIMessage,
} from 'ai';
import { Student, type RoadmapStepDoc } from '../models/Student.js';
import {
  searchDatabaseTool,
  getEntityDetailsTool,
  listFieldsTool,
  getRoadmapStateTool,
} from '../tools/searchDatabase.js';

export const chatRouter = Router();

// ---- System prompt (tighter, more directive) ----

const SEARCH_SYSTEM_PROMPT = `You are Studyond's AI thesis advisor — warm, direct, knowledgeable about Swiss academia and industry.

## Rules
1. ALWAYS call searchDatabase before generating match cards. Never skip this.
2. Only use entity IDs returned by tool results. NEVER invent or guess IDs.
3. Copy entity metadata (fieldIds, companyId, supervisorIds, expertIds) EXACTLY as returned by the search tool. Do NOT modify or omit these arrays.
4. Use listFields when the student is starting out or needs to choose a field.
5. Use getRoadmapState to check committed steps before recommending.
6. Use getEntityDetails only when the student asks for deeper info on one entity.
7. One or two tool calls per turn is enough.

## Guided Routing
- No committed steps → suggest choosing a Field first (use listFields).
- Has Field → suggest Companies or Supervisors.
- Has Company → suggest Experts at that company.
- Has Supervisor or Expert → suggest Topics.
- Student CAN skip ahead — don't block them.

## Filtering by Committed Steps
When the student has committed steps, their search constraints are MANDATORY.
- If fieldId constraint is given, ALWAYS pass it to searchDatabase.
- If companyId constraint is given, ALWAYS pass it when searching experts/topics.
- NEVER show entities outside the committed field unless the student explicitly asks to explore other fields.
- If all steps are committed (topic found), congratulate and do NOT generate new match cards.

## Response Format
After your short 1–2 sentence text response, output EXACTLY this JSON block:

\`\`\`json
{
  "matches": [
    {
      "id": "match-<unique>",
      "entityType": "field" | "topic" | "supervisor" | "company" | "expert",
      "entityId": "<ID from tool results>",
      "name": "<display name>",
      "subtitle": "<short descriptor>",
      "imageUrl": null,
      "compatibilityScore": <1.0-5.0>,
      "description": "<2-3 sentences why this matches the student>",
      "tags": ["#Tag1", "#Tag2"],
      "topicTitle": "<thesis title or null>",
      "university": "<university name or null>",
      "companyId": "<from DB or null>",
      "fieldIds": ["<from DB>"],
      "supervisorIds": ["<from DB>"],
      "expertIds": ["<from DB>"]
    }
  ]
}
\`\`\`

## Match Card Rules
- 5–8 cards per response, sorted by compatibilityScore DESC.
- Score spread: 4.5–5.0 exceptional, 3.5–4.4 good, 2.5–3.4 moderate, 1.5–2.4 weak. Do NOT give every card above 4.0.
- entityId MUST come from tool results.
- field cards: name = field name, topicTitle = null.
- topic cards: name = company/university name, topicTitle = thesis title, include companyId/supervisorIds/expertIds/fieldIds from DB.
- supervisor cards: name = "Prof. Dr. First Last", university = university name, include fieldIds.
- company cards: name = company name, topicTitle = null.
- expert cards: name = "First Last", subtitle = "Title at Company", include companyId/fieldIds.
- tags: specific hashtags (#NLP, #Remote, #Fintech, #Python).
- ALWAYS output the JSON block — the UI depends on it.
- ALWAYS include fieldIds, companyId, supervisorIds, expertIds when available — the commit engine needs them.`;

// ---- Build enriched context with MANDATORY search constraints ----

async function buildEnrichedContext(baseContext: string, studentId: string): Promise<string> {
  try {
    const student = await Student.findOne({ id: studentId }).lean();
    if (!student) return baseContext;

    const steps = student.roadmapSteps as RoadmapStepDoc[];

    // Build a map of committed steps keyed by step id
    const committedMap: Record<string, { entityId: string; entityName: string }> = {};
    for (const step of steps) {
      if (step.status === 'committed' && step.committedEntityId) {
        committedMap[step.id] = {
          entityId: step.committedEntityId,
          entityName: step.committedEntityName ?? step.committedEntityId,
        };
      }
    }

    const committedSteps = steps.filter(
      (s: RoadmapStepDoc) => s.status === 'committed' && s.committedEntityId,
    );

    if (committedSteps.length === 0 && !baseContext) {
      return `Student ID: ${studentId}\nNo committed steps yet — this is a fresh start. Guide them to choose a Field first.`;
    }

    // ---- Build HARD constraints from committed steps ----
    const constraints: string[] = [];

    if (committedMap.field) {
      constraints.push(
        `MANDATORY: Student committed to field "${committedMap.field.entityName}" (${committedMap.field.entityId}). When calling searchDatabase, you MUST pass fieldId="${committedMap.field.entityId}". Do NOT show results outside this field.`,
      );
    }
    if (committedMap.company) {
      constraints.push(
        `MANDATORY: Student committed to company "${committedMap.company.entityName}" (${committedMap.company.entityId}). When searching for experts or topics at this company, pass companyId="${committedMap.company.entityId}".`,
      );
    }
    if (committedMap.supervisor) {
      constraints.push(
        `Student already has supervisor "${committedMap.supervisor.entityName}". Prefer topics supervised by this person. Do NOT suggest other supervisors unless asked.`,
      );
    }
    if (committedMap.expert) {
      constraints.push(
        `Student already has expert "${committedMap.expert.entityName}". Do NOT suggest other experts unless asked.`,
      );
    }
    if (committedMap.topic) {
      constraints.push(
        `Student already committed to topic "${committedMap.topic.entityName}". Their thesis journey is complete — congratulate them and help with next steps.`,
      );
    }

    // ---- Build next-step suggestion ----
    const openStepIds = steps.filter((s: RoadmapStepDoc) => s.status === 'open').map((s: RoadmapStepDoc) => s.id);
    let nextStepHint = '';

    if (openStepIds.length > 0) {
      if (!committedMap.field && openStepIds.includes('field')) {
        nextStepHint = 'The student has not chosen a field yet. Start by suggesting fields (use listFields tool).';
      } else if (committedMap.field && !committedMap.company && !committedMap.supervisor && openStepIds.includes('company')) {
        nextStepHint = `Suggest companies or supervisors in the "${committedMap.field.entityName}" field. Use searchDatabase with fieldId="${committedMap.field.entityId}".`;
      } else if (committedMap.company && !committedMap.expert && openStepIds.includes('expert')) {
        nextStepHint = `Suggest experts at "${committedMap.company.entityName}". Use searchDatabase with companyId="${committedMap.company.entityId}" and entityTypes=["expert"].`;
      } else if ((committedMap.supervisor || committedMap.expert) && !committedMap.topic && openStepIds.includes('topic')) {
        nextStepHint = `Suggest thesis topics. Use searchDatabase with fieldId="${committedMap.field?.entityId ?? ''}"${committedMap.company ? ` and companyId="${committedMap.company.entityId}"` : ''}.`;
      }
    }

    // ---- Build committed/open step listings ----
    const commitLines = committedSteps
      .map((step: RoadmapStepDoc) => {
        const name = step.committedEntityName ?? step.committedEntityId ?? 'unknown';
        return `  - ${step.label}: ${name} (${step.id}: ${step.committedEntityId})`;
      })
      .join('\n');

    const openSteps = steps
      .filter((s: RoadmapStepDoc) => s.status === 'open')
      .map((s: RoadmapStepDoc) => `  - ${s.label} (${s.id})`);

    // ---- Assemble the context string ----
    let context = baseContext || '';
    context += `\n\nStudent ID: ${studentId}`;

    if (constraints.length > 0) {
      context += `\n\n## SEARCH CONSTRAINTS (MANDATORY — DO NOT IGNORE)\n${constraints.join('\n')}`;
    }

    if (nextStepHint) {
      context += `\n\n## Suggested Next Step\n${nextStepHint}`;
    }

    if (commitLines) {
      context += `\n\n## Committed Steps\n${commitLines}`;
    }

    if (openSteps.length > 0) {
      context += `\n\n## Open Steps\n${openSteps.join('\n')}`;
    }

    return context;
  } catch (err) {
    console.warn('[Chat] Could not enrich context:', err);
    return baseContext;
  }
}

// ---- POST /api/chat ----

chatRouter.post('/', async (req: Request, res: Response) => {
  const { messages, systemContext, studentId, mode = 'search' } = req.body as {
    messages?: UIMessage[];
    systemContext?: string;
    studentId?: string;
    mode?: 'search';
  };

  console.log(`[Chat] mode=${mode} studentId=${studentId ?? 'none'} messages=${messages?.length ?? 0}`);

  // Convert UIMessages to core messages
  const coreMessages = (messages ?? [])
    .map((m: UIMessage) => {
      const textPart = m.parts?.find((p: { type: string }) => p.type === 'text') as
        | { type: 'text'; text: string }
        | undefined;
      return { role: m.role as 'user' | 'assistant', content: textPart?.text ?? '' };
    })
    .filter((m) => m.content && (m.role === 'user' || m.role === 'assistant'));

  console.log(`[Chat] Core messages: ${coreMessages.map((m) => `${m.role}:"${m.content.slice(0, 40)}"`).join(', ')}`);

  try {
    const enrichedContext = studentId
      ? await buildEnrichedContext(systemContext ?? '', studentId)
      : systemContext ?? '';

    const systemPrompt = SEARCH_SYSTEM_PROMPT + (enrichedContext ? `\n\n${enrichedContext}` : '');

    const result = streamText({
      model: mistral('mistral-large-latest'),
      temperature: 0.3,
      system: systemPrompt,
      messages: coreMessages,
      maxOutputTokens: 2500,
      stopWhen: stepCountIs(15),
      tools: {
        searchDatabase: searchDatabaseTool,
        getEntityDetails: getEntityDetailsTool,
        listFields: listFieldsTool,
        getRoadmapState: getRoadmapStateTool,
      },
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls && toolCalls.length > 0) {
          const toolName = (toolCalls[0] as { toolName?: string }).toolName ?? 'unknown';
          console.log(`[Chat] Tool call: "${toolName}"`);
        }
      },
    });

    pipeUIMessageStreamToResponse({
      response: res,
      stream: createUIMessageStream({
        execute: async ({ writer }) => {
          writer.merge(result.toUIMessageStream());
        },
      }),
    });
  } catch (error) {
    console.error('[Chat] Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate response' });
    }
  }
});
