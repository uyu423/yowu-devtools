/**
 * Top Shared Panel - C영역 (Domains, Method, Path, Params, Body, Headers)
 */

import React, { useCallback, useState, useMemo } from 'react';
import { Play, Square, List, Cookie, HelpCircle } from 'lucide-react';
import type { HttpMethod, KeyValuePair, DomainPreset } from '../types';
import { BODY_SUPPORTED_METHODS } from '../types';
import { HTTP_METHODS } from '../constants';
import { parsePathWithQuery } from '../utils';
import KeyValueEditor from './KeyValueEditor';
import DomainPresetModal from './DomainPresetModal';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { ExtensionStatus } from '@/tools/api-tester/components';
import type { ExtensionStatus as ExtensionStatusType } from '@/tools/api-tester/types';
import { Tooltip } from '@/components/ui/Tooltip';

interface TopSharedPanelProps {
  // Domains
  domainA: string;
  domainB: string;
  onDomainAChange: (domain: string) => void;
  onDomainBChange: (domain: string) => void;
  // Request config
  method: HttpMethod;
  path: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  isExecuting: boolean;
  onMethodChange: (method: HttpMethod) => void;
  onPathChange: (path: string) => void;
  onParamsChange: (params: KeyValuePair[]) => void;
  onHeadersChange: (headers: KeyValuePair[]) => void;
  onBodyChange: (body: string) => void;
  onExecute: () => void;
  // Options
  includeCookies: boolean;
  onIncludeCookiesChange: (value: boolean) => void;
  // Presets
  presets: DomainPreset[];
  onAddPreset: (title: string, domain: string) => DomainPreset;
  onRemovePreset: (id: string) => void;
  onClearAllPresets: () => void;
  onExportPresets: () => void;
  onImportPresets: (file: File) => Promise<{ success: boolean; count: number; error?: string }>;
  // Extension status
  extensionStatus: ExtensionStatusType;
  onCheckExtension: () => void;
}

export const TopSharedPanel: React.FC<TopSharedPanelProps> = ({
  domainA,
  domainB,
  onDomainAChange,
  onDomainBChange,
  method,
  path,
  params,
  headers,
  body,
  isExecuting,
  onMethodChange,
  onPathChange,
  onParamsChange,
  onHeadersChange,
  onBodyChange,
  onExecute,
  includeCookies,
  onIncludeCookiesChange,
  presets,
  onAddPreset,
  onRemovePreset,
  onClearAllPresets,
  onExportPresets,
  onImportPresets,
  extensionStatus,
  onCheckExtension,
}) => {
  const { t } = useI18n();
  const showBody = BODY_SUPPORTED_METHODS.includes(method);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [presetTargetSide, setPresetTargetSide] = useState<'A' | 'B'>('A');

  // Dark mode detection for CodeMirror
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Handle path input with query string parsing
  const handlePathBlur = useCallback(() => {
    if (path.includes('?')) {
      const { path: cleanPath, params: queryParams } = parsePathWithQuery(path);
      onPathChange(cleanPath);
      if (queryParams.length > 0) {
        // Merge with existing params (query params take precedence)
        const existingParams = params.filter(
          (p) => p.key.trim() && !queryParams.find((qp: KeyValuePair) => qp.key === p.key)
        );
        onParamsChange([...existingParams, ...queryParams]);
      }
    }
  }, [path, params, onPathChange, onParamsChange]);

  const handlePathKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handlePathBlur();
      }
    },
    [handlePathBlur]
  );

  const openPresetModal = useCallback((side: 'A' | 'B') => {
    setPresetTargetSide(side);
    setPresetModalOpen(true);
  }, []);

  const handlePresetSelect = useCallback(
    (domain: string) => {
      if (presetTargetSide === 'A') {
        onDomainAChange(domain);
      } else {
        onDomainBChange(domain);
      }
    },
    [presetTargetSide, onDomainAChange, onDomainBChange]
  );

  // CodeMirror extensions
  const extensions = useMemo(() => [json()], []);

  // Count valid parameters (non-empty key or value)
  const validParamsCount = useMemo(() => {
    return params.filter((p) => p.key.trim() || p.value.trim()).length;
  }, [params]);

  // Count valid headers (non-empty key or value)
  const validHeadersCount = useMemo(() => {
    return headers.filter((h) => h.key.trim() || h.value.trim()).length;
  }, [headers]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
      {/* Domains Header with Extension Status and Include Cookies */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('tool.apiDiff.domains')}
        </span>
        <div className="flex items-center gap-4">
          {/* Include Cookies checkbox - only show when extension is available */}
          {extensionStatus === 'connected' && (
            <div className="flex items-center gap-1.5">
              <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCookies}
                  onChange={(e) => onIncludeCookiesChange(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  disabled={isExecuting}
                />
                <Cookie className="w-4 h-4" />
                <span>{t('tool.apiDiff.includeCookies')}</span>
              </label>
              <Tooltip content={t('tool.apiDiff.includeCookiesTooltip')} position="bottom">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help" />
              </Tooltip>
            </div>
          )}
          <ExtensionStatus status={extensionStatus} onRetry={onCheckExtension} />
        </div>
      </div>

      {/* Domains - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Domain A */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('tool.apiDiff.domainA')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={domainA}
              onChange={(e) => onDomainAChange(e.target.value)}
              placeholder="https://api-a.example.com"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              onClick={() => openPresetModal('A')}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={t('tool.apiDiff.preset.select')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Domain B */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('tool.apiDiff.domainB')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={domainB}
              onChange={(e) => onDomainBChange(e.target.value)}
              placeholder="https://api-b.example.com"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              onClick={() => openPresetModal('B')}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={t('tool.apiDiff.preset.select')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Method & Path & Execute */}
      <div className="flex gap-3">
        <select
          value={method}
          onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
          className="px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={path}
          onChange={(e) => onPathChange(e.target.value)}
          onBlur={handlePathBlur}
          onKeyDown={handlePathKeyDown}
          placeholder="/api/v1/example"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
        <button
          onClick={onExecute}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
            isExecuting
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          )}
          title={isExecuting ? t('common.cancel') : `${t('tool.apiDiff.execute')} (⌘/Ctrl + Enter)`}
        >
          {isExecuting ? (
            <>
              <Square className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.cancel')}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tool.apiDiff.execute')}</span>
            </>
          )}
        </button>
      </div>

      {/* Parameters & Headers - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Parameters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tool.apiDiff.parameters')}
            {validParamsCount > 0 && (
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                ({validParamsCount})
              </span>
            )}
          </label>
          <KeyValueEditor
            items={params}
            onChange={onParamsChange}
            keyPlaceholder="param"
            valuePlaceholder="value"
          />
        </div>

        {/* Headers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tool.apiDiff.headers')}
            {validHeadersCount > 0 && (
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                ({validHeadersCount})
              </span>
            )}
          </label>
          <KeyValueEditor
            items={headers}
            onChange={onHeadersChange}
            keyPlaceholder="header"
            valuePlaceholder="value"
          />
        </div>
      </div>

      {/* Body (only for non-GET methods) */}
      {showBody && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tool.apiDiff.body')}
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <CodeMirror
              value={body}
              height="150px"
              extensions={extensions}
              theme={isDark ? 'dark' : 'light'}
              onChange={onBodyChange}
              placeholder='{"key": "value"}'
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
              }}
            />
          </div>
        </div>
      )}

      {/* Preset Modal */}
      <DomainPresetModal
        isOpen={presetModalOpen}
        onClose={() => setPresetModalOpen(false)}
        presets={presets}
        onSelect={handlePresetSelect}
        onAddPreset={onAddPreset}
        onRemovePreset={onRemovePreset}
        onClearAll={onClearAllPresets}
        onExport={onExportPresets}
        onImport={onImportPresets}
        targetSide={presetTargetSide}
      />
    </div>
  );
};

export default TopSharedPanel;
