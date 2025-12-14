/* eslint-disable react-refresh/only-export-components */
import React, { useMemo, useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Clock } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
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
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <label className="text-sm font-medium text-gray-700">Epoch Timestamp</label>
            <div className="flex items-center space-x-4 text-sm">
              {(['ms', 's'] as const).map(unit => (
                <label key={unit} className="inline-flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="epoch-unit" 
                    checked={state.epochUnit === unit}
                    onChange={() => handleUnitChange(unit)}
                    className="text-blue-600"
                  />
                  <span>{unit === 'ms' ? 'milliseconds' : 'seconds'}</span>
                </label>
              ))}
            </div>
          </div>
          <input 
            type="text" 
            value={state.epochInput}
            onChange={(e) => handleEpochChange(e.target.value)}
            className={`block w-full rounded-md border px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${epochError ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="e.g. 1704067200000"
          />
          {epochError && <ErrorBanner message="Epoch input error" details={epochError} />}
        </div>

        <div className="flex justify-center">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-600 transition-colors" onClick={handleSetNow}>
            Set to Now
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <label className="text-sm font-medium text-gray-700">ISO 8601 Date</label>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {(['local', 'utc'] as const).map((tz) => (
                <button
                  key={tz}
                  onClick={() => handleTimezoneChange(tz)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${state.timezone === tz ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-500'}`}
                >
                  {tz === 'local' ? 'Local' : 'UTC'}
                </button>
              ))}
            </div>
          </div>
          <input 
            type="text" 
            value={state.isoInput}
            onChange={(e) => handleIsoChange(e.target.value)}
            className={`block w-full rounded-md border px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isoError ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="e.g. 2024-01-01T00:00:00.000Z"
          />
          {isoError && <ErrorBanner message="ISO input error" details={isoError} />}
        </div>

        <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-900 border border-blue-100">
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
