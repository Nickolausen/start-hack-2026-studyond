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
import { Thread, type ThreadDoc } from '../models/Thread.js';
import {
  searchDatabaseTool,
  getEntityDetailsTool,
  listFieldsTool,
  getRoadmapStateTool,
} from '../tools/searchDatabase.js';

export const chatRouter = Router();

// ---- System prompt ----

const SEARCH_SYSTEM_PROMPT = `You are Studyond's AI thesis advisor — warm, direct, and knowledgeable about Swiss academia and industry.

## Your Role
Help students navigate the thesis journey: choosing a field, finding companies, experts, supervisors, and ultimately a thesis topic.

## Thesis Journey Dependency Graph
The student's roadmap has 5 steps with strict dependencies:
  - Field → Company → Expert → Topic  (industry path)
  - Field → Supervisor → Topic         (academic path)
  - Or a mix: Company → Expert → Topic, Supervisor → Topic, or directly to Topic

When a student commits to an entity, parent dependencies are auto-committed.
When they uncommit an entity, downstream dependents are cascaded-uncommitted.

## Guided Routing
- For NEW students (no committed steps): Default to suggesting they start by choosing a **Field** of study. Use listFields to show available fields. This is the most productive starting point.
- If they already have a Field: Suggest Companies OR Supervisors as next steps (depending on their objectives).
- If they have a Company: Suggest Experts at that company.
- If they have a Supervisor or Expert: Suggest Topics.
- ALWAYS check the student's current roadmap state to tailor recommendations.
- The student CAN skip ahead (e.g. directly search for topics) — don't block them, but mention what parent steps will be auto-committed.

## Workflow
1. When the student asks about thesis opportunities, ALWAYS call searchDatabase first.
2. Use listFields when the student needs to choose a field or is just starting.
3. Use getRoadmapState to check what they've already committed before recommending.
4. Use only entity IDs returned by tools — never invent IDs.
5. After searching, output a short encouraging 1-2 sentence response, then the match cards JSON block.
6. Use getEntityDetails for deeper information about a specific entity.
7. Be efficient — one or two tool calls per turn is enough.

## Match Card Format
After your text response, output a fenced JSON block like this:

\`\`\`json
{
  "matches": [
    {
      "id": "match-<unique-suffix>",
      "entityType": "topic",
      "entityId": "topic-07",
      "name": "Swisscom",
      "subtitle": "Telecommunications · IT Services",
      "imageUrl": null,
      "compatibilityScore": 4.2,
      "description": "2-3 sentences explaining why this is a great match.",
      "tags": ["#FederatedLearning", "#Hybrid", "#Privacy"],
      "topicTitle": "Federated Learning for Telecom Network Optimization",
      "university": null,
      "companyId": "company-04",
      "fieldIds": ["field-01", "field-03"],
      "supervisorIds": [],
      "expertIds": ["expert-07"]
    }
  ]
}
\`\`\`

## Match Card Rules
- Generate 5-8 cards per response, sorted by compatibilityScore DESCENDING
- compatibilityScore: 1.0–5.0 scale with meaningful differentiation
  * 4.5–5.0 = exceptional alignment
  * 3.5–4.4 = good match
  * 2.5–3.4 = moderate match
  * 1.5–2.4 = weak match
  NEVER give every card above 4.0.
- entityType: "field", "topic", "supervisor", "company", or "expert"
- entityId MUST be a real ID from tool results
- For field cards: name = field name; no topicTitle
- For topic cards: name = company/university name; topicTitle = thesis title; include companyId, supervisorIds, expertIds, fieldIds from DB
- For supervisor cards: name = "Prof. Dr. First Last"; university = university name; include fieldIds
- For company cards: name = company name; topicTitle = null
- For expert cards: name = "First Last"; subtitle = "Title at Company"; include companyId, fieldIds
- tags: specific hashtags like #NLP, #Remote, #Fintech, #Python
- descriptions must reference the student's specific skills and interests
- ALWAYS output the JSON block — the UI depends on it
- ALWAYS include fieldIds, companyId, supervisorIds, expertIds when available from DB data — the commit engine needs these for dependency resolution
- Tone: warm, peer-like. Short sentences.`;

// ---- Build enriched context from DB ----

async function buildEnrichedContext(baseContext: string, studentId: string): Promise<string> {
  try {
    const student = await Student.findOne({ id: studentId }).lean();
    if (!student) return baseContext;

    const steps = student.roadmapSteps as RoadmapStepDoc[];
    const committedSteps = steps.filter(
      (s: RoadmapStepDoc) => s.status === 'committed' && s.committedEntityId
    );

    if (committedSteps.length === 0 && !baseContext) {
      return `Student ID: ${studentId}\nNo committed steps yet — this is a fresh start. Guide them to choose a Field first.`;
    }

    const threads = committedSteps
      .filter((s: RoadmapStepDoc) => s.committedThreadId)
      .map((s: RoadmapStepDoc) => s.committedThreadId!);

    const threadDocs: ThreadDoc[] = threads.length > 0
      ? await Thread.find({ id: { $in: threads } }).lean()
      : [];
    const threadMap = new Map(threadDocs.map((t: ThreadDoc) => [t.id, t]));

    const commitLines = committedSteps
      .map((step: RoadmapStepDoc) => {
        const t = step.committedThreadId ? threadMap.get(step.committedThreadId) : null;
        const entityDetail = step.committedEntityName ?? step.committedEntityId ?? 'unknown';
        const threadDetail = t?.card.topicTitle
          ? ` — Topic: "${t.card.topicTitle}"`
          : '';
        return `  ✓ ${step.label}: ${entityDetail} (${step.id}: ${step.committedEntityId})${threadDetail}`;
      })
      .join('\n');

    const openSteps = steps
      .filter((s: RoadmapStepDoc) => s.status === 'open')
      .map((s: RoadmapStepDoc) => `  ○ ${s.label} (${s.id})`);

    let context = baseContext || '';
    context += `\n\n## Current Roadmap State`;
    context += `\nStudent ID: ${studentId}`;

    if (commitLines) {
      context += `\nCommitted:\n${commitLines}`;
    }
    if (openSteps.length > 0) {
      context += `\nStill searching:\n${openSteps.join('\n')}`;
    }
    context += `\nTailor recommendations to complement existing decisions. Suggest the most logical next step.`;

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
