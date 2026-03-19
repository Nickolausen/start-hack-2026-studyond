import mongoose, { Schema, type Document } from 'mongoose';

export interface ExpertDoc extends Document {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  companyId: string;
  offerInterviews: boolean;
  about: string | null;
  objectives: string[];
  fieldIds: string[];
}

const expertSchema = new Schema<ExpertDoc>({
  id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  title: { type: String, required: true },
  companyId: { type: String, required: true },
  offerInterviews: { type: Boolean, default: false },
  about: { type: String, default: null },
  objectives: { type: [String], default: [] },
  fieldIds: { type: [String], default: [] },
});

expertSchema.index(
  { about: 'text', title: 'text', firstName: 'text', lastName: 'text' },
  { weights: { title: 3, about: 2, firstName: 1, lastName: 1 } }
);

export const Expert = mongoose.model<ExpertDoc>('Expert', expertSchema);
