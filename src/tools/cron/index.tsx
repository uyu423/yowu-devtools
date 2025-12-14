import React, { useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Timer } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';

const CronTool: React.FC = () => {
  const [expression, setExpression] = useState('*/5 * * * *');
  
  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-3xl mx-auto">
      <ToolHeader 
        title="Cron Parser" 
        description="Parse and explain cron expressions."
        onReset={() => setExpression('*/5 * * * *')}
      />
      
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cron Expression</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg p-3 font-mono border"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
              Parse
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Supports standard cron syntax (5 or 6 fields).
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 uppercase tracking-wider mb-1">Human Readable</h3>
          <p className="text-lg text-blue-800 font-medium">
            "At every 5th minute."
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium text-gray-700">
            Next Scheduled Dates
          </div>
          <ul className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map(i => (
              <li key={i} className="px-4 py-3 text-sm text-gray-600 flex justify-between">
                <span className="font-mono">2024-01-01 12:{i * 5}:00</span>
                <span className="text-gray-400">in {i * 5} minutes</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const cronTool: ToolDefinition = {
  id: 'cron',
  title: 'Cron Parser',
  description: 'Cron expression explainer',
  path: '/cron',
  icon: Timer,
  defaultState: {},
  Component: CronTool,
};

