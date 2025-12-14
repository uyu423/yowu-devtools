import React, { useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { FileJson } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';

const JsonTool: React.FC = () => {
  const [input, setInput] = useState('');
  
  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-[90rem] mx-auto">
      <ToolHeader 
        title="JSON Pretty Viewer" 
        description="Format, validate, and explore JSON data."
        onReset={() => setInput('')}
      />
      
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <EditorPanel 
            title="Input JSON"
            value={input}
            onChange={setInput}
            mode="json"
            placeholder='Paste JSON here...'
            className="h-full"
          />
        </div>
        
        <div className="flex-none hidden lg:flex items-center justify-center px-2 text-gray-400">
          →
        </div>

        <div className="flex-1 flex flex-col min-h-0">
           {/* Placeholder for Tree View or Output Editor */}
           <div className="h-full border rounded-md bg-gray-50 flex items-center justify-center text-gray-400">
             Output will appear here
           </div>
        </div>
      </div>
      
      <ActionBar className="mt-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
          Format
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
          Minify
        </button>
      </ActionBar>
    </div>
  );
};

export const jsonTool: ToolDefinition = {
  id: 'json',
  title: 'JSON Viewer',
  description: 'Pretty print and traverse JSON',
  path: '/json',
  icon: FileJson,
  defaultState: {},
  Component: JsonTool,
};

