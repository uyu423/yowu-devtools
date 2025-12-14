import React, { useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { FileDiff } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';

const DiffTool: React.FC = () => {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  
  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-[90rem] mx-auto">
      <ToolHeader 
        title="Text Diff" 
        description="Compare two text blocks."
        onReset={() => { setOriginal(''); setModified(''); }}
      />
      
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="h-1/3 flex flex-col lg:flex-row gap-4">
           <div className="flex-1 min-h-0">
             <EditorPanel 
               title="Original Text"
               value={original}
               onChange={setOriginal}
               className="h-full"
             />
           </div>
           <div className="flex-1 min-h-0">
             <EditorPanel 
               title="Modified Text"
               value={modified}
               onChange={setModified}
               className="h-full"
             />
           </div>
        </div>

        <ActionBar>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm">
            Compare
          </button>
          <div className="h-6 w-px bg-gray-300 mx-2" />
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <input type="checkbox" className="rounded border-gray-300" />
            <span>Ignore Whitespace</span>
          </label>
        </ActionBar>

        <div className="flex-1 min-h-0 border rounded-md bg-white flex flex-col">
           <div className="bg-gray-50 px-3 py-1.5 border-b text-xs font-medium text-gray-500 uppercase tracking-wider flex justify-between">
             <span>Diff Result</span>
             <div className="space-x-2">
               <button className="text-xs hover:text-blue-600 font-medium">Split</button>
               <span className="text-gray-300">|</span>
               <button className="text-xs hover:text-blue-600 font-medium">Unified</button>
             </div>
           </div>
           <div className="flex-1 p-4 overflow-auto font-mono text-sm">
             {/* Diff output placeholder */}
             <div className="text-gray-400 text-center mt-10">
               Click 'Compare' to see differences
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export const diffTool: ToolDefinition = {
  id: 'diff',
  title: 'Text Diff',
  description: 'Compare two texts',
  path: '/diff',
  icon: FileDiff,
  defaultState: {},
  Component: DiffTool,
};

