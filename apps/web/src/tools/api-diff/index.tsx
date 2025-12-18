/* eslint-disable react-refresh/only-export-components */
/**
 * API Response Diff Tool
 * Compare API responses from two domains
 */

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { GitCompare } from 'lucide-react';
import { toast } from 'sonner';
import { useToolState } from '@/hooks/useToolState';
import { useShareModal } from '@/hooks/useShareModal';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ShareModal } from '@/components/common/ShareModal';
import type { ToolDefinition } from '../types';
import type { ApiDiffState, HttpMethod, KeyValuePair, ResponseTab } from './types';
import { DEFAULT_STATE, createEmptyKeyValue } from './constants';
import { TopSharedPanel, SidePanel, ResultBanner, HistorySidebar } from './components';
import { compareResponses, sanitizePathAndParams } from './utils';
import { useDomainPresets, useApiDiffExecutor, useHistory } from './hooks';
import { CorsModal } from '../api-tester/components';
import { useCorsAllowlist } from '../api-tester/hooks';

// Note: Data transfer from API Tester is handled via location.state in useToolState

const ApiDiffTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.apiDiff.title'));

  // History sidebar visibility state
  const [showHistory, setShowHistory] = useState(false);

  // Toggle history sidebar
  const handleToggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  // Domain presets
  const {
    presets,
    addPreset,
    removePreset,
    clearAllPresets,
    exportPresets,
    importPresets,
  } = useDomainPresets();

  // API executor
  const {
    isLoading,
    executeRequests,
    cancelRequests,
    extensionStatus,
    checkExtension,
  } = useApiDiffExecutor();

  // CORS allowlist
  const { isAllowed: isCorsAllowed, addOrigin: addCorsOrigin } = useCorsAllowlist();

  // CORS modal state
  const [corsModalOpen, setCorsModalOpen] = useState(false);
  const [pendingCorsRetry, setPendingCorsRetry] = useState(false);
  const pendingCorsUrlRef = useRef<string | null>(null);

  // History
  const {
    items: historyItems,
    addItem: addHistoryItem,
    deleteItem: deleteHistoryItem,
    clearAll: clearAllHistory,
    loadItem: loadHistoryItem,
  } = useHistory();

  const { state, updateState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<ApiDiffState>('api-diff', DEFAULT_STATE, {
      shareStateFilter: ({
        method,
        path,
        params,
        headers,
        body,
        domainA,
        domainB,
        includeCookies,
      }) => ({
        method,
        path,
        params: params.filter((p) => p.key.trim() || p.value.trim()),
        headers: headers.filter((h) => h.key.trim() || h.value.trim()),
        body,
        domainA,
        domainB,
        includeCookies,
      }),
    });

  const { handleShare, shareModalProps } = useShareModal({
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName: t('tool.apiDiff.title'),
  });

  // Comparison result
  const comparison = useMemo(() => {
    if (!state.responseA && !state.responseB) return null;
    return compareResponses(state.responseA, state.responseB);
  }, [state.responseA, state.responseB]);

  // Check if response has CORS error (only for direct mode requests)
  const hasCorsError =
    (state.responseA?.error?.code === 'CORS_ERROR' && state.responseA?.method === 'direct') ||
    (state.responseB?.error?.code === 'CORS_ERROR' && state.responseB?.method === 'direct');

  // Determine which URL had CORS error
  const corsErrorUrl = useMemo(() => {
    if (state.responseA?.error?.code === 'CORS_ERROR') {
      return state.domainA;
    }
    if (state.responseB?.error?.code === 'CORS_ERROR') {
      return state.domainB;
    }
    return null;
  }, [state.responseA, state.responseB, state.domainA, state.domainB]);

  // Show CORS modal when CORS error detected
  const prevHasCorsError = useRef(false);
  useEffect(() => {
    // Only show modal when CORS error transitions from false to true
    if (hasCorsError && !prevHasCorsError.current && !pendingCorsRetry) {
      pendingCorsUrlRef.current = corsErrorUrl;
      // Use setTimeout to avoid synchronous setState
      const timeoutId = setTimeout(() => setCorsModalOpen(true), 0);
      return () => clearTimeout(timeoutId);
    }
    prevHasCorsError.current = hasCorsError;
  }, [hasCorsError, corsErrorUrl, pendingCorsRetry]);

  // Handle execute with automatic CORS bypass for allowed origins
  const handleExecute = useCallback(async (forceExtension = false) => {
    if (isLoading) {
      // Cancel
      cancelRequests();
      updateState({ isExecuting: false });
      return;
    }

    // Validation
    if (!state.path.trim()) {
      toast.error(t('tool.apiDiff.validation.pathRequired'));
      return;
    }
    if (!state.domainA.trim() || !state.domainB.trim()) {
      toast.error(t('tool.apiDiff.validation.domainsRequired'));
      return;
    }

    // Sanitize path: extract query params from path and merge with existing params
    const { sanitizedPath, mergedParams } = sanitizePathAndParams(state.path, state.params);
    
    // Update state if path was sanitized (has query params in path)
    let requestState = state;
    if (sanitizedPath !== state.path) {
      updateState({ path: sanitizedPath, params: mergedParams });
      requestState = { ...state, path: sanitizedPath, params: mergedParams };
    }

    // Reset CORS retry state
    setPendingCorsRetry(false);

    // Check if domains are in CORS allowlist - use extension automatically
    const shouldUseExtension =
      forceExtension ||
      (isCorsAllowed(requestState.domainA) && extensionStatus === 'connected') ||
      (isCorsAllowed(requestState.domainB) && extensionStatus === 'connected');

    // Set executing state
    updateState({
      isExecuting: true,
      responseA: null,
      responseB: null,
    });

    try {
      const { responseA, responseB } = await executeRequests(requestState, shouldUseExtension);
      updateState({
        isExecuting: false,
        responseA,
        responseB,
      });
      // Add to history on success
      addHistoryItem(requestState);
    } catch (error) {
      console.error('Request execution failed:', error);
      updateState({ isExecuting: false });
      toast.error(error instanceof Error ? error.message : 'Request failed');
    }
  }, [isLoading, state, cancelRequests, executeRequests, updateState, addHistoryItem, t, isCorsAllowed, extensionStatus]);

  // Keyboard shortcut: Cmd+Enter (Mac) or Ctrl+Enter (Windows) to execute comparison
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading && state.path.trim() && state.domainA.trim() && state.domainB.trim()) {
          handleExecute();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExecute, isLoading, state.path, state.domainA, state.domainB]);

  // Handle retry with extension (from CORS modal)
  const handleRetryWithExtension = useCallback(
    async (rememberChoice: boolean) => {
      setCorsModalOpen(false);
      setPendingCorsRetry(true);

      // Clear previous responses
      updateState({
        responseA: null,
        responseB: null,
      });

      // Add to CORS allowlist if user chose to remember
      if (rememberChoice) {
        addCorsOrigin(state.domainA);
        addCorsOrigin(state.domainB);
      }

      // Retry with extension
      handleExecute(true);
    },
    [state.domainA, state.domainB, updateState, addCorsOrigin, handleExecute]
  );

  // Handle reset
  const handleReset = useCallback(() => {
    updateState({
      ...DEFAULT_STATE,
      params: [createEmptyKeyValue()],
      headers: [createEmptyKeyValue()],
    });
  }, [updateState]);

  // Handle history item select
  const handleHistorySelect = useCallback(
    (item: import('./types').HistoryItem) => {
      const loadedState = loadHistoryItem(item);
      if (loadedState) {
        updateState({
          ...loadedState,
          // Ensure params and headers have at least one empty row
          params:
            loadedState.params && loadedState.params.length > 0
              ? loadedState.params
              : [createEmptyKeyValue()],
          headers:
            loadedState.headers && loadedState.headers.length > 0
              ? loadedState.headers
              : [createEmptyKeyValue()],
          // Reset response state
          responseA: null,
          responseB: null,
          isExecuting: false,
        });
        toast.success(t('tool.apiDiff.history.loaded'));
      }
    },
    [loadHistoryItem, updateState, t]
  );

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
        onShare={handleShare}
      />
      <ShareModal {...shareModalProps} />

      {/* Content */}
      <div className="flex-1 space-y-4">
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
          includeCookies={state.includeCookies}
          onIncludeCookiesChange={(includeCookies) => updateState({ includeCookies })}
          presets={presets}
          onAddPreset={addPreset}
          onRemovePreset={removePreset}
          onClearAllPresets={clearAllPresets}
          onExportPresets={exportPresets}
          onImportPresets={importPresets}
          extensionStatus={extensionStatus}
          onCheckExtension={checkExtension}
        />

        {/* Result Banner - between input and response panels */}
        <ResultBanner
          comparison={comparison}
          hasResponses={!!(state.responseA || state.responseB)}
          rawBodyA={state.responseA?.rawBody}
          rawBodyB={state.responseB?.rawBody}
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
            differentFields={comparison?.differentFields}
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
            differentFields={comparison?.differentFields}
          />
        </div>
      </div>

      {/* History Sidebar - Overlay */}
      <HistorySidebar
        items={historyItems}
        onSelect={handleHistorySelect}
        onDelete={deleteHistoryItem}
        onClearAll={clearAllHistory}
        isOpen={showHistory}
        onToggle={handleToggleHistory}
      />

      {/* CORS Error Modal */}
      <CorsModal
        isOpen={corsModalOpen}
        onClose={() => setCorsModalOpen(false)}
        onRetryWithExtension={handleRetryWithExtension}
        extensionStatus={extensionStatus}
        targetUrl={corsErrorUrl || undefined}
      />
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

