/* eslint-disable react-refresh/only-export-components */
import React, { useMemo, useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Clock } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToolState } from '@/hooks/useToolState';
import { useTitle } from '@/hooks/useTitle';
import { format, formatISO } from 'date-fns';

interface TimeToolState {
  epochInput: string;
  epochUnit: 'ms' | 's';
  isoInput: string;
  timezone: 'local' | 'utc';
}

const DEFAULT_STATE: TimeToolState = {
  epochInput: '',
  epochUnit: 'ms',
  isoInput: '',
  timezone: 'local',
};

const TimeTool: React.FC = () => {
  useTitle('Time Converter');
  const { state, setState, resetState, shareState } = useToolState<TimeToolState>('time', DEFAULT_STATE);
  const [epochError, setEpochError] = useState<string | null>(null);
  const [isoError, setIsoError] = useState<string | null>(null);

  const derivedDate = useMemo(() => {
    if (state.isoInput.trim()) {
      const parsed = new Date(state.isoInput);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    if (state.epochInput.trim()) {
      const ms = state.epochUnit === 's' ? Number(state.epochInput) * 1000 : Number(state.epochInput);
      if (!Number.isNaN(ms)) {
        const parsed = new Date(ms);
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
    }
    return null;
  }, [state.isoInput, state.epochInput, state.epochUnit]);

  const handleEpochChange = (value: string) => {
    const { iso, error } = convertEpoch(value, state.epochUnit, state.timezone);
    setEpochError(error);
    if (!error && iso !== undefined) {
      setIsoError(null);
      setState(prev => ({ ...prev, epochInput: value, isoInput: iso }));
    } else {
      setState(prev => ({ ...prev, epochInput: value }));
    }
  };

  const handleIsoChange = (value: string) => {
    const { epoch, error } = convertIso(value, state.epochUnit);
    setIsoError(error);
    if (!error && epoch !== undefined) {
      setEpochError(null);
      setState(prev => ({ ...prev, isoInput: value, epochInput: epoch }));
    } else {
      setState(prev => ({ ...prev, isoInput: value }));
    }
  };

  const handleUnitChange = (unit: 'ms' | 's') => {
    const { iso, error } = convertEpoch(state.epochInput, unit, state.timezone);
    setEpochError(error);
    setState(prev => ({ ...prev, epochUnit: unit, isoInput: iso ?? prev.isoInput }));
  };

  const handleTimezoneChange = (timezone: 'local' | 'utc') => {
    const { iso, error } = convertEpoch(state.epochInput, state.epochUnit, timezone);
    setEpochError(error);
    setState(prev => ({ ...prev, timezone, isoInput: iso ?? prev.isoInput }));
  };

  const handleSetNow = () => {
    const now = Date.now();
    const epochValue = state.epochUnit === 's' ? Math.floor(now / 1000).toString() : now.toString();
    const isoValue = state.timezone === 'utc' ? new Date(now).toISOString() : formatISO(new Date(now));
    setEpochError(null);
    setIsoError(null);
    setState(prev => ({ ...prev, epochInput: epochValue, isoInput: isoValue }));
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-3xl mx-auto">
      <ToolHeader 
        title="Epoch / ISO Converter" 
        description="Switch between epoch timestamps and ISO8601 strings."
        onReset={resetState}
        onShare={shareState}
      />
      <div className="space-y-8 mt-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <OptionLabel tooltip="Epoch timestamp represents the number of seconds or milliseconds that have elapsed since January 1, 1970 (Unix epoch) in UTC. This is a common way to represent dates in programming." className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Epoch Timestamp
            </OptionLabel>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              {(['ms', 's'] as const).map(unit => (
                <label 
                  key={unit} 
                  className="inline-flex items-center gap-2 cursor-pointer"
                >
                  <input 
                    type="radio" 
                    name="epoch-unit" 
                    checked={state.epochUnit === unit}
                    onChange={() => handleUnitChange(unit)}
                    className="text-blue-600 dark:text-blue-500"
                  />
                  <OptionLabel tooltip={unit === 'ms' ? 'Interpret the epoch value as milliseconds since 1970-01-01 UTC. This is the JavaScript Date format (e.g., 1704067200000).' : 'Interpret the epoch value as seconds since 1970-01-01 UTC. This is the Unix timestamp format (e.g., 1704067200).'}>
                    {unit === 'ms' ? 'milliseconds' : 'seconds'}
                  </OptionLabel>
                </label>
              ))}
            </div>
          </div>
          <input 
            type="text" 
            value={state.epochInput}
            onChange={(e) => handleEpochChange(e.target.value)}
            className={`block w-full rounded-md border px-3 py-2 font-mono text-sm shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 ${epochError ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}`}
            placeholder="e.g. 1704067200000"
          />
          {epochError && <ErrorBanner message="Epoch input error" details={epochError} />}
        </div>

        <div className="flex justify-center">
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700" onClick={handleSetNow}>
            Set to Now
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <OptionLabel tooltip="ISO 8601 is an international standard for date and time representation. The format is YYYY-MM-DDTHH:mm:ss.sssZ, where 'Z' indicates UTC timezone. This format is widely used in APIs and databases." className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ISO 8601 Date
            </OptionLabel>
            <div className="flex items-center gap-2 text-sm">
              {(['local', 'utc'] as const).map((tz) => (
                <Tooltip
                  key={tz}
                  content={tz === 'local' ? 'Display ISO conversions relative to your local timezone. The time will be adjusted based on your browser\'s timezone settings.' : 'Display ISO conversions relative to UTC (Coordinated Universal Time). This is the standard timezone used in programming and avoids daylight saving time complications.'}
                >
                  <button
                    onClick={() => handleTimezoneChange(tz)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      state.timezone === tz 
                        ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                        : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tz === 'local' ? 'Local' : 'UTC'}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
          <input 
            type="text" 
            value={state.isoInput}
            onChange={(e) => handleIsoChange(e.target.value)}
            className={`block w-full rounded-md border px-3 py-2 font-mono text-sm shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 ${isoError ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}`}
            placeholder="e.g. 2024-01-01T00:00:00.000Z"
          />
          {isoError && <ErrorBanner message="ISO input error" details={isoError} />}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md text-sm text-blue-900 dark:text-blue-100 border border-blue-100 dark:border-blue-800">
          <p className="flex justify-between"><span className="font-medium">Local Time</span><span className="font-mono">{derivedDate ? format(derivedDate, 'yyyy-MM-dd HH:mm:ss.SSS xxx') : '-'}</span></p>
          <p className="mt-2 flex justify-between"><span className="font-medium">UTC</span><span className="font-mono">{derivedDate ? derivedDate.toISOString() : '-'}</span></p>
        </div>
      </div>
    </div>
  );
};

function convertEpoch(value: string, unit: 'ms' | 's', timezone: 'local' | 'utc') {
  const trimmed = value.trim();
  if (!trimmed) return { iso: '', error: null };
  if (!/^[-]?\d+(\.\d+)?$/.test(trimmed)) {
    return { iso: '', error: 'Please enter a numeric value.' };
  }
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    return { iso: '', error: 'Number is out of range.' };
  }
  const ms = unit === 's' ? numeric * 1000 : numeric;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) {
    return { iso: '', error: 'Epoch value is invalid.' };
  }
  const iso = timezone === 'utc' ? date.toISOString() : formatISO(date);
  return { iso, error: null };
}

function convertIso(value: string, unit: 'ms' | 's') {
  const trimmed = value.trim();
  if (!trimmed) return { epoch: '', error: null };
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return { epoch: '', error: 'ISO 8601 format is invalid.' };
  }
  const ms = date.getTime();
  const epoch = unit === 's' ? Math.floor(ms / 1000).toString() : ms.toString();
  return { epoch, error: null };
}

export const timeTool: ToolDefinition<TimeToolState> = {
  id: 'time',
  title: 'Time Converter',
  description: 'Epoch <-> ISO converter',
  path: '/time',
  icon: Clock,
  defaultState: DEFAULT_STATE,
  Component: TimeTool,
};
