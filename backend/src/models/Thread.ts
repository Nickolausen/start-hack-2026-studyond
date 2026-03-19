import mongoose, { Schema, type Document } from 'mongoose';

// ---- Embedded MatchCard ----
// entityType now supports all 5 entity types in the dependency graph
export type MatchEntityType = 'field' | 'company' | 'expert' | 'supervisor' | 'topic';

export interface MatchCardDoc {
  id: string;
  entityType: MatchEntityType;
  entityId: string;
  name: string;
  subtitle: string;
  imageUrl: string | null;
  compatibilityScore: number;
  description: string;
  tags: string[];
  topicTitle?: string;
  university?: string;
  /** For experts: the parent company ID (used by dependency engine) */
  companyId?: string;
  /** For topics: the owning company or university ID */
  ownerEntityId?: string;
  /** For topics: linked supervisor IDs */
  supervisorIds?: string[];
  /** For topics: linked expert IDs */
  expertIds?: string[];
  /** Field IDs associated with this entity */
  fieldIds?: string[];
}

export interface ThreadMessageDoc {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ThreadDoc extends Document {
  id: string;
  studentId: string;
  card: MatchCardDoc;
  messages: ThreadMessageDoc[];
  lastActivity: Date;
  isRead: boolean;
  /** Which roadmap step this thread is committed to; null = not committed */
  closedStepId: string | null;
  closedAt: Date | null;
}

const matchCardSchema = new Schema<MatchCardDoc>(
  {
    id: { type: String, required: true },
    entityType: {
      type: String,
      required: true,
      enum: ['field', 'company', 'expert', 'supervisor', 'topic'],
    },
    entityId: { type: String, required: true },
    name: { type: String, required: true },
    subtitle: { type: String, default: '' },
    imageUrl: { type: String, default: null },
    compatibilityScore: { type: Number, required: true },
    description: { type: String, default: '' },
    tags: { type: [String], default: [] },
    topicTitle: { type: String },
    university: { type: String },
    companyId: { type: String },
    ownerEntityId: { type: String },
    supervisorIds: { type: [String] },
    expertIds: { type: [String] },
    fieldIds: { type: [String] },
  },
  { _id: false }
);

const threadMessageSchema = new Schema<ThreadMessageDoc>(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const threadSchema = new Schema<ThreadDoc>({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, index: true },
  card: { type: matchCardSchema, required: true },
  messages: { type: [threadMessageSchema], default: [] },
  lastActivity: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  closedStepId: { type: String, default: null },
  closedAt: { type: Date, default: null },
});

export const Thread = mongoose.model<ThreadDoc>('Thread', threadSchema);
