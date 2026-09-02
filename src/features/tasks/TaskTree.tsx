import React, { useState } from 'react';
import type { TaskNode } from '../../utils/taskUtils';
import { calculateProgress, getOverallStatus } from '../../utils/taskUtils';
import { isTaskStale, getDeadlineRisk } from '../../utils/healthUtils';
import { ChevronRight, ChevronDown, Plus, Clock, Trash2, AlertTriangle } from 'lucide-react';
import ProgressBar from '../../components/ProgressBar';
import StatusBadge from '../../components/StatusBadge';
import { useTaskStore } from '../../store/useTaskStore';
import { useUserStore } from '../../store/useUserStore';
import type { Status, DelayCategory } from '../../types';
import DelayReasonModal from '../../components/DelayReasonModal';
import HistoryModal from '../../components/HistoryModal';
import AssigneeChip from '../../components/AssigneeChip';

interface TaskTreeProps {
  nodes: TaskNode[];
  level?: number;
}

const TaskTree: React.FC<TaskTreeProps> = ({ nodes, level = 0 }) => {
  return (
    <div className="space-y-2">
      {nodes.map(node => (
        <TaskRow key={node.id} task={node} level={level} />
      ))}
    </div>
  );
};

const TaskRow: React.FC<{ task: TaskNode; level: number }> = ({ task, level }) => {
  const [expanded, setExpanded] = useState(true);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{userId: string, status: Status} | null>(null);
  
  const { users, currentUser } = useUserStore();
  const { updateAssigneeStatus, assignUser, addTask, removeUser, deleteTask } = useTaskStore();
  
  const progress = calculateProgress(task.assignees);
  const overallStatus = getOverallStatus(task.assignees);
  const isStale = isTaskStale(task);
  const risk = getDeadlineRisk(task);

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
      e.target.value = ''; // reset
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
    <div className="flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm mb-2 overflow-visible">
      {/* Row Header */}
      <div 
        className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        style={{ paddingLeft: `calc(${level} * clamp(12px, 3vw, 24px) + 12px)` }}
      >
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="p-1 mr-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          disabled={task.children.length === 0}
        >
          {task.children.length > 0 ? (
            expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="w-4 h-4" /> // placeholder
          )}
        </button>
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center truncate pr-4">
              <span className="font-semibold text-gray-800 dark:text-gray-100 mr-2">{task.title}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                By {users.find(u => u.id === task.createdBy)?.name || 'Unknown'}
              </span>
              {isStale && (
                <span className="ml-2 text-[10px] text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 font-bold px-2 py-0.5 rounded-md flex items-center shrink-0">
                   <AlertTriangle className="w-3 h-3 mr-1" /> Stale
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 shrink-0">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
              <StatusBadge status={overallStatus} size="sm" />
            </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-y-2">
             <div className="w-32 md:w-48 mr-6 shrink-0">
               <ProgressBar progress={progress} />
             </div>
             
             {/* Beautiful Inline Assignee Chips */}
             <div className="flex flex-wrap gap-2 mr-4">
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
             
             {/* Add Assignee Dropdown */}
             <select 
                className="text-xs border border-dashed border-gray-300 dark:border-gray-600 rounded-full px-2 py-1 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-auto"
                onChange={handleAddAssignee}
                defaultValue=""
              >
               <option value="" disabled>+ Assign</option>
               {users.filter(u => !task.assignees.some(a => a.userId === u.id)).map(u => (
                 <option key={u.id} value={u.id}>{u.name}</option>
               ))}
             </select>

             <div className="flex items-center space-x-3 shrink-0 ml-4">
               <button onClick={handleAddSubtask} className="text-xs text-primary hover:underline flex items-center">
                 <Plus className="w-3 h-3 mr-1" /> Subtask
               </button>

               <button 
                  onClick={() => setShowHistoryModal(true)}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-300 flex items-center"
                  title="View Audit History"
                >
                 <Clock className="w-4 h-4" />
               </button>

               <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this task and all of its subtasks?")) {
                      deleteTask(task.id);
                    }
                  }} 
                  className="text-xs text-red-500 hover:text-red-700 flex items-center"
                  title="Delete Task"
                >
                 <Trash2 className="w-4 h-4" />
               </button>
             </div>
          </div>
          
          {/* Smart Deadline Risk Warning */}
          {risk.isAtRisk && (
            <div className="mt-3 mb-1 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start text-xs text-orange-800 dark:text-orange-300">
              <AlertTriangle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              <p><strong>Predictive Insight:</strong> {risk.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Render Children Recursively */}
      {expanded && task.children.length > 0 && (
        <div className="mt-1">
          <TaskTree nodes={task.children} level={level + 1} />
        </div>
      )}

      {/* Delay Modal */}
      <DelayReasonModal 
        isOpen={showDelayModal} 
        onClose={() => setShowDelayModal(false)}
        onSubmit={handleDelaySubmit}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        taskTitle={task.title}
        history={task.history}
      />
    </div>
  );
};

export default TaskTree;
