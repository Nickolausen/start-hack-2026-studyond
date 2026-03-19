import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'crypto';
import { Thread } from '../models/Thread.js';
import { Student } from '../models/Student.js';

export const threadsRouter = Router({ mergeParams: true });

// GET /api/students/:studentId/threads
threadsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const threads = await Thread.find({ studentId: req.params.studentId })
      .sort({ lastActivity: -1 })
      .lean();
    res.json(threads);
  } catch (error) {
    console.error('[Threads] GET list error:', error);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

// POST /api/students/:studentId/threads — save a liked card
threadsRouter.post('/', async (req: Request, res: Response) => {
  const { studentId } = req.params as { studentId: string };
  const { card } = req.body;

  if (!card) { res.status(400).json({ error: 'card is required' }); return; }

  // Prevent duplicates
  const existing = await Thread.findOne({ studentId, 'card.id': card.id }).lean();
  if (existing) { res.json(existing); return; }

  const threadId: string = (card.id as string | undefined) ?? randomUUID();
  const welcomeMessage = {
    id: `msg-init-${threadId}`,
    role: 'assistant' as const,
    content: `Hi! I'm here to help you explore the thesis opportunity with **${card.name}**.${
      card.topicTitle ? ` The topic is: *${card.topicTitle}*.` : ''
    }\n\nFeel free to ask me anything — about the research scope, what skills you'd need, how to reach out, or whether it fits your timeline.`,
    timestamp: new Date(),
  };

  try {
    const thread = await Thread.create({
      id: threadId,
      studentId,
      card: { ...card, id: threadId },
      messages: [welcomeMessage],
      lastActivity: new Date(),
      isRead: false,
      closedStepId: null,
      closedAt: null,
    });
    res.status(201).json(thread);
  } catch (error) {
    console.error('[Threads] POST error:', error);
    res.status(500).json({ error: 'Failed to save thread' });
  }
});

// DELETE /api/students/:studentId/threads/:threadId
threadsRouter.delete('/:threadId', async (req: Request, res: Response) => {
  const { studentId, threadId } = req.params;
  try {
    const thread = await Thread.findOne({ id: threadId, studentId }).lean();
    if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

    // If this thread closed a step, reopen that step
    if (thread.closedStepId) {
      await Student.findOneAndUpdate(
        { id: studentId, 'roadmapSteps.id': thread.closedStepId },
        {
          $set: {
            'roadmapSteps.$.status': 'open',
            'roadmapSteps.$.committedThreadId': null,
            'roadmapSteps.$.committedAt': null,
          },
        }
      );
    }

    await Thread.deleteOne({ id: threadId, studentId });
    res.json({ ok: true });
  } catch (error) {
    console.error('[Threads] DELETE error:', error);
    res.status(500).json({ error: 'Failed to delete thread' });
  }
});

// PATCH /api/students/:studentId/threads/:threadId/commit
threadsRouter.patch('/:threadId/commit', async (req: Request, res: Response) => {
  const { studentId, threadId } = req.params;
  const { stepId } = req.body as { stepId: string };

  if (!stepId) { res.status(400).json({ error: 'stepId is required' }); return; }

  try {
    const student = await Student.findOne({ id: studentId });
    if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

    const step = student.roadmapSteps.find((s) => s.id === stepId);
    if (!step) { res.status(400).json({ error: `Step "${stepId}" not found` }); return; }

    // If the step is already committed by another thread, uncommit that thread first
    if (step.status === 'committed' && step.committedThreadId && step.committedThreadId !== threadId) {
      await Thread.findOneAndUpdate(
        { id: step.committedThreadId, studentId },
        { $set: { closedStepId: null, closedAt: null } }
      );
    }

    const now = new Date();

    // Update step on student
    await Student.findOneAndUpdate(
      { id: studentId, 'roadmapSteps.id': stepId },
      {
        $set: {
          'roadmapSteps.$.status': 'committed',
          'roadmapSteps.$.committedThreadId': threadId,
          'roadmapSteps.$.committedAt': now,
        },
      }
    );

    // Update thread
    const updatedThread = await Thread.findOneAndUpdate(
      { id: threadId, studentId },
      { $set: { closedStepId: stepId, closedAt: now } },
      { returnDocument: "after" }
    ).lean();

    const updatedStudent = await Student.findOne({ id: studentId }).lean();

    res.json({ thread: updatedThread, roadmapSteps: updatedStudent?.roadmapSteps });
  } catch (error) {
    console.error('[Threads] PATCH commit error:', error);
    res.status(500).json({ error: 'Failed to commit thread' });
  }
});

// PATCH /api/students/:studentId/threads/:threadId/uncommit
// No cascade — only reverts this specific thread and its roadmap step.
threadsRouter.patch('/:threadId/uncommit', async (req: Request, res: Response) => {
  const { studentId, threadId } = req.params;

  try {
    const thread = await Thread.findOne({ id: threadId, studentId }).lean();
    if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

    // Not committed — nothing to do
    if (!thread.closedStepId) {
      res.json({ ok: true, roadmapSteps: (await Student.findOne({ id: studentId }).lean())?.roadmapSteps });
      return;
    }

    const stepId = thread.closedStepId;

    // 1. Reset only this thread
    await Thread.findOneAndUpdate(
      { id: threadId, studentId },
      { $set: { closedStepId: null, closedAt: null } }
    );

    // 2. Reset only its roadmap step
    await Student.findOneAndUpdate(
      { id: studentId, 'roadmapSteps.id': stepId },
      {
        $set: {
          'roadmapSteps.$.status': 'open',
          'roadmapSteps.$.committedThreadId': null,
          'roadmapSteps.$.committedAt': null,
        },
      }
    );

    console.log(`[Threads] Uncommitted thread ${threadId} from step "${stepId}"`);

    const updatedStudent = await Student.findOne({ id: studentId }).lean();
    res.json({ ok: true, roadmapSteps: updatedStudent?.roadmapSteps });
  } catch (error) {
    console.error('[Threads] PATCH uncommit error:', error);
    res.status(500).json({ error: 'Failed to uncommit thread' });
  }
});

// POST /api/students/:studentId/threads/:threadId/messages
threadsRouter.post('/:threadId/messages', async (req: Request, res: Response) => {
  const { studentId, threadId } = req.params;
  const { role, content } = req.body as { role: 'user' | 'assistant'; content: string };

  if (!role || !content) { res.status(400).json({ error: 'role and content are required' }); return; }

  const message = {
    id: randomUUID(),
    role,
    content,
    timestamp: new Date(),
  };

  try {
    const updated = await Thread.findOneAndUpdate(
      { id: threadId, studentId },
      { $push: { messages: message }, $set: { lastActivity: new Date(), isRead: false } },
      { returnDocument: "after" }
    ).lean();

    if (!updated) { res.status(404).json({ error: 'Thread not found' }); return; }
    res.json(message);
  } catch (error) {
    console.error('[Threads] POST message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// PATCH /api/students/:studentId/threads/:threadId/read
threadsRouter.patch('/:threadId/read', async (req: Request, res: Response) => {
  const { studentId, threadId } = req.params;
  try {
    await Thread.findOneAndUpdate({ id: threadId, studentId }, { $set: { isRead: true } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});
