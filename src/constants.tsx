import { Agent, TopBuilder, AnalyticsData } from './types';

export const DEPARTMENTS: { id: string; label: string; icon: string }[] = [
  { id: 'IT', label: 'IT Department', icon: '💻' },
  { id: 'SalesMarketing', label: 'Sales + Marketing', icon: '📈' },
  { id: 'Graphic', label: 'Graphic Design', icon: '🎨' },
  { id: 'FinancialAdmin', label: 'Financial & Admin', icon: '🛡️' },
];

export const MOCK_AGENTS: Agent[] = [];

export const TOP_BUILDERS: TopBuilder[] = [
  { name: 'Alex River', avatar: '👨‍💻', score: 24, rank: 1 },
  { name: 'Sarah Sky', avatar: '👩‍🔬', score: 18, rank: 2 },
  { name: 'Jon Stone', avatar: '👷', score: 15, rank: 3 },
];

export const ANALYTICS_HISTORY: AnalyticsData[] = [
  { month: 'Jan', tokens: 4000000, activeAgents: 45 },
  { month: 'Feb', tokens: 5200000, activeAgents: 52 },
  { month: 'Mar', tokens: 4800000, activeAgents: 58 },
  { month: 'Apr', tokens: 7100000, activeAgents: 65 },
  { month: 'May', tokens: 9500000, activeAgents: 82 },
];
