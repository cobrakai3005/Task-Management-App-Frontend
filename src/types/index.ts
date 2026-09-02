export type Status = 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'OVERDUE';

export type DelayCategory = 
  | 'Technical Issue' 
  | 'Waiting for Dependency' 
  | 'Waiting for Approval' 
  | 'Requirement Changed' 
  | 'Client Delay' 
  | 'Personal Emergency' 
  | 'Workload / Capacity' 
  | 'External Service Down' 
  | 'Other';

export interface AssigneeProgress {
  userId: string;
  status: Status;
  completedAt?: string;
  delayCategory?: DelayCategory;
  delayNote?: string;
}

export interface TaskHistory {
  id: string;
  timestamp: string;
  action: string;
  userId: string; // The user who performed the action
}

export interface Task {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  description: string;
  dueDate: string;
  startDate: string;
  assignees: AssigneeProgress[];
  history: TaskHistory[];
  createdAt: string;
  createdBy: string;
}

export interface Project {
  id: string;
  name: string;
  workspaceId: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}
