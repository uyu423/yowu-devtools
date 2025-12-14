/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Timer } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useToolState } from '@/hooks/useToolState';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTitle } from '@/hooks/useTitle';
import { format, formatDistanceToNow } from 'date-fns';
import CronExpressionParser, { type CronExpressionOptions } from 'cron-parser';
import cronstrue from 'cronstrue';

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
  const { state, updateState, resetState, shareState } = useToolState<CronToolState>('cron', DEFAULT_STATE);
  const debouncedExpression = useDebouncedValue(state.expression, 300);

  const cronResult = useMemo(() => {
    if (!debouncedExpression.trim()) {
      return { description: '', nextRuns: [] as Date[], error: 'Please enter a cron expression.' };
    }

    try {
      const parts = debouncedExpression.trim().split(/\s+/);
      const expected = state.hasSeconds ? 6 : 5;
      if (parts.length !== expected) {
        throw new Error(`Expected ${expected} fields but received ${parts.length}.`);
      }
      const options: CronExpressionOptions = {
        currentDate: new Date(),
        tz: state.timezone === 'utc' ? 'UTC' : undefined,
      };
      const expression = CronExpressionParser.parse(debouncedExpression, options);
      const runs: Date[] = [];
      for (let i = 0; i < state.nextCount; i++) {
        runs.push(expression.next().toDate());
      }
      const description = cronstrue.toString(debouncedExpression, {
        use24HourTimeFormat: true,
        throwExceptionOnParseError: true,
      });
      return { description, nextRuns: runs, error: '' };
    } catch (error) {
      return { description: '', nextRuns: [], error: (error as Error).message };
    }
  }, [debouncedExpression, state.hasSeconds, state.nextCount, state.timezone]);

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-3xl mx-auto">
      <ToolHeader 
        title="Cron Parser" 
        description="Explain cron expressions and preview upcoming runs."
        onReset={resetState}
        onShare={shareState}
      />

      <div className="flex-1 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cron Expression</label>
          <input 
            type="text" 
            value={state.expression}
            onChange={(e) => updateState({ expression: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            <label className="inline-flex items-center gap-2">
              <input 
                type="checkbox" 
                className="rounded border-gray-300"
                checked={state.hasSeconds}
                onChange={(e) => updateState({ hasSeconds: e.target.checked })}
              />
              <span>Include seconds field</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <span>Timezone</span>
              <select 
                className="rounded-md border px-2 py-1"
                value={state.timezone}
                onChange={(e) => updateState({ timezone: e.target.value as CronToolState['timezone'] })}
              >
                <option value="local">Local</option>
                <option value="utc">UTC</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-2">
              <span>Next runs</span>
              <select 
                className="rounded-md border px-2 py-1"
                value={state.nextCount}
                onChange={(e) => updateState({ nextCount: Number(e.target.value) as 10 | 20 })}
              >
                <option value={10}>10 items</option>
                <option value={20}>20 items</option>
              </select>
            </label>
          </div>
        </div>

        {cronResult.error && (
          <ErrorBanner message="Cron parsing error" details={cronResult.error} />
        )}

        {!cronResult.error && cronResult.description && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 uppercase tracking-wider mb-1">Human readable</h3>
            <p className="text-lg text-blue-800 font-semibold">{cronResult.description}</p>
          </div>
        )}

        {!cronResult.error && cronResult.nextRuns.length > 0 && (
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium text-gray-700 flex justify-between">
              <span>Next Scheduled Dates</span>
              <span className="text-xs text-gray-500">{state.timezone === 'utc' ? 'UTC timezone' : 'Local timezone'}</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {cronResult.nextRuns.map((date, idx) => (
                <li key={idx} className="px-4 py-3 text-sm text-gray-700 flex justify-between">
                  <span className="font-mono">{format(date, 'yyyy-MM-dd HH:mm:ss')}</span>
                  <span className="text-gray-400">{formatDistanceToNow(date, { addSuffix: true })}</span>
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
  defaultState: DEFAULT_STATE,
  Component: CronTool,
};
