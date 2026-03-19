import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  StudentProfile,
  MatchCard,
  Thread,
  ThreadMessage,
  RoadmapStep,
  RoadmapStepId,
} from '@/types';
import { MOCK_STUDENT, MOCK_PROFILE_TAGS } from '@/data/mockStudent';
import { INITIAL_ROADMAP_STEPS } from '@/data/roadmapSteps';
import {
  createThread as apiCreateThread,
  deleteThread as apiDeleteThread,
  commitThread as apiCommitThread,
  uncommitThread as apiUncommitThread,
  addThreadMessage as apiAddThreadMessage,
  markThreadRead as apiMarkThreadRead,
} from '@/api';

// The single demo student ID used throughout the app
const STUDENT_ID = 'student-01';

// ---- Helpers ----
function getInitials(name: string): string {
  return name.split(/[\s.]+/).filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function enrichCard(card: MatchCard): MatchCard {
  return card.initials ? card : { ...card, initials: getInitials(card.name) };
}

function buildWelcomeMessage(enriched: MatchCard): ThreadMessage {
  return {
    id: `msg-init-${enriched.id}`,
    role: 'assistant',
    content:
      `Hi! I'm here to help you explore the thesis opportunity with **${enriched.name}**.` +
      (enriched.topicTitle ? ` The topic is: *${enriched.topicTitle}*.` : '') +
      `\n\nFeel free to ask me anything — about the research scope, what skills you'd need, how to reach out, or whether it fits your timeline.`,
    timestamp: new Date(),
  };
}

// ---- Store interface ----

interface AppState {
  // Profile
  profile: StudentProfile;
  profileTags: string[];

  // Chatbot — session only, NOT persisted to DB
  swipeDeck: MatchCard[];
  deckVisible: boolean;

  // Saved Threads (DM inbox) — persisted to DB
  savedThreads: Thread[];

  // Roadmap — persisted to DB (via student document)
  roadmapSteps: RoadmapStep[];

  // UI
  hasExploredTopics: boolean;

  // ---- Actions ----

  updateProfile: (data: Partial<StudentProfile>) => void;
  setProfileTags: (tags: string[]) => void;

  setSwipeDeck: (cards: MatchCard[]) => void;
  setDeckVisible: (visible: boolean) => void;

  saveThread: (card: MatchCard) => void;
  removeThread: (threadId: string) => void;
  addMessageToThread: (threadId: string, message: ThreadMessage) => void;
  markThreadRead: (threadId: string) => void;

  commitToThread: (threadId: string, stepId: RoadmapStepId) => void;
  uncommitThread: (threadId: string) => void;

  setRoadmapSteps: (steps: RoadmapStep[]) => void;
  hydrateFromDB: (data: {
    profile?: StudentProfile;
    profileTags?: string[];
    savedThreads?: Thread[];
    roadmapSteps?: RoadmapStep[];
  }) => void;

  getThread: (threadId: string) => Thread | undefined;
  getCommittedThreadIds: () => string[];
  buildSystemContext: () => string;
}

// Fire-and-forget helper — logs errors without throwing
function bgSync(label: string, promise: Promise<unknown>) {
  promise.catch((err) => console.warn(`[Store] DB sync failed (${label}):`, err));
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ---- Initial state ----
      profile: MOCK_STUDENT,
      profileTags: MOCK_PROFILE_TAGS,
      swipeDeck: [],
      deckVisible: false,
      savedThreads: [],
      roadmapSteps: INITIAL_ROADMAP_STEPS,
      hasExploredTopics: false,

      // ---- Profile ----
      updateProfile: (data) => set((s) => ({ profile: { ...s.profile, ...data } })),
      setProfileTags: (tags) => set({ profileTags: tags }),

      // ---- Swipe deck (session only — no DB sync) ----
      setSwipeDeck: (cards) => set({ swipeDeck: cards.map(enrichCard), deckVisible: cards.length > 0 }),
      setDeckVisible: (visible) => set({ deckVisible: visible }),

      // ---- Threads ----

      saveThread: (card) => {
        const enriched = enrichCard(card);

        // Idempotent — don't duplicate
        if (get().savedThreads.find((t) => t.id === enriched.id)) return;

        const thread: Thread = {
          id: enriched.id,
          card: enriched,
          messages: [buildWelcomeMessage(enriched)],
          lastActivity: new Date(),
          isRead: false,
          closedStepId: null,
          closedAt: null,
        };

        // Optimistic UI update
        set((s) => ({ savedThreads: [thread, ...s.savedThreads] }));

        // DB sync — backend creates the thread with the same welcome message
        bgSync('saveThread', apiCreateThread(STUDENT_ID, enriched));
      },

      removeThread: (threadId) => {
        const thread = get().savedThreads.find((t) => t.id === threadId);

        // Optimistic update — also reopen the step if this thread closed one
        set((s) => ({
          savedThreads: s.savedThreads.filter((t) => t.id !== threadId),
          roadmapSteps: thread?.closedStepId
            ? s.roadmapSteps.map((step) =>
                step.id === thread.closedStepId
                  ? { ...step, status: 'open' as const, committedThreadId: null, committedAt: null }
                  : step
              )
            : s.roadmapSteps,
        }));

        bgSync('removeThread', apiDeleteThread(STUDENT_ID, threadId));
      },

      addMessageToThread: (threadId, message) => {
        // Optimistic update
        set((s) => ({
          savedThreads: s.savedThreads.map((t) =>
            t.id === threadId
              ? { ...t, messages: [...t.messages, message], lastActivity: new Date() }
              : t
          ),
        }));

        // DB sync — only persist user/assistant messages; skip the init message (already created by backend)
        if (message.id.startsWith('msg-init-')) return;
        bgSync(
          'addMessageToThread',
          apiAddThreadMessage(STUDENT_ID, threadId, { role: message.role, content: message.content })
        );
      },

      markThreadRead: (threadId) => {
        set((s) => ({
          savedThreads: s.savedThreads.map((t) =>
            t.id === threadId ? { ...t, isRead: true } : t
          ),
        }));
        bgSync('markThreadRead', apiMarkThreadRead(STUDENT_ID, threadId));
      },

      // ---- Commit / Uncommit ----

      commitToThread: (threadId, stepId) => {
        const now = new Date();

        // If another thread already closes this step, clear it locally first
        const previousCommit = get().savedThreads.find(
          (t) => t.closedStepId === stepId && t.id !== threadId
        );

        set((s) => ({
          roadmapSteps: s.roadmapSteps.map((step) =>
            step.id === stepId
              ? { ...step, status: 'committed' as const, committedThreadId: threadId, committedAt: now }
              : step
          ),
          savedThreads: s.savedThreads.map((t) => {
            if (t.id === threadId) return { ...t, closedStepId: stepId, closedAt: now };
            if (previousCommit && t.id === previousCommit.id)
              return { ...t, closedStepId: null, closedAt: null };
            return t;
          }),
        }));

        bgSync('commitToThread', apiCommitThread(STUDENT_ID, threadId, stepId));
      },

      // No cascade — only this thread's step is reverted.
      uncommitThread: (threadId) => {
        const thread = get().savedThreads.find((t) => t.id === threadId);
        if (!thread?.closedStepId) return;

        const stepId = thread.closedStepId;

        set((s) => ({
          roadmapSteps: s.roadmapSteps.map((step) =>
            step.id === stepId
              ? { ...step, status: 'open' as const, committedThreadId: null, committedAt: null }
              : step
          ),
          savedThreads: s.savedThreads.map((t) =>
            t.id === threadId ? { ...t, closedStepId: null, closedAt: null } : t
          ),
        }));

        bgSync('uncommitThread', apiUncommitThread(STUDENT_ID, threadId));
      },

      // ---- Roadmap ----
      setRoadmapSteps: (steps) => set({ roadmapSteps: steps }),

      // ---- DB hydration (called on app init — DB is authoritative) ----
      hydrateFromDB: ({ profile, profileTags, savedThreads, roadmapSteps }) => {
        set(() => ({
          ...(profile !== undefined && { profile }),
          ...(profileTags !== undefined && { profileTags }),
          ...(savedThreads !== undefined && {
            savedThreads: savedThreads.map((t) => ({
              ...t,
              card: enrichCard(t.card),
              lastActivity: new Date(t.lastActivity),
              closedAt: t.closedAt ? new Date(t.closedAt) : null,
              messages: t.messages.map((m) => ({
                ...m,
                timestamp: new Date(m.timestamp),
              })),
            })),
          }),
          ...(roadmapSteps !== undefined && {
            roadmapSteps: roadmapSteps.map((s) => ({
              ...s,
              committedAt: s.committedAt ? new Date(s.committedAt) : null,
            })),
          }),
        }));
      },

      // ---- Helpers ----
      getThread: (threadId) => get().savedThreads.find((t) => t.id === threadId),

      getCommittedThreadIds: () =>
        get()
          .roadmapSteps.filter((s) => s.status === 'committed' && s.committedThreadId)
          .map((s) => s.committedThreadId!),

      buildSystemContext: () => {
        const { profile, profileTags, roadmapSteps, savedThreads } = get();

        const committedLines = roadmapSteps
          .filter((s) => s.status === 'committed' && s.committedThreadId)
          .map((s) => {
            const t = savedThreads.find((th) => th.id === s.committedThreadId);
            const detail = t?.card.topicTitle
              ? `"${t.card.topicTitle}" via ${t.card.name}`
              : t?.card.name ?? s.committedThreadId;
            return `  ✓ ${s.label}: ${detail}`;
          });

        const openLines = roadmapSteps
          .filter((s) => s.status === 'open')
          .map((s) => `  ○ ${s.label}`);

        return `## Student Profile
Name: ${profile.firstName} ${profile.lastName}
Degree: ${profile.degree.toUpperCase()} · ${profile.studyProgram} at ${profile.university}
Email: ${profile.email}
Skills: ${profile.skills.join(', ')}
Interests: ${profile.interests.join(', ')}
AI Profile Tags: ${profileTags.join(', ')}
About: ${profile.about}
Objectives: ${profile.objectives.join(', ')}${
          committedLines.length > 0
            ? `\n\n## Thesis Decisions (committed)\n${committedLines.join('\n')}`
            : ''
        }${
          openLines.length > 0
            ? `\n\n## Still Searching\n${openLines.join('\n')}`
            : ''
        }`;
      },
    }),
    {
      name: 'studyond-app-state',
      // swipeDeck and deckVisible are excluded — they're session-only
      partialize: (s) => ({
        profile: s.profile,
        profileTags: s.profileTags,
        savedThreads: s.savedThreads,
        roadmapSteps: s.roadmapSteps,
        hasExploredTopics: s.hasExploredTopics,
      }),
    }
  )
);
