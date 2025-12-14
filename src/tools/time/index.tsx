import React, { useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Clock } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';

const TimeTool: React.FC = () => {
  const [epoch, setEpoch] = useState('');
  const [iso, setIso] = useState('');
  
  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-3xl mx-auto">
      <ToolHeader 
        title="Epoch / ISO Converter" 
        description="Convert between Epoch timestamps and ISO 8601 strings."
        onReset={() => { setEpoch(''); setIso(''); }}
      />
      
      <div className="space-y-8 mt-4">
        {/* Epoch Section */}
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Epoch Timestamp</label>
            <div className="flex items-center space-x-4 text-sm">
              <label className="inline-flex items-center">
                <input type="radio" name="unit" className="text-blue-600" defaultChecked />
                <span className="ml-2">milliseconds</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" name="unit" className="text-blue-600" />
                <span className="ml-2">seconds</span>
              </label>
            </div>
          </div>
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={epoch}
              onChange={(e) => setEpoch(e.target.value)}
              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="e.g. 1704067200000"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-600 transition-colors">
            Set to Now
          </button>
        </div>

        {/* ISO Section */}
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
           <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">ISO 8601 Date</label>
            <label className="flex items-center space-x-2 text-sm text-gray-600">
               <input type="checkbox" className="rounded text-blue-600" />
               <span>UTC</span>
            </label>
          </div>
          <input 
            type="text" 
            value={iso}
            onChange={(e) => setIso(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder="e.g. 2024-01-01T00:00:00.000Z"
          />
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
          <p>Local Time: <span className="font-mono ml-2">-</span></p>
        </div>
      </div>
    </div>
  );
};

export const timeTool: ToolDefinition = {
  id: 'time',
  title: 'Time Converter',
  description: 'Epoch <-> ISO converter',
  path: '/time',
  icon: Clock,
  defaultState: {},
  Component: TimeTool,
};

