import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import { mistral } from '@ai-sdk/mistral';
import {
  streamText,
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  appendResponseMessages,
  type UIMessage,
} from 'ai';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const AI_SYSTEM_PROMPT = `You are Studyond's AI thesis advisor — warm, direct, and knowledgeable about Swiss academia and industry.

## Your Role
Help students find the perfect thesis topic, company partner, or academic supervisor. When a student describes what they want to work on, analyze their profile and produce:
1. A short, encouraging 1-2 sentence response
2. Then output a JSON block of match cards

## Match Card Format
After your text response, output a fenced JSON block like this:

\`\`\`json
{
  "matches": [
    {
      "id": "unique-id",
      "entityType": "company",
      "entityId": "company-01",
      "name": "Display Name",
      "subtitle": "Role or company name",
      "imageUrl": null,
      "initials": "DN",
      "compatibilityScore": 4.5,
      "description": "2-3 sentences explaining why this is a great match for THIS student based on their specific profile and query.",
      "tags": ["#MachineLearning", "#Remote", "#Fintech"],
      "topicTitle": "Optional: specific topic title if applicable",
      "university": "ETH Zurich",
      "workplaceType": "hybrid"
    }
  ]
}
\`\`\`

## Rules
- Generate 5-8 match cards per response, sorted by compatibilityScore descending
- Scores range from 3.0 to 5.0 (never below 3.0)
- Tags must be specific: field tags (#NLP, #Robotics), mode tags (#Remote, #OnSite, #Hybrid), sector tags (#Fintech, #Pharma, #DeepTech)
- Descriptions must be personalized — reference the student's specific skills and the query
- Mix entity types: companies, academic supervisors, and specific thesis topics
- ALWAYS output the JSON block — the UI depends on it
- initials must be 2 characters from the entity name
- entityType must be "company", "supervisor", or "topic"
- Tone: warm, peer-like. Short sentences. Action-oriented.`;

// Main chat endpoint using Vercel AI SDK v6 UIMessageStream
app.post('/api/chat', async (req, res) => {
  const { messages, systemContext } = req.body as {
    messages?: UIMessage[];
    systemContext?: string;
  };

  const systemPrompt = systemContext
    ? `${AI_SYSTEM_PROMPT}\n\n${systemContext}`
    : AI_SYSTEM_PROMPT;

  // Convert UIMessages to simple text messages for Claude
  const coreMessages = (messages ?? []).map((m: UIMessage) => {
    const textPart = m.parts?.find((p: { type: string }) => p.type === 'text') as { type: 'text'; text: string } | undefined;
    return {
      role: m.role as 'user' | 'assistant',
      content: textPart?.text ?? '',
    };
  }).filter((m) => m.content);

  try {
    const result = streamText({
      model: mistral("mistral-large-latest"),
      system: systemPrompt,
      messages: coreMessages,
      maxTokens: 2000,
    });

    // Use pipeUIMessageStreamToResponse to match the DefaultChatTransport protocol
    pipeUIMessageStreamToResponse({
      response: res,
      stream: createUIMessageStream({
        execute: async ({ writer }) => {
          writer.merge(result.toUIMessageStream());
        },
      }),
    });
  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate response' });
    }
  }
});

// Profile tag extraction endpoint
app.post('/api/extract-tags', async (req, res) => {
  const { profile } = req.body as { profile: Record<string, unknown> };

  try {
    const result = await streamText({
      model: mistral("mistral-large-latest"),
      system: 'You are a semantic tag extractor for academic student profiles.',
      messages: [
        {
          role: 'user',
          content: `Extract 8-12 concise semantic tags from this student profile. Return ONLY a JSON array of strings, nothing else.

Profile:
${JSON.stringify(profile, null, 2)}

Rules:
- Include technical skills (Python, Machine Learning, NLP)
- Include domain interests (Sustainability, Healthcare, Fintech)
- Include methodology tags (Quantitative Research, Deep Learning)
- Keep tags short: 1-3 words max
- No hashtags — just plain strings
- Return ONLY valid JSON array like: ["Python", "Machine Learning", "Sustainability"]`,
        },
      ],
      maxTokens: 200,
    });

    const text = await result.text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const tags = JSON.parse(jsonMatch[0]);
      res.json({ tags });
    } else {
      res.json({ tags: [] });
    }
  } catch (error) {
    console.error('Tag extraction error:', error);
    res.status(500).json({ error: 'Failed to extract tags', tags: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Studyond API server running on http://localhost:${PORT}`);
});
