export type Department = 'IT' | 'SalesMarketing' | 'FinancialAdmin';

export type UserRole = 'admin' | 'Senior IT' | 'Junior IT' | 'Intern IT' | 'Intern Graphic' | 'Private' | 'pending';

export interface TargetItem {
  id: string;
  name: string;
  type: 'percentage' | 'quantity';
  value: number;
  max: number;
  color?: string;
  cardStyle?: 'default' | 'minimal' | 'bold' | 'glossy';
}

export interface CalendarEvent {
  id: string;
  date: string;
  text: string;
  time?: string;
  isUrgent?: boolean;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  type?: 'once' | 'recurring';
  status?: any;
  dueDate?: string;
  label?: string;
  labelColor?: string;
  callDuration?: string;
}

export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  timeRange: string;
  timestamp: number;
}

export interface AutomationGoal {
  name: string;
  description: string;
  target: string;
  deadline: string;
  progress: number;
  status: 'In Progress' | 'Completed' | 'Pending';
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  isAdmin?: boolean;
  internshipEndDate?: string;
  department?: Department;
  target?: any;
  targets?: TargetItem[];
  todos?: TodoItem[];
  calendarEvents?: CalendarEvent[];
  activityLogs?: ActivityLog[];
  automationGoal?: AutomationGoal;
  githubRepo?: {
    owner: string;
    name: string;
    path: string;
  };
  createdAt?: any;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  department: Department;
  powerLevel: number; // 0-100
  tokensConsumed: number;
  popularity: number; // 0-100
  owner: string;
  ownerId?: string;
  avatar: string;
  description: string;
  imageUrl?: string;
  externalLink?: string;
  createdAt?: any;
  visibility?: 'public' | 'private';
  allowedRoles?: UserRole[];
  allowedEmails?: string[];
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface AnalyticsData {
  month: string;
  tokens: number;
  activeAgents: number;
}

export interface TopBuilder {
  name: string;
  avatar: string;
  score: number;
  rank: 1 | 2 | 3;
}

export interface GlobalEvent {
  id?: string;
  type: 'agent_created' | 'target_hit' | 'announcement';
  title?: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: any;
}

export interface DepartmentWidget {
  id?: string;
  title: string;
  department: Department | 'All';
  type: 'metric' | 'chart_line' | 'chart_bar';
  dataSourceUrl: string; // URL for data, or empty for mock
  mockDataJson: string; // fallback mock data JSON string
  ownerId: string;
  createdAt: any;
}
