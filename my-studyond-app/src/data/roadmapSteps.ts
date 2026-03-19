import type { RoadmapStep } from '@/types';

// Default 5-step roadmap — matches the backend's dependency graph.
// field -> company -> expert -> topic  (industry path)
// field -> supervisor -> topic         (academic path)
export const INITIAL_ROADMAP_STEPS: RoadmapStep[] = [
  {
    id: 'field',
    label: 'Choose a Field',
    description: 'Select your area of focus — this shapes all downstream recommendations.',
    status: 'open',
    committedThreadId: null,
    committedEntityId: null,
    committedEntityName: null,
    committedAt: null,
  },
  {
    id: 'company',
    label: 'Find a Company',
    description: 'Partner with a company for real-world data and industry context.',
    status: 'open',
    committedThreadId: null,
    committedEntityId: null,
    committedEntityName: null,
    committedAt: null,
  },
  {
    id: 'expert',
    label: 'Find an Expert',
    description: 'Connect with an industry expert who will mentor your thesis work.',
    status: 'open',
    committedThreadId: null,
    committedEntityId: null,
    committedEntityName: null,
    committedAt: null,
  },
  {
    id: 'supervisor',
    label: 'Find a Supervisor',
    description: 'Secure an academic supervisor who will evaluate your work.',
    status: 'open',
    committedThreadId: null,
    committedEntityId: null,
    committedEntityName: null,
    committedAt: null,
  },
  {
    id: 'topic',
    label: 'Find a Topic',
    description: 'Choose a research question that anchors your thesis.',
    status: 'open',
    committedThreadId: null,
    committedEntityId: null,
    committedEntityName: null,
    committedAt: null,
  },
];
