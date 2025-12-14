import React, { useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Binary } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';

const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  
  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader 
        title="Base64 Converter" 
        description="Encode and decode Base64 data with UTF-8 support."
        onReset={() => setInput('')}
      />
      
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex-1">
          <EditorPanel 
            title={mode === 'encode' ? 'Text Input' : 'Base64 Input'}
            value={input}
            onChange={setInput}
            placeholder={mode === 'encode' ? 'Type text to encode...' : 'Paste Base64 string...'}
            className="h-48 lg:h-64"
          />
        </div>

        <ActionBar className="justify-center flex-col sm:flex-row gap-4">
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
          
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <input type="checkbox" className="rounded border-gray-300" />
            <span>URL Safe</span>
          </label>
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

export const base64Tool: ToolDefinition = {
  id: 'base64',
  title: 'Base64',
  description: 'Base64 Encode/Decode',
  path: '/base64',
  icon: Binary,
  defaultState: {},
  Component: Base64Tool,
};

