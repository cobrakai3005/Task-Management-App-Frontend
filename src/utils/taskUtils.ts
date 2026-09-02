import type { Task, AssigneeProgress, Status } from '../types';

export const calculateProgress = (assignees: AssigneeProgress[]): number => {
  if (!assignees || assignees.length === 0) return 0;
  
  const completedCount = assignees.filter(a => a.status === 'DONE').length;
  return Math.round((completedCount / assignees.length) * 100);
};

export const getOverallStatus = (assignees: AssigneeProgress[]): Status => {
  if (!assignees || assignees.length === 0) return 'PENDING';
  
  const allDone = assignees.every(a => a.status === 'DONE');
  if (allDone) return 'DONE';
  
  const anyOverdue = assignees.some(a => a.status === 'OVERDUE');
  if (anyOverdue) return 'OVERDUE';
  
  const anyBlocked = assignees.some(a => a.status === 'BLOCKED');
  if (anyBlocked) return 'BLOCKED';
  
  const anyInProgress = assignees.some(a => a.status === 'IN_PROGRESS' || a.status === 'DONE');
  if (anyInProgress) return 'IN_PROGRESS';
  
  return 'PENDING';
};

// Build tree from flat tasks
export interface TaskNode extends Task {
  children: TaskNode[];
}

export const buildTaskTree = (tasks: Task[], projectId: string): TaskNode[] => {
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const taskMap = new Map<string, TaskNode>();
  
  projectTasks.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] });
  });
  
  const rootNodes: TaskNode[] = [];
  
  projectTasks.forEach(task => {
    const node = taskMap.get(task.id);
    if (node) {
      if (task.parentId === null) {
        rootNodes.push(node);
      } else {
        const parent = taskMap.get(task.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Fallback if parent missing
          rootNodes.push(node);
        }
      }
    }
  });
  
  return rootNodes;
};
