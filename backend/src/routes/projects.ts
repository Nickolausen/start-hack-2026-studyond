import { Router, type Request, type Response } from 'express';
import { ThesisProject, type ProjectState } from '../models/ThesisProject.js';

export const projectsRouter = Router({ mergeParams: true });

const VALID_STATES: ProjectState[] = [
  'proposed', 'applied', 'withdrawn', 'rejected', 'agreed', 'in_progress', 'canceled', 'completed',
];

/**
 * Valid state transitions — maps each state to the set of states it can move to.
 * Terminal states (completed, withdrawn, rejected, canceled) cannot transition forward
 * except that rejected/withdrawn can go back to proposed.
 */
const ALLOWED_TRANSITIONS: Record<ProjectState, ProjectState[]> = {
  proposed:    ['applied', 'withdrawn', 'canceled'],
  applied:     ['agreed', 'withdrawn', 'rejected'],
  withdrawn:   ['proposed'],
  rejected:    ['proposed'],
  agreed:      ['in_progress', 'canceled'],
  in_progress: ['completed', 'canceled'],
  canceled:    ['proposed'],
  completed:   [],
};

// GET /api/students/:studentId/projects — list all projects for a student
projectsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await ThesisProject.find({ studentId: req.params.studentId })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(projects);
  } catch (error) {
    console.error('[Projects] GET list error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/students/:studentId/projects/:projectId — get single project
projectsRouter.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const project = await ThesisProject.findOne({
      id: req.params.projectId,
      studentId: req.params.studentId,
    }).lean();

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('[Projects] GET single error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// PATCH /api/students/:studentId/projects/:projectId — update project
projectsRouter.patch('/:projectId', async (req: Request, res: Response) => {
  try {
    const project = await ThesisProject.findOne({
      id: req.params.projectId,
      studentId: req.params.studentId,
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const { title, description, motivation, state } = req.body as {
      title?: string;
      description?: string | null;
      motivation?: string | null;
      state?: string;
    };

    // Validate state transition if state is being changed
    if (state !== undefined) {
      if (!VALID_STATES.includes(state as ProjectState)) {
        res.status(400).json({
          error: `Invalid state '${state}'. Must be one of: ${VALID_STATES.join(', ')}`,
        });
        return;
      }

      const currentState = project.state;
      const newState = state as ProjectState;

      if (currentState !== newState && !ALLOWED_TRANSITIONS[currentState].includes(newState)) {
        res.status(400).json({
          error: `Cannot transition from '${currentState}' to '${newState}'. Allowed transitions: ${ALLOWED_TRANSITIONS[currentState].join(', ') || 'none'}`,
        });
        return;
      }

      project.state = newState;
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (motivation !== undefined) project.motivation = motivation;

    await project.save();

    res.json(project.toObject());
  } catch (error) {
    console.error('[Projects] PATCH error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/students/:studentId/projects/:projectId — delete project
projectsRouter.delete('/:projectId', async (req: Request, res: Response) => {
  try {
    const result = await ThesisProject.deleteOne({
      id: req.params.projectId,
      studentId: req.params.studentId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('[Projects] DELETE error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});
