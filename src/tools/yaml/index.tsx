/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { FileCode2, ArrowRightLeft } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useToolState } from '@/hooks/useToolState';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTitle } from '@/hooks/useTitle';
import { copyToClipboard } from '@/lib/clipboard';
import YAML from 'yaml';

interface YamlToolState {
  source: string;
  direction: 'yaml2json' | 'json2yaml';
  indent: 2 | 4;
}

const DEFAULT_STATE: YamlToolState = {
  source: '',
  direction: 'yaml2json',
  indent: 2,
};

const YamlTool: React.FC = () => {
  useTitle('YAML Converter');
  const { state, updateState, resetState, shareState } = useToolState<YamlToolState>('yaml', DEFAULT_STATE);
  const debouncedInput = useDebouncedValue(state.source, 250);

  const conversion = useMemo(() => {
    if (!debouncedInput.trim()) return { output: '', error: null as string | null };
    try {
      if (state.direction === 'yaml2json') {
        const parsed = YAML.parse(debouncedInput);
        return { output: JSON.stringify(parsed, null, state.indent), error: null };
      }
      const parsed = JSON.parse(debouncedInput);
      return { output: YAML.stringify(parsed, { indent: state.indent }), error: null };
    } catch (error) {
      const err = error as YAML.YAMLParseError | Error;
      if ('linePos' in err && Array.isArray(err.linePos)) {
        const pos = err.linePos[0];
        return { output: '', error: `${err.message} (line ${pos.line}, col ${pos.col})` };
      }
      return { output: '', error: err.message };
    }
  }, [debouncedInput, state.direction, state.indent]);

  const handleSwap = () => {
    if (conversion.error || !conversion.output) return;
    updateState({
      source: conversion.output,
      direction: state.direction === 'yaml2json' ? 'json2yaml' : 'yaml2json',
    });
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-[90rem] mx-auto">
      <ToolHeader 
        title="YAML ↔ JSON" 
        description="Convert both directions and inspect parse errors quickly."
        onReset={resetState}
        onShare={shareState}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <EditorPanel 
            title={state.direction === 'yaml2json' ? 'YAML Input' : 'JSON Input'}
            value={state.source}
            onChange={(val) => updateState({ source: val })}
            mode={state.direction === 'yaml2json' ? 'yaml' : 'json'}
            className="h-full"
            status={conversion.error ? 'error' : 'default'}
          />
        </div>
        <div className="flex-none flex items-center justify-center px-2">
          <button 
            onClick={handleSwap}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            title="Switch Direction"
            disabled={!!conversion.error || !conversion.output}
          >
            <ArrowRightLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <EditorPanel 
            title={state.direction === 'yaml2json' ? 'JSON Output' : 'YAML Output'}
            value={conversion.output}
            readOnly
            mode={state.direction === 'yaml2json' ? 'json' : 'yaml'}
            className="h-full bg-gray-50"
            status={conversion.error ? 'error' : conversion.output ? 'success' : 'default'}
          />
        </div>
      </div>

      {conversion.error && (
        <ErrorBanner className="mt-4" message="Conversion failed" details={conversion.error} />
      )}

      <ActionBar className="mt-4 flex-wrap items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <span>Indent</span>
          <select 
            className="rounded-md border px-2 py-1"
            value={state.indent}
            onChange={(e) => updateState({ indent: Number(e.target.value) as 2 | 4 })}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </label>
        <button
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
          disabled={!conversion.output || !!conversion.error}
          onClick={() => conversion.output && copyToClipboard(conversion.output, 'Copied output.')}
        >
          Copy Output
        </button>
      </ActionBar>
    </div>
  );
};

export const yamlTool: ToolDefinition<YamlToolState> = {
  id: 'yaml',
  title: 'YAML Converter',
  description: 'YAML <-> JSON converter',
  path: '/yaml',
  icon: FileCode2,
  defaultState: DEFAULT_STATE,
  Component: YamlTool,
};
