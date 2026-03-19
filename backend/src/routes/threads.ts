import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'crypto';
import { Thread } from '../models/Thread.js';
import type { RoadmapStepId } from '../models/Student.js';
import { planCommit, executeCommit, executeUncommit } from '../services/commitEngine.js';

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
  const studentId = req.params.studentId as string;
  const threadId = req.params.threadId as string;
  try {
    const thread = await Thread.findOne({ id: threadId, studentId }).lean();
    if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

    // If this thread closed a step, uncommit it (with downstream cascade)
    if (thread.closedStepId) {
      await executeUncommit(studentId, threadId);
    }

    await Thread.deleteOne({ id: threadId, studentId });
    res.json({ ok: true });
  } catch (error) {
    console.error('[Threads] DELETE error:', error);
    res.status(500).json({ error: 'Failed to delete thread' });
  }
});

// ---- COMMIT (dependency-aware) ----

/**
 * POST /api/students/:studentId/threads/:threadId/plan-commit
 * Dry-run: returns the commit plan (auto-commits + conflicts) without executing.
 * Frontend can use this to show confirmation dialogs for conflicts.
 */
threadsRouter.post('/:threadId/plan-commit', async (req: Request, res: Response) => {
  const studentId = req.params.studentId as string;
  const threadId = req.params.threadId as string;
  const { stepId } = req.body as { stepId: string };

  if (!stepId) { res.status(400).json({ error: 'stepId is required' }); return; }

  try {
    const plan = await planCommit(studentId, threadId, stepId as RoadmapStepId);
    res.json(plan);
  } catch (error) {
    console.error('[Threads] POST plan-commit error:', error);
    res.status(500).json({ error: 'Failed to plan commit' });
  }
});

/**
 * PATCH /api/students/:studentId/threads/:threadId/commit
 * Execute the commit. Pass `force: true` to overwrite conflicting steps.
 *
 * Response:
 *   - success: true → { thread, roadmapSteps, autoCommitted }
 *   - success: false → { conflicts } (caller must re-request with force=true or cancel)
 */
threadsRouter.patch('/:threadId/commit', async (req: Request, res: Response) => {
  const studentId = req.params.studentId as string;
  const threadId = req.params.threadId as string;
  const { stepId, force = false } = req.body as { stepId: string; force?: boolean };

  if (!stepId) { res.status(400).json({ error: 'stepId is required' }); return; }

  try {
    const result = await executeCommit(studentId, threadId, stepId as RoadmapStepId, force);

    if (!result.success) {
      // Return 409 Conflict with the conflicts array
      res.status(409).json({
        success: false,
        conflicts: result.conflicts,
        message: 'Committing this entity would overwrite existing commitments. Send force=true to confirm.',
      });
      return;
    }

    // Fetch the updated thread
    const updatedThread = await Thread.findOne({ id: threadId, studentId }).lean();

    res.json({
      success: true,
      thread: updatedThread,
      roadmapSteps: result.updatedSteps,
      autoCommitted: result.autoCommitted,
    });
  } catch (error) {
    console.error('[Threads] PATCH commit error:', error);
    res.status(500).json({ error: 'Failed to commit thread' });
  }
});

/**
 * PATCH /api/students/:studentId/threads/:threadId/uncommit
 * Uncommit this thread's step AND cascade-uncommit all downstream dependents.
 */
threadsRouter.patch('/:threadId/uncommit', async (req: Request, res: Response) => {
  const studentId = req.params.studentId as string;
  const threadId = req.params.threadId as string;

  try {
    const { updatedSteps, cascadedSteps } = await executeUncommit(studentId, threadId);

    console.log(
      `[Threads] Uncommitted thread ${threadId}` +
        (cascadedSteps.length > 0 ? ` (cascaded: ${cascadedSteps.join(', ')})` : '')
    );

    res.json({
      ok: true,
      roadmapSteps: updatedSteps,
      cascadedSteps,
    });
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
      { returnDocument: 'after' }
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
