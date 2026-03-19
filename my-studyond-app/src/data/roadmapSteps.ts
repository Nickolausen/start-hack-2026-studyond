import type { RoadmapStep } from '@/types';

export const INITIAL_ROADMAP_STEPS: RoadmapStep[] = [
  {
    id: 'setup-profile',
    label: 'Setup Profile',
    description: 'Complete your profile with skills, interests, and academic background.',
    status: 'completed',
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    id: 'explore-topics',
    label: 'Explore Topics',
    description: 'Use the AI chatbot to discover matching thesis topics and supervisors.',
    status: 'current',
  },
  {
    id: 'secure-supervisor',
    label: 'Secure Supervisor',
    description: 'Commit to a company or academic supervisor for your thesis.',
    status: 'future',
  },
  {
    id: 'start-writing',
    label: 'Start Writing',
    description: 'Begin your thesis with structured guidance and AI support.',
    status: 'future',
  },
  {
    id: 'submit-thesis',
    label: 'Submit Thesis',
    description: 'Finalize and submit your completed thesis.',
    status: 'future',
  },
];
