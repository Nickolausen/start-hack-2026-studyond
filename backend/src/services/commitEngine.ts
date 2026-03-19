/**
 * commitEngine.ts — Dependency-aware commit logic for the thesis roadmap.
 *
 * DEPENDENCY GRAPH (directed — parent → child):
 *
 *   Field ──→ Company ──→ Expert ──→ Topic
 *     │                                ↑
 *     └──→ Supervisor ────────────────┘
 *
 * Valid paths to Topic:
 *   A: Field → Company → Expert → Topic
 *   B: Field → Supervisor → Topic
 *   C: Company → Expert → Topic         (field inferred)
 *   D: Supervisor → Topic               (field inferred)
 *   E: Directly to Topic                (all parents inferred)
 *
 * COMMIT RULES:
 *   Rule 1 (Upstream Forces): Committing an entity auto-commits its required
 *     parent dependencies. E.g. committing an Expert also commits the Expert's Company.
 *
 *   Rule 2 (Overwrite Warnings): If an auto-commit conflicts with an already-committed
 *     step, the engine returns a `conflicts` array. The caller can then either:
 *       - Pass `force: true` to overwrite, or
 *       - Return the conflict to the frontend for user confirmation.
 *
 * UNCOMMIT RULES:
 *   Uncommitting a step also uncommits all downstream dependents.
 *   E.g. uncommitting Company also uncommits Expert (and Topic if it was via Company path).
 */

import { Student, type RoadmapStepDoc, type RoadmapStepId } from '../models/Student.js';
import { Thread, type MatchCardDoc } from '../models/Thread.js';
import { Company } from '../models/Company.js';
import { Expert } from '../models/Expert.js';
import { Supervisor } from '../models/Supervisor.js';
import { Topic } from '../models/Topic.js';
import { Field } from '../models/Field.js';
import { ThesisProject } from '../models/ThesisProject.js';

// ---- Dependency Graph Definition ----

/**
 * For each step, which parent steps MUST be committed first.
 * An entity may force-commit parents using data from the entity itself.
 */
/** Unused at runtime — kept as documentation of the declared dependency relationships */
// const UPSTREAM_DEPENDENCIES: Record<RoadmapStepId, RoadmapStepId[]> = {
//   field: [],                      // no parents
//   company: ['field'],             // company is in a field
//   expert: ['company', 'field'],   // expert belongs to a company
//   supervisor: ['field'],          // supervisor is in a field
//   topic: [],                      // topic can arrive via any path; parents are resolved from the topic data
// };

/**
 * For each step, which downstream steps depend on it.
 * Used for cascade-uncommit.
 */
const DOWNSTREAM_DEPENDENTS: Record<RoadmapStepId, RoadmapStepId[]> = {
  field: ['company', 'expert', 'supervisor', 'topic'],
  company: ['expert', 'topic'],
  expert: ['topic'],
  supervisor: ['topic'],
  topic: [],
};

// ---- Types ----

export interface CommitConflict {
  stepId: RoadmapStepId;
  currentEntityId: string;
  currentEntityName: string;
  incomingEntityId: string;
  incomingEntityName: string;
}

export interface AutoCommit {
  stepId: RoadmapStepId;
  entityId: string;
  entityName: string;
  threadId: string | null; // null = auto-committed (no thread created)
}

export interface CommitPlan {
  /** The primary step being committed */
  primaryStep: RoadmapStepId;
  /** Steps that will be auto-committed as upstream dependencies */
  autoCommits: AutoCommit[];
  /** Conflicts with already-committed steps that need confirmation */
  conflicts: CommitConflict[];
  /** Whether this commit can proceed without force */
  canProceed: boolean;
}

export interface CommitResult {
  success: boolean;
  updatedSteps: RoadmapStepDoc[];
  autoCommitted: AutoCommit[];
  /** If success is false, conflicts that must be resolved */
  conflicts?: CommitConflict[];
  /** Set when topic is committed and a ThesisProject is created/updated */
  projectId?: string;
}

// ---- Resolve upstream parents from entity data ----

/**
 * Given a thread's match card, resolve what parent entities should be auto-committed.
 * This queries the DB to find the real parent chain.
 */
async function resolveUpstreamParents(card: MatchCardDoc): Promise<AutoCommit[]> {
  const autoCommits: AutoCommit[] = [];
  const entityType = card.entityType as RoadmapStepId;

  if (entityType === 'expert') {
    // Expert → Company (required)
    const companyId = card.companyId;
    if (companyId) {
      const company = await Company.findOne({ id: companyId }).lean();
      if (company) {
        autoCommits.push({
          stepId: 'company',
          entityId: company.id,
          entityName: company.name,
          threadId: null,
        });
      }
    } else {
      // Try to resolve from DB
      const expert = await Expert.findOne({ id: card.entityId }).lean();
      if (expert) {
        const company = await Company.findOne({ id: expert.companyId }).lean();
        if (company) {
          autoCommits.push({
            stepId: 'company',
            entityId: company.id,
            entityName: company.name,
            threadId: null,
          });
        }
      }
    }

    // Expert → Field (via expert's fieldIds or company domains)
    const fieldCommit = await resolveFieldForEntity(card);
    if (fieldCommit) autoCommits.push(fieldCommit);
  }

  if (entityType === 'company') {
    // Company → Field
    const fieldCommit = await resolveFieldForEntity(card);
    if (fieldCommit) autoCommits.push(fieldCommit);
  }

  if (entityType === 'supervisor') {
    // Supervisor → Field
    const fieldCommit = await resolveFieldForEntity(card);
    if (fieldCommit) autoCommits.push(fieldCommit);
  }

  if (entityType === 'topic') {
    // Topic → all possible parents
    const topic = await Topic.findOne({ id: card.entityId }).lean();
    if (topic) {
      // Topic → Field (from topic's fieldIds)
      if (topic.fieldIds?.length > 0) {
        const field = await Field.findOne({ id: topic.fieldIds[0] }).lean();
        if (field) {
          autoCommits.push({
            stepId: 'field',
            entityId: field.id,
            entityName: field.name,
            threadId: null,
          });
        }
      }

      // Topic → Company (if company-backed)
      if (topic.companyId) {
        const company = await Company.findOne({ id: topic.companyId }).lean();
        if (company) {
          autoCommits.push({
            stepId: 'company',
            entityId: company.id,
            entityName: company.name,
            threadId: null,
          });
        }

        // Topic → Expert (if company topic with expertIds)
        if (topic.expertIds?.length > 0) {
          const expert = await Expert.findOne({ id: topic.expertIds[0] }).lean();
          if (expert) {
            autoCommits.push({
              stepId: 'expert',
              entityId: expert.id,
              entityName: `${expert.firstName} ${expert.lastName}`,
              threadId: null,
            });
          }
        }
      }

      // Topic → Supervisor (if supervisor-backed)
      if (topic.supervisorIds?.length > 0) {
        const supervisor = await Supervisor.findOne({ id: topic.supervisorIds[0] }).lean();
        if (supervisor) {
          autoCommits.push({
            stepId: 'supervisor',
            entityId: supervisor.id,
            entityName: `${supervisor.title} ${supervisor.firstName} ${supervisor.lastName}`,
            threadId: null,
          });
        }
      }
    }
  }

  return autoCommits;
}

/**
 * Resolve the best-matching field for an entity from its fieldIds.
 */
async function resolveFieldForEntity(card: MatchCardDoc): Promise<AutoCommit | null> {
  // First check if fieldIds are embedded on the card
  if (card.fieldIds?.length) {
    const field = await Field.findOne({ id: card.fieldIds[0] }).lean();
    if (field) {
      return { stepId: 'field', entityId: field.id, entityName: field.name, threadId: null };
    }
  }

  // Fallback: look up the entity in DB for its fieldIds
  let fieldIds: string[] = [];
  if (card.entityType === 'expert') {
    const expert = await Expert.findOne({ id: card.entityId }).lean();
    fieldIds = expert?.fieldIds ?? [];
  } else if (card.entityType === 'supervisor') {
    const supervisor = await Supervisor.findOne({ id: card.entityId }).lean();
    fieldIds = supervisor?.fieldIds ?? [];
  } else if (card.entityType === 'company') {
    // Companies don't have fieldIds — skip field auto-commit for standalone company commits
    return null;
  }

  if (fieldIds.length > 0) {
    const field = await Field.findOne({ id: fieldIds[0] }).lean();
    if (field) {
      return { stepId: 'field', entityId: field.id, entityName: field.name, threadId: null };
    }
  }

  return null;
}

// ---- Plan a commit (dry run — identifies conflicts) ----

export async function planCommit(
  studentId: string,
  threadId: string,
  stepId: RoadmapStepId
): Promise<CommitPlan> {
  const student = await Student.findOne({ id: studentId }).lean();
  if (!student) throw new Error('Student not found');

  const thread = await Thread.findOne({ id: threadId, studentId }).lean();
  if (!thread) throw new Error('Thread not found');

  const stepsMap = new Map<string, RoadmapStepDoc>();
  for (const s of student.roadmapSteps) stepsMap.set(s.id, s);

  // Resolve what parents need to be auto-committed
  const autoCommits = await resolveUpstreamParents(thread.card);

  // Detect conflicts: where an auto-commit would overwrite an existing commitment
  const conflicts: CommitConflict[] = [];

  for (const ac of autoCommits) {
    const existingStep = stepsMap.get(ac.stepId);
    if (
      existingStep &&
      existingStep.status === 'committed' &&
      existingStep.committedEntityId &&
      existingStep.committedEntityId !== ac.entityId
    ) {
      conflicts.push({
        stepId: ac.stepId,
        currentEntityId: existingStep.committedEntityId,
        currentEntityName: existingStep.committedEntityName ?? existingStep.committedEntityId,
        incomingEntityId: ac.entityId,
        incomingEntityName: ac.entityName,
      });
    }
  }

  // Check if the primary step itself conflicts
  const primaryStep = stepsMap.get(stepId);
  if (
    primaryStep &&
    primaryStep.status === 'committed' &&
    primaryStep.committedEntityId &&
    primaryStep.committedEntityId !== thread.card.entityId
  ) {
    conflicts.push({
      stepId,
      currentEntityId: primaryStep.committedEntityId,
      currentEntityName: primaryStep.committedEntityName ?? primaryStep.committedEntityId,
      incomingEntityId: thread.card.entityId,
      incomingEntityName: thread.card.name,
    });
  }

  return {
    primaryStep: stepId,
    autoCommits,
    conflicts,
    canProceed: conflicts.length === 0,
  };
}

// ---- Execute a commit ----

export async function executeCommit(
  studentId: string,
  threadId: string,
  stepId: RoadmapStepId,
  force: boolean = false
): Promise<CommitResult> {
  const plan = await planCommit(studentId, threadId, stepId);

  if (!plan.canProceed && !force) {
    return {
      success: false,
      updatedSteps: [],
      autoCommitted: [],
      conflicts: plan.conflicts,
    };
  }

  const student = await Student.findOne({ id: studentId });
  if (!student) throw new Error('Student not found');

  const thread = await Thread.findOne({ id: threadId, studentId });
  if (!thread) throw new Error('Thread not found');

  const now = new Date();

  // For the primary commit, resolve the best display name:
  // - topic: use topicTitle (the thesis title), not the company name
  // - supervisor: use "Title FirstName LastName"
  // - expert: same
  // - others: use card.name
  let primaryEntityName = thread.card.name;
  if (stepId === 'topic' && thread.card.topicTitle) {
    primaryEntityName = thread.card.topicTitle;
  }

  const allCommits = [
    ...plan.autoCommits,
    {
      stepId,
      entityId: thread.card.entityId,
      entityName: primaryEntityName,
      threadId,
    },
  ];

  // Apply all commits
  for (const commit of allCommits) {
    const step = student.roadmapSteps.find((s: RoadmapStepDoc) => s.id === commit.stepId);
    if (!step) continue;

    // If this step was committed by a different thread, clear that thread's closedStepId
    if (step.committedThreadId && step.committedThreadId !== commit.threadId) {
      await Thread.findOneAndUpdate(
        { id: step.committedThreadId, studentId },
        { $set: { closedStepId: null, closedAt: null } }
      );
    }

    step.status = 'committed';
    step.committedThreadId = commit.threadId;
    step.committedEntityId = commit.entityId;
    step.committedEntityName = commit.entityName;
    step.committedAt = now;
  }

  await student.save();

  // Mark the primary thread as committed
  await Thread.findOneAndUpdate(
    { id: threadId, studentId },
    { $set: { closedStepId: stepId, closedAt: now } }
  );

  const updatedStudent = await Student.findOne({ id: studentId }).lean();

  // ---- Auto-create ThesisProject when topic step is committed ----
  // The project is the GOAL of the journey. It pulls authoritative data from the
  // Topic DB record (companyId, supervisorIds, expertIds, fieldIds) and merges
  // with whatever the student committed on their roadmap steps.
  let projectId: string | undefined;

  if (stepId === 'topic' && updatedStudent) {
    const topicEntityId = thread.card.entityId;

    // Fetch the ACTUAL topic record from DB — this is the source of truth
    const topicRecord = await Topic.findOne({ id: topicEntityId }).lean();

    // Also read what the roadmap committed (may have extra info from manual commits)
    const stepsMap = new Map<string, RoadmapStepDoc>();
    for (const s of updatedStudent.roadmapSteps) stepsMap.set(s.id, s);
    const companyStep = stepsMap.get('company');
    const supervisorStep = stepsMap.get('supervisor');
    const expertStep = stepsMap.get('expert');
    const fieldStep = stepsMap.get('field');

    // Merge: topic DB record is primary, roadmap commits fill gaps
    const topicCompanyId = topicRecord?.companyId ?? null;
    const topicSupervisorIds = topicRecord?.supervisorIds ?? [];
    const topicExpertIds = topicRecord?.expertIds ?? [];
    const topicFieldIds = topicRecord?.fieldIds ?? [];
    const topicUniversityId = topicRecord?.universityId ?? null;

    // Company: prefer topic's own companyId, fallback to roadmap
    const finalCompanyId = topicCompanyId
      ?? (companyStep?.status === 'committed' ? companyStep.committedEntityId : null);

    // Supervisors: union of topic's supervisorIds and roadmap-committed supervisor
    const finalSupervisorIds = [...new Set([
      ...topicSupervisorIds,
      ...(supervisorStep?.status === 'committed' && supervisorStep.committedEntityId
        ? [supervisorStep.committedEntityId] : []),
    ])];

    // Experts: union of topic's expertIds and roadmap-committed expert
    const finalExpertIds = [...new Set([
      ...topicExpertIds,
      ...(expertStep?.status === 'committed' && expertStep.committedEntityId
        ? [expertStep.committedEntityId] : []),
    ])];

    // Fields: union of topic's fieldIds and roadmap-committed field
    const finalFieldIds = [...new Set([
      ...topicFieldIds,
      ...(fieldStep?.status === 'committed' && fieldStep.committedEntityId
        ? [fieldStep.committedEntityId] : []),
    ])];

    // University: topic's university, or student's university
    const finalUniversityId = topicUniversityId ?? updatedStudent.universityId;

    // Title: topic title from card, or from DB record
    const title = thread.card.topicTitle ?? topicRecord?.title ?? thread.card.name;
    // Description: from DB topic record
    const description = topicRecord?.description ?? null;

    projectId = `project-${Date.now()}`;

    await ThesisProject.findOneAndUpdate(
      { studentId, topicId: topicEntityId },
      {
        $setOnInsert: { id: projectId },
        $set: {
          title,
          description,
          motivation: null,
          state: 'proposed',
          studentId,
          topicId: topicEntityId,
          companyId: finalCompanyId,
          universityId: finalUniversityId,
          supervisorIds: finalSupervisorIds,
          expertIds: finalExpertIds,
          fieldIds: finalFieldIds,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    // If the document already existed, use its persisted id
    const existingProject = await ThesisProject.findOne({
      studentId,
      topicId: topicEntityId,
    }).lean();
    if (existingProject) {
      projectId = existingProject.id;
    }
  }

  return {
    success: true,
    updatedSteps: updatedStudent?.roadmapSteps ?? [],
    autoCommitted: plan.autoCommits,
    projectId,
  };
}

// ---- Execute an uncommit (with downstream cascade) ----

export async function executeUncommit(
  studentId: string,
  threadId: string
): Promise<{ updatedSteps: RoadmapStepDoc[]; cascadedSteps: RoadmapStepId[] }> {
  const thread = await Thread.findOne({ id: threadId, studentId }).lean();
  if (!thread || !thread.closedStepId) {
    const student = await Student.findOne({ id: studentId }).lean();
    return { updatedSteps: student?.roadmapSteps ?? [], cascadedSteps: [] };
  }

  const stepId = thread.closedStepId as RoadmapStepId;
  const student = await Student.findOne({ id: studentId });
  if (!student) throw new Error('Student not found');

  // Collect all steps to uncommit: the primary + all downstream dependents
  const stepsToUncommit = new Set<RoadmapStepId>([stepId]);
  const queue: RoadmapStepId[] = [stepId];
  const cascadedSteps: RoadmapStepId[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dependents = DOWNSTREAM_DEPENDENTS[current] ?? [];
    for (const dep of dependents) {
      if (!stepsToUncommit.has(dep)) {
        // Only cascade if the dependent is actually committed
        const depStep = student.roadmapSteps.find((s: RoadmapStepDoc) => s.id === dep);
        if (depStep && depStep.status === 'committed') {
          stepsToUncommit.add(dep);
          queue.push(dep);
          cascadedSteps.push(dep);
        }
      }
    }
  }

  // Reset all affected steps
  for (const sid of stepsToUncommit) {
    const step = student.roadmapSteps.find((s: RoadmapStepDoc) => s.id === sid);
    if (!step) continue;

    // Clear the thread's commit reference
    if (step.committedThreadId) {
      await Thread.findOneAndUpdate(
        { id: step.committedThreadId, studentId },
        { $set: { closedStepId: null, closedAt: null } }
      );
    }

    step.status = 'open';
    step.committedThreadId = null;
    step.committedEntityId = null;
    step.committedEntityName = null;
    step.committedAt = null;
  }

  await student.save();

  const updatedStudent = await Student.findOne({ id: studentId }).lean();
  return {
    updatedSteps: updatedStudent?.roadmapSteps ?? [],
    cascadedSteps,
  };
}
