import React from 'react';
import type { TaskHistory } from '../types';
import { useUserStore } from '../store/useUserStore';
import { X, Clock, UserCircle, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  history: TaskHistory[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, taskTitle, history }) => {
  const { users } = useUserStore();

  if (!isOpen) return null;

  // Helper to replace user IDs in the action string with actual names and make them bold
  const formatActionText = (action: string) => {
    let formattedText = action;
    users.forEach(u => {
      // Replace "user u1" with the actual name
      const regex = new RegExp(`user ${u.id}`, 'g');
      formattedText = formattedText.replace(regex, `<span class="font-semibold text-gray-800 dark:text-gray-200">${u.name}</span>`);
    });
    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Audit Log
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium truncate max-w-[300px]">
              Task: {taskTitle}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors border border-gray-200 dark:border-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Timeline Content */}
        <div className="p-6 overflow-y-auto bg-white dark:bg-gray-800 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <Activity className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <p>No history recorded for this task yet.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-4 space-y-8">
              {history.map((entry, index) => {
                const actor = users.find(u => u.id === entry.userId);
                const isLatest = index === 0;

                return (
                  <div key={entry.id} className="relative pl-6">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${isLatest ? 'bg-primary shadow-[0_0_0_3px_rgba(59,130,246,0.2)]' : 'bg-gray-300'}`}></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1.5">
                          {actor?.avatarUrl ? (
                            <img src={actor.avatarUrl} alt={actor.name} className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700" />
                          ) : (
                            <UserCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{actor?.name || 'System'}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        
                        <p className={`text-sm ${isLatest ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                          {formatActionText(entry.action)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
