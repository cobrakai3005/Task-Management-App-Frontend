import React, { useState } from 'react';
import type { Task, Status, DelayCategory } from '../../types';
import { calculateProgress, getOverallStatus } from '../../utils/taskUtils';
import { ChevronRight, ChevronLeft, Plus, Clock, Trash2 } from 'lucide-react';
import ProgressBar from '../../components/ProgressBar';
import StatusBadge from '../../components/StatusBadge';
import { useTaskStore } from '../../store/useTaskStore';
import { useUserStore } from '../../store/useUserStore';
import DelayReasonModal from '../../components/DelayReasonModal';
import HistoryModal from '../../components/HistoryModal';
import AssigneeChip from '../../components/AssigneeChip';

interface MobileTaskDrillDownProps {
  tasks: Task[];
  projectId: string;
}

const MobileTaskDrillDown: React.FC<MobileTaskDrillDownProps> = ({ tasks, projectId }) => {
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  const projectTasks = tasks.filter(t => t.projectId === projectId);
  
  // Find current parent task to display back button properly
  const currentParentTask = currentParentId ? projectTasks.find(t => t.id === currentParentId) : null;
  
  // Get tasks to display for the current level
  const displayedTasks = projectTasks.filter(t => t.parentId === currentParentId);

  const handleBack = () => {
    if (currentParentTask) {
      setCurrentParentId(currentParentTask.parentId);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Navigation Header */}
      {currentParentId && currentParentTask && (
        <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg mb-4">
          <button 
            onClick={handleBack}
            className="p-2 mr-2 bg-white dark:bg-gray-800 text-blue-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">Inside</p>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">{currentParentTask.title}</h3>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {displayedTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No tasks found at this level.
          </div>
        ) : (
          displayedTasks.map(task => {
            const childCount = projectTasks.filter(t => t.parentId === task.id).length;
            return (
              <MobileTaskCard 
                key={task.id} 
                task={task} 
                childCount={childCount}
                onDrillDown={() => setCurrentParentId(task.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

const MobileTaskCard: React.FC<{ 
  task: Task; 
  childCount: number;
  onDrillDown: () => void;
}> = ({ task, childCount, onDrillDown }) => {
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{userId: string, status: Status} | null>(null);
  
  const { users, currentUser } = useUserStore();
  const { updateAssigneeStatus, assignUser, addTask, removeUser, deleteTask } = useTaskStore();
  
  const progress = calculateProgress(task.assignees);
  const overallStatus = getOverallStatus(task.assignees);

  const handleStatusChange = (userId: string, newStatus: Status) => {
    if (newStatus === 'BLOCKED' || newStatus === 'OVERDUE') {
      setPendingStatusChange({ userId, status: newStatus });
      setShowDelayModal(true);
    } else {
      updateAssigneeStatus(task.id, userId, newStatus, currentUser.id);
    }
  };

  const handleDelaySubmit = (category: DelayCategory, note: string) => {
    if (pendingStatusChange) {
      updateAssigneeStatus(
        task.id, 
        pendingStatusChange.userId, 
        pendingStatusChange.status, 
        currentUser.id,
        category, 
        note
      );
      setPendingStatusChange(null);
    }
    setShowDelayModal(false);
  };

  const handleAddAssignee = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (userId) {
      assignUser(task.id, userId, currentUser.id);
      e.target.value = ''; 
    }
  };

  const handleAddSubtask = () => {
    const title = prompt("Enter subtask title:");
    if (title) {
      addTask({
        title,
        description: '',
        projectId: task.projectId,
        parentId: task.id,
        dueDate: task.dueDate,
        startDate: new Date().toISOString(),
        assignees: [], createdBy: currentUser.id
      }, currentUser.id);
    }
  };

  return (
    <div className="flex flex-col border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm overflow-visible p-4">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight mb-1 break-words">{task.title}</h4>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Due: {new Date(task.dueDate).toLocaleDateString()}
            <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
            By {users.find(u => u.id === task.createdBy)?.name || 'Unknown'}
          </span>
        </div>
        <StatusBadge status={overallStatus} size="sm" />
      </div>

      {/* Progress & Drill-down Button Row */}
      <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="flex-1 mr-4">
          <ProgressBar progress={progress} />
        </div>
        <button 
          onClick={onDrillDown}
          className="flex items-center text-sm font-semibold text-primary bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
        >
          {childCount} Subtasks <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Assignees Area */}
      <div className="flex flex-col space-y-3 mb-2">
        <div className="flex flex-wrap gap-2">
          {task.assignees.map(a => {
            const u = users.find(user => user.id === a.userId);
            return u ? (
              <AssigneeChip 
                key={a.userId} 
                assignee={a} 
                user={u} 
                isMe={currentUser.id === a.userId} 
                canEdit={currentUser.id === a.userId || currentUser.id === task.createdBy}
                onStatusChange={(status) => handleStatusChange(a.userId, status)} 
                onRemove={() => removeUser(task.id, a.userId, currentUser.id)} 
              />
            ) : null;
          })}
        </div>
        
        <select 
          className="text-xs border border-dashed border-gray-300 dark:border-gray-600 rounded-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 w-fit"
          onChange={handleAddAssignee}
          defaultValue=""
        >
          <option value="" disabled>+ Add Assignee</option>
          {users.filter(u => !task.assignees.some(a => a.userId === u.id)).map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
        <button onClick={handleAddSubtask} className="text-sm font-medium text-primary flex items-center">
          <Plus className="w-4 h-4 mr-1" /> New Subtask
        </button>

        <div className="flex space-x-4">
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="text-gray-400 hover:text-blue-500 transition-colors"
            title="Audit History"
          >
            <Clock className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              if (confirm("Delete this task and all nested subtasks?")) {
                deleteTask(task.id);
              }
            }} 
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <DelayReasonModal 
        isOpen={showDelayModal} 
        onClose={() => setShowDelayModal(false)}
        onSubmit={handleDelaySubmit}
      />
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        taskTitle={task.title}
        history={task.history}
      />
    </div>
  );
};

export default MobileTaskDrillDown;
