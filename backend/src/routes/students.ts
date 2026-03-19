import { Router, type Request, type Response } from 'express';
import { Student, defaultRoadmapSteps, type RoadmapStepDoc } from '../models/Student.js';
import { Thread, type ThreadDoc } from '../models/Thread.js';

export const studentsRouter = Router();

// GET /api/students/:id — full student profile
studentsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ id: req.params.id as string }).lean();
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Ensure roadmapSteps is initialised and migrated to 5-step format
    if (!student.roadmapSteps || student.roadmapSteps.length < 5) {
      const steps = defaultRoadmapSteps();
      // Preserve any existing commits
      if (student.roadmapSteps) {
        for (const oldStep of student.roadmapSteps) {
          const match = steps.find((ns: RoadmapStepDoc) => ns.id === oldStep.id);
          if (match && oldStep.status === 'committed') {
            match.status = oldStep.status;
            match.committedThreadId = oldStep.committedThreadId;
            match.committedEntityId = oldStep.committedEntityId ?? null;
            match.committedEntityName = oldStep.committedEntityName ?? null;
            match.committedAt = oldStep.committedAt;
          }
        }
      }
      await Student.findOneAndUpdate({ id: req.params.id as string }, { $set: { roadmapSteps: steps } });
      res.json({ ...student, roadmapSteps: steps });
      return;
    }

    res.json(student);
  } catch (error) {
    console.error('[Students] GET error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// GET /api/students/:id/roadmap — full roadmap state with resolved entity details
studentsRouter.get('/:id/roadmap', async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ id: req.params.id as string }).lean();
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const steps = (student.roadmapSteps ?? defaultRoadmapSteps()) as RoadmapStepDoc[];

    // Resolve thread details for committed steps
    const committedThreadIds = steps
      .filter((s: RoadmapStepDoc) => s.committedThreadId)
      .map((s: RoadmapStepDoc) => s.committedThreadId!);

    const threads: ThreadDoc[] = committedThreadIds.length > 0
      ? await Thread.find({ id: { $in: committedThreadIds } }).lean()
      : [];
    const threadMap = new Map(threads.map((t: ThreadDoc) => [t.id, t]));

    const enrichedSteps = steps.map((step: RoadmapStepDoc) => {
      const thread = step.committedThreadId ? threadMap.get(step.committedThreadId) : null;
      return {
        id: step.id,
        label: step.label,
        description: step.description,
        status: step.status,
        committedThreadId: step.committedThreadId,
        committedEntityId: step.committedEntityId,
        committedEntityName: step.committedEntityName,
        committedAt: step.committedAt,
        // Extra details from thread (for frontend rendering)
        threadCard: thread ? {
          entityType: thread.card.entityType,
          entityId: thread.card.entityId,
          name: thread.card.name,
          subtitle: thread.card.subtitle,
          topicTitle: thread.card.topicTitle,
          compatibilityScore: thread.card.compatibilityScore,
          tags: thread.card.tags,
        } : null,
      };
    });

    // Compute which steps are "unlocked" based on dependency graph
    const committedIds = new Set(
      steps.filter((s: RoadmapStepDoc) => s.status === 'committed').map((s: RoadmapStepDoc) => s.id)
    );

    // A step is unlocked if its parent dependencies are met
    // field: always unlocked
    // company: needs field (or always unlocked as entry point)
    // expert: needs company
    // supervisor: needs field (or always unlocked as entry point)
    // topic: always available (parents auto-committed)
    const unlocked: Record<string, boolean> = {
      field: true,
      company: committedIds.has('field') || true, // company can be an entry point
      expert: committedIds.has('company'),
      supervisor: committedIds.has('field') || true, // supervisor can be an entry point
      topic: true, // always available (parents auto-committed when topic is committed)
    };

    res.json({
      steps: enrichedSteps,
      unlocked,
      progress: {
        total: steps.length,
        committed: steps.filter((s: RoadmapStepDoc) => s.status === 'committed').length,
      },
    });
  } catch (error) {
    console.error('[Students] GET roadmap error:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
});

// PUT /api/students/:id — update profile fields
studentsRouter.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  // Only allow updating safe profile fields — never overwrite roadmapSteps or aiTags via this endpoint
  const {
    firstName, lastName, email, degree, university, studyProgram,
    studyProgramId, universityId, skills, interests, about, objectives, fieldIds,
  } = req.body;

  const updates: Record<string, unknown> = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (email !== undefined) updates.email = email;
  if (degree !== undefined) updates.degree = degree;
  if (studyProgramId !== undefined) updates.studyProgramId = studyProgramId;
  if (universityId !== undefined) updates.universityId = universityId;
  if (skills !== undefined) updates.skills = skills;
  if (interests !== undefined) updates.interests = interests;
  if (about !== undefined) updates.about = about;
  if (objectives !== undefined) updates.objectives = objectives;
  if (fieldIds !== undefined) updates.fieldIds = fieldIds;

  // Ignore frontend-only display fields
  void university; void studyProgram;

  try {
    const updated = await Student.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after', runValidators: false }
    ).lean();

    if (!updated) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error('[Students] PUT error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// PATCH /api/students/:id/tags — update AI tags
studentsRouter.patch('/:id/tags', async (req: Request, res: Response) => {
  const { tags } = req.body as { tags: string[] };
  try {
    const updated = await Student.findOneAndUpdate(
      { id: req.params.id as string },
      { $set: { aiTags: tags } },
      { returnDocument: 'after' }
    ).lean();
    if (!updated) { res.status(404).json({ error: 'Student not found' }); return; }
    res.json({ aiTags: updated.aiTags });
  } catch (error) {
    console.error('[Students] PATCH tags error:', error);
    res.status(500).json({ error: 'Failed to update tags' });
  }
});
