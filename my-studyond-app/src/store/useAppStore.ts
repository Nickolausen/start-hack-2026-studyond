import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  StudentProfile,
  MatchCard,
  Thread,
  ThreadMessage,
  RoadmapStep,
} from '@/types';
import { MOCK_STUDENT, MOCK_PROFILE_TAGS } from '@/data/mockStudent';
import { INITIAL_ROADMAP_STEPS } from '@/data/roadmapSteps';

interface AppState {
  // ---- Student Profile ----
  profile: StudentProfile;
  profileTags: string[];

  // ---- Chatbot ----
  swipeDeck: MatchCard[];
  deckVisible: boolean;

  // ---- Saved Threads (DM inbox) ----
  savedThreads: Thread[];
  committedThreadId: string | null;

  // ---- Roadmap ----
  roadmapSteps: RoadmapStep[];

  // ---- UI State ----
  hasExploredTopics: boolean;

  // ---- Actions ----

  // Profile
  updateProfile: (data: Partial<StudentProfile>) => void;
  setProfileTags: (tags: string[]) => void;

  // Swipe deck
  setSwipeDeck: (cards: MatchCard[]) => void;
  setDeckVisible: (visible: boolean) => void;

  // Threads
  saveThread: (card: MatchCard) => void;
  removeThread: (threadId: string) => void;
  addMessageToThread: (threadId: string, message: ThreadMessage) => void;
  markThreadRead: (threadId: string) => void;
  commitToThread: (threadId: string) => void;
  uncommitThread: () => void;

  // Roadmap
  setRoadmapStepStatus: (stepId: string, status: RoadmapStep['status'], completedAt?: Date) => void;

  // Helpers
  getThread: (threadId: string) => Thread | undefined;
  buildSystemContext: () => string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ---- Initial State ----
      profile: MOCK_STUDENT,
      profileTags: MOCK_PROFILE_TAGS,
      swipeDeck: [],
      deckVisible: false,
      savedThreads: [],
      committedThreadId: null,
      roadmapSteps: INITIAL_ROADMAP_STEPS,
      hasExploredTopics: false,

      // ---- Profile Actions ----
      updateProfile: (data) =>
        set((state) => ({ profile: { ...state.profile, ...data } })),

      setProfileTags: (tags) => set({ profileTags: tags }),

      // ---- Swipe Deck Actions ----
      setSwipeDeck: (cards) => set({ swipeDeck: cards, deckVisible: cards.length > 0 }),

      setDeckVisible: (visible) => set({ deckVisible: visible }),

      // ---- Thread Actions ----
      saveThread: (card) => {
        const state = get();
        // Don't duplicate
        if (state.savedThreads.find((t) => t.id === card.id)) return;

        const thread: Thread = {
          id: card.id,
          card,
          messages: [
            {
              id: `msg-init-${card.id}`,
              role: 'assistant',
              content: `Hi! I'm here to help you explore the thesis opportunity with **${card.name}**. ${card.topicTitle ? `The topic is: *${card.topicTitle}*.` : ''}\n\nFeel free to ask me anything — about the research scope, what skills you'd need, how to reach out, or whether it fits your timeline.`,
              timestamp: new Date(),
            },
          ],
          lastActivity: new Date(),
          isCommitted: false,
          isRead: false,
        };

        set((state) => ({
          savedThreads: [thread, ...state.savedThreads],
        }));

        // Mark "explore topics" roadmap step as completed after first save
        const exploreStep = state.roadmapSteps.find((s) => s.id === 'explore-topics');
        if (exploreStep && exploreStep.status !== 'completed') {
          get().setRoadmapStepStatus('explore-topics', 'completed', new Date());
          get().setRoadmapStepStatus('secure-supervisor', 'current');
        }
      },

      removeThread: (threadId) =>
        set((state) => ({
          savedThreads: state.savedThreads.filter((t) => t.id !== threadId),
          committedThreadId:
            state.committedThreadId === threadId ? null : state.committedThreadId,
        })),

      addMessageToThread: (threadId, message) =>
        set((state) => ({
          savedThreads: state.savedThreads.map((t) =>
            t.id === threadId
              ? { ...t, messages: [...t.messages, message], lastActivity: new Date() }
              : t
          ),
        })),

      markThreadRead: (threadId) =>
        set((state) => ({
          savedThreads: state.savedThreads.map((t) =>
            t.id === threadId ? { ...t, isRead: true } : t
          ),
        })),

      commitToThread: (threadId) => {
        set((state) => ({
          committedThreadId: threadId,
          savedThreads: state.savedThreads.map((t) =>
            t.id === threadId
              ? { ...t, isCommitted: true }
              : { ...t, isCommitted: false }
          ),
        }));

        // Update roadmap: mark "secure-supervisor" as completed
        get().setRoadmapStepStatus('secure-supervisor', 'completed', new Date());
        get().setRoadmapStepStatus('start-writing', 'current');
      },

      uncommitThread: () => {
        set((state) => ({
          committedThreadId: null,
          savedThreads: state.savedThreads.map((t) => ({ ...t, isCommitted: false })),
        }));
        // Revert roadmap
        get().setRoadmapStepStatus('secure-supervisor', 'current');
        get().setRoadmapStepStatus('start-writing', 'future');
      },

      // ---- Roadmap Actions ----
      setRoadmapStepStatus: (stepId, status, completedAt) =>
        set((state) => ({
          roadmapSteps: state.roadmapSteps.map((s) =>
            s.id === stepId
              ? { ...s, status, ...(completedAt ? { completedAt } : {}) }
              : s
          ),
        })),

      // ---- Helpers ----
      getThread: (threadId) => get().savedThreads.find((t) => t.id === threadId),

      buildSystemContext: () => {
        const { profile, profileTags } = get();
        return `## Student Profile
Name: ${profile.firstName} ${profile.lastName}
Degree: ${profile.degree.toUpperCase()} ${profile.studyProgram} at ${profile.university}
Email: ${profile.email}

Skills: ${profile.skills.join(', ')}
Interests: ${profile.interests.join(', ')}
AI Profile Tags: ${profileTags.join(', ')}

About: ${profile.about}

Objectives: ${profile.objectives.join(', ')}`;
      },
    }),
    {
      name: 'studyond-app-state',
      // Only persist non-transient state
      partialize: (state) => ({
        profile: state.profile,
        profileTags: state.profileTags,
        savedThreads: state.savedThreads,
        committedThreadId: state.committedThreadId,
        roadmapSteps: state.roadmapSteps,
        hasExploredTopics: state.hasExploredTopics,
      }),
    }
  )
);
