import type { Task } from '../types';
import { getOverallStatus } from './taskUtils';

export type HealthStatus = 'HEALTHY' | 'AT_RISK' | 'CRITICAL';

export const isTaskStale = (task: Task): boolean => {
  const overall = getOverallStatus(task.assignees);
  if (overall === 'DONE') return false; // Completed tasks aren't stale

  const now = new Date().getTime();
  let lastUpdate = new Date(task.createdAt).getTime();

  if (task.history && task.history.length > 0) {
    // History is sorted newest first usually, but let's find the max
    lastUpdate = Math.max(...task.history.map(h => new Date(h.timestamp).getTime()));
  }

  const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate > 3; // Stale if no updates in 3 days
};

export const getDeadlineRisk = (task: Task): { isAtRisk: boolean; message: string } => {
  const overall = getOverallStatus(task.assignees);
  if (overall === 'DONE' || overall === 'OVERDUE') return { isAtRisk: false, message: '' };

  const now = new Date().getTime();
  const start = new Date(task.startDate).getTime();
  const due = new Date(task.dueDate).getTime();
  
  if (due <= start) return { isAtRisk: false, message: '' }; // Invalid dates

  const totalDuration = due - start;
  const elapsed = now - start;
  const timeProgress = Math.max(0, Math.min(1, elapsed / totalDuration)) * 100;
  
  // Calculate actual progress based on assignee statuses
  const completedAssignees = task.assignees.filter(a => a.status === 'DONE').length;
  const totalAssignees = task.assignees.length || 1; // avoid div by 0
  const actualProgress = (completedAssignees / totalAssignees) * 100;

  const hoursUntilDue = (due - now) / (1000 * 60 * 60);

  // Risk Condition 1: Blocked close to deadline
  if (task.assignees.some(a => a.status === 'BLOCKED') && hoursUntilDue < 1) {
    return { isAtRisk: true, message: `High probability this task will miss its deadline due to active blockers.` };
  }

  // Risk Condition 2: Lagging significantly behind schedule
  if (timeProgress > 50 && actualProgress < timeProgress - 35) {
    const dueDay = new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'long' });
    return { isAtRisk: true, message: `Based on current velocity, high probability this task will miss ${dueDay}'s deadline.` };
  }

  return { isAtRisk: false, message: '' };
};

export const getTaskHealth = (task: Task): HealthStatus => {
  const overall = getOverallStatus(task.assignees);
  if (overall === 'DONE') return 'HEALTHY';

  // Check critical
  if (overall === 'OVERDUE') return 'CRITICAL';
  
  const blockedCount = task.assignees.filter(a => a.status === 'BLOCKED').length;
  if (blockedCount > 0 && blockedCount >= Math.ceil(task.assignees.length / 2)) {
    return 'CRITICAL'; // If 50%+ are blocked
  }

  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDue < 0) return 'CRITICAL';

  // Check At Risk
  if (blockedCount > 0) return 'AT_RISK'; // Any blockers
  if (isTaskStale(task)) return 'AT_RISK'; // Stale tasks are at risk
  if (hoursUntilDue < 48 && overall === 'PENDING') return 'AT_RISK'; // Due soon but hasn't started

  return 'HEALTHY';
};

export const getProjectHealth = (tasks: Task[]): { status: HealthStatus; score: number } => {
  if (tasks.length === 0) return { status: 'HEALTHY', score: 100 };

  let score = 100;
  let criticalCount = 0;
  let atRiskCount = 0;

  tasks.forEach(task => {
    const health = getTaskHealth(task);
    if (health === 'CRITICAL') {
      score -= 15;
      criticalCount++;
    } else if (health === 'AT_RISK') {
      score -= 5;
      atRiskCount++;
    }
  });

  score = Math.max(0, score);

  let status: HealthStatus = 'HEALTHY';
  if (score < 60 || criticalCount > 2) status = 'CRITICAL';
  else if (score < 85 || atRiskCount > 2) status = 'AT_RISK';

  return { status, score };
};
