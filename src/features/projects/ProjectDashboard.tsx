import React, { useState } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useUserStore } from '../../store/useUserStore';
import { buildTaskTree } from '../../utils/taskUtils';
import { getProjectHealth, getTaskHealth } from '../../utils/healthUtils';
import TaskTree from '../tasks/TaskTree';
import MobileTaskDrillDown from '../tasks/MobileTaskDrillDown';
import { Plus, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

const ProjectDashboard: React.FC = () => {
  const { projects, tasks, addTask } = useTaskStore();
  const { currentUser } = useUserStore();
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || '');

  const projectTasks = tasks.filter(t => t.projectId === activeProjectId);
  const taskTree = buildTaskTree(projectTasks, activeProjectId);
  
  const projectHealth = getProjectHealth(projectTasks);
  const staleCount = projectTasks.filter(t => getTaskHealth(t) === 'AT_RISK' || getTaskHealth(t) === 'CRITICAL').length;

  const handleCreateRootTask = () => {
    const title = prompt("Enter new main task title:");
    if (title) {
      // For demo purposes, setting due date to next week
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      
      addTask({
        title,
        description: '',
        projectId: activeProjectId,
        parentId: null,
        dueDate: dueDate.toISOString(),
        startDate: new Date().toISOString(),
        assignees: [], createdBy: currentUser.id
      }, currentUser.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Project Workspace</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Manage nested tasks and individual accountability.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <select 
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 shadow-sm px-4 py-2"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button 
            onClick={() => {
              const name = prompt("Enter new project name:");
              if (name) {
                // Get useTaskStore's addProject
                useTaskStore.getState().addProject(name);
                // Also set active
                const p = useTaskStore.getState().projects.slice(-1)[0];
                if(p) setActiveProjectId(p.id);
              }
            }}
            className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm font-medium text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </button>
          
          <button 
            onClick={handleCreateRootTask}
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition shadow-sm font-medium text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Main Task
          </button>
        </div>
      </div>

      {/* Project Health Dashboard Component */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Health Score</p>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{projectHealth.score}/100</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${
            projectHealth.status === 'HEALTHY' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
            projectHealth.status === 'AT_RISK' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Project Status</p>
            <span className={`text-lg font-bold ${
              projectHealth.status === 'HEALTHY' ? 'text-green-600 dark:text-green-400' :
              projectHealth.status === 'AT_RISK' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {projectHealth.status === 'HEALTHY' ? 'Healthy' : projectHealth.status === 'AT_RISK' ? 'At Risk' : 'Critical'}
            </span>
          </div>
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            {projectHealth.status === 'HEALTHY' ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Problem Tasks</p>
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{staleCount}</span>
          </div>
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 min-h-[500px]">
        
        {/* Desktop View (Tree) */}
        <div className="hidden md:block">
          {taskTree.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks in this project yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Create a main task to get started building your hierarchy.</p>
              <button 
                onClick={handleCreateRootTask}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </button>
            </div>
          ) : (
            <TaskTree nodes={taskTree} />
          )}
        </div>

        {/* Mobile View (Drill-Down) */}
        <div className="block md:hidden">
          <MobileTaskDrillDown tasks={tasks} projectId={activeProjectId} />
        </div>

      </div>
    </div>
  );
};

export default ProjectDashboard;
