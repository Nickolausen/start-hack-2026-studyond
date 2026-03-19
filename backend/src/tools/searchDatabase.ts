import { tool } from 'ai';
import { z } from 'zod';
import { Topic, type TopicDoc } from '../models/Topic.js';
import { Supervisor, type SupervisorDoc } from '../models/Supervisor.js';
import { Company, type CompanyDoc } from '../models/Company.js';
import { Expert, type ExpertDoc } from '../models/Expert.js';
import { Field, type FieldDoc } from '../models/Field.js';
import { University, type UniversityDoc } from '../models/University.js';

// ---- Result types ----

type FieldResult = { id: string; name: string };

type TopicResult = {
  id: string; title: string; description: string; type: string;
  workplaceType: string | null; degrees: string[];
  companyId: string | null; universityId: string | null;
  supervisorIds: string[]; expertIds: string[];
  employment: string; employmentType: string | null;
  companyName?: string; universityName?: string;
  fieldIds: string[];
};

type SupervisorResult = {
  id: string; firstName: string; lastName: string; title: string;
  universityId: string; universityName: string;
  researchInterests: string[]; about: string | null;
  fieldIds: string[];
};

type CompanyResult = {
  id: string; name: string; description: string; about: string | null;
  size: string; domains: string[];
};

type ExpertResult = {
  id: string; firstName: string; lastName: string; title: string;
  companyId: string; companyName: string;
  offerInterviews: boolean; about: string | null;
  fieldIds: string[];
};

type SearchResult = {
  fields: FieldResult[];
  topics: TopicResult[];
  supervisors: SupervisorResult[];
  companies: CompanyResult[];
  experts: ExpertResult[];
};

// ---- Main search tool ----

export const searchDatabaseTool = tool({
  description: `Search the Studyond database for thesis-related entities: fields, topics, supervisors, companies, and experts.
ALWAYS call this tool before generating match cards. Use only the entity IDs returned here — never invent IDs.
Returns real data sorted by relevance. Use entityTypes to narrow the search.`,
  inputSchema: z.object({
    query: z.string().describe('Search terms describing what the student is looking for'),
    entityTypes: z
      .array(z.enum(['field', 'topic', 'supervisor', 'company', 'expert']))
      .optional()
      .describe('Entity types to search (default: all five)'),
    degree: z
      .enum(['bsc', 'msc', 'phd'])
      .optional()
      .describe('Filter topics by degree level'),
    fieldId: z
      .string()
      .optional()
      .describe('Filter entities by a specific field ID (e.g. "field-01")'),
    companyId: z
      .string()
      .optional()
      .describe('Filter experts/topics by company ID'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(15)
      .optional()
      .describe('Max results per entity type (default: 8)'),
  }),
  execute: async ({ query, entityTypes, degree, fieldId, companyId, limit = 8 }): Promise<SearchResult> => {
    const types = entityTypes ?? ['field', 'topic', 'supervisor', 'company', 'expert'];
    const scoreProjection = { score: { $meta: 'textScore' } };
    const scoreSort = { score: { $meta: 'textScore' } } as const;

    const result: SearchResult = { fields: [], topics: [], supervisors: [], companies: [], experts: [] };

    // ---- Fields ----
    if (types.includes('field')) {
      try {
        const regex = new RegExp(query.split(/\s+/).join('|'), 'i');
        const raw: FieldDoc[] = await Field.find({ name: regex }).limit(limit).lean();
        result.fields = raw.map((f: FieldDoc) => ({ id: f.id, name: f.name }));
      } catch {
        const all: FieldDoc[] = await Field.find({}).limit(limit).lean();
        result.fields = all.map((f: FieldDoc) => ({ id: f.id, name: f.name }));
      }
    }

    // ---- Topics ----
    if (types.includes('topic')) {
      try {
        const filter: Record<string, unknown> = { $text: { $search: query } };
        if (degree) filter.degrees = degree;
        if (fieldId) filter.fieldIds = fieldId;
        if (companyId) filter.companyId = companyId;

        const raw: TopicDoc[] = await Topic.find(filter, scoreProjection).sort(scoreSort).limit(limit).lean();

        // Resolve company names
        const cIds = [...new Set(raw.filter((t: TopicDoc) => t.companyId).map((t: TopicDoc) => t.companyId!))];
        const companies: CompanyDoc[] = cIds.length
          ? await Company.find({ id: { $in: cIds } }).lean()
          : [];
        const companyMap: Record<string, string> = Object.fromEntries(
          companies.map((c: CompanyDoc) => [c.id, c.name])
        );

        // Resolve university names
        const uIds = [...new Set(raw.filter((t: TopicDoc) => t.universityId).map((t: TopicDoc) => t.universityId!))];
        const unis: UniversityDoc[] = uIds.length ? await University.find({ id: { $in: uIds } }).lean() : [];
        const uniMap: Record<string, string> = Object.fromEntries(unis.map((u: UniversityDoc) => [u.id, u.name]));

        result.topics = raw.map((t: TopicDoc) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          type: t.type,
          workplaceType: t.workplaceType,
          degrees: t.degrees,
          companyId: t.companyId,
          universityId: t.universityId,
          supervisorIds: t.supervisorIds,
          expertIds: t.expertIds,
          employment: t.employment,
          employmentType: t.employmentType,
          fieldIds: t.fieldIds,
          ...(t.companyId && { companyName: companyMap[t.companyId] }),
          ...(t.universityId && { universityName: uniMap[t.universityId] }),
        }));
      } catch {
        result.topics = [];
      }
    }

    // ---- Supervisors ----
    if (types.includes('supervisor')) {
      try {
        const filter: Record<string, unknown> = { $text: { $search: query } };
        if (fieldId) filter.fieldIds = fieldId;

        const raw: SupervisorDoc[] = await Supervisor.find(filter, scoreProjection)
          .sort(scoreSort)
          .limit(limit)
          .lean();

        const uIds = [...new Set(raw.map((s: SupervisorDoc) => s.universityId))];
        const unis: UniversityDoc[] = await University.find({ id: { $in: uIds } }).lean();
        const uniMap: Record<string, string> = Object.fromEntries(unis.map((u: UniversityDoc) => [u.id, u.name]));

        result.supervisors = raw.map((s: SupervisorDoc) => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          title: s.title,
          universityId: s.universityId,
          universityName: uniMap[s.universityId] ?? s.universityId,
          researchInterests: s.researchInterests,
          about: s.about,
          fieldIds: s.fieldIds,
        }));
      } catch {
        result.supervisors = [];
      }
    }

    // ---- Companies ----
    if (types.includes('company')) {
      try {
        const raw: CompanyDoc[] = await Company.find(
          { $text: { $search: query } },
          scoreProjection
        )
          .sort(scoreSort)
          .limit(limit)
          .lean();

        result.companies = raw.map((c: CompanyDoc) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          about: c.about,
          size: c.size,
          domains: c.domains,
        }));
      } catch {
        result.companies = [];
      }
    }

    // ---- Experts ----
    if (types.includes('expert')) {
      try {
        const filter: Record<string, unknown> = {};
        if (companyId) filter.companyId = companyId;
        if (fieldId) filter.fieldIds = fieldId;

        let raw: ExpertDoc[];
        if (Object.keys(filter).length === 0) {
          const regex = new RegExp(query.split(/\s+/).join('|'), 'i');
          raw = await Expert.find({
            $or: [
              { about: regex },
              { title: regex },
              { firstName: regex },
              { lastName: regex },
            ],
          })
            .limit(limit)
            .lean();
        } else {
          raw = await Expert.find(filter).limit(limit).lean();
        }

        // Resolve company names
        const expertCIds = [...new Set(raw.map((e: ExpertDoc) => e.companyId))];
        const expertCompanies: CompanyDoc[] = await Company.find({ id: { $in: expertCIds } }).lean();
        const expertCompanyMap: Record<string, string> = Object.fromEntries(
          expertCompanies.map((c: CompanyDoc) => [c.id, c.name])
        );

        result.experts = raw.map((e: ExpertDoc) => ({
          id: e.id,
          firstName: e.firstName,
          lastName: e.lastName,
          title: e.title,
          companyId: e.companyId,
          companyName: expertCompanyMap[e.companyId] ?? e.companyId,
          offerInterviews: e.offerInterviews,
          about: e.about,
          fieldIds: e.fieldIds,
        }));
      } catch {
        result.experts = [];
      }
    }

    return result;
  },
});

// ---- Entity detail tool ----

export const getEntityDetailsTool = tool({
  description:
    'Fetch full details for a specific entity by ID to enrich a match card description. Supports all entity types.',
  inputSchema: z.object({
    entityId: z.string().describe('The entity ID, e.g. "topic-07", "supervisor-03", "field-01", "expert-05"'),
    entityType: z.enum(['field', 'topic', 'supervisor', 'company', 'expert']),
  }),
  execute: async ({ entityId, entityType }) => {
    if (entityType === 'field') {
      return await Field.findOne({ id: entityId }).lean();
    }

    if (entityType === 'topic') {
      const topic = await Topic.findOne({ id: entityId }).lean() as TopicDoc | null;
      if (!topic) return null;
      let companyName: string | null = null;
      let universityName: string | null = null;
      if (topic.companyId) {
        const c = await Company.findOne({ id: topic.companyId }).lean() as CompanyDoc | null;
        companyName = c?.name ?? null;
      }
      if (topic.universityId) {
        const u = await University.findOne({ id: topic.universityId }).lean() as UniversityDoc | null;
        universityName = u?.name ?? null;
      }
      return { ...topic, companyName, universityName };
    }

    if (entityType === 'supervisor') {
      const s = await Supervisor.findOne({ id: entityId }).lean() as SupervisorDoc | null;
      if (!s) return null;
      const uni = await University.findOne({ id: s.universityId }).lean() as UniversityDoc | null;
      return { ...s, universityName: uni?.name ?? s.universityId };
    }

    if (entityType === 'company') {
      return await Company.findOne({ id: entityId }).lean();
    }

    if (entityType === 'expert') {
      const e = await Expert.findOne({ id: entityId }).lean() as ExpertDoc | null;
      if (!e) return null;
      const c = await Company.findOne({ id: e.companyId }).lean() as CompanyDoc | null;
      return { ...e, companyName: c?.name ?? e.companyId };
    }

    return null;
  },
});

// ---- List all fields tool (for initial field selection) ----

export const listFieldsTool = tool({
  description: 'List all available academic/industry fields. Use this when the student is starting their journey and needs to choose a field of study.',
  inputSchema: z.object({}),
  execute: async (): Promise<FieldResult[]> => {
    const fields: FieldDoc[] = await Field.find({}).sort({ name: 1 }).lean();
    return fields.map((f: FieldDoc) => ({ id: f.id, name: f.name }));
  },
});

// ---- Get student's committed roadmap state ----

export const getRoadmapStateTool = tool({
  description: `Get the student's current thesis roadmap state — which steps are committed and which are still open. Use this to understand what the student has already decided before making recommendations.`,
  inputSchema: z.object({
    studentId: z.string().describe('The student ID'),
  }),
  execute: async ({ studentId }) => {
    const { Student } = await import('../models/Student.js');
    const student = await Student.findOne({ id: studentId }).lean();
    if (!student) return { error: 'Student not found' };

    return {
      steps: (student.roadmapSteps as Array<{ id: string; label: string; status: string; committedEntityId: string | null; committedEntityName: string | null }>).map((s) => ({
        id: s.id,
        label: s.label,
        status: s.status,
        committedEntityId: s.committedEntityId,
        committedEntityName: s.committedEntityName,
      })),
    };
  },
});
