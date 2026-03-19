import { tool } from 'ai';
import { z } from 'zod';
import { Topic, type TopicDoc } from '../models/Topic.js';
import { Supervisor, type SupervisorDoc } from '../models/Supervisor.js';
import { Company, type CompanyDoc } from '../models/Company.js';
import { Expert, type ExpertDoc } from '../models/Expert.js';
import { Field, type FieldDoc } from '../models/Field.js';
import { University, type UniversityDoc } from '../models/University.js';
import { Student } from '../models/Student.js';

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

// ---- Batch helpers ----

async function batchCompanyNames(ids: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return {};
  const docs: CompanyDoc[] = await Company.find({ id: { $in: unique } }).lean();
  return Object.fromEntries(docs.map((c: CompanyDoc) => [c.id, c.name]));
}

async function batchUniversityNames(ids: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return {};
  const docs: UniversityDoc[] = await University.find({ id: { $in: unique } }).lean();
  return Object.fromEntries(docs.map((u: UniversityDoc) => [u.id, u.name]));
}

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

    // ---- Fields (use $text, fallback to regex) ----
    if (types.includes('field')) {
      try {
        const raw: FieldDoc[] = await Field.find(
          { $text: { $search: query } },
          scoreProjection,
        ).sort(scoreSort).limit(limit).lean();
        result.fields = raw.map((f: FieldDoc) => ({ id: f.id, name: f.name }));
      } catch (err) {
        console.warn('[SearchDB] Field $text search failed, falling back to regex', err);
        try {
          const regex = new RegExp(query.split(/\s+/).join('|'), 'i');
          const raw: FieldDoc[] = await Field.find({ name: regex }).limit(limit).lean();
          result.fields = raw.map((f: FieldDoc) => ({ id: f.id, name: f.name }));
        } catch (regexErr) {
          console.warn('[SearchDB] Field regex fallback failed', regexErr);
          result.fields = [];
        }
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

        // Batch-resolve company + university names
        const cIds = raw.filter((t: TopicDoc) => t.companyId).map((t: TopicDoc) => t.companyId!);
        const uIds = raw.filter((t: TopicDoc) => t.universityId).map((t: TopicDoc) => t.universityId!);

        const [companyMap, uniMap] = await Promise.all([
          batchCompanyNames(cIds),
          batchUniversityNames(uIds),
        ]);

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
      } catch (err) {
        console.warn('[SearchDB] Topic search failed', err);
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

        const uniMap = await batchUniversityNames(raw.map((s: SupervisorDoc) => s.universityId));

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
      } catch (err) {
        console.warn('[SearchDB] Supervisor search failed', err);
        result.supervisors = [];
      }
    }

    // ---- Companies ----
    if (types.includes('company')) {
      try {
        const raw: CompanyDoc[] = await Company.find(
          { $text: { $search: query } },
          scoreProjection,
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
      } catch (err) {
        console.warn('[SearchDB] Company search failed', err);
        result.companies = [];
      }
    }

    // ---- Experts (use $text, fallback to regex) ----
    if (types.includes('expert')) {
      try {
        const filter: Record<string, unknown> = { $text: { $search: query } };
        if (companyId) filter.companyId = companyId;
        if (fieldId) filter.fieldIds = fieldId;

        let raw: ExpertDoc[];
        try {
          raw = await Expert.find(filter, scoreProjection).sort(scoreSort).limit(limit).lean();
        } catch (textErr) {
          console.warn('[SearchDB] Expert $text search failed, falling back to regex', textErr);
          const regexFilter: Record<string, unknown> = {};
          if (companyId) regexFilter.companyId = companyId;
          if (fieldId) regexFilter.fieldIds = fieldId;
          const regex = new RegExp(query.split(/\s+/).join('|'), 'i');
          raw = await Expert.find({
            ...regexFilter,
            $or: [
              { about: regex },
              { title: regex },
              { firstName: regex },
              { lastName: regex },
            ],
          }).limit(limit).lean();
        }

        const expertCompanyMap = await batchCompanyNames(raw.map((e: ExpertDoc) => e.companyId));

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
      } catch (err) {
        console.warn('[SearchDB] Expert search failed', err);
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
      const topic: TopicDoc | null = await Topic.findOne({ id: entityId }).lean() as TopicDoc | null;
      if (!topic) return null;

      // Collect IDs for batch resolution
      const companyIds = topic.companyId ? [topic.companyId] : [];
      const universityIds = topic.universityId ? [topic.universityId] : [];
      const supervisorIds = [...new Set(topic.supervisorIds)];
      const expertIds = [...new Set(topic.expertIds)];
      const fieldIds = [...new Set(topic.fieldIds)];

      const [companyMap, uniMap, supervisors, experts, fields] = await Promise.all([
        batchCompanyNames(companyIds),
        batchUniversityNames(universityIds),
        supervisorIds.length
          ? Supervisor.find({ id: { $in: supervisorIds } }).lean() as Promise<SupervisorDoc[]>
          : Promise.resolve([] as SupervisorDoc[]),
        expertIds.length
          ? Expert.find({ id: { $in: expertIds } }).lean() as Promise<ExpertDoc[]>
          : Promise.resolve([] as ExpertDoc[]),
        fieldIds.length
          ? Field.find({ id: { $in: fieldIds } }).lean() as Promise<FieldDoc[]>
          : Promise.resolve([] as FieldDoc[]),
      ]);

      return {
        ...topic,
        companyName: topic.companyId ? companyMap[topic.companyId] ?? null : null,
        universityName: topic.universityId ? uniMap[topic.universityId] ?? null : null,
        supervisors: supervisors.map((s: SupervisorDoc) => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          title: s.title,
        })),
        experts: experts.map((e: ExpertDoc) => ({
          id: e.id,
          firstName: e.firstName,
          lastName: e.lastName,
          title: e.title,
        })),
        fields: fields.map((f: FieldDoc) => ({ id: f.id, name: f.name })),
      };
    }

    if (entityType === 'supervisor') {
      const s: SupervisorDoc | null = await Supervisor.findOne({ id: entityId }).lean() as SupervisorDoc | null;
      if (!s) return null;

      const [uniMap, topics] = await Promise.all([
        batchUniversityNames([s.universityId]),
        Topic.find({ supervisorIds: entityId }).lean() as Promise<TopicDoc[]>,
      ]);

      return {
        ...s,
        universityName: uniMap[s.universityId] ?? s.universityId,
        topics: topics.map((t: TopicDoc) => ({
          id: t.id,
          title: t.title,
          type: t.type,
          degrees: t.degrees,
        })),
      };
    }

    if (entityType === 'company') {
      return await Company.findOne({ id: entityId }).lean();
    }

    if (entityType === 'expert') {
      const e: ExpertDoc | null = await Expert.findOne({ id: entityId }).lean() as ExpertDoc | null;
      if (!e) return null;

      const [companyMap, topics] = await Promise.all([
        batchCompanyNames([e.companyId]),
        Topic.find({ companyId: e.companyId }).lean() as Promise<TopicDoc[]>,
      ]);

      return {
        ...e,
        companyName: companyMap[e.companyId] ?? e.companyId,
        relatedTopics: topics.map((t: TopicDoc) => ({
          id: t.id,
          title: t.title,
          type: t.type,
          degrees: t.degrees,
        })),
      };
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
