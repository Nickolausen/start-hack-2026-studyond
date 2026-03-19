// ============================================================
// Core domain types for the Studyond Thesis Journey App
// ============================================================

export type Degree = 'bsc' | 'msc' | 'phd';
export type EntityType = 'field' | 'company' | 'expert' | 'supervisor' | 'topic';

// ---- Student Profile ----

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  degree: Degree;
  university: string;       // display-only — not stored in DB directly
  studyProgram: string;     // display-only — not stored in DB directly
  studyProgramId?: string;
  universityId?: string;
  skills: string[];
  interests: string[];
  about: string;
  objectives: string[];
}

// ---- Match Card (produced by AI swipe deck) ----

export interface MatchCard {
  id: string;
  entityType: EntityType;
  entityId: string;
  name: string;
  subtitle: string;
  imageUrl: string | null;
  compatibilityScore: number; // 1.0–5.0
  description: string;
  tags: string[];
  topicTitle?: string;
  university?: string;
  // Dependency metadata — used by commit engine
  companyId?: string;
  ownerEntityId?: string;
  supervisorIds?: string[];
  expertIds?: string[];
  fieldIds?: string[];
  // Frontend-only computed field
  initials?: string;
}

// Compute initials from a display name (frontend utility)
export function computeInitials(name: string): string {
  return name
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ---- Roadmap ----

export type RoadmapStepId = 'field' | 'company' | 'expert' | 'supervisor' | 'topic';
export type RoadmapStepStatus = 'open' | 'committed';

export interface RoadmapStep {
  id: RoadmapStepId;
  label: string;
  description: string;
  status: RoadmapStepStatus;
  committedThreadId: string | null;
  committedEntityId: string | null;
  committedEntityName: string | null;
  committedAt: Date | null;
}

// ---- Commit engine types (from backend) ----

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
  threadId: string | null;
}

// ---- Thread (a saved match -> becomes a conversation) ----

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Thread {
  id: string;
  card: MatchCard;
  messages: ThreadMessage[];
  lastActivity: Date;
  isRead: boolean;
  closedStepId: string | null;
  closedAt: Date | null;
}

// Derived helper
export function isThreadCommitted(thread: Thread): boolean {
  return thread.closedStepId !== null;
}

// ---- Chat message (AI SDK compatible) ----

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ---- AI Response parsing ----

export interface ParsedAIResponse {
  text: string;
  matches: MatchCard[] | null;
}

// ---- Thesis Project ----

export type ProjectState = 'proposed' | 'applied' | 'withdrawn' | 'rejected' | 'agreed' | 'in_progress' | 'canceled' | 'completed';

export interface ThesisProject {
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
  createdAt: string;
  updatedAt: string;
}
