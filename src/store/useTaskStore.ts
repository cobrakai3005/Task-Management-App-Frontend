import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Project, Status, DelayCategory, TaskHistory } from '../types';
import { v4 as uuidv4 } from 'uuid';
import initialState from './initialState.json';

interface TaskState {
  projects: Project[];
  tasks: Task[];
  addProject: (name: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'history'>, currentUserId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  assignUser: (taskId: string, userId: string, currentUserId: string) => void;
  removeUser: (taskId: string, userId: string, currentUserId: string) => void;
  updateAssigneeStatus: (
    taskId: string, 
    userId: string, 
    status: Status, 
    currentUserId: string,
    delayCategory?: DelayCategory, 
    delayNote?: string
  ) => void;
  checkOverdueTasks: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      projects: initialState.projects as Project[],
      tasks: initialState.tasks as Task[],

      addProject: (name) => set((state) => ({
        projects: [...state.projects, { id: uuidv4(), name, workspaceId: 'w1' }]
      })),

      addTask: (taskData, currentUserId) => set((state) => {
        const newTask: Task = {
          ...taskData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          history: [{
            id: uuidv4(),
            action: 'Task created',
            timestamp: new Date().toISOString(),
            userId: currentUserId
          }]
        };
        return { tasks: [...state.tasks, newTask] };
      }),

      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      })),

      deleteTask: (taskId) => set((state) => {
        const getDescendants = (parentId: string): string[] => {
          const children = state.tasks.filter(t => t.parentId === parentId).map(t => t.id);
          let allDescendants = [...children];
          children.forEach(childId => {
            allDescendants = [...allDescendants, ...getDescendants(childId)];
          });
          return allDescendants;
        };
        
        const idsToDelete = new Set([taskId, ...getDescendants(taskId)]);
        return { tasks: state.tasks.filter(t => !idsToDelete.has(t.id)) };
      }),

      assignUser: (taskId, userId, currentUserId) => set((state) => {
        return {
          tasks: state.tasks.map(t => {
            if (t.id === taskId) {
              // Check if already assigned
              if (t.assignees.some(a => a.userId === userId)) return t;
              
              const newHistory: TaskHistory = {
                id: uuidv4(),
                action: `Assigned user ${userId}`,
                timestamp: new Date().toISOString(),
                userId: currentUserId
              };
              
              return {
                ...t,
                assignees: [...t.assignees, { userId, status: 'PENDING' }],
                history: [newHistory, ...t.history]
              };
            }
            return t;
          })
        };
      }),

      removeUser: (taskId, userId, currentUserId) => set((state) => {
        return {
          tasks: state.tasks.map(t => {
            if (t.id === taskId) {
              const newHistory: TaskHistory = {
                id: uuidv4(),
                action: `Removed user ${userId}`,
                timestamp: new Date().toISOString(),
                userId: currentUserId
              };
              
              return {
                ...t,
                assignees: t.assignees.filter(a => a.userId !== userId),
                history: [newHistory, ...t.history]
              };
            }
            return t;
          })
        };
      }),

      updateAssigneeStatus: (taskId, userId, status, currentUserId, delayCategory, delayNote) => set((state) => {
        return {
          tasks: state.tasks.map(t => {
            if (t.id === taskId) {
              const newHistory: TaskHistory = {
                id: uuidv4(),
                action: `Updated status to ${status} for user ${userId}`,
                timestamp: new Date().toISOString(),
                userId: currentUserId
              };

              const updatedAssignees = t.assignees.map(a => {
                if (a.userId === userId) {
                  // If moving to a healthy status, clear the delay reasons.
                  // Otherwise, update them if new ones are provided, or keep the old ones.
                  const isHealthyStatus = status === 'DONE' || status === 'PENDING' || status === 'IN_PROGRESS';
                  
                  return {
                    ...a,
                    status,
                    completedAt: status === 'DONE' ? new Date().toISOString() : a.completedAt,
                    delayCategory: isHealthyStatus ? undefined : (delayCategory || a.delayCategory),
                    delayNote: isHealthyStatus ? undefined : (delayNote || a.delayNote)
                  };
                }
                return a;
              });

              return {
                ...t,
                assignees: updatedAssignees,
                history: [newHistory, ...t.history]
              };
            }
            return t;
          })
        };
      }),

      checkOverdueTasks: () => set((state) => {
        const now = new Date();
        const updatedTasks = state.tasks.map(t => {
          const dueDate = new Date(t.dueDate);
          if (dueDate < now) {
            let changed = false;
            const updatedAssignees = t.assignees.map(a => {
              if (a.status !== 'DONE' && a.status !== 'OVERDUE') {
                changed = true;
                return { ...a, status: 'OVERDUE' as Status };
              }
              return a;
            });
            if (changed) {
              return { ...t, assignees: updatedAssignees };
            }
          }
          return t;
        });
        return { tasks: updatedTasks };
      })
    }),
    {
      name: 'task-data-storage',
    }
  )
);
