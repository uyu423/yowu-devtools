/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Timer } from 'lucide-react';
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

interface CronToolState {
  expression: string;
  hasSeconds: boolean;
  timezone: 'local' | 'utc';
  nextCount: 10 | 20;
}

const DEFAULT_STATE: CronToolState = {
  expression: '*/5 * * * *',
  hasSeconds: false,
  timezone: 'local',
  nextCount: 10,
};

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

const CronTool: React.FC = () => {
  const { locale } = useI18n();
  const {
    state,
    updateState,
    resetState,
    t,
    handleShare,
    shareModalProps,
  } = useToolSetup<CronToolState>('cron', 'cron', DEFAULT_STATE);

  const cronResult = useMemo(() => {
    if (!state.expression.trim()) {
      return {
        description: '',
        nextRuns: [] as Date[],
        error: t('tool.cron.pleaseEnterCron'),
      };
    }

    try {
      const parts = state.expression.trim().split(/\s+/);
      const expected = state.hasSeconds ? 6 : 5;
      if (parts.length !== expected) {
        throw new Error(
          t('tool.cron.expectedFields')
            .replace('{n}', String(expected))
            .replace('{m}', String(parts.length))
        );
      }
      const options: CronExpressionOptions = {
        currentDate: new Date(),
        tz: state.timezone === 'utc' ? 'UTC' : undefined,
      };
      const expression = CronExpressionParser.parse(state.expression, options);
      const runs: Date[] = [];
      for (let i = 0; i < state.nextCount; i++) {
        runs.push(expression.next().toDate());
      }
      const cronstrueLocale = CRONSTRUE_LOCALE_MAP[locale] || 'en';
      const description = cronstrue.toString(state.expression, {
        use24HourTimeFormat: true,
        throwExceptionOnParseError: true,
        locale: cronstrueLocale,
      });
      return { description, nextRuns: runs, error: '' };
    } catch (error) {
      return { description: '', nextRuns: [], error: (error as Error).message };
    }
  }, [
    state.expression,
    state.hasSeconds,
    state.nextCount,
    state.timezone,
    t,
    locale,
  ]);

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
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tool.cron.cronExpression')}
          </label>
          <input
            type="text"
            value={state.expression}
            onChange={(e) => updateState({ expression: e.target.value })}
            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
                checked={state.hasSeconds}
                onChange={(e) => updateState({ hasSeconds: e.target.checked })}
              />
              <OptionLabel tooltip={t('tool.cron.secondsTooltip')}>
                {t('tool.cron.includeSeconds')}
              </OptionLabel>
            </label>
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
            <label className="inline-flex items-center gap-2">
              <OptionLabel tooltip={t('tool.cron.nextRunsTooltip')}>
                {t('tool.cron.nextRuns')}
              </OptionLabel>
              <select
                className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 text-sm"
                value={state.nextCount}
                onChange={(e) =>
                  updateState({ nextCount: Number(e.target.value) as 10 | 20 })
                }
              >
                <option value={10}>{t('tool.cron.items10')}</option>
                <option value={20}>{t('tool.cron.items20')}</option>
              </select>
            </label>
          </div>
        </div>

        {cronResult.error && (
          <ErrorBanner
            message={t('tool.cron.cronParsingError')}
            details={cronResult.error}
          />
        )}

        {!cronResult.error && cronResult.description && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-1">
              {t('tool.cron.humanReadable')}
            </h3>
            <p className="text-lg text-blue-800 dark:text-blue-200 font-semibold">
              {cronResult.description}
            </p>
          </div>
        )}

        {!cronResult.error && cronResult.nextRuns.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between">
              <span>{t('tool.cron.nextScheduledDates')}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {state.timezone === 'utc'
                  ? t('tool.time.utcTimezone')
                  : t('tool.time.localTimezone')}
              </span>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
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
  keywords: ['cron', 'schedule', 'expression', 'parser', 'explain', 'next'],
  category: 'parser',
  defaultState: DEFAULT_STATE,
  Component: CronTool,
};
