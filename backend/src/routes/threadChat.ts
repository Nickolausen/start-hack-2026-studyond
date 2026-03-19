import { Router, type Request, type Response } from 'express';
import { mistral } from '@ai-sdk/mistral';
import { generateText } from 'ai';

export const threadChatRouter = Router();

/**
 * POST /api/thread-chat
 *
 * Dedicated endpoint for deep-dive thread conversations. Uses generateText
 * (non-streaming) for simplicity and reliability. Returns plain JSON.
 *
 * Now includes dependency context so the AI knows where this entity sits
 * in the student's thesis journey.
 */
threadChatRouter.post('/', async (req: Request, res: Response) => {
  const { message, threadContext, systemContext, suggestQuestions, roadmapContext } = req.body as {
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
  };

  if (!threadContext) {
    res.status(400).json({ error: 'threadContext is required' });
    return;
  }

  console.log(`[ThreadChat] ${suggestQuestions ? 'Generating questions' : 'User message'} for "${threadContext.entityName}" (${threadContext.entityType})`);

  try {
    if (suggestQuestions) {
      // Generate 4 context-aware suggested questions
      const roadmapInfo = roadmapContext
        ? `\nStudent's roadmap: ${roadmapContext.committedSteps.map((s) => `${s.label}: ${s.entityName}`).join(', ')}. Still searching: ${roadmapContext.openSteps.map((s) => s.label).join(', ')}.`
        : '';

      const questionsPrompt = `You are helping a student explore a thesis opportunity.

Entity: ${threadContext.entityName} (${threadContext.entityType})
${threadContext.topicTitle ? `Topic: ${threadContext.topicTitle}` : ''}
Description: ${threadContext.description}
Tags: ${threadContext.tags.join(', ')}
${threadContext.companyName ? `Company: ${threadContext.companyName}` : ''}
${threadContext.universityName ? `University: ${threadContext.universityName}` : ''}${roadmapInfo}

Generate exactly 4 short, specific follow-up questions a student would ask when exploring this opportunity.
Questions must be directly relevant to this specific entity and its tags.
Include at least one question about how this fits their thesis journey / next steps.
Return ONLY a JSON array of 4 strings. No explanation. No markdown.`;

      const result = await generateText({
        model: mistral('mistral-small-latest'),
        messages: [{ role: 'user', content: questionsPrompt }],
        maxOutputTokens: 200,
      });

      console.log(`[ThreadChat] Questions raw response: ${result.text.slice(0, 100)}`);

      const match = result.text.match(/\[[\s\S]*\]/);
      const questions: string[] = match ? JSON.parse(match[0]) : [
        `What technical skills are most important for this ${threadContext.entityType}?`,
        'What is the expected thesis timeline?',
        'How should I reach out or apply?',
        'How does this fit into my thesis roadmap?',
      ];

      res.json({ questions: questions.slice(0, 4) });
      return;
    }

    if (!message?.trim()) {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    // Build dependency-aware system prompt
    const entityLabel = threadContext.entityType === 'supervisor'
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
      const committed = roadmapContext.committedSteps.map((s) => `✓ ${s.label}: ${s.entityName}`).join('\n  ');
      const open = roadmapContext.openSteps.map((s) => `○ ${s.label}`).join('\n  ');
      roadmapSection = `\n\n## Student's Thesis Roadmap\n  ${committed}\n  ${open}`;
    }

    const systemPrompt = `You are Studyond's AI thesis advisor in a focused one-on-one conversation with a student about a specific thesis opportunity.

## The Opportunity
Entity: ${threadContext.entityName} (${entityLabel})
${threadContext.topicTitle ? `Topic: ${threadContext.topicTitle}` : ''}
Description: ${threadContext.description}
Tags: ${threadContext.tags.join(', ')}
${threadContext.companyName ? `Company: ${threadContext.companyName}` : ''}
${threadContext.universityName ? `University: ${threadContext.universityName}` : ''}
${threadContext.compatibilityScore ? `Match Score: ${threadContext.compatibilityScore}/5.0` : ''}${roadmapSection}

## Instructions
- Answer the student's question specifically about this opportunity
- Be helpful, concise, and direct — aim for 3-5 sentences
- Reference specific details from the opportunity (tags, domain, type)
- If the student asks about next steps or committing, explain what will happen:
  * Committing auto-commits parent dependencies (e.g. expert → company → field)
  * Uncommitting cascades to remove downstream decisions
- Do NOT generate match cards or JSON blocks — this is a focused conversation
- Tone: warm, knowledgeable, peer-like${systemContext ? `\n\n## Student Context\n${systemContext}` : ''}`;

    console.log(`[ThreadChat] Calling Mistral for: "${message.slice(0, 80)}..."`);

    const result = await generateText({
      model: mistral('mistral-large-latest'),
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
      maxOutputTokens: 600,
    });

    console.log(`[ThreadChat] Response: ${result.text.slice(0, 100)}...`);

    res.json({ text: result.text });
  } catch (error) {
    console.error('[ThreadChat] Error:', error);
    res.status(500).json({ error: 'Failed to generate response', text: null });
  }
});
