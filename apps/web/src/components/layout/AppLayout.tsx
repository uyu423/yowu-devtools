import React from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { cn } from '@/lib/utils';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { isCollapsed, toggleCollapse } = useSidebarCollapse();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-30 bg-white dark:bg-gray-900 border-r dark:border-gray-800 transform transition-all duration-200 ease-in-out lg:translate-x-0 lg:static',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: width based on collapse state
        isCollapsed ? 'lg:w-16' : 'lg:w-64',
        // Mobile: always full width when open
        'w-64'
      )}>
        <Sidebar 
          onCloseMobile={() => setIsSidebarOpen(false)} 
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Mobile Header */}
        <div className="h-14 border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center px-4 lg:hidden shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-semibold text-gray-900 dark:text-white">Yowu's DevTools</span>
        </div>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};
