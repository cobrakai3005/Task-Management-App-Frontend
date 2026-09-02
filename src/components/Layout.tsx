import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import clsx from 'clsx';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { users, currentUser, setCurrentUser } = useUserStore();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes('/projects')) return 'Projects';
    if (location.pathname.includes('/my-tasks')) return 'Person View';
    return 'Task Management';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <CheckSquare className="w-6 h-6 text-primary mr-2" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-200">TaskFlow</span>
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
      <div className="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors">
          <div className="flex items-center">
            {/* Mobile Logo */}
            <CheckSquare className="w-6 h-6 text-primary mr-2 md:hidden" />
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 hidden md:block">
              {getPageTitle()}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden lg:inline">Simulating as:</span>
            
            {/* User Switcher (Compact on mobile) */}
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUser(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-primary focus:border-primary block w-auto md:w-48 p-1.5 md:p-2.5"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (hidden on desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center z-50 pb-safe">
        <NavLink 
          to="/projects" 
          className={({ isActive }) => clsx(
            "flex flex-col items-center justify-center w-full h-full",
            isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
          )}
        >
          <LayoutDashboard className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Projects</span>
        </NavLink>
        <NavLink 
          to="/my-tasks" 
          className={({ isActive }) => clsx(
            "flex flex-col items-center justify-center w-full h-full",
            isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
          )}
        >
          <Users className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">My Tasks</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Layout;
