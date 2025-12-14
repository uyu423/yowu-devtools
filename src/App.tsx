import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { tools } from '@/tools';
import { Toaster } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

function App() {
  // Ensure theme is initialized at app level
  useTheme();
  
  return (
    <AppLayout>
      <Toaster position="bottom-center" />
      <Routes>
        <Route path="/" element={
          <div className="p-8 max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                tools.yowu.dev
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                An open toolbox for developers who would rather keep sensitive snippets on their own machines. 
                Too many "free" web converters quietly ship data to unknown backends, so this project keeps 
                every transformation inside the browser, publishes every line of code, and documents the UX 
                decisions in the open. The goal is simple: make the common chores (JSON inspection, cron 
                sanity checks, quick diffs, etc.) pleasant <strong>and</strong> trustworthy.
              </p>
              
              {/* Why it exists */}
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Why it exists</h2>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span><strong>Transparent processing</strong> – no servers, no trackers, and an auditable codebase. 
                    If a tool claims to only prettify JSON, you should be able to confirm that's all it does.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span><strong>Shareable but private by default</strong> – nothing leaves the tab unless you explicitly 
                    create a share link; even then the payload stays compressed inside the URL fragment.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span><strong>Composable workspace</strong> – a single layout, persistent state per tool, and theme 
                    controls so you're not juggling a dozen shady tabs during a debugging session.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Available Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map(tool => (
                  <a 
                    key={tool.id} 
                    href={`#${tool.path}`}
                    className="group block p-5 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start mb-2">
                      {tool.icon && (
                        <tool.icon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                      )}
                      <div className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tool.title}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {tool.description}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        } />
        
        {/* Dynamic Routes for Tools */}
        {tools.map(tool => (
          <Route 
            key={tool.id} 
            path={tool.path} 
            element={<tool.Component />} 
          />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
