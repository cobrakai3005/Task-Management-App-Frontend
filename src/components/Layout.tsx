import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import clsx from 'clsx';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { users, currentUser, setCurrentUser } = useUserStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <CheckSquare className="w-6 h-6 text-primary mr-2" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-200">TaskFlow App</span>
        </div>
        
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/projects" 
                className={({ isActive }) => clsx(
                  "flex items-center px-6 py-3 text-sm font-medium",
                  isActive ? "text-primary bg-blue-50 dark:bg-blue-900/30 border-r-4 border-primary" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Projects
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/my-tasks" 
                className={({ isActive }) => clsx(
                  "flex items-center px-6 py-3 text-sm font-medium",
                  isActive ? "text-primary bg-blue-50 dark:bg-blue-900/30 border-r-4 border-primary" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <Users className="w-5 h-5 mr-3" />
                Person View
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 shrink-0 transition-colors">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Task Management</h2>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Simulating as:</span>
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUser(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-primary focus:border-primary block w-48 p-2.5"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
