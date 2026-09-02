import React from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useUserStore } from '../../store/useUserStore';
import StatusBadge from '../../components/StatusBadge';
import { Clock } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { tasks } = useTaskStore();
  const { currentUser } = useUserStore();

  // Find all tasks where current user is an assignee
  const myTasks = tasks.filter(t => t.assignees.some(a => a.userId === currentUser.id));

  // Compute metrics
  const total = myTasks.length;
  const completed = myTasks.filter(t => t.assignees.find(a => a.userId === currentUser.id)?.status === 'DONE').length;
  const inProgress = myTasks.filter(t => t.assignees.find(a => a.userId === currentUser.id)?.status === 'IN_PROGRESS').length;
  const pending = myTasks.filter(t => t.assignees.find(a => a.userId === currentUser.id)?.status === 'PENDING').length;
  const blocked = myTasks.filter(t => t.assignees.find(a => a.userId === currentUser.id)?.status === 'BLOCKED').length;
  const overdue = myTasks.filter(t => t.assignees.find(a => a.userId === currentUser.id)?.status === 'OVERDUE').length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-16 h-16 rounded-full border-4 border-white shadow-sm mr-4" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentUser.name}'s Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Person-level view of assigned tasks and statuses.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Total Assigned" count={total} color="bg-gray-100" />
        <MetricCard label="Completed" count={completed} color="bg-green-100 text-green-800" />
        <MetricCard label="In Progress" count={inProgress} color="bg-blue-100 text-blue-800" />
        <MetricCard label="Pending" count={pending} color="bg-gray-100 text-gray-800 dark:text-gray-200" />
        <MetricCard label="Blocked" count={blocked} color="bg-red-100 text-red-800" />
        <MetricCard label="Overdue" count={overdue} color="bg-orange-100 text-orange-800" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">My Task List</h2>
        </div>
        
        {myTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            You don't have any tasks assigned to you right now.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {myTasks.map(task => {
              const myStatus = task.assignees.find(a => a.userId === currentUser.id)!;
              return (
                <li key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{task.title}</h4>
                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {myStatus.delayCategory && (
                      <span className="text-xs text-red-600 font-medium">
                        Delay: {myStatus.delayCategory}
                      </span>
                    )}
                    <StatusBadge status={myStatus.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ label, count, color }: { label: string, count: number, color: string }) => (
  <div className={`p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center ${color}`}>
    <span className="text-3xl font-bold">{count}</span>
    <span className="text-xs uppercase tracking-wider font-semibold mt-1 opacity-80">{label}</span>
  </div>
);

export default UserDashboard;
