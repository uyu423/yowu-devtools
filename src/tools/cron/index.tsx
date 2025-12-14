/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Timer } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useToolState } from '@/hooks/useToolState';
import { useTitle } from '@/hooks/useTitle';
import { format, formatDistanceToNow } from 'date-fns';
import CronExpressionParser, { type CronExpressionOptions } from 'cron-parser';
import cronstrue from 'cronstrue';
import { isMobileDevice } from '@/lib/utils';
import { ShareModal } from '@/components/common/ShareModal';

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

const CronTool: React.FC = () => {
  useTitle('Cron Parser');
  // Cron tool state is small (expression string, boolean flags, small numbers)
  // No filter needed - all fields are necessary and small
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<CronToolState>('cron', DEFAULT_STATE);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const shareInfo = getShareStateInfo();
  const isMobile = isMobileDevice();

  const cronResult = useMemo(() => {
    if (!state.expression.trim()) {
      return {
        description: '',
        nextRuns: [] as Date[],
        error: 'Please enter a cron expression.',
      };
    }

    try {
      const parts = state.expression.trim().split(/\s+/);
      const expected = state.hasSeconds ? 6 : 5;
      if (parts.length !== expected) {
        throw new Error(
          `Expected ${expected} fields but received ${parts.length}.`
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
      const description = cronstrue.toString(state.expression, {
        use24HourTimeFormat: true,
        throwExceptionOnParseError: true,
      });
      return { description, nextRuns: runs, error: '' };
    } catch (error) {
      return { description: '', nextRuns: [], error: (error as Error).message };
    }
  }, [state.expression, state.hasSeconds, state.nextCount, state.timezone]);

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-3xl mx-auto">
      <ToolHeader
        title="Cron Parser"
        description="Explain cron expressions and preview upcoming runs."
        onReset={resetState}
        onShare={async () => {
          if (isMobile) {
            setIsShareModalOpen(true);
          } else {
            await copyShareLink();
          }
        }}
      />

      <div className="flex-1 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cron Expression
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
              <OptionLabel tooltip="Switch to the 6-field cron format that includes a leading seconds column. Standard cron uses 5 fields (minute, hour, day, month, weekday), but some systems support a 6-field format with seconds for more granular scheduling.">
                Include seconds field
              </OptionLabel>
            </label>
            <label className="inline-flex items-center gap-2">
              <OptionLabel tooltip="Choose whether upcoming runs are calculated in your local timezone or UTC. Local timezone uses your browser's timezone settings, while UTC provides consistent results regardless of location.">
                Timezone
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
                <option value="local">Local</option>
                <option value="utc">UTC</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-2">
              <OptionLabel tooltip="Set how many future executions to generate in the schedule table. This helps you preview when the cron job will run next, making it easier to verify your schedule.">
                Next runs
              </OptionLabel>
              <select
                className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 text-sm"
                value={state.nextCount}
                onChange={(e) =>
                  updateState({ nextCount: Number(e.target.value) as 10 | 20 })
                }
              >
                <option value={10}>10 items</option>
                <option value={20}>20 items</option>
              </select>
            </label>
          </div>
        </div>

        {cronResult.error && (
          <ErrorBanner
            message="Cron parsing error"
            details={cronResult.error}
          />
        )}

        {!cronResult.error && cronResult.description && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-1">
              Human readable
            </h3>
            <p className="text-lg text-blue-800 dark:text-blue-200 font-semibold">
              {cronResult.description}
            </p>
          </div>
        )}

        {!cronResult.error && cronResult.nextRuns.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between">
              <span>Next Scheduled Dates</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {state.timezone === 'utc' ? 'UTC timezone' : 'Local timezone'}
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
                    {formatDistanceToNow(date, { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onConfirm={async () => {
          setIsShareModalOpen(false);
          await shareViaWebShare();
        }}
        includedFields={shareInfo.includedFields}
        excludedFields={shareInfo.excludedFields}
        toolName="Cron Parser"
      />
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
