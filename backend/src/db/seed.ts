import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Student, defaultRoadmapSteps, type RoadmapStepDoc } from '../models/Student.js';
import { Topic } from '../models/Topic.js';
import { Supervisor } from '../models/Supervisor.js';
import { Company } from '../models/Company.js';
import { Expert } from '../models/Expert.js';
import { University } from '../models/University.js';
import { StudyProgram } from '../models/StudyProgram.js';
import { Field } from '../models/Field.js';
import { ThesisProject } from '../models/ThesisProject.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MOCK_DIR = join(__dirname, '../../..', 'kickoff-material/mock-data');

function readJSON<T>(filename: string): T[] {
  const raw = readFileSync(join(MOCK_DIR, filename), 'utf-8');
  return JSON.parse(raw) as T[];
}

// Interests for demo students
const STUDENT_INTERESTS: Record<string, string[]> = {
  'student-01': ['AI Efficiency', 'Large Language Models', 'Sustainable Tech', 'Edge Computing'],
  'student-02': ['Sustainability', 'Environmental Science'],
  'student-03': ['Digital Strategy', 'Innovation Management'],
  'student-04': ['Medical Imaging', 'Genomics'],
  'student-05': ['Renewable Energy', 'Smart Grids'],
};

export async function runSeed(): Promise<{ inserted: number; updated: number }> {
  console.log('[Seed] Starting database seeding...');
  let inserted = 0;
  let updated = 0;

  // Helper: upsert by `id` field
  async function upsert<T extends { id: string }>(
    Model: { findOneAndUpdate: Function },
    docs: T[]
  ) {
    for (const doc of docs) {
      const result = await (Model as any).findOneAndUpdate(
        { id: doc.id },
        { $set: doc },
        { upsert: true, returnDocument: 'after', runValidators: false }
      );
      if (result) updated++;
      else inserted++;
    }
  }

  // --- Fields ---
  const fields = readJSON<{ id: string; name: string }>('fields.json');
  await upsert(Field, fields);
  console.log(`[Seed] Fields: ${fields.length}`);

  // --- Universities ---
  const universities = readJSON<{
    id: string; name: string; country: string; domains: string[]; about: string | null
  }>('universities.json');
  await upsert(University, universities);
  console.log(`[Seed] Universities: ${universities.length}`);

  // --- Study Programs ---
  const programs = readJSON<{
    id: string; name: string; degree: string; universityId: string; about: string | null
  }>('study-programs.json');
  await upsert(StudyProgram, programs);
  console.log(`[Seed] Study Programs: ${programs.length}`);

  // --- Companies ---
  const companies = readJSON<{
    id: string; name: string; description: string; about: string | null; size: string; domains: string[]
  }>('companies.json');
  await upsert(Company, companies);
  console.log(`[Seed] Companies: ${companies.length}`);

  // --- Experts ---
  const experts = readJSON<{
    id: string; firstName: string; lastName: string; email: string; title: string;
    companyId: string; offerInterviews: boolean; about: string | null;
    objectives: string[]; fieldIds: string[]
  }>('experts.json');
  await upsert(Expert, experts);
  console.log(`[Seed] Experts: ${experts.length}`);

  // --- Supervisors ---
  const supervisors = readJSON<{
    id: string; firstName: string; lastName: string; email: string; title: string;
    universityId: string; researchInterests: string[]; about: string | null;
    objectives: string[]; fieldIds: string[]
  }>('supervisors.json');
  await upsert(Supervisor, supervisors);
  console.log(`[Seed] Supervisors: ${supervisors.length}`);

  // --- Topics ---
  const topics = readJSON<{
    id: string; title: string; description: string; type: string; employment: string;
    employmentType: string | null; workplaceType: string | null; degrees: string[];
    fieldIds: string[]; companyId: string | null; universityId: string | null;
    supervisorIds: string[]; expertIds: string[]
  }>('topics.json');
  await upsert(Topic, topics);
  console.log(`[Seed] Topics: ${topics.length}`);

  // --- Thesis Projects (NEW) ---
  const projects = readJSON<{
    id: string; title: string; description: string | null; motivation: string | null;
    state: string; studentId: string; topicId: string | null;
    companyId: string | null; universityId: string | null;
    supervisorIds: string[]; expertIds: string[];
    createdAt: string; updatedAt: string;
  }>('projects.json');
  await upsert(ThesisProject, projects);
  console.log(`[Seed] Thesis Projects: ${projects.length}`);

  // --- Students (extend with new fields + 5-step roadmap) ---
  const students = readJSON<{
    id: string; firstName: string; lastName: string; email: string; degree: string;
    studyProgramId: string; universityId: string; skills: string[]; about: string | null;
    objectives: string[]; fieldIds: string[]
  }>('students.json');

  for (const s of students) {
    const interests = STUDENT_INTERESTS[s.id] ?? [];
    const existing = await Student.findOne({ id: s.id });

    if (existing) {
      // Preserve existing AI tags and roadmap progress; only update base fields
      // Migrate roadmap if it still has old 3-step format
      let needsRoadmapMigration = false;
      if (existing.roadmapSteps.length < 5) {
        needsRoadmapMigration = true;
      }

      const updateSet: Record<string, unknown> = {
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        degree: s.degree,
        studyProgramId: s.studyProgramId,
        universityId: s.universityId,
        skills: s.skills,
        about: s.about,
        objectives: s.objectives,
        fieldIds: s.fieldIds,
      };

      // Only set interests if not already customised
      if (existing.interests.length === 0) {
        updateSet.interests = interests;
      }

      // Migrate old 3-step roadmap to 5-step
      if (needsRoadmapMigration) {
        const newSteps = defaultRoadmapSteps();
        // Preserve any existing commits from the old roadmap
        for (const oldStep of existing.roadmapSteps) {
          const match = newSteps.find((ns: RoadmapStepDoc) => ns.id === oldStep.id);
          if (match && oldStep.status === 'committed') {
            match.status = oldStep.status;
            match.committedThreadId = oldStep.committedThreadId;
            match.committedEntityId = oldStep.committedEntityId ?? null;
            match.committedEntityName = oldStep.committedEntityName ?? null;
            match.committedAt = oldStep.committedAt;
          }
        }
        updateSet.roadmapSteps = newSteps;
      }

      await Student.findOneAndUpdate(
        { id: s.id },
        { $set: updateSet },
        { runValidators: false }
      );
      updated++;
    } else {
      // New student — init with defaults
      await Student.create({
        ...s,
        interests,
        aiTags: [],
        roadmapSteps: defaultRoadmapSteps(),
      });
      inserted++;
    }
  }
  console.log(`[Seed] Students: ${students.length}`);

  console.log(`[Seed] Done — inserted: ${inserted}, updated: ${updated}`);
  return { inserted, updated };
}
