/**
 * entityService.ts — Centralized DB access layer for batch-resolving entities.
 *
 * Eliminates N+1 query patterns by collecting all needed IDs up-front
 * and resolving each entity type with a single `$in` query.
 *
 * Every query uses `.lean()` to return plain objects and skip Mongoose hydration.
 */

import type { Model, Document } from 'mongoose';

import type { TopicDoc } from '../models/Topic.js';
import type { SupervisorDoc } from '../models/Supervisor.js';
import type { CompanyDoc } from '../models/Company.js';
import type { ExpertDoc } from '../models/Expert.js';
import type { FieldDoc } from '../models/Field.js';
import type { UniversityDoc } from '../models/University.js';
import type { StudentDoc } from '../models/Student.js';

import { Topic } from '../models/Topic.js';
import { Supervisor } from '../models/Supervisor.js';
import { Company } from '../models/Company.js';
import { Expert } from '../models/Expert.js';
import { Field } from '../models/Field.js';
import { University } from '../models/University.js';
import { Student } from '../models/Student.js';

// ---------------------------------------------------------------------------
// Enriched document types
// ---------------------------------------------------------------------------

export interface EnrichedTopic extends TopicDoc {
  companyName: string | null;
  universityName: string | null;
  fieldNames: string[];
  supervisorNames: string[];
  expertNames: string[];
}

export interface EnrichedSupervisor extends SupervisorDoc {
  universityName: string | null;
  fieldNames: string[];
}

export interface EnrichedExpert extends ExpertDoc {
  companyName: string | null;
  fieldNames: string[];
}

// ---------------------------------------------------------------------------
// Entity type union accepted by getFullEntityContext
// ---------------------------------------------------------------------------

export type EntityType = 'topic' | 'supervisor' | 'expert' | 'company' | 'university' | 'field' | 'student';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deduplicate and remove falsy values from an array of IDs. */
function uniqueIds(ids: (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => id != null && id !== ''))];
}

// ---------------------------------------------------------------------------
// 1. Generic batch name resolver
// ---------------------------------------------------------------------------

/**
 * Given an array of entity IDs, return a Map<id, displayName>.
 * Uses a single `{ id: { $in: [...] } }` query.
 *
 * @param ids        Array of entity IDs to look up
 * @param ModelRef   The Mongoose model to query
 * @param nameField  The document field used as the display name (default: `"name"`)
 */
export async function resolveNames<T extends Document>(
  ids: string[],
  ModelRef: Model<T>,
  nameField: string = 'name',
): Promise<Map<string, string>> {
  const deduped = uniqueIds(ids);
  if (deduped.length === 0) return new Map();

  const docs = await ModelRef.find({ id: { $in: deduped } })
    .select(`id ${nameField}`)
    .lean<Array<Record<string, unknown>>>();

  const map = new Map<string, string>();
  for (const doc of docs) {
    const id = doc['id'] as string;
    const name = doc[nameField] as string | undefined;
    if (id && name !== undefined) {
      map.set(id, String(name));
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// 2–4. Typed convenience wrappers
// ---------------------------------------------------------------------------

export async function resolveCompanyNames(companyIds: string[]): Promise<Map<string, string>> {
  return resolveNames(companyIds, Company, 'name');
}

export async function resolveUniversityNames(uniIds: string[]): Promise<Map<string, string>> {
  return resolveNames(uniIds, University, 'name');
}

export async function resolveFieldNames(fieldIds: string[]): Promise<Map<string, string>> {
  return resolveNames(fieldIds, Field, 'name');
}

// ---------------------------------------------------------------------------
// Person-name resolver (firstName + lastName)
// ---------------------------------------------------------------------------

async function resolvePersonNames<T extends Document>(
  ids: string[],
  ModelRef: Model<T>,
): Promise<Map<string, string>> {
  const deduped = uniqueIds(ids);
  if (deduped.length === 0) return new Map();

  const docs = await ModelRef.find({ id: { $in: deduped } })
    .select('id firstName lastName title')
    .lean<Array<Record<string, unknown>>>();

  const map = new Map<string, string>();
  for (const doc of docs) {
    const id = doc['id'] as string;
    const first = doc['firstName'] as string | undefined;
    const last = doc['lastName'] as string | undefined;
    const title = doc['title'] as string | undefined;
    if (id && first && last) {
      const prefix = title ? `${title} ` : '';
      map.set(id, `${prefix}${first} ${last}`);
    }
  }
  return map;
}

export async function resolveSupervisorNames(supervisorIds: string[]): Promise<Map<string, string>> {
  return resolvePersonNames(supervisorIds, Supervisor);
}

export async function resolveExpertNames(expertIds: string[]): Promise<Map<string, string>> {
  return resolvePersonNames(expertIds, Expert);
}

// ---------------------------------------------------------------------------
// 5. enrichTopic — single topic enrichment
// ---------------------------------------------------------------------------

export async function enrichTopic(topic: TopicDoc): Promise<EnrichedTopic> {
  const [companyNames, universityNames, fieldNames, supervisorNames, expertNames] =
    await Promise.all([
      resolveCompanyNames(topic.companyId ? [topic.companyId] : []),
      resolveUniversityNames(topic.universityId ? [topic.universityId] : []),
      resolveFieldNames(topic.fieldIds ?? []),
      resolveSupervisorNames(topic.supervisorIds ?? []),
      resolveExpertNames(topic.expertIds ?? []),
    ]);

  return Object.assign({}, topic, {
    companyName: topic.companyId ? (companyNames.get(topic.companyId) ?? null) : null,
    universityName: topic.universityId ? (universityNames.get(topic.universityId) ?? null) : null,
    fieldNames: (topic.fieldIds ?? []).map((fid) => fieldNames.get(fid) ?? fid),
    supervisorNames: (topic.supervisorIds ?? []).map((sid) => supervisorNames.get(sid) ?? sid),
    expertNames: (topic.expertIds ?? []).map((eid) => expertNames.get(eid) ?? eid),
  }) as EnrichedTopic;
}

// ---------------------------------------------------------------------------
// 6. enrichTopics — batch topic enrichment (ONE query per entity type)
// ---------------------------------------------------------------------------

export async function enrichTopics(topics: TopicDoc[]): Promise<EnrichedTopic[]> {
  if (topics.length === 0) return [];

  // Collect all referenced IDs across every topic
  const allCompanyIds: string[] = [];
  const allUniversityIds: string[] = [];
  const allFieldIds: string[] = [];
  const allSupervisorIds: string[] = [];
  const allExpertIds: string[] = [];

  for (const t of topics) {
    if (t.companyId) allCompanyIds.push(t.companyId);
    if (t.universityId) allUniversityIds.push(t.universityId);
    allFieldIds.push(...(t.fieldIds ?? []));
    allSupervisorIds.push(...(t.supervisorIds ?? []));
    allExpertIds.push(...(t.expertIds ?? []));
  }

  // One query per type, run in parallel
  const [companyNames, universityNames, fieldNames, supervisorNames, expertNames] =
    await Promise.all([
      resolveCompanyNames(allCompanyIds),
      resolveUniversityNames(allUniversityIds),
      resolveFieldNames(allFieldIds),
      resolveSupervisorNames(allSupervisorIds),
      resolveExpertNames(allExpertIds),
    ]);

  return topics.map((t) =>
    Object.assign({}, t, {
      companyName: t.companyId ? (companyNames.get(t.companyId) ?? null) : null,
      universityName: t.universityId ? (universityNames.get(t.universityId) ?? null) : null,
      fieldNames: (t.fieldIds ?? []).map((fid) => fieldNames.get(fid) ?? fid),
      supervisorNames: (t.supervisorIds ?? []).map((sid) => supervisorNames.get(sid) ?? sid),
      expertNames: (t.expertIds ?? []).map((eid) => expertNames.get(eid) ?? eid),
    }) as EnrichedTopic,
  );
}

// ---------------------------------------------------------------------------
// 7. enrichSupervisor — single supervisor enrichment
// ---------------------------------------------------------------------------

export async function enrichSupervisor(supervisor: SupervisorDoc): Promise<EnrichedSupervisor> {
  const [universityNames, fieldNames] = await Promise.all([
    resolveUniversityNames(supervisor.universityId ? [supervisor.universityId] : []),
    resolveFieldNames(supervisor.fieldIds ?? []),
  ]);

  return Object.assign({}, supervisor, {
    universityName: supervisor.universityId
      ? (universityNames.get(supervisor.universityId) ?? null)
      : null,
    fieldNames: (supervisor.fieldIds ?? []).map((fid) => fieldNames.get(fid) ?? fid),
  }) as EnrichedSupervisor;
}

// ---------------------------------------------------------------------------
// 8. enrichSupervisors — batch version
// ---------------------------------------------------------------------------

export async function enrichSupervisors(supervisors: SupervisorDoc[]): Promise<EnrichedSupervisor[]> {
  if (supervisors.length === 0) return [];

  const allUniversityIds: string[] = [];
  const allFieldIds: string[] = [];

  for (const s of supervisors) {
    if (s.universityId) allUniversityIds.push(s.universityId);
    allFieldIds.push(...(s.fieldIds ?? []));
  }

  const [universityNames, fieldNames] = await Promise.all([
    resolveUniversityNames(allUniversityIds),
    resolveFieldNames(allFieldIds),
  ]);

  return supervisors.map((s) =>
    Object.assign({}, s, {
      universityName: s.universityId
        ? (universityNames.get(s.universityId) ?? null)
        : null,
      fieldNames: (s.fieldIds ?? []).map((fid) => fieldNames.get(fid) ?? fid),
    }) as EnrichedSupervisor,
  );
}

// ---------------------------------------------------------------------------
// 9. enrichExpert — single expert enrichment
// ---------------------------------------------------------------------------

export async function enrichExpert(expert: ExpertDoc): Promise<EnrichedExpert> {
  const [companyNames, fieldNames] = await Promise.all([
    resolveCompanyNames(expert.companyId ? [expert.companyId] : []),
    resolveFieldNames(expert.fieldIds ?? []),
  ]);

  return Object.assign({}, expert, {
    companyName: expert.companyId ? (companyNames.get(expert.companyId) ?? null) : null,
    fieldNames: (expert.fieldIds ?? []).map((fid) => fieldNames.get(fid) ?? fid),
  }) as EnrichedExpert;
}

// ---------------------------------------------------------------------------
// 10. enrichExperts — batch version
// ---------------------------------------------------------------------------

export async function enrichExperts(experts: ExpertDoc[]): Promise<EnrichedExpert[]> {
  if (experts.length === 0) return [];

  const allCompanyIds: string[] = [];
  const allFieldIds: string[] = [];

  for (const e of experts) {
    if (e.companyId) allCompanyIds.push(e.companyId);
    allFieldIds.push(...(e.fieldIds ?? []));
  }

  const [companyNames, fieldNames] = await Promise.all([
    resolveCompanyNames(allCompanyIds),
    resolveFieldNames(allFieldIds),
  ]);

  return experts.map((e) =>
    Object.assign({}, e, {
      companyName: e.companyId ? (companyNames.get(e.companyId) ?? null) : null,
      fieldNames: (e.fieldIds ?? []).map((fid) => fieldNames.get(fid) ?? fid),
    }) as EnrichedExpert,
  );
}

// ---------------------------------------------------------------------------
// 11. getFullEntityContext — rich plain-text description for LLM prompts
// ---------------------------------------------------------------------------

/**
 * Fetches an entity by type + ID, resolves all related entities,
 * and returns a formatted plain-text block suitable for injecting into
 * an LLM system/user prompt.
 */
export async function getFullEntityContext(
  entityType: EntityType,
  entityId: string,
): Promise<string> {
  switch (entityType) {
    case 'topic':
      return buildTopicContext(entityId);
    case 'supervisor':
      return buildSupervisorContext(entityId);
    case 'expert':
      return buildExpertContext(entityId);
    case 'company':
      return buildCompanyContext(entityId);
    case 'university':
      return buildUniversityContext(entityId);
    case 'field':
      return buildFieldContext(entityId);
    case 'student':
      return buildStudentContext(entityId);
  }
}

// ---- Context builders (private) -----------------------------------------

async function buildTopicContext(entityId: string): Promise<string> {
  const topic = await Topic.findOne({ id: entityId }).lean<TopicDoc>();
  if (!topic) return `[Topic ${entityId} not found]`;

  // Resolve all related entities in parallel
  const [companyNames, universityNames, fieldNames, supervisors, experts] = await Promise.all([
    resolveCompanyNames(topic.companyId ? [topic.companyId] : []),
    resolveUniversityNames(topic.universityId ? [topic.universityId] : []),
    resolveFieldNames(topic.fieldIds ?? []),
    Supervisor.find({ id: { $in: uniqueIds(topic.supervisorIds ?? []) } }).lean<SupervisorDoc[]>(),
    Expert.find({ id: { $in: uniqueIds(topic.expertIds ?? []) } }).lean<ExpertDoc[]>(),
  ]);

  const lines: string[] = [
    `=== TOPIC: ${topic.title} ===`,
    `ID: ${topic.id}`,
    `Type: ${topic.type}`,
    `Description: ${topic.description}`,
  ];

  if (topic.employment) lines.push(`Employment: ${topic.employment}`);
  if (topic.employmentType) lines.push(`Employment Type: ${topic.employmentType}`);
  if (topic.workplaceType) lines.push(`Workplace Type: ${topic.workplaceType}`);
  if (topic.degrees?.length) lines.push(`Degrees: ${topic.degrees.join(', ')}`);

  const fieldNamesList = (topic.fieldIds ?? []).map((fid) => fieldNames.get(fid) ?? fid);
  if (fieldNamesList.length) lines.push(`Fields: ${fieldNamesList.join(', ')}`);

  if (topic.companyId) {
    lines.push(`Company: ${companyNames.get(topic.companyId) ?? topic.companyId}`);
  }
  if (topic.universityId) {
    lines.push(`University: ${universityNames.get(topic.universityId) ?? topic.universityId}`);
  }

  if (supervisors.length) {
    lines.push(`Supervisors:`);
    for (const s of supervisors) {
      lines.push(`  - ${s.title} ${s.firstName} ${s.lastName} (${s.email})`);
      if (s.researchInterests?.length) {
        lines.push(`    Research interests: ${s.researchInterests.join(', ')}`);
      }
    }
  }

  if (experts.length) {
    lines.push(`Experts:`);
    for (const e of experts) {
      lines.push(`  - ${e.title} ${e.firstName} ${e.lastName} (${e.email})`);
      if (e.about) lines.push(`    About: ${e.about}`);
    }
  }

  return lines.join('\n');
}

async function buildSupervisorContext(entityId: string): Promise<string> {
  const supervisor = await Supervisor.findOne({ id: entityId }).lean<SupervisorDoc>();
  if (!supervisor) return `[Supervisor ${entityId} not found]`;

  const [universityNames, fieldNames] = await Promise.all([
    resolveUniversityNames([supervisor.universityId]),
    resolveFieldNames(supervisor.fieldIds ?? []),
  ]);

  const lines: string[] = [
    `=== SUPERVISOR: ${supervisor.title} ${supervisor.firstName} ${supervisor.lastName} ===`,
    `ID: ${supervisor.id}`,
    `Email: ${supervisor.email}`,
    `University: ${universityNames.get(supervisor.universityId) ?? supervisor.universityId}`,
  ];

  const fieldNamesList = (supervisor.fieldIds ?? []).map((fid) => fieldNames.get(fid) ?? fid);
  if (fieldNamesList.length) lines.push(`Fields: ${fieldNamesList.join(', ')}`);
  if (supervisor.researchInterests?.length) {
    lines.push(`Research Interests: ${supervisor.researchInterests.join(', ')}`);
  }
  if (supervisor.about) lines.push(`About: ${supervisor.about}`);
  if (supervisor.objectives?.length) {
    lines.push(`Objectives: ${supervisor.objectives.join('; ')}`);
  }

  return lines.join('\n');
}

async function buildExpertContext(entityId: string): Promise<string> {
  const expert = await Expert.findOne({ id: entityId }).lean<ExpertDoc>();
  if (!expert) return `[Expert ${entityId} not found]`;

  const [companyNames, fieldNames] = await Promise.all([
    resolveCompanyNames([expert.companyId]),
    resolveFieldNames(expert.fieldIds ?? []),
  ]);

  const lines: string[] = [
    `=== EXPERT: ${expert.title} ${expert.firstName} ${expert.lastName} ===`,
    `ID: ${expert.id}`,
    `Email: ${expert.email}`,
    `Company: ${companyNames.get(expert.companyId) ?? expert.companyId}`,
    `Offers Interviews: ${expert.offerInterviews ? 'Yes' : 'No'}`,
  ];

  const fieldNamesList = (expert.fieldIds ?? []).map((fid) => fieldNames.get(fid) ?? fid);
  if (fieldNamesList.length) lines.push(`Fields: ${fieldNamesList.join(', ')}`);
  if (expert.about) lines.push(`About: ${expert.about}`);
  if (expert.objectives?.length) {
    lines.push(`Objectives: ${expert.objectives.join('; ')}`);
  }

  return lines.join('\n');
}

async function buildCompanyContext(entityId: string): Promise<string> {
  const company = await Company.findOne({ id: entityId }).lean<CompanyDoc>();
  if (!company) return `[Company ${entityId} not found]`;

  const lines: string[] = [
    `=== COMPANY: ${company.name} ===`,
    `ID: ${company.id}`,
    `Description: ${company.description}`,
    `Size: ${company.size}`,
  ];

  if (company.domains?.length) lines.push(`Domains: ${company.domains.join(', ')}`);
  if (company.about) lines.push(`About: ${company.about}`);

  // Also list experts and topics belonging to this company
  const [experts, topics] = await Promise.all([
    Expert.find({ companyId: entityId }).select('id firstName lastName title').lean<ExpertDoc[]>(),
    Topic.find({ companyId: entityId }).select('id title').lean<TopicDoc[]>(),
  ]);

  if (experts.length) {
    lines.push(`Experts at this company:`);
    for (const e of experts) {
      lines.push(`  - ${e.title} ${e.firstName} ${e.lastName}`);
    }
  }

  if (topics.length) {
    lines.push(`Topics at this company:`);
    for (const t of topics) {
      lines.push(`  - ${t.title} (${t.id})`);
    }
  }

  return lines.join('\n');
}

async function buildUniversityContext(entityId: string): Promise<string> {
  const university = await University.findOne({ id: entityId }).lean<UniversityDoc>();
  if (!university) return `[University ${entityId} not found]`;

  const lines: string[] = [
    `=== UNIVERSITY: ${university.name} ===`,
    `ID: ${university.id}`,
    `Country: ${university.country}`,
  ];

  if (university.domains?.length) lines.push(`Domains: ${university.domains.join(', ')}`);
  if (university.about) lines.push(`About: ${university.about}`);

  // List supervisors and topics at this university
  const [supervisors, topics] = await Promise.all([
    Supervisor.find({ universityId: entityId }).select('id firstName lastName title').lean<SupervisorDoc[]>(),
    Topic.find({ universityId: entityId }).select('id title').lean<TopicDoc[]>(),
  ]);

  if (supervisors.length) {
    lines.push(`Supervisors at this university:`);
    for (const s of supervisors) {
      lines.push(`  - ${s.title} ${s.firstName} ${s.lastName}`);
    }
  }

  if (topics.length) {
    lines.push(`Topics at this university:`);
    for (const t of topics) {
      lines.push(`  - ${t.title} (${t.id})`);
    }
  }

  return lines.join('\n');
}

async function buildFieldContext(entityId: string): Promise<string> {
  const field = await Field.findOne({ id: entityId }).lean<FieldDoc>();
  if (!field) return `[Field ${entityId} not found]`;

  const lines: string[] = [
    `=== FIELD: ${field.name} ===`,
    `ID: ${field.id}`,
  ];

  // List topics, supervisors, and experts in this field
  const [topics, supervisors, experts] = await Promise.all([
    Topic.find({ fieldIds: entityId }).select('id title type').lean<TopicDoc[]>(),
    Supervisor.find({ fieldIds: entityId }).select('id firstName lastName title').lean<SupervisorDoc[]>(),
    Expert.find({ fieldIds: entityId }).select('id firstName lastName title').lean<ExpertDoc[]>(),
  ]);

  if (topics.length) {
    lines.push(`Topics in this field (${topics.length}):`);
    for (const t of topics) {
      lines.push(`  - ${t.title} [${t.type}] (${t.id})`);
    }
  }

  if (supervisors.length) {
    lines.push(`Supervisors in this field (${supervisors.length}):`);
    for (const s of supervisors) {
      lines.push(`  - ${s.title} ${s.firstName} ${s.lastName}`);
    }
  }

  if (experts.length) {
    lines.push(`Experts in this field (${experts.length}):`);
    for (const e of experts) {
      lines.push(`  - ${e.title} ${e.firstName} ${e.lastName}`);
    }
  }

  return lines.join('\n');
}

async function buildStudentContext(entityId: string): Promise<string> {
  const student = await Student.findOne({ id: entityId }).lean<StudentDoc>();
  if (!student) return `[Student ${entityId} not found]`;

  const [universityNames, fieldNames] = await Promise.all([
    resolveUniversityNames([student.universityId]),
    resolveFieldNames(student.fieldIds ?? []),
  ]);

  const lines: string[] = [
    `=== STUDENT: ${student.firstName} ${student.lastName} ===`,
    `ID: ${student.id}`,
    `Email: ${student.email}`,
    `Degree: ${student.degree}`,
    `University: ${universityNames.get(student.universityId) ?? student.universityId}`,
  ];

  const fieldNamesList = (student.fieldIds ?? []).map((fid) => fieldNames.get(fid) ?? fid);
  if (fieldNamesList.length) lines.push(`Fields of Interest: ${fieldNamesList.join(', ')}`);
  if (student.skills?.length) lines.push(`Skills: ${student.skills.join(', ')}`);
  if (student.interests?.length) lines.push(`Interests: ${student.interests.join(', ')}`);
  if (student.about) lines.push(`About: ${student.about}`);
  if (student.objectives?.length) {
    lines.push(`Objectives: ${student.objectives.join('; ')}`);
  }

  if (student.roadmapSteps?.length) {
    lines.push(`\nRoadmap Progress:`);
    for (const step of student.roadmapSteps) {
      const status = step.status === 'committed'
        ? `COMMITTED → ${step.committedEntityName ?? step.committedEntityId ?? '?'}`
        : 'open';
      lines.push(`  [${step.id}] ${step.label}: ${status}`);
    }
  }

  return lines.join('\n');
}
