// ============================================================
// Core domain types for the Studyond Thesis Journey App
// ============================================================

export type Degree = 'bsc' | 'msc' | 'phd';
export type WorkplaceType = 'remote' | 'hybrid' | 'on_site';
export type EntityType = 'company' | 'supervisor' | 'topic';

// ---- Student Profile ----

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  degree: Degree;
  university: string;
  studyProgram: string;
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
  subtitle: string;           // Company domain, Prof title, or topic company name
  imageUrl: string | null;    // Logo or avatar URL
  initials: string;           // Fallback for avatar
  compatibilityScore: number; // 3.0–5.0
  description: string;        // 2-3 sentence AI-generated rationale
  tags: string[];             // e.g. ["#NLP", "#Remote", "#Fintech"]
  topicTitle?: string;        // Specific thesis topic title if applicable
  university?: string;        // For supervisor cards
  workplaceType?: WorkplaceType;
}

// ---- Thread (a saved match → becomes a conversation) ----

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Thread {
  id: string;           // Same as MatchCard.id for the saved card
  card: MatchCard;
  messages: ThreadMessage[];
  lastActivity: Date;
  isCommitted: boolean;
  isRead: boolean;
}

// ---- Roadmap ----

export type RoadmapStepStatus = 'completed' | 'current' | 'future';

export interface RoadmapStep {
  id: string;
  label: string;
  description: string;
  status: RoadmapStepStatus;
  completedAt?: Date;
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
