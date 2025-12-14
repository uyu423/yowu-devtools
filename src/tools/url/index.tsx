import React, { useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Link } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';

const UrlTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  
  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader 
        title="URL Encode/Decode" 
        description="Encode or decode URL components."
        onReset={() => setInput('')}
      />
      
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex-1">
          <EditorPanel 
            title="Input"
            value={input}
            onChange={setInput}
            placeholder="Type or paste content here..."
            className="h-48 lg:h-64"
          />
        </div>

        <ActionBar className="justify-center">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <button 
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setMode('encode')}
            >
              Encode
            </button>
            <button 
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setMode('decode')}
            >
              Decode
            </button>
          </div>
        </ActionBar>

        <div className="flex-1">
          <EditorPanel 
            title="Result"
            value="" 
            readOnly
            placeholder="Result will appear here..."
            className="h-48 lg:h-64 bg-gray-50"
          />
        </div>
      </div>
    </div>
  );
};

export const urlTool: ToolDefinition = {
  id: 'url',
  title: 'URL Encoder',
  description: 'Encode/Decode URL strings',
  path: '/url',
  icon: Link,
  defaultState: {},
  Component: UrlTool,
};

