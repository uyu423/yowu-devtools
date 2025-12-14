/* eslint-disable react-refresh/only-export-components */
import React, { useMemo, useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Clock, Copy } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToolState } from '@/hooks/useToolState';
import { useTitle } from '@/hooks/useTitle';
import { format, formatISO } from 'date-fns';
import { format as formatTz } from 'date-fns-tz';
import { copyToClipboard } from '@/lib/clipboard';

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

// Time format item component
const TimeFormatItem: React.FC<{ label: string; value: string; tooltip?: string }> = ({ label, value, tooltip }) => (
  <div className="group flex items-center justify-between gap-3 py-2 px-3 rounded-md hover:bg-blue-100/50 dark:hover:bg-blue-800/20 transition-colors">
    <div className="flex-1 min-w-0">
      {tooltip ? (
        <Tooltip content={tooltip}>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-help">{label}</span>
        </Tooltip>
      ) : (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      )}
      <div className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400 break-all">{value}</div>
    </div>
    {value !== '-' && (
      <button
        onClick={() => copyToClipboard(value, `Copied ${label}`)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-all flex-shrink-0"
        title={`Copy ${label}`}
      >
        <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
      </button>
    )}
  </div>
);

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

  // Helper functions for various time formats using date-fns and date-fns-tz
  const formatRFC2822 = (date: Date): string => {
    // RFC 2822 format: "Mon, 01 Jan 2024 00:00:00 GMT"
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[date.getUTCDay()];
    const dayNum = String(date.getUTCDate()).padStart(2, '0');
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${day}, ${dayNum} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
  };

  const formatRFC3339 = (date: Date): string => {
    // RFC 3339 is essentially ISO 8601 format
    return formatISO(date);
  };

  // Timezone-specific formatting using date-fns-tz
  const formatInTimezone = (date: Date, timeZone: string, formatStr: string): string => {
    return formatTz(date, formatStr, { timeZone });
  };

  // Format timezone abbreviation
  const getTimezoneAbbr = (date: Date, timeZone: string): string => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'short',
      });
      const parts = formatter.formatToParts(date);
      const tzName = parts.find(part => part.type === 'timeZoneName')?.value || '';
      return tzName;
    } catch {
      return '';
    }
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

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Basic Formats Section */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Basic Formats</h3>
          </div>
          <div className="p-4 space-y-1">
            <TimeFormatItem 
              label="Local Time" 
              value={derivedDate ? format(derivedDate, 'yyyy-MM-dd HH:mm:ss.SSS xxx') : '-'}
              tooltip="Local time in your browser's timezone"
            />
            <TimeFormatItem 
              label="UTC" 
              value={derivedDate ? derivedDate.toISOString() : '-'}
              tooltip="Coordinated Universal Time (UTC) - standard time reference"
            />
            <TimeFormatItem 
              label="Unix (seconds)" 
              value={derivedDate ? Math.floor(derivedDate.getTime() / 1000).toString() : '-'}
              tooltip="Unix timestamp in seconds since January 1, 1970 UTC"
            />
            <TimeFormatItem 
              label="Unix (milliseconds)" 
              value={derivedDate ? derivedDate.getTime().toString() : '-'}
              tooltip="Unix timestamp in milliseconds since January 1, 1970 UTC"
            />
          </div>

          {/* Standard Formats Section */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Standard Formats</h3>
          </div>
          <div className="p-4 space-y-1">
            <TimeFormatItem 
              label="RFC 2822" 
              value={derivedDate ? formatRFC2822(derivedDate) : '-'}
              tooltip="RFC 2822 format commonly used in email headers"
            />
            <TimeFormatItem 
              label="RFC 3339" 
              value={derivedDate ? formatRFC3339(derivedDate) : '-'}
              tooltip="RFC 3339 format (subset of ISO 8601)"
            />
            <TimeFormatItem 
              label="ISO 8601" 
              value={derivedDate ? formatISO(derivedDate) : '-'}
              tooltip="ISO 8601 international standard date and time format"
            />
          </div>

          {/* Human Readable Formats Section */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Human Readable</h3>
          </div>
          <div className="p-4 space-y-1">
            <TimeFormatItem 
              label="Human Readable (Global)" 
              value={derivedDate ? format(derivedDate, 'MMMM dd, yyyy, hh:mm:ss a') : '-'}
              tooltip="Easy-to-read format with month name and AM/PM"
            />
            <TimeFormatItem 
              label="Human Readable (Korea)" 
              value={derivedDate ? (() => {
                const koreaDate = new Date(derivedDate.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
                const year = koreaDate.getFullYear();
                const month = koreaDate.getMonth() + 1;
                const day = koreaDate.getDate();
                const hours24 = koreaDate.getHours();
                const minutes = koreaDate.getMinutes();
                const seconds = koreaDate.getSeconds();
                
                const ampm = hours24 < 12 ? '오전' : '오후';
                const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
                
                return `${year}년 ${month}월 ${day}일 ${ampm} ${hours12}시 ${minutes}분 ${seconds}초`;
              })() : '-'}
              tooltip="한국 표준시(KST) 기준의 한국어 형식 날짜 및 시간"
            />
            <TimeFormatItem 
              label="Day of Week" 
              value={derivedDate ? format(derivedDate, 'EEEE, MMMM dd, yyyy') : '-'}
              tooltip="Full day name with date"
            />
          </div>

          {/* Timezone Formats Section */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Timezone Formats</h3>
          </div>
          <div className="p-4 space-y-1">
            <TimeFormatItem 
              label={`US Eastern (${derivedDate ? getTimezoneAbbr(derivedDate, 'America/New_York') : 'EST/EDT'})`}
              value={derivedDate ? `${formatInTimezone(derivedDate, 'America/New_York', 'yyyy-MM-dd HH:mm:ss')} ${getTimezoneAbbr(derivedDate, 'America/New_York')}` : '-'}
              tooltip="US Eastern Time (America/New_York)"
            />
            <TimeFormatItem 
              label={`US Pacific (${derivedDate ? getTimezoneAbbr(derivedDate, 'America/Los_Angeles') : 'PST/PDT'})`}
              value={derivedDate ? `${formatInTimezone(derivedDate, 'America/Los_Angeles', 'yyyy-MM-dd HH:mm:ss')} ${getTimezoneAbbr(derivedDate, 'America/Los_Angeles')}` : '-'}
              tooltip="US Pacific Time (America/Los_Angeles)"
            />
            <TimeFormatItem 
              label={`UK (${derivedDate ? getTimezoneAbbr(derivedDate, 'Europe/London') : 'GMT/BST'})`}
              value={derivedDate ? `${formatInTimezone(derivedDate, 'Europe/London', 'yyyy-MM-dd HH:mm:ss')} ${getTimezoneAbbr(derivedDate, 'Europe/London')}` : '-'}
              tooltip="UK Time (Europe/London)"
            />
            <TimeFormatItem 
              label={`Korea/Japan (${derivedDate ? getTimezoneAbbr(derivedDate, 'Asia/Seoul') : 'KST/JST'})`}
              value={derivedDate ? `${formatInTimezone(derivedDate, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss')} ${getTimezoneAbbr(derivedDate, 'Asia/Seoul')}` : '-'}
              tooltip="Korea Standard Time / Japan Standard Time (GMT+9)"
            />
            <TimeFormatItem 
              label={`China (${derivedDate ? getTimezoneAbbr(derivedDate, 'Asia/Shanghai') : 'CST'})`}
              value={derivedDate ? `${formatInTimezone(derivedDate, 'Asia/Shanghai', 'yyyy-MM-dd HH:mm:ss')} ${getTimezoneAbbr(derivedDate, 'Asia/Shanghai')}` : '-'}
              tooltip="China Standard Time (Asia/Shanghai)"
            />
          </div>
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
