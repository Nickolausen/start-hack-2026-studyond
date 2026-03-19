import { Router, type Request, type Response } from 'express';
import { mistral } from '@ai-sdk/mistral';
import { generateText } from 'ai';
import { Topic, type TopicDoc } from '../models/Topic.js';
import { Supervisor, type SupervisorDoc } from '../models/Supervisor.js';
import { Company, type CompanyDoc } from '../models/Company.js';
import { Expert, type ExpertDoc } from '../models/Expert.js';
import { Field, type FieldDoc } from '../models/Field.js';
import { University, type UniversityDoc } from '../models/University.js';
import { Thread } from '../models/Thread.js';

export const threadChatRouter = Router();

/* ------------------------------------------------------------------ */
/*  Helper: resolve field IDs → names                                 */
/* ------------------------------------------------------------------ */
async function resolveFieldNames(fieldIds: string[]): Promise<string[]> {
  if (!fieldIds.length) return [];
  const fields = (await Field.find({ id: { $in: fieldIds } }).lean()) as FieldDoc[];
  return fields.map(f => f.name);
}

/* ------------------------------------------------------------------ */
/*  Helper: resolve supervisor IDs → display strings                  */
/* ------------------------------------------------------------------ */
async function resolveSupervisorNames(supervisorIds: string[]): Promise<string[]> {
  if (!supervisorIds.length) return [];
  const sups = (await Supervisor.find({ id: { $in: supervisorIds } }).lean()) as SupervisorDoc[];
  return sups.map(s => `${s.title} ${s.firstName} ${s.lastName}`);
}

/* ------------------------------------------------------------------ */
/*  Helper: resolve expert IDs → display strings                      */
/* ------------------------------------------------------------------ */
async function resolveExpertNames(expertIds: string[]): Promise<string[]> {
  if (!expertIds.length) return [];
  const exps = (await Expert.find({ id: { $in: expertIds } }).lean()) as ExpertDoc[];
  return exps.map(e => `${e.title} ${e.firstName} ${e.lastName}`);
}

/* ------------------------------------------------------------------ */
/*  DB enrichment: build a detailed context string per entity type     */
/* ------------------------------------------------------------------ */
async function buildDbContext(
  entityType: string,
  entityId: string | undefined,
): Promise<string> {
  if (!entityId) return '';

  try {
    switch (entityType) {
      case 'topic': {
        const topic = (await Topic.findOne({ id: entityId }).lean()) as TopicDoc | null;
        if (!topic) return '';

        const [companyName, universityName, supervisorNames, expertNames, fieldNames] =
          await Promise.all([
            topic.companyId
              ? Company.findOne({ id: topic.companyId }).lean().then(c => (c as CompanyDoc | null)?.name ?? 'Unknown')
              : Promise.resolve(null),
            topic.universityId
              ? University.findOne({ id: topic.universityId }).lean().then(u => (u as UniversityDoc | null)?.name ?? 'Unknown')
              : Promise.resolve(null),
            resolveSupervisorNames(topic.supervisorIds),
            resolveExpertNames(topic.expertIds),
            resolveFieldNames(topic.fieldIds),
          ]);

        return [
          `## Full Database Record — Topic`,
          `Title: ${topic.title}`,
          `Description: ${topic.description}`,
          `Type: ${topic.type}`,
          `Employment: ${topic.employment}`,
          topic.employmentType ? `Employment Type: ${topic.employmentType}` : null,
          topic.workplaceType ? `Workplace Type: ${topic.workplaceType}` : null,
          topic.degrees.length ? `Degrees: ${topic.degrees.join(', ')}` : null,
          companyName ? `Company: ${companyName}` : null,
          universityName ? `University: ${universityName}` : null,
          supervisorNames.length ? `Supervisors: ${supervisorNames.join('; ')}` : null,
          expertNames.length ? `Experts: ${expertNames.join('; ')}` : null,
          fieldNames.length ? `Fields: ${fieldNames.join(', ')}` : null,
        ].filter(Boolean).join('\n');
      }

      case 'company': {
        const company = (await Company.findOne({ id: entityId }).lean()) as CompanyDoc | null;
        if (!company) return '';

        const [topics, experts] = await Promise.all([
          Topic.find({ companyId: entityId }).lean() as Promise<TopicDoc[]>,
          Expert.find({ companyId: entityId }).lean() as Promise<ExpertDoc[]>,
        ]);

        return [
          `## Full Database Record — Company`,
          `Name: ${company.name}`,
          `Description: ${company.description}`,
          company.about ? `About: ${company.about}` : null,
          company.size ? `Size: ${company.size}` : null,
          company.domains.length ? `Domains: ${company.domains.join(', ')}` : null,
          topics.length ? `Topics (${topics.length}): ${topics.map(t => t.title).join('; ')}` : `Topics: none listed`,
          experts.length ? `Experts (${experts.length}): ${experts.map(e => `${e.title} ${e.firstName} ${e.lastName}`).join('; ')}` : `Experts: none listed`,
        ].filter(Boolean).join('\n');
      }

      case 'supervisor': {
        const supervisor = (await Supervisor.findOne({ id: entityId }).lean()) as SupervisorDoc | null;
        if (!supervisor) return '';

        const [university, topics, fieldNames] = await Promise.all([
          University.findOne({ id: supervisor.universityId }).lean() as Promise<UniversityDoc | null>,
          Topic.find({ supervisorIds: entityId }).lean() as Promise<TopicDoc[]>,
          resolveFieldNames(supervisor.fieldIds),
        ]);

        return [
          `## Full Database Record — Supervisor`,
          `Name: ${supervisor.title} ${supervisor.firstName} ${supervisor.lastName}`,
          `Email: ${supervisor.email}`,
          university ? `University: ${university.name} (${university.country})` : null,
          supervisor.researchInterests.length ? `Research Interests: ${supervisor.researchInterests.join(', ')}` : null,
          supervisor.about ? `About: ${supervisor.about}` : null,
          supervisor.objectives.length ? `Objectives: ${supervisor.objectives.join('; ')}` : null,
          fieldNames.length ? `Fields: ${fieldNames.join(', ')}` : null,
          topics.length ? `Supervises Topics (${topics.length}): ${topics.map(t => t.title).join('; ')}` : `Supervises Topics: none listed`,
        ].filter(Boolean).join('\n');
      }

      case 'expert': {
        const expert = (await Expert.findOne({ id: entityId }).lean()) as ExpertDoc | null;
        if (!expert) return '';

        const [company, fieldNames] = await Promise.all([
          Company.findOne({ id: expert.companyId }).lean() as Promise<CompanyDoc | null>,
          resolveFieldNames(expert.fieldIds),
        ]);

        return [
          `## Full Database Record — Expert`,
          `Name: ${expert.title} ${expert.firstName} ${expert.lastName}`,
          `Email: ${expert.email}`,
          company ? `Company: ${company.name}` : null,
          `Offers Interviews: ${expert.offerInterviews ? 'Yes' : 'No'}`,
          expert.about ? `About: ${expert.about}` : null,
          expert.objectives.length ? `Objectives: ${expert.objectives.join('; ')}` : null,
          fieldNames.length ? `Fields: ${fieldNames.join(', ')}` : null,
        ].filter(Boolean).join('\n');
      }

      case 'field': {
        const field = (await Field.findOne({ id: entityId }).lean()) as FieldDoc | null;
        if (!field) return '';

        const [topicCount, supervisorCount, companyCount] = await Promise.all([
          Topic.countDocuments({ fieldIds: entityId }),
          Supervisor.countDocuments({ fieldIds: entityId }),
          // Companies don't have fieldIds directly — count via topics
          Topic.distinct('companyId', { fieldIds: entityId, companyId: { $ne: null } }).then(ids => ids.length),
        ]);

        return [
          `## Full Database Record — Field`,
          `Name: ${field.name}`,
          `Topics in this field: ${topicCount}`,
          `Supervisors in this field: ${supervisorCount}`,
          `Companies with topics in this field: ${companyCount}`,
        ].join('\n');
      }

      default:
        return '';
    }
  } catch (err) {
    console.error(`[ThreadChat] DB enrichment failed for ${entityType}/${entityId}:`, err);
    return '';
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/thread-chat                                              */
/* ------------------------------------------------------------------ */
threadChatRouter.post('/', async (req: Request, res: Response) => {
  const {
    message,
    threadContext,
    systemContext,
    suggestQuestions,
    roadmapContext,
    threadId,
    studentId,
  } = req.body as {
    message?: string;
    suggestQuestions?: boolean;
    threadContext?: {
      entityName: string;
      entityType: string;
      entityId?: string;
      topicTitle?: string;
      description: string;
      tags: string[];
      compatibilityScore?: number;
      companyId?: string;
      companyName?: string;
      universityName?: string;
      fieldIds?: string[];
      supervisorIds?: string[];
      expertIds?: string[];
    };
    systemContext?: string;
    roadmapContext?: {
      committedSteps: Array<{ id: string; label: string; entityName: string | null }>;
      openSteps: Array<{ id: string; label: string }>;
    };
    threadId?: string;
    studentId?: string;
  };

  if (!threadContext) {
    res.status(400).json({ error: 'threadContext is required' });
    return;
  }

  console.log(
    `[ThreadChat] ${suggestQuestions ? 'Generating questions' : 'User message'} for "${threadContext.entityName}" (${threadContext.entityType})`,
  );

  try {
    /* -------------------------------------------------------------- */
    /*  Fetch DB enrichment (used by both branches)                    */
    /* -------------------------------------------------------------- */
    const dbContext = await buildDbContext(
      threadContext.entityType,
      threadContext.entityId,
    );

    /* -------------------------------------------------------------- */
    /*  Branch A: Suggest questions                                    */
    /* -------------------------------------------------------------- */
    if (suggestQuestions) {
      const roadmapInfo = roadmapContext
        ? `\nStudent's roadmap: ${roadmapContext.committedSteps.map(s => `${s.label}: ${s.entityName}`).join(', ')}. Still searching: ${roadmapContext.openSteps.map(s => s.label).join(', ')}.`
        : '';

      const questionsPrompt = `You are helping a student explore a thesis opportunity.

Entity: ${threadContext.entityName} (${threadContext.entityType})
${threadContext.topicTitle ? `Topic: ${threadContext.topicTitle}` : ''}
Description: ${threadContext.description}
Tags: ${threadContext.tags.join(', ')}
${threadContext.companyName ? `Company: ${threadContext.companyName}` : ''}
${threadContext.universityName ? `University: ${threadContext.universityName}` : ''}${roadmapInfo}

${dbContext ? `${dbContext}\n` : ''}
Generate exactly 4 short, specific follow-up questions a student would ask when exploring this opportunity.
Questions must be directly relevant to this specific entity and its real data above.
Include at least one question about how this fits their thesis journey / next steps.
Return ONLY a JSON array of 4 strings. No explanation. No markdown.`;

      const result = await generateText({
        model: mistral('mistral-small-latest'),
        messages: [{ role: 'user', content: questionsPrompt }],
        temperature: 0.4,
        maxOutputTokens: 200,
      });

      console.log(`[ThreadChat] Questions raw response: ${result.text.slice(0, 100)}`);

      const match = result.text.match(/\[[\s\S]*\]/);
      const questions: string[] = match
        ? JSON.parse(match[0])
        : [
            `What technical skills are most important for this ${threadContext.entityType}?`,
            'What is the expected thesis timeline?',
            'How should I reach out or apply?',
            'How does this fit into my thesis roadmap?',
          ];

      res.json({ questions: questions.slice(0, 4) });
      return;
    }

    /* -------------------------------------------------------------- */
    /*  Branch B: Conversation reply                                   */
    /* -------------------------------------------------------------- */
    if (!message?.trim()) {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    // ---- Fetch conversation history from thread ----
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (threadId && studentId) {
      const thread = await Thread.findOne({ id: threadId, studentId }).lean();
      if (thread) {
        conversationHistory = thread.messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      }
    }

    // ---- Build system prompt with DB enrichment ----
    const entityLabel =
      threadContext.entityType === 'supervisor'
        ? 'Academic Supervisor'
        : threadContext.entityType === 'company'
          ? 'Company Partner'
          : threadContext.entityType === 'expert'
            ? 'Industry Expert'
            : threadContext.entityType === 'field'
              ? 'Field of Study'
              : 'Thesis Topic';

    let roadmapSection = '';
    if (roadmapContext) {
      const committed = roadmapContext.committedSteps
        .map(s => `  - ${s.label}: ${s.entityName}`)
        .join('\n');
      const open = roadmapContext.openSteps.map(s => `  - ${s.label}`).join('\n');
      roadmapSection = `\n\n## Student's Thesis Roadmap\nCommitted:\n${committed}\nStill searching:\n${open}`;
    }

    const systemPrompt = `You are Studyond's AI thesis advisor in a focused one-on-one conversation with a student about a specific thesis opportunity.

## The Opportunity
Entity: ${threadContext.entityName} (${entityLabel})
${threadContext.topicTitle ? `Topic: ${threadContext.topicTitle}` : ''}
Description: ${threadContext.description}
Tags: ${threadContext.tags.join(', ')}
${threadContext.companyName ? `Company: ${threadContext.companyName}` : ''}
${threadContext.universityName ? `University: ${threadContext.universityName}` : ''}
${threadContext.compatibilityScore ? `Match Score: ${threadContext.compatibilityScore}/5.0` : ''}

${dbContext ? `${dbContext}\n` : ''}${roadmapSection}

## Instructions
- Answer the student's question specifically about this opportunity using the full database record above
- Be helpful, concise, and direct — aim for 3-5 sentences
- Reference specific, factual details from the database record (names, fields, research interests, etc.)
- If the student asks about next steps or committing, explain what will happen:
  * Committing auto-commits parent dependencies (e.g. expert -> company -> field)
  * Uncommitting cascades to remove downstream decisions
- Do NOT generate match cards or JSON blocks — this is a focused conversation
- Do NOT invent facts that are not in the database record above
- Tone: warm, knowledgeable, peer-like${systemContext ? `\n\n## Student Context\n${systemContext}` : ''}`;

    // ---- Build messages array: history + current message ----
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    console.log(
      `[ThreadChat] Calling Mistral for: "${message.slice(0, 80)}..." (${messages.length} messages in context)`,
    );

    const result = await generateText({
      model: mistral('mistral-large-latest'),
      system: systemPrompt,
      messages,
      temperature: 0.2,
      maxOutputTokens: 600,
    });

    console.log(`[ThreadChat] Response: ${result.text.slice(0, 100)}...`);

    res.json({ text: result.text });
  } catch (error) {
    console.error('[ThreadChat] Error:', error);
    res.status(500).json({ error: 'Failed to generate response', text: null });
  }
});
