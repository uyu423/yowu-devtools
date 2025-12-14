import React, { useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { FileCode2, ArrowRightLeft } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';

const YamlTool: React.FC = () => {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [direction, setDirection] = useState<'yaml2json' | 'json2yaml'>('yaml2json');
  
  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-[90rem] mx-auto">
      <ToolHeader 
        title="YAML ↔ JSON" 
        description="Convert between YAML and JSON formats."
        onReset={() => { setLeft(''); setRight(''); }}
      />
      
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <EditorPanel 
            title={direction === 'yaml2json' ? "YAML Input" : "JSON Input"}
            value={left}
            onChange={setLeft}
            mode={direction === 'yaml2json' ? 'yaml' : 'json'}
            className="h-full"
          />
        </div>
        
        <div className="flex-none flex items-center justify-center px-2">
          <button 
            onClick={() => setDirection(d => d === 'yaml2json' ? 'json2yaml' : 'yaml2json')}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            title="Switch Direction"
          >
            <ArrowRightLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <EditorPanel 
            title={direction === 'yaml2json' ? "JSON Output" : "YAML Output"}
            value={right}
            readOnly
            mode={direction === 'yaml2json' ? 'json' : 'yaml'}
            className="h-full bg-gray-50"
          />
        </div>
      </div>
    </div>
  );
};

export const yamlTool: ToolDefinition = {
  id: 'yaml',
  title: 'YAML Converter',
  description: 'YAML <-> JSON converter',
  path: '/yaml',
  icon: FileCode2,
  defaultState: {},
  Component: YamlTool,
};

