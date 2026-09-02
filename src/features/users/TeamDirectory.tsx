import React, { useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { useTaskStore } from '../../store/useTaskStore';
import UserProfileModal from './UserProfileModal';


const TeamDirectory: React.FC = () => {
  const { users } = useUserStore();
  const { tasks } = useTaskStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Helper to count active tasks per user
  const getActiveTaskCount = (userId: string) => {
    return tasks.filter(t => {
      const s = t.assignees.find(a => a.userId === userId)?.status;
      return s === 'IN_PROGRESS' || s === 'PENDING' || s === 'OVERDUE';
    }).length;
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Team Directory</h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">View workloads, profiles, and performance across the organization.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map(user => {
          const activeTasks = getActiveTaskCount(user.id);
          
          return (
            <div 
              key={user.id} 
              onClick={() => setSelectedUserId(user.id)}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition cursor-pointer overflow-hidden group flex flex-col"
            >
              {/* Card Header (Avatar + Color block) */}
              <div className="h-20 bg-gradient-to-r from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 relative">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 absolute -bottom-8 left-6 object-cover shadow-sm group-hover:scale-105 transition-transform" 
                />
              </div>
              
              {/* Card Body */}
              <div className="pt-10 px-6 pb-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.name === 'Aman' ? 'Project Manager' : 'Developer'}</p>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Current Workload</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full ${
                      activeTasks > 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      activeTasks > 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {activeTasks} Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedUserId && (
        <UserProfileModal 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      )}
    </div>
  );
};

export default TeamDirectory;
