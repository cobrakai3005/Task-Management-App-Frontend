import React, { useState } from 'react';
import type { AssigneeProgress, User, Status } from '../types';
import { X, AlertTriangle, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface AssigneeChipProps {
  assignee: AssigneeProgress;
  user?: User;
  isMe: boolean;
  onStatusChange: (status: Status) => void;
  onRemove: () => void;
}

const statusConfig: Record<Status, { bg: string; text: string; border: string; dot: string; label: string }> = {
  PENDING: { bg: 'bg-gray-50 dark:bg-gray-900', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700', dot: 'bg-gray-400', label: 'Pending' },
  IN_PROGRESS: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200', dot: 'bg-blue-500', label: 'In Progress' },
  BLOCKED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Blocked' },
  DONE: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', label: 'Done' },
  OVERDUE: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500', label: 'Overdue' },
};

const AssigneeChip: React.FC<AssigneeChipProps> = ({ assignee, user, isMe, onStatusChange, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = statusConfig[assignee.status];

  if (!user) return null;

  return (
    <div className="relative inline-block">
      {/* The Chip */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center space-x-2 px-2 py-1 rounded-full border text-xs font-medium transition-all hover:shadow-sm",
          config.bg, config.text, config.border,
          isMe && "ring-2 ring-primary ring-offset-1"
        )}
      >
        <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-white/50" />
        <span>{user.name}</span>
        <div className={clsx("w-1.5 h-1.5 rounded-full ml-1", config.dot)} />
        <ChevronDown className="w-3 h-3 opacity-50 ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 z-20 overflow-hidden transform origin-top-left transition-all">
            <div className="p-3 border-b border-gray-50 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center space-x-2">
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full shadow-sm" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{config.label}</p>
                </div>
              </div>
              
              {assignee.delayCategory && (
                <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-xs text-red-700 font-semibold flex items-center mb-0.5">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {assignee.delayCategory}
                  </p>
                  <p className="text-xs text-red-600 truncate">{assignee.delayNote}</p>
                </div>
              )}
            </div>

            <div className="p-2 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Set Status</p>
              {(['PENDING', 'IN_PROGRESS', 'BLOCKED', 'DONE'] as Status[]).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(status);
                    if (status !== 'BLOCKED') setIsOpen(false); // keep open for block to allow modal to handle, though modal is app-level
                  }}
                  className={clsx(
                    "w-full text-left px-3 py-1.5 text-sm rounded-md flex items-center justify-between transition-colors",
                    assignee.status === status ? "bg-gray-100 font-medium text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  {statusConfig[status].label}
                  {assignee.status === status && <div className={clsx("w-1.5 h-1.5 rounded-full", statusConfig[status].dot)} />}
                </button>
              ))}
            </div>
            
            <div className="p-2 border-t border-gray-50">
              <button
                onClick={() => {
                  onRemove();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm rounded-md text-red-600 hover:bg-red-50 flex items-center transition-colors font-medium"
              >
                <X className="w-4 h-4 mr-2" />
                Remove from task
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssigneeChip;
