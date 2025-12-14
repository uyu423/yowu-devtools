import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { tools } from '@/tools';
import { X, Moon, Sun, Laptop, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import logoImg from '@/assets/yowu-logo.jpeg';

interface SidebarProps {
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-full bg-gray-50/50 dark:bg-gray-900 dark:border-gray-800 transition-colors">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b shrink-0 bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-white transition-colors">
        <div className="flex items-center space-x-3">
          <a 
            href="https://yowu.dev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-8 h-8 rounded-full overflow-hidden hover:opacity-80 transition-opacity border border-gray-200 dark:border-gray-700"
            title="Go to yowu.dev"
          >
            <img src={logoImg} alt="yowu" className="w-full h-full object-cover" />
          </a>
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="font-bold text-lg tracking-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            tools.yowu.dev
          </NavLink>
        </div>
        <button onClick={onCloseMobile} className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {tools.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              No tools loaded
            </div>
          ) : (
            tools.map(tool => (
              <NavLink
                key={tool.id}
                to={tool.path}
                onClick={onCloseMobile}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                )}
              >
                {tool.icon && <tool.icon className="w-4 h-4 mr-3 opacity-70" />}
                {tool.title}
              </NavLink>
            ))
          )}
        </nav>

        {/* Easter Egg Badge */}
        <div className="mt-6 px-4">
           <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 cursor-help group transition-all hover:scale-105" title="More tools are being baked...">
             <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
             <span>More coming soon...</span>
           </div>
        </div>
      </div>

      {/* Footer / Theme Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
           <button 
             onClick={() => setTheme('light')}
             className={cn(
               "flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all",
               theme === 'light' 
                 ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white" 
                 : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
             )}
             title="Light Mode"
           >
             <Sun className="w-3.5 h-3.5" />
           </button>
           <button 
             onClick={() => setTheme('system')}
             className={cn(
               "flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all",
               theme === 'system' 
                 ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white" 
                 : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
             )}
             title="System Mode"
           >
             <Laptop className="w-3.5 h-3.5" />
           </button>
           <button 
             onClick={() => setTheme('dark')}
             className={cn(
               "flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all",
               theme === 'dark' 
                 ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white" 
                 : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
             )}
             title="Dark Mode"
           >
             <Moon className="w-3.5 h-3.5" />
           </button>
        </div>
      </div>
    </div>
  );
};
