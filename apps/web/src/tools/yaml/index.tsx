/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { FileCode2, ArrowRightLeft, Copy } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { FileInput } from '@/components/common/FileInput';
import { FileDownload } from '@/components/common/FileDownload';
import { getMimeType } from '@/lib/fileUtils';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { Select } from '@/components/ui/Select';
import { useToolSetup } from '@/hooks/useToolSetup';
import { useWebWorker, shouldUseWorkerForText } from '@/hooks/useWebWorker';
import { copyToClipboard } from '@/lib/clipboard';
import { ShareModal } from '@/components/common/ShareModal';
import { AdsenseFooter } from '@/components/common/AdsenseFooter';
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
  const {
    state,
    updateState,
    resetState,
    t,
    handleShare,
    shareModalProps,
  } = useToolSetup<YamlToolState>('yaml', 'yaml', DEFAULT_STATE);

  // Worker 사용 여부 결정
  const shouldUseWorker = React.useMemo(
    () => shouldUseWorkerForText(state.source, 500_000, 10_000),
    [state.source]
  );

  // Request ID for Worker response ordering (v1.2.0)
  const [requestId, setRequestId] = React.useState<number | undefined>(undefined);
  
  // Generate request ID when source changes
  React.useEffect(() => {
    if (shouldUseWorker && state.source.trim()) {
      setRequestId((prev) => (prev ?? 0) + 1);
    }
  }, [shouldUseWorker, state.source]);

  // Worker를 사용한 변환
  const { result: workerResult, isProcessing } = useWebWorker<
    { source: string; direction: 'yaml2json' | 'json2yaml'; indent: 2 | 4 },
    { success: boolean; output?: string; error?: string }
  >({
    workerUrl: new URL('../workers/yaml-converter.worker.ts', import.meta.url),
    shouldUseWorker: shouldUseWorker && !!state.source.trim(),
    request: shouldUseWorker && state.source.trim()
      ? {
          source: state.source,
          direction: state.direction,
          indent: state.indent,
        }
      : null,
    requestId,
    timeout: 10_000, // 10 seconds timeout
  });

  // 메인 스레드 변환 (작은 데이터용)
  const mainThreadConversion = useMemo(() => {
    if (!state.source.trim() || shouldUseWorker) {
      return { output: '', error: null as string | null };
    }
    try {
      if (state.direction === 'yaml2json') {
        const parsed = YAML.parse(state.source);
        return {
          output: JSON.stringify(parsed, null, state.indent),
          error: null,
        };
      }
      const parsed = JSON.parse(state.source);
      return {
        output: YAML.stringify(parsed, { indent: state.indent }),
        error: null,
      };
    } catch (error) {
      const err = error as YAML.YAMLParseError | Error;
      if ('linePos' in err && Array.isArray(err.linePos)) {
        const pos = err.linePos[0];
        return {
          output: '',
          error: `${err.message} (line ${pos.line}, col ${pos.col})`,
        };
      }
      return { output: '', error: err.message };
    }
  }, [state.source, state.direction, state.indent, shouldUseWorker]);

  // 최종 변환 결과 (Worker 또는 메인 스레드)
  const conversion = React.useMemo(() => {
    if (shouldUseWorker) {
      if (!workerResult) {
        return { output: '', error: null as string | null };
      }
      if (workerResult.success) {
        return { output: workerResult.output ?? '', error: null };
      }
      return { output: '', error: workerResult.error ?? null };
    }
    return mainThreadConversion;
  }, [shouldUseWorker, workerResult, mainThreadConversion]);

  const handleSwap = () => {
    if (conversion.error || !conversion.output) return;
    updateState({
      source: conversion.output,
      direction: state.direction === 'yaml2json' ? 'json2yaml' : 'yaml2json',
    });
  };

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 max-w-[90rem] mx-auto">
      <ToolHeader
        title={t('tool.yaml.title')}
        description={t('tool.yaml.description')}
        onReset={resetState}
        onShare={handleShare}
      />
      <ShareModal {...shareModalProps} />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <EditorPanel
            title={
              state.direction === 'yaml2json' ? t('tool.yaml.yamlInput') : t('tool.yaml.jsonInput')
            }
            value={state.source}
            onChange={(val) => updateState({ source: val })}
            mode={state.direction === 'yaml2json' ? 'yaml' : 'json'}
            className="h-full"
            status={conversion.error ? 'error' : 'default'}
          />
          <div className="mt-3">
            <FileInput
              onFileLoad={(content) => {
                updateState({ source: content });
              }}
              accept={state.direction === 'yaml2json' ? '.yaml,.yml,text/yaml' : '.json,application/json'}
              maxSize={50 * 1024 * 1024} // 50MB
              className="w-full"
            />
          </div>
        </div>
        <div className="flex-none flex items-center justify-center px-2">
          <button
            onClick={handleSwap}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            title={t('tool.yaml.switchDirection')}
            disabled={!!conversion.error || !conversion.output || isProcessing}
          >
            <ArrowRightLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {isProcessing && (
            <div className="flex-1 flex items-center justify-center p-4 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 mr-2"></div>
              {t('tool.yaml.convertingLargeFile')}
            </div>
          )}
          {!isProcessing && (
            <div className="flex-1 flex flex-col overflow-hidden rounded-md border shadow-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 shrink-0">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {state.direction === 'yaml2json' ? t('tool.yaml.jsonOutput') : t('tool.yaml.yamlOutput')}
                </span>
                <button
                  onClick={() =>
                    conversion.output &&
                    copyToClipboard(conversion.output, t('tool.yaml.copiedOutput'))
                  }
                  disabled={!conversion.output || !!conversion.error}
                  className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('common.copy')}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <EditorPanel
                  title=""
                  value={conversion.output}
                  readOnly
                  mode={state.direction === 'yaml2json' ? 'json' : 'yaml'}
                  className="h-full border-0 shadow-none rounded-none"
                  status={
                    conversion.error
                      ? 'error'
                      : conversion.output
                      ? 'success'
                      : 'default'
                  }
                />
              </div>
            </div>
          )}
          {/* Placeholder to match left side FileInput height */}
          <div className="mt-3 h-[42px]" />
        </div>
      </div>

      {!isProcessing && conversion.error && (
        <ErrorBanner
          className="mt-4"
          message={t('tool.yaml.conversionFailed')}
          details={conversion.error}
        />
      )}

      <ActionBar className="mt-4 flex-wrap items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <OptionLabel tooltip={t('tool.yaml.indentTooltip')}>
            {t('common.indent')}
          </OptionLabel>
          <Select
            value={String(state.indent) as '2' | '4'}
            onChange={(val) => updateState({ indent: Number(val) as 2 | 4 })}
            options={[
              { value: '2', label: t('common.spaces2') },
              { value: '4', label: t('common.spaces4') },
            ]}
            size="sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FileDownload
            content={conversion.output || ''}
            fileName={state.direction === 'yaml2json' ? 'output.json' : 'output.yaml'}
            mimeType={state.direction === 'yaml2json' ? getMimeType('json') : getMimeType('yaml')}
            disabled={!conversion.output || !!conversion.error}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('common.download')}
          </FileDownload>
        </div>
      </ActionBar>

      <AdsenseFooter />
    </div>
  );
};

export const yamlTool: ToolDefinition<YamlToolState> = {
  id: 'yaml',
  title: 'YAML Converter',
  description: 'YAML <-> JSON converter',
  path: '/yaml',
  icon: FileCode2,
  keywords: ['yaml', 'yml', 'json', 'convert', 'transform', 'parser'],
  category: 'converter',
  defaultState: DEFAULT_STATE,
  Component: YamlTool,
};
