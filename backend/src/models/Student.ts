import mongoose, { Schema, type Document } from 'mongoose';

// ---- Roadmap Step Types ----
// The five entity types a student can commit on their thesis journey.
// Dependencies enforce a DAG — see DEPENDENCY_GRAPH in commitEngine.ts
export type RoadmapStepId = 'field' | 'company' | 'expert' | 'supervisor' | 'topic';

export interface RoadmapStepDoc {
  id: RoadmapStepId;
  label: string;
  description: string;
  status: 'open' | 'committed';
  /** The thread ID from which this step was committed */
  committedThreadId: string | null;
  /** The actual database entity ID (e.g. "company-04", "supervisor-03") */
  committedEntityId: string | null;
  /** Resolved display name for the committed entity */
  committedEntityName: string | null;
  committedAt: Date | null;
}

export interface StudentDoc extends Document {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  degree: string;
  studyProgramId: string;
  universityId: string;
  skills: string[];
  interests: string[];
  about: string | null;
  objectives: string[];
  fieldIds: string[];
  aiTags: string[];
  roadmapSteps: RoadmapStepDoc[];
}

const roadmapStepSchema = new Schema<RoadmapStepDoc>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'committed'], default: 'open' },
    committedThreadId: { type: String, default: null },
    committedEntityId: { type: String, default: null },
    committedEntityName: { type: String, default: null },
    committedAt: { type: Date, default: null },
  },
  { _id: false }
);

const studentSchema = new Schema<StudentDoc>({
  id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  degree: { type: String, required: true },
  studyProgramId: { type: String, required: true },
  universityId: { type: String, required: true },
  skills: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  about: { type: String, default: null },
  objectives: { type: [String], default: [] },
  fieldIds: { type: [String], default: [] },
  aiTags: { type: [String], default: [] },
  roadmapSteps: { type: [roadmapStepSchema], default: [] },
});

export const Student = mongoose.model<StudentDoc>('Student', studentSchema);

/**
 * Default 5-step roadmap factory.
 * Steps are ordered from broadest (field) to most specific (topic).
 * Dependencies are enforced at commit time by the commitEngine, not here.
 */
export function defaultRoadmapSteps(): RoadmapStepDoc[] {
  return [
    {
      id: 'field',
      label: 'Choose a Field',
      description: 'Select your area of focus — this shapes all downstream recommendations.',
      status: 'open',
      committedThreadId: null,
      committedEntityId: null,
      committedEntityName: null,
      committedAt: null,
    },
    {
      id: 'company',
      label: 'Find a Company',
      description: 'Partner with a company for real-world data and industry context.',
      status: 'open',
      committedThreadId: null,
      committedEntityId: null,
      committedEntityName: null,
      committedAt: null,
    },
    {
      id: 'expert',
      label: 'Find an Expert',
      description: 'Connect with an industry expert who will mentor your thesis work.',
      status: 'open',
      committedThreadId: null,
      committedEntityId: null,
      committedEntityName: null,
      committedAt: null,
    },
    {
      id: 'supervisor',
      label: 'Find a Supervisor',
      description: 'Secure an academic supervisor who will evaluate your work.',
      status: 'open',
      committedThreadId: null,
      committedEntityId: null,
      committedEntityName: null,
      committedAt: null,
    },
    {
      id: 'topic',
      label: 'Find a Topic',
      description: 'Choose a research question that anchors your thesis.',
      status: 'open',
      committedThreadId: null,
      committedEntityId: null,
      committedEntityName: null,
      committedAt: null,
    },
  ];
}
