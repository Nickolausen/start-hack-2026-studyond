import mongoose, { Schema, type Document } from 'mongoose';

/**
 * ThesisProject — the central entity linking a student to their thesis journey.
 * Mirrors the structure in kickoff-material/mock-data/projects.json.
 *
 * A project can exist WITHOUT a topic (project-first model).
 * States: proposed → applied → agreed → in_progress → completed
 *         (or withdrawn / rejected / canceled at any point)
 */

export type ProjectState =
  | 'proposed'
  | 'applied'
  | 'withdrawn'
  | 'rejected'
  | 'agreed'
  | 'in_progress'
  | 'canceled'
  | 'completed';

export interface ThesisProjectDoc extends Document {
  id: string;
  title: string;
  description: string | null;
  motivation: string | null;
  state: ProjectState;
  studentId: string;
  topicId: string | null;
  companyId: string | null;
  universityId: string | null;
  supervisorIds: string[];
  expertIds: string[];
  fieldIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const thesisProjectSchema = new Schema<ThesisProjectDoc>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    motivation: { type: String, default: null },
    state: {
      type: String,
      enum: ['proposed', 'applied', 'withdrawn', 'rejected', 'agreed', 'in_progress', 'canceled', 'completed'],
      default: 'proposed',
    },
    studentId: { type: String, required: true, index: true },
    topicId: { type: String, default: null },
    companyId: { type: String, default: null },
    universityId: { type: String, default: null },
    supervisorIds: { type: [String], default: [] },
    expertIds: { type: [String], default: [] },
    fieldIds: { type: [String], default: [] },
  },
  {
    timestamps: true, // auto-manages createdAt / updatedAt
  }
);

export const ThesisProject = mongoose.model<ThesisProjectDoc>('ThesisProject', thesisProjectSchema);
