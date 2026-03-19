import type { MatchCard } from '@/types';

// Pre-built match cards for the initial demo state
// These are shown when the user first opens the chatbot or as fallback matches
export const MOCK_MATCH_CARDS: MatchCard[] = [
  {
    id: 'match-001',
    entityType: 'topic',
    entityId: 'topic-07',
    name: 'Swisscom',
    subtitle: 'Telecommunications · IT Services',
    imageUrl: null,
    initials: 'SC',
    compatibilityScore: 4.8,
    description:
      'Your Python and distributed systems skills are a near-perfect fit for this federated learning project. Swisscom\'s privacy-preserving ML challenge directly leverages your Kubernetes expertise, and the hybrid work model suits ETH\'s thesis requirements perfectly.',
    tags: ['#FederatedLearning', '#Privacy', '#Hybrid', '#Telecom', '#Python'],
    topicTitle: 'Federated Learning for Telecom Network Optimization',
    workplaceType: 'hybrid',
  },
  {
    id: 'match-002',
    entityType: 'supervisor',
    entityId: 'supervisor-01',
    name: 'Prof. Dr. Martin Vechev',
    subtitle: 'ETH Zurich · Reliable AI',
    imageUrl: null,
    initials: 'MV',
    compatibilityScore: 4.7,
    description:
      'Prof. Vechev leads ETH\'s AI reliability research — directly aligned with your interest in LLM inference efficiency. His group works on program synthesis and automated reasoning, giving you access to cutting-edge research infrastructure and a strong publication record.',
    tags: ['#ReliableAI', '#ETH', '#ProgramSynthesis', '#AcademicResearch', '#LLMs'],
    university: 'ETH Zurich',
  },
  {
    id: 'match-003',
    entityType: 'topic',
    entityId: 'topic-06',
    name: 'ABB',
    subtitle: 'Industrial Technology · Energy',
    imageUrl: null,
    initials: 'AB',
    compatibilityScore: 4.5,
    description:
      'ABB\'s Edge AI quality inspection project maps directly to your machine learning background. Running lightweight ML models on industrial edge hardware is a practical application of efficient inference — exactly the thesis direction you described. Working student contract included.',
    tags: ['#EdgeAI', '#ComputerVision', '#Industrial', '#OnSite', '#WorkingStudent'],
    topicTitle: 'Edge AI for Industrial Quality Inspection',
    workplaceType: 'on_site',
  },
  {
    id: 'match-004',
    entityType: 'topic',
    entityId: 'topic-01',
    name: 'Nestlé',
    subtitle: 'Consumer Goods · Food & Beverage',
    imageUrl: null,
    initials: 'NE',
    compatibilityScore: 4.3,
    description:
      'Nestlé\'s demand forecasting project offers a large-scale ML engineering challenge using real production data. Your distributed systems and Python skills are exactly what\'s needed to build a unified forecasting pipeline. High impact: even small accuracy gains translate to millions in reduced food waste.',
    tags: ['#MLOps', '#DataEngineering', '#Sustainability', '#Hybrid', '#FoodTech'],
    topicTitle: 'AI-Driven Demand Forecasting for Perishable Goods',
    workplaceType: 'hybrid',
  },
  {
    id: 'match-005',
    entityType: 'topic',
    entityId: 'topic-09',
    name: 'SBB',
    subtitle: 'Transportation · Logistics',
    imageUrl: null,
    initials: 'SB',
    compatibilityScore: 4.2,
    description:
      'SBB\'s predictive maintenance project uses IoT sensor telemetry — a great opportunity to apply anomaly detection with real-world data. Your Kubernetes and distributed systems background makes you well-suited for handling high-volume sensor streams at scale.',
    tags: ['#PredictiveMaintenance', '#IoT', '#Anomaly Detection', '#OnSite', '#Transport'],
    topicTitle: 'Predictive Maintenance for Rolling Stock Using IoT Data',
    workplaceType: 'on_site',
  },
  {
    id: 'match-006',
    entityType: 'supervisor',
    entityId: 'supervisor-03',
    name: 'Prof. Dr. Carmela Troncoso',
    subtitle: 'EPFL · Privacy Engineering',
    imageUrl: null,
    initials: 'CT',
    compatibilityScore: 4.1,
    description:
      'Prof. Troncoso\'s SPRING lab at EPFL focuses on privacy-preserving ML systems — a natural extension of your distributed systems expertise. She co-designed the DP-3T protocol used across Europe and has a track record of impactful, publication-ready thesis projects.',
    tags: ['#Privacy', '#Security', '#EPFL', '#MachineLearning', '#Research'],
    university: 'EPFL',
  },
  {
    id: 'match-007',
    entityType: 'topic',
    entityId: 'topic-05',
    name: 'ABB',
    subtitle: 'Industrial Technology · Robotics',
    imageUrl: null,
    initials: 'AB',
    compatibilityScore: 3.9,
    description:
      'Build a digital twin for collaborative robot work cells using ABB\'s RobotStudio. While this project leans more hardware-adjacent, your ML skills would bring strong value to the predictive maintenance component — and ABB\'s Zurich research center provides excellent industry exposure.',
    tags: ['#DigitalTwin', '#Robotics', '#Simulation', '#OnSite', '#Internship'],
    topicTitle: 'Digital Twin for Collaborative Robot Work Cells',
    workplaceType: 'on_site',
  },
  {
    id: 'match-008',
    entityType: 'topic',
    entityId: 'topic-33',
    name: 'Prof. Dr. Carmela Troncoso',
    subtitle: 'EPFL · Privacy Engineering',
    imageUrl: null,
    initials: 'CT',
    compatibilityScore: 3.8,
    description:
      'Design a differential privacy framework for health data sharing at EPFL. The combination of your Python skills and interest in distributed systems makes this a feasible and publishable thesis. The privacy-utility tradeoff problem is exactly the kind of technically rigorous challenge that suits your profile.',
    tags: ['#DifferentialPrivacy', '#HealthData', '#AcademicResearch', '#EPFL'],
    topicTitle: 'Privacy-Preserving Analytics for Health Data Sharing',
    university: 'EPFL',
  },
];

// Helper: get a color for entity initials avatar
export const ENTITY_COLORS: Record<string, string> = {
  SC: 'bg-blue-100 text-blue-700',
  MV: 'bg-purple-100 text-purple-700',
  AB: 'bg-orange-100 text-orange-700',
  NE: 'bg-red-100 text-red-700',
  SB: 'bg-green-100 text-green-700',
  CT: 'bg-indigo-100 text-indigo-700',
  RO: 'bg-teal-100 text-teal-700',
  SW: 'bg-sky-100 text-sky-700',
  NO: 'bg-rose-100 text-rose-700',
  HI: 'bg-yellow-100 text-yellow-700',
};

export function getInitialsColor(initials: string): string {
  return ENTITY_COLORS[initials] ?? 'bg-muted text-muted-foreground';
}
