import React from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useUserStore } from '../../store/useUserStore';
import { X, Activity, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose }) => {
  const { tasks, projects } = useTaskStore();
  const { users } = useUserStore();
  
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  // 1. Calculate Metrics
  const assignedTasks = tasks.filter(t => t.assignees.some(a => a.userId === userId));
  const completed = assignedTasks.filter(t => t.assignees.find(a => a.userId === userId)?.status === 'DONE').length;
  const blocked = assignedTasks.filter(t => t.assignees.find(a => a.userId === userId)?.status === 'BLOCKED').length;
  const active = assignedTasks.filter(t => {
    const s = t.assignees.find(a => a.userId === userId)?.status;
    return s === 'IN_PROGRESS' || s === 'PENDING' || s === 'OVERDUE';
  });

  // 2. Aggregate Recent Activity
  // Flatten all history events from all tasks where this user was the actor
  const recentActivity = tasks.flatMap(task => 
    (task.history || [])
      .filter(h => h.userId === userId)
      .map(h => ({ ...h, taskTitle: task.title }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
   .slice(0, 10); // get top 10 most recent

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center">
            <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700 shadow-sm mr-4" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Team Member Profile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
              <div className="flex items-center text-blue-600 dark:text-blue-400 mb-1">
                <Activity className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold uppercase tracking-wider">Active</span>
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{active.length}</span>
            </div>
            
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50">
              <div className="flex items-center text-green-600 dark:text-green-400 mb-1">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold uppercase tracking-wider">Completed</span>
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{completed}</span>
            </div>

            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50">
              <div className="flex items-center text-red-600 dark:text-red-400 mb-1">
                <AlertOctagon className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold uppercase tracking-wider">Blocked</span>
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{blocked}</span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold uppercase tracking-wider">Total Lifetime</span>
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{assignedTasks.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Active Tasks Column */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Current Workload</h3>
              {active.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No active tasks right now.</p>
              ) : (
                <ul className="space-y-3">
                  {active.map(task => {
                    const status = task.assignees.find(a => a.userId === userId)!.status;
                    const projName = projects.find(p => p.id === task.projectId)?.name || 'Unknown Project';
                    return (
                      <li key={task.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{task.title}</span>
                          <StatusBadge status={status} size="sm" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                          <span>Project: {projName}</span>
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Recent Activity Column */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Recent Activity Feed</h3>
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No recorded activity yet.</p>
              ) : (
                <div className="relative pl-4 border-l border-gray-200 dark:border-gray-700 space-y-6">
                  {recentActivity.map(item => (
                    <div key={item.id} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        <span className="font-medium text-primary">{item.action}</span> on <span className="font-semibold">"{item.taskTitle}"</span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
