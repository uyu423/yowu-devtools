/* eslint-disable react-refresh/only-export-components */
import React, { useMemo, useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Timer, Copy, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useToolSetup } from '@/hooks/useToolSetup';
import { format, formatDistanceToNow } from 'date-fns';
import { enUS as enUSLocale, ko, ja, zhCN, es } from 'date-fns/locale';
import CronExpressionParser, { type CronExpressionOptions } from 'cron-parser';
import cronstrue from 'cronstrue';
// cronstrue locales
import 'cronstrue/locales/ko';
import 'cronstrue/locales/ja';
import 'cronstrue/locales/zh_CN';
import 'cronstrue/locales/es';
import { ShareModal } from '@/components/common/ShareModal';
import { useI18n } from '@/hooks/useI18nHooks';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/clipboard';
import { cn } from '@/lib/utils';

// v1.3.2 imports
import type { CronToolState, CronSpec, ParsedCronField, CronWarning } from './types';
import { DEFAULT_CRON_STATE, CRON_SPECS } from './types';
import {
  parseCronExpression,
  normalizeCronExpression,
  detectCronSpec,
  expandMacro,
  toAwsFormat,
} from './parsers';

// Map our locale codes to cronstrue locale codes
const CRONSTRUE_LOCALE_MAP: Record<string, string> = {
  'en-US': 'en',
  'ko-KR': 'ko',
  'ja-JP': 'ja',
  'zh-CN': 'zh_CN',
  'es-ES': 'es',
};

// Map our locale codes to date-fns locale objects
const DATE_FNS_LOCALE_MAP: Record<string, typeof enUSLocale> = {
  'en-US': enUSLocale,
  'ko-KR': ko,
  'ja-JP': ja,
  'zh-CN': zhCN,
  'es-ES': es,
};

// Field type to i18n key mapping
const FIELD_I18N_MAP: Record<string, string> = {
  seconds: 'fieldSeconds',
  minutes: 'fieldMinutes',
  hours: 'fieldHours',
  dayOfMonth: 'fieldDom',
  month: 'fieldMonth',
  dayOfWeek: 'fieldDow',
  year: 'fieldYear',
};

// Spec options for dropdown
const SPEC_OPTIONS: { value: CronSpec; labelKey: string; descKey: string }[] = [
  { value: 'auto', labelKey: 'specAuto', descKey: 'specAutoDesc' },
  { value: 'unix', labelKey: 'specUnix', descKey: 'specUnixDesc' },
  { value: 'unix-seconds', labelKey: 'specUnixSeconds', descKey: 'specUnixSecondsDesc' },
  { value: 'quartz', labelKey: 'specQuartz', descKey: 'specQuartzDesc' },
  { value: 'aws', labelKey: 'specAws', descKey: 'specAwsDesc' },
  { value: 'k8s', labelKey: 'specK8s', descKey: 'specK8sDesc' },
  { value: 'jenkins', labelKey: 'specJenkins', descKey: 'specJenkinsDesc' },
];

const CronTool: React.FC = () => {
  const { locale } = useI18n();
  const {
    state,
    updateState,
    resetState,
    t,
    handleShare,
    shareModalProps,
  } = useToolSetup<CronToolState>('cron', 'cron', DEFAULT_CRON_STATE);

  const [showFieldBreakdown, setShowFieldBreakdown] = useState(false);

  // Parse cron expression using new parser infrastructure
  const parseResult = useMemo(() => {
    return parseCronExpression(state.expression, state.spec);
  }, [state.expression, state.spec]);

  // Calculate next runs and description
  const cronResult = useMemo(() => {
    if (!state.expression.trim()) {
      return {
        description: '',
        nextRuns: [] as Date[],
        error: t('tool.cron.pleaseEnterCron'),
        normalized: '',
        awsFormat: undefined as string | undefined,
        detectedSpec: 'unix' as CronSpec,
        fields: [] as ParsedCronField[],
        warnings: [] as CronWarning[],
      };
    }

    // Handle macros
    const { normalized } = normalizeCronExpression(state.expression);
    const expandedMacro = expandMacro(normalized);
    const effectiveExpression = expandedMacro || normalized;

    try {
      // Check field count based on spec
      const parts = effectiveExpression.trim().split(/\s+/);
      const detectedSpec = state.spec === 'auto' 
        ? detectCronSpec(state.expression) 
        : state.spec;
      
      // Determine expected field count
      let expectedMin = 5;
      let expectedMax = 5;
      const specInfo = CRON_SPECS[detectedSpec];
      if (Array.isArray(specInfo.fieldCount)) {
        [expectedMin, expectedMax] = specInfo.fieldCount;
      } else {
        expectedMin = expectedMax = specInfo.fieldCount;
      }

      // For hasSeconds option, override field count expectation
      const actualExpected = state.hasSeconds ? 6 : expectedMin;
      
      if (parts.length < expectedMin || parts.length > expectedMax) {
        if (state.spec !== 'auto' || parts.length !== actualExpected) {
          // Only error if not auto mode or field count doesn't match hasSeconds
          if (parts.length !== actualExpected) {
            throw new Error(
              t('tool.cron.expectedFields')
                .replace('{n}', String(actualExpected))
                .replace('{m}', String(parts.length))
            );
          }
        }
      }

      // Parse with cron-parser
      const options: CronExpressionOptions = {
        currentDate: state.fromDateTime ? new Date(state.fromDateTime) : new Date(),
        tz: state.timezone === 'utc' ? 'UTC' : undefined,
      };

      // For cron-parser, we need to handle the expression based on hasSeconds
      const expression = CronExpressionParser.parse(effectiveExpression, options);
      const runs: Date[] = [];
      for (let i = 0; i < state.nextCount; i++) {
        runs.push(expression.next().toDate());
      }

      // Generate human-readable description with cronstrue
      const cronstrueLocale = CRONSTRUE_LOCALE_MAP[locale] || 'en';
      let description = '';
      try {
        description = cronstrue.toString(effectiveExpression, {
          use24HourTimeFormat: true,
          throwExceptionOnParseError: false,
          locale: cronstrueLocale,
        });
      } catch {
        description = '';
      }

      // Get AWS format if applicable
      const awsFormat = toAwsFormat(effectiveExpression, detectedSpec);

      return {
        description,
        nextRuns: runs,
        error: '',
        normalized: effectiveExpression,
        awsFormat,
        detectedSpec,
        fields: parseResult.fields,
        warnings: parseResult.warnings,
      };
    } catch (error) {
      return {
        description: '',
        nextRuns: [],
        error: (error as Error).message,
        normalized: effectiveExpression,
        awsFormat: undefined,
        detectedSpec: parseResult.detectedSpec,
        fields: [],
        warnings: [],
      };
    }
  }, [
    state.expression,
    state.hasSeconds,
    state.nextCount,
    state.timezone,
    state.spec,
    state.fromDateTime,
    t,
    locale,
    parseResult,
  ]);

  // Handle spec change
  const handleSpecChange = (newSpec: CronSpec) => {
    updateState({ spec: newSpec });
    // Auto-update hasSeconds based on spec
    if (newSpec === 'unix-seconds' || newSpec === 'quartz') {
      updateState({ hasSeconds: true });
    } else if (newSpec === 'unix' || newSpec === 'k8s' || newSpec === 'jenkins') {
      updateState({ hasSeconds: false });
    }
  };

  // Copy next runs in various formats
  const copyNextRuns = (formatType: 'iso' | 'rfc3339' | 'epoch') => {
    const formatted = cronResult.nextRuns.map((date) => {
      switch (formatType) {
        case 'iso':
          return date.toISOString();
        case 'rfc3339':
          return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
        case 'epoch':
          return String(date.getTime());
        default:
          return date.toISOString();
      }
    });
    copyToClipboard(formatted.join('\n'));
    toast.success(t('tool.cron.copiedNextRuns'));
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-3xl mx-auto">
      <ToolHeader
        title={t('tool.cron.title')}
        description={t('tool.cron.description')}
        onReset={resetState}
        onShare={handleShare}
      />
      <ShareModal {...shareModalProps} />

      <div className="flex-1 flex flex-col gap-6">
        {/* Cron Expression Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tool.cron.cronExpression')}
          </label>
          <input
            type="text"
            value={state.expression}
            onChange={(e) => updateState({ expression: e.target.value })}
            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="*/5 * * * *"
          />

          {/* Normalized display */}
          {!cronResult.error && cronResult.normalized && cronResult.normalized !== state.expression.trim() && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
              <span className="font-medium">{t('tool.cron.normalized')}:</span>{' '}
              <span className="text-gray-700 dark:text-gray-300">{cronResult.normalized}</span>
            </div>
          )}

          {/* AWS format display */}
          {!cronResult.error && cronResult.awsFormat && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
              <span className="font-medium">{t('tool.cron.awsFormat')}:</span>{' '}
              <span className="text-gray-700 dark:text-gray-300">{cronResult.awsFormat}</span>
            </div>
          )}

          {/* Options */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {/* Spec dropdown */}
            <label className="inline-flex items-center gap-2">
              <OptionLabel tooltip={t('tool.cron.specTooltip')}>
                {t('tool.cron.spec')}
              </OptionLabel>
              <select
                className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 text-sm"
                value={state.spec}
                onChange={(e) => handleSpecChange(e.target.value as CronSpec)}
              >
                {SPEC_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(`tool.cron.${opt.labelKey}`)}
                  </option>
                ))}
              </select>
            </label>

            {/* Include seconds checkbox */}
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
                checked={state.hasSeconds}
                onChange={(e) => updateState({ hasSeconds: e.target.checked })}
                disabled={state.spec === 'unix' || state.spec === 'k8s' || state.spec === 'jenkins'}
              />
              <OptionLabel tooltip={t('tool.cron.secondsTooltip')}>
                {t('tool.cron.includeSeconds')}
              </OptionLabel>
            </label>

            {/* Timezone */}
            <label className="inline-flex items-center gap-2">
              <OptionLabel tooltip={t('tool.cron.timezoneTooltip')}>
                {t('tool.cron.timezone')}
              </OptionLabel>
              <select
                className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 text-sm"
                value={state.timezone}
                onChange={(e) =>
                  updateState({
                    timezone: e.target.value as CronToolState['timezone'],
                  })
                }
              >
                <option value="local">{t('tool.time.local')}</option>
                <option value="utc">{t('tool.time.utc')}</option>
              </select>
            </label>

            {/* Next runs count */}
            <label className="inline-flex items-center gap-2">
              <OptionLabel tooltip={t('tool.cron.nextRunsTooltip')}>
                {t('tool.cron.nextRuns')}
              </OptionLabel>
              <select
                className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 text-sm"
                value={state.nextCount}
                onChange={(e) =>
                  updateState({ nextCount: Number(e.target.value) as 10 | 20 | 50 })
                }
              >
                <option value={10}>{t('tool.cron.items10')}</option>
                <option value={20}>{t('tool.cron.items20')}</option>
                <option value={50}>{t('tool.cron.items50')}</option>
              </select>
            </label>
          </div>

          {/* From datetime */}
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <OptionLabel tooltip={t('tool.cron.fromDateTimeTooltip')}>
              {t('tool.cron.fromDateTime')}
              <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                ({state.timezone === 'utc' ? 'UTC' : t('tool.time.local')})
              </span>
            </OptionLabel>
            <input
              type="datetime-local"
              className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 text-sm"
              value={state.fromDateTime || new Date().toISOString().slice(0, 16)}
              onChange={(e) => updateState({ fromDateTime: e.target.value || undefined })}
            />
            <button
              type="button"
              className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => {
                const now = new Date().toISOString().slice(0, 16);
                updateState({ fromDateTime: now });
              }}
            >
              {t('tool.cron.now')}
            </button>
          </div>

          {/* Spec description */}
          {state.spec !== 'auto' && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {t(`tool.cron.${SPEC_OPTIONS.find(opt => opt.value === state.spec)?.descKey || 'specAutoDesc'}`)}
              </span>
            </div>
          )}
        </div>

        {/* Error Banner */}
        {cronResult.error && (
          <ErrorBanner
            message={t('tool.cron.cronParsingError')}
            details={cronResult.error}
          />
        )}

        {/* Warnings */}
        {!cronResult.error && cronResult.warnings.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-sm font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              {t('tool.cron.warnings')}
            </div>
            <ul className="space-y-1">
              {cronResult.warnings.map((warning, idx) => (
                <li key={idx} className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {warning.type === 'dom-dow-or' && t('tool.cron.warningDomDowOr')}
                    {warning.type === 'dom-dow-exclusive' && 
                      (state.spec === 'aws' 
                        ? t('tool.cron.warningAwsDomDow') 
                        : t('tool.cron.warningDomDowExclusive'))}
                    {warning.type === 'jenkins-hash' && t('tool.cron.warningJenkinsHash')}
                    {warning.type === 'aws-tz' && t('tool.cron.warningAwsTz')}
                    {warning.type === 'k8s-tz' && t('tool.cron.warningK8sTz')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Human Readable Description */}
        {!cronResult.error && cronResult.description && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-1">
              {t('tool.cron.humanReadable')}
            </h3>
            <p className="text-lg text-blue-800 dark:text-blue-200 font-semibold">
              {cronResult.description}
            </p>

            {/* Detected spec badge */}
            {state.spec === 'auto' && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {t('tool.cron.spec')}: {CRON_SPECS[cronResult.detectedSpec].name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Field Breakdown (collapsible) */}
        {!cronResult.error && cronResult.fields.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <button
              type="button"
              className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => setShowFieldBreakdown(!showFieldBreakdown)}
            >
              <span>{t('tool.cron.fieldBreakdown')}</span>
              {showFieldBreakdown ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {showFieldBreakdown && (
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {cronResult.fields.map((field, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-2 rounded border",
                      field.hasSpecialTokens
                        ? "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
                    )}
                  >
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {t(`tool.cron.${FIELD_I18N_MAP[field.type]}`)}
                    </div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white mt-1">
                      {field.raw}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {field.description}
                    </div>
                    {field.hasSpecialTokens && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {field.specialTokens.map((token, tidx) => (
                          <span
                            key={tidx}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300"
                          >
                            {token.symbol}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Next Scheduled Dates */}
        {!cronResult.error && cronResult.nextRuns.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center">
              <span>{t('tool.cron.nextScheduledDates')}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {state.timezone === 'utc'
                    ? t('tool.time.utcTimezone')
                    : t('tool.time.localTimezone')}
                </span>
                {/* Copy buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                    onClick={() => copyNextRuns('iso')}
                    title={t('tool.cron.copyIso')}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {cronResult.nextRuns.map((date, idx) => (
                <li
                  key={idx}
                  className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 flex justify-between"
                >
                  <span className="font-mono">
                    {format(date, 'yyyy-MM-dd HH:mm:ss')}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">
                    {formatDistanceToNow(date, {
                      addSuffix: true,
                      locale: DATE_FNS_LOCALE_MAP[locale] || enUSLocale,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Special tokens reference (show when Quartz/AWS/Jenkins) */}
        {(state.spec === 'quartz' || state.spec === 'aws' || state.spec === 'jenkins' ||
          (state.spec === 'auto' && ['quartz', 'aws', 'jenkins'].includes(cronResult.detectedSpec))) && (
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="font-medium mb-1">{t('tool.cron.specialTokens')}</div>
            <ul className="space-y-0.5">
              {(state.spec === 'quartz' || state.spec === 'aws' || cronResult.detectedSpec === 'quartz' || cronResult.detectedSpec === 'aws') && (
                <>
                  <li>{t('tool.cron.tokenQuestion')}</li>
                  <li>{t('tool.cron.tokenL')}</li>
                  <li>{t('tool.cron.tokenW')}</li>
                  <li>{t('tool.cron.tokenHash')}</li>
                </>
              )}
              {(state.spec === 'jenkins' || cronResult.detectedSpec === 'jenkins') && (
                <li>{t('tool.cron.tokenH')}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export const cronTool: ToolDefinition<CronToolState> = {
  id: 'cron',
  title: 'Cron Parser',
  description: 'Cron expression explainer',
  path: '/cron',
  icon: Timer,
  keywords: ['cron', 'schedule', 'expression', 'parser', 'explain', 'next', 'quartz', 'aws', 'jenkins', 'kubernetes'],
  category: 'parser',
  defaultState: DEFAULT_CRON_STATE,
  Component: CronTool,
};
