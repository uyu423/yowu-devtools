/* eslint-disable react-refresh/only-export-components */
import React, { useMemo, useRef, useCallback, useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { TextCursorInput, Upload, Globe, RefreshCw, X, AlertTriangle, Loader2 } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToolSetup } from '@/hooks/useToolSetup';
import { ShareModal } from '@/components/common/ShareModal';
import { AdsenseFooter } from '@/components/common/AdsenseFooter';
import { toast } from 'sonner';

interface StringLengthToolState {
  input: string;
}

const DEFAULT_STATE: StringLengthToolState = {
  input: "Hello Yowu's DevTools",
};

// UTF-8 바이트 수 계산
function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

// 단어 수 계산 (공백으로 구분, 연속 공백 무시)
function getWordCount(str: string): number {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

// 줄 수 계산
function getLineCount(str: string): number {
  if (!str) return 0;
  return str.split(/\r\n|\r|\n/).length;
}

// 공백 제외 문자 수
function getCharCountWithoutSpaces(str: string): number {
  return str.replace(/\s/g, '').length;
}

// URL 유효성 검사 함수
function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url.trim()) {
    return { isValid: false, error: 'urlEmpty' };
  }
  
  try {
    const parsed = new URL(url);
    // HTTP/HTTPS만 허용
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, error: 'urlProtocolInvalid' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'urlInvalid' };
  }
}

// URL 로드 모달 컴포넌트
interface UrlLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (url: string) => Promise<void>;
  isLoading: boolean;
  t: (key: string) => string;
}

const UrlLoadModal: React.FC<UrlLoadModalProps> = ({
  isOpen,
  onClose,
  onLoad,
  isLoading,
  t,
}) => {
  const [url, setUrl] = useState('');
  const [validation, setValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: true });
  const inputRef = useRef<HTMLInputElement>(null);

  // 모달이 열릴 때 입력 필드에 포커스
  React.useEffect(() => {
    if (isOpen) {
      setUrl('');
      setValidation({ isValid: true });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    // 입력 중에는 빈 값이 아닐 때만 유효성 검사
    if (value.trim()) {
      setValidation(validateUrl(value));
    } else {
      setValidation({ isValid: true });
    }
  };

  const handleSubmit = async () => {
    const result = validateUrl(url);
    setValidation(result);
    
    if (result.isValid) {
      await onLoad(url);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && validation.isValid && url.trim()) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('tool.stringLength.loadFromUrl')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tool.stringLength.urlInputLabel')}
            </label>
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com/file.txt"
              disabled={isLoading}
              className={`w-full px-3 py-2 text-sm rounded-md border transition-colors
                ${!validation.isValid && url.trim()
                  ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2
                disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {/* Validation Error */}
            {!validation.isValid && url.trim() && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {validation.error === 'urlProtocolInvalid'
                  ? t('tool.stringLength.urlProtocolError')
                  : t('tool.stringLength.invalidUrl')}
              </p>
            )}
          </div>

          {/* CORS Warning */}
          <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t('tool.stringLength.corsWarningTitle')}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {t('tool.stringLength.corsWarningDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !validation.isValid || !url.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                {t('tool.stringLength.loadButton')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const StringLengthTool: React.FC = () => {
  const {
    state,
    updateState,
    resetState,
    t,
    handleShare,
    shareModalProps,
  } = useToolSetup<StringLengthToolState>('string-length', 'stringLength', DEFAULT_STATE);

  const debouncedInput = useDebouncedValue(state.input, 100);

  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const input = debouncedInput;
    return {
      characters: input.length,
      charactersNoSpaces: getCharCountWithoutSpaces(input),
      words: getWordCount(input),
      lines: getLineCount(input),
      bytes: getByteLength(input),
    };
  }, [debouncedInput]);

  // 파일 업로드 핸들러
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // 파일 크기 제한 (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(t('common.fileTooLarge').replace('{size}', '10'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        updateState({ input: text });
        toast.success(t('common.fileLoadedSuccess').replace('{name}', file.name));
      };
      reader.onerror = () => {
        toast.error(t('common.fileReadFailed'));
      };
      reader.readAsText(file);

      // 같은 파일 재선택 허용을 위해 input 초기화
      event.target.value = '';
    },
    [updateState, t]
  );

  // URL에서 텍스트 로드 (모달에서 호출)
  const handleLoadFromUrl = useCallback(async (url: string) => {
    setIsLoadingUrl(true);
    setUrlError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      updateState({ input: text });
      toast.success(t('tool.stringLength.urlLoadedSuccess'));
      setIsUrlModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setUrlError(message);
      toast.error(t('tool.stringLength.urlLoadFailed'));
    } finally {
      setIsLoadingUrl(false);
    }
  }, [updateState, t]);

  // 샘플 데이터 로드
  const handleLoadSample = useCallback(() => {
    updateState({ input: DEFAULT_STATE.input });
    toast.success(t('tool.stringLength.sampleLoaded'));
  }, [updateState, t]);

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title={t('tool.stringLength.title')}
        description={t('tool.stringLength.description')}
        onReset={resetState}
        onShare={handleShare}
      />
      <ShareModal {...shareModalProps} />
      
      {/* URL Load Modal */}
      <UrlLoadModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onLoad={handleLoadFromUrl}
        isLoading={isLoadingUrl}
        t={t}
      />

      <div className="flex-1 flex flex-col gap-6">
        {/* Action Bar */}
        <ActionBar className="flex flex-wrap items-center gap-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 sm:p-4 shadow-sm">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.json,.xml,.csv,.log,.html,.css,.js,.ts,.yaml,.yml"
            className="hidden"
          />
          <button
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            title={t('tool.stringLength.uploadFile')}
          >
            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t('tool.stringLength.uploadFile')}
          </button>

          <button
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsUrlModalOpen(true)}
            title={t('tool.stringLength.loadFromUrl')}
          >
            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t('tool.stringLength.loadFromUrl')}
          </button>

          <button
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={handleLoadSample}
            title={t('tool.stringLength.loadSample')}
          >
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t('tool.stringLength.loadSample')}
          </button>
        </ActionBar>

        {urlError && (
          <ErrorBanner
            message={t('tool.stringLength.urlLoadFailed')}
            details={urlError}
          />
        )}

        {/* Input Panel */}
        <EditorPanel
          title={t('common.input')}
          value={state.input}
          onChange={(val) => updateState({ input: val })}
          placeholder={t('tool.stringLength.inputPlaceholder')}
          resizable
          minHeight={120}
          maxHeight={600}
          heightStorageKey="string-length-input-height"
        />

        {/* Statistics Panel */}
        <div className="rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            {t('tool.stringLength.statistics')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              label={t('tool.stringLength.characters')}
              value={stats.characters}
            />
            <StatCard
              label={t('tool.stringLength.charactersNoSpaces')}
              value={stats.charactersNoSpaces}
            />
            <StatCard
              label={t('tool.stringLength.words')}
              value={stats.words}
            />
            <StatCard
              label={t('tool.stringLength.lines')}
              value={stats.lines}
            />
            <StatCard
              label={t('tool.stringLength.bytes')}
              value={stats.bytes}
              suffix="B"
            />
          </div>
        </div>

        <AdsenseFooter />
      </div>
    </div>
  );
};

// 통계 카드 컴포넌트
interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, suffix }) => (
  <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
      {value.toLocaleString()}{suffix && <span className="text-sm ml-0.5">{suffix}</span>}
    </span>
    <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
      {label}
    </span>
  </div>
);

export const stringLengthTool: ToolDefinition<StringLengthToolState> = {
  id: 'string-length',
  title: 'String Length',
  description: 'Count characters, words, lines, and bytes',
  keywords: ['string', 'length', 'count', 'character', 'word', 'line', 'byte', 'text', 'counter'],
  category: 'utility',
  path: '/string-length',
  icon: TextCursorInput,
  defaultState: DEFAULT_STATE,
  Component: StringLengthTool,
};

