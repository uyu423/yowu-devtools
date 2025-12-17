/* eslint-disable react-refresh/only-export-components */
/**
 * API Response Diff Tool
 * Compare API responses from two domains
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { GitCompare } from 'lucide-react';
import { useToolState } from '@/hooks/useToolState';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { ToolHeader } from '@/components/common/ToolHeader';
import type { ToolDefinition } from '../types';
import type { ApiDiffState, HttpMethod, KeyValuePair, ResponseTab } from './types';
import { DEFAULT_STATE, createEmptyKeyValue } from './constants';
import { TopSharedPanel, SidePanel, ResultBanner } from './components';
import { compareResponses } from './utils';
import { useDomainPresets } from './hooks';

const ApiDiffTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.apiDiff.title'));

  // Domain presets
  const {
    presets,
    addPreset,
    removePreset,
    clearAllPresets,
    exportPresets,
    importPresets,
  } = useDomainPresets();

  const { state, updateState, copyShareLink } =
    useToolState<ApiDiffState>('api-diff', DEFAULT_STATE, {
      shareStateFilter: ({
        method,
        path,
        params,
        headers,
        body,
        domainA,
        domainB,
      }) => ({
        method,
        path,
        params: params.filter((p) => p.key.trim() || p.value.trim()),
        headers: headers.filter((h) => h.key.trim() || h.value.trim()),
        body,
        domainA,
        domainB,
      }),
    });

  // Comparison result
  const comparison = useMemo(() => {
    if (!state.responseA && !state.responseB) return null;
    return compareResponses(state.responseA, state.responseB);
  }, [state.responseA, state.responseB]);

  // Handle execute (placeholder - will be implemented with Extension)
  const handleExecute = useCallback(() => {
    if (state.isExecuting) {
      // Cancel
      updateState({ isExecuting: false });
      return;
    }

    // Validation
    if (!state.path.trim()) {
      alert('Please enter a path');
      return;
    }
    if (!state.domainA.trim() || !state.domainB.trim()) {
      alert('Please enter both domains');
      return;
    }

    // For now, just set executing state (actual request will be implemented later)
    updateState({
      isExecuting: true,
      responseA: null,
      responseB: null,
    });

    // Simulate request completion after 1 second (placeholder)
    setTimeout(() => {
      updateState({
        isExecuting: false,
        // Mock responses for UI testing
        responseA: {
          ok: true,
          status: 200,
          elapsedMs: 150,
          sizeBytes: 1024,
          headers: { 'content-type': 'application/json' },
          rawBody: '{"message": "Hello from A", "data": {"id": 1, "name": "Test"}}',
          parsedJson: { message: 'Hello from A', data: { id: 1, name: 'Test' } },
        },
        responseB: {
          ok: true,
          status: 200,
          elapsedMs: 180,
          sizeBytes: 1048,
          headers: { 'content-type': 'application/json' },
          rawBody: '{"message": "Hello from B", "data": {"id": 1, "name": "Test Modified"}}',
          parsedJson: { message: 'Hello from B', data: { id: 1, name: 'Test Modified' } },
        },
      });
    }, 1000);
  }, [state.isExecuting, state.path, state.domainA, state.domainB, updateState]);

  // Handle reset
  const handleReset = useCallback(() => {
    updateState({
      ...DEFAULT_STATE,
      params: [createEmptyKeyValue()],
      headers: [createEmptyKeyValue()],
    });
  }, [updateState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter: Execute
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
      }
      // Esc: Cancel
      if (e.key === 'Escape' && state.isExecuting) {
        e.preventDefault();
        updateState({ isExecuting: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExecute, state.isExecuting, updateState]);

  // Handler wrappers
  const handleMethodChange = useCallback(
    (method: HttpMethod) => updateState({ method }),
    [updateState]
  );
  const handlePathChange = useCallback(
    (path: string) => updateState({ path }),
    [updateState]
  );
  const handleParamsChange = useCallback(
    (params: KeyValuePair[]) => updateState({ params }),
    [updateState]
  );
  const handleHeadersChange = useCallback(
    (headers: KeyValuePair[]) => updateState({ headers }),
    [updateState]
  );
  const handleBodyChange = useCallback(
    (body: string) => updateState({ body }),
    [updateState]
  );
  const handleDomainAChange = useCallback(
    (domainA: string) => updateState({ domainA }),
    [updateState]
  );
  const handleDomainBChange = useCallback(
    (domainB: string) => updateState({ domainB }),
    [updateState]
  );
  const handleTabAChange = useCallback(
    (activeTabA: ResponseTab) => updateState({ activeTabA }),
    [updateState]
  );
  const handleTabBChange = useCallback(
    (activeTabB: ResponseTab) => updateState({ activeTabB }),
    [updateState]
  );

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-[90rem] mx-auto">
      {/* Header */}
      <ToolHeader
        title={t('tool.apiDiff.title')}
        description={t('tool.apiDiff.description')}
        onReset={handleReset}
        onShare={copyShareLink}
      />

      {/* Content */}
      <div className="flex-1 space-y-4">
        {/* Result Banner */}
        <ResultBanner
          comparison={comparison}
          hasResponses={!!(state.responseA || state.responseB)}
        />

        {/* Top Shared Panel (C영역) */}
        <TopSharedPanel
          domainA={state.domainA}
          domainB={state.domainB}
          onDomainAChange={handleDomainAChange}
          onDomainBChange={handleDomainBChange}
          method={state.method}
          path={state.path}
          params={state.params}
          headers={state.headers}
          body={state.body}
          isExecuting={state.isExecuting}
          onMethodChange={handleMethodChange}
          onPathChange={handlePathChange}
          onParamsChange={handleParamsChange}
          onHeadersChange={handleHeadersChange}
          onBodyChange={handleBodyChange}
          onExecute={handleExecute}
          presets={presets}
          onAddPreset={addPreset}
          onRemovePreset={removePreset}
          onClearAllPresets={clearAllPresets}
          onExportPresets={exportPresets}
          onImportPresets={importPresets}
        />

        {/* Side Panels (A/B 영역) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SidePanel
            side="A"
            domain={state.domainA}
            response={state.responseA}
            activeTab={state.activeTabA}
            onTabChange={handleTabAChange}
            method={state.method}
            path={state.path}
            params={state.params}
            headers={state.headers}
            body={state.body}
          />
          <SidePanel
            side="B"
            domain={state.domainB}
            response={state.responseB}
            activeTab={state.activeTabB}
            onTabChange={handleTabBChange}
            method={state.method}
            path={state.path}
            params={state.params}
            headers={state.headers}
            body={state.body}
          />
        </div>
      </div>
    </div>
  );
};

// Tool Definition
export const apiDiffTool: ToolDefinition<ApiDiffState> = {
  id: 'api-diff',
  title: 'API Response Diff',
  description: 'Compare API responses from two domains',
  icon: GitCompare,
  path: '/api-diff',
  i18nKey: 'apiDiff',
  keywords: [
    'api',
    'diff',
    'compare',
    'response',
    'json',
    'endpoint',
    'request',
    'test',
  ],
  category: 'api',
  defaultState: DEFAULT_STATE,
  Component: ApiDiffTool,
};

export default ApiDiffTool;

