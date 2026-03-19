import type { StudentProfile } from '@/types';

// Luca Meier — MSc CS at ETH Zurich (demo student)
export const MOCK_STUDENT: StudentProfile = {
  id: 'student-01',
  firstName: 'Luca',
  lastName: 'Meier',
  email: 'luca.meier@student.ethz.ch',
  degree: 'msc',
  university: 'ETH Zurich',
  studyProgram: 'MSc Computer Science',
  skills: ['Python', 'Machine Learning', 'Distributed Systems', 'Kubernetes', 'PyTorch', 'LLMs'],
  interests: ['AI Efficiency', 'Large Language Models', 'Sustainable Tech', 'Edge Computing'],
  about:
    'MSc Computer Science student at ETH Zurich, specializing in machine learning systems. Currently exploring thesis topics around efficient inference for large language models. Previously interned at Google Zurich working on distributed training infrastructure.',
  objectives: ['topic', 'career_start'],
};

// Pre-generated AI tags for Luca's profile
export const MOCK_PROFILE_TAGS: string[] = [
  'Python',
  'Machine Learning',
  'Distributed Systems',
  'Kubernetes',
  'PyTorch',
  'Large Language Models',
  'Edge Computing',
  'AI Infrastructure',
  'Sustainable AI',
  'Research',
];
