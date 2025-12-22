/* eslint-disable react-refresh/only-export-components */
import React, { useMemo, useState } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Clock, Copy } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { GoogleAdsenseBlock } from '@/components/common/GoogleAdsenseBlock';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToolSetup } from '@/hooks/useToolSetup';
import { format, formatISO } from 'date-fns';
import { format as formatTz } from 'date-fns-tz';
import { copyToClipboard } from '@/lib/clipboard';
import { ShareModal } from '@/components/common/ShareModal';
import { useI18n } from '@/hooks/useI18nHooks';

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
const TimeFormatItem: React.FC<{
  label: string;
  value: string;
  tooltip?: string;
}> = ({ label, value, tooltip }) => {
  const { t } = useI18n();
  return (
    <div className="group flex items-center justify-between gap-3 py-2 px-3 rounded-md hover:bg-blue-100/50 dark:hover:bg-blue-800/20 transition-colors">
      <div className="flex-1 min-w-0">
        {tooltip ? (
          <Tooltip content={tooltip}>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-help">
              {label}
            </span>
          </Tooltip>
        ) : (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
        )}
        <div className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
          {value}
        </div>
      </div>
      {value !== '-' && (
        <button
          onClick={() => copyToClipboard(value, t('common.copiedToClipboard'))}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-all flex-shrink-0"
          title={t('common.copy')}
        >
          <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
};

const TimeTool: React.FC = () => {
  const {
    state,
    setState,
    resetState,
    t,
    handleShare,
    shareModalProps,
  } = useToolSetup<TimeToolState>('time', 'time', DEFAULT_STATE);

  const [epochError, setEpochError] = useState<string | null>(null);
  const [isoError, setIsoError] = useState<string | null>(null);

  const derivedDate = useMemo(() => {
    if (state.isoInput.trim()) {
      const parsed = new Date(state.isoInput);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    if (state.epochInput.trim()) {
      const ms =
        state.epochUnit === 's'
          ? Number(state.epochInput) * 1000
          : Number(state.epochInput);
      if (!Number.isNaN(ms)) {
        const parsed = new Date(ms);
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
    }
    return null;
  }, [state.isoInput, state.epochInput, state.epochUnit]);

  const handleEpochChange = (value: string) => {
    const { iso, error } = convertEpoch(value, state.epochUnit, state.timezone, t);
    setEpochError(error);
    if (!error && iso !== undefined) {
      setIsoError(null);
      setState((prev) => ({ ...prev, epochInput: value, isoInput: iso }));
    } else {
      setState((prev) => ({ ...prev, epochInput: value }));
    }
  };

  const handleIsoChange = (value: string) => {
    const { epoch, error } = convertIso(value, state.epochUnit, t);
    setIsoError(error);
    if (!error && epoch !== undefined) {
      setEpochError(null);
      setState((prev) => ({ ...prev, isoInput: value, epochInput: epoch }));
    } else {
      setState((prev) => ({ ...prev, isoInput: value }));
    }
  };

  const handleUnitChange = (unit: 'ms' | 's') => {
    const { iso, error } = convertEpoch(state.epochInput, unit, state.timezone, t);
    setEpochError(error);
    setState((prev) => ({
      ...prev,
      epochUnit: unit,
      isoInput: iso ?? prev.isoInput,
    }));
  };

  const handleTimezoneChange = (timezone: 'local' | 'utc') => {
    const { iso, error } = convertEpoch(
      state.epochInput,
      state.epochUnit,
      timezone,
      t
    );
    setEpochError(error);
    setState((prev) => ({ ...prev, timezone, isoInput: iso ?? prev.isoInput }));
  };

  const handleSetNow = () => {
    const now = Date.now();
    const epochValue =
      state.epochUnit === 's'
        ? Math.floor(now / 1000).toString()
        : now.toString();
    const isoValue =
      state.timezone === 'utc'
        ? new Date(now).toISOString()
        : formatISO(new Date(now));
    setEpochError(null);
    setIsoError(null);
    setState((prev) => ({
      ...prev,
      epochInput: epochValue,
      isoInput: isoValue,
    }));
  };

  // Helper functions for various time formats using date-fns and date-fns-tz
  const formatRFC2822 = (date: Date): string => {
    // RFC 2822 format: "Mon, 01 Jan 2024 00:00:00 GMT"
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
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
  const formatInTimezone = (
    date: Date,
    timeZone: string,
    formatStr: string
  ): string => {
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
      const tzName =
        parts.find((part) => part.type === 'timeZoneName')?.value || '';
      return tzName;
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 max-w-3xl mx-auto">
      <ToolHeader
        title={t('tool.time.title')}
        description={t('tool.time.description')}
        onReset={resetState}
        onShare={handleShare}
      />
      <ShareModal {...shareModalProps} />
      <div className="space-y-8 mt-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <OptionLabel
              tooltip={t('tool.time.epochTooltip')}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('tool.time.epochTimestamp')}
            </OptionLabel>
            <RadioGroup
              name="epoch-unit"
              value={state.epochUnit}
              onChange={(val) => handleUnitChange(val as 'ms' | 's')}
              options={[
                {
                  value: 'ms',
                  label: (
                    <OptionLabel tooltip={t('tool.time.msTooltip')}>
                      {t('tool.time.milliseconds')}
                    </OptionLabel>
                  ),
                },
                {
                  value: 's',
                  label: (
                    <OptionLabel tooltip={t('tool.time.secTooltip')}>
                      {t('tool.time.seconds')}
                    </OptionLabel>
                  ),
                },
              ]}
              className="text-sm text-gray-600 dark:text-gray-400"
            />
          </div>
          <input
            type="text"
            value={state.epochInput}
            onChange={(e) => handleEpochChange(e.target.value)}
            className={`block w-full rounded-md border px-3 py-2 font-mono text-sm shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 ${
              epochError
                ? 'border-red-300 dark:border-red-700'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder={t('tool.time.epochPlaceholder')}
          />
          {epochError && (
            <ErrorBanner message={t('tool.time.epochInputError')} details={epochError} />
          )}
        </div>

        <div className="flex justify-center">
          <button
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700"
            onClick={handleSetNow}
          >
            {t('tool.time.setToNow')}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <OptionLabel
              tooltip={t('tool.time.isoTooltip')}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('tool.time.isoDate')}
            </OptionLabel>
            <div className="flex items-center gap-2 text-sm">
              {(['local', 'utc'] as const).map((tz) => (
                <Tooltip
                  key={tz}
                  content={
                    tz === 'local'
                      ? t('tool.time.localTooltip')
                      : t('tool.time.utcTooltip')
                  }
                >
                  <button
                    onClick={() => handleTimezoneChange(tz)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      state.timezone === tz
                        ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tz === 'local' ? t('tool.time.local') : t('tool.time.utc')}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={state.isoInput}
            onChange={(e) => handleIsoChange(e.target.value)}
            className={`block w-full rounded-md border px-3 py-2 font-mono text-sm shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 ${
              isoError
                ? 'border-red-300 dark:border-red-700'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder={t('tool.time.isoPlaceholder')}
          />
          {isoError && (
            <ErrorBanner message={t('tool.time.isoInputError')} details={isoError} />
          )}
        </div>

        {/* AdSense - Before Basic Format Block */}
        <GoogleAdsenseBlock />

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Basic Formats Section */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('tool.time.basicFormats')}
            </h3>
          </div>
          <div className="p-4 space-y-1">
            <TimeFormatItem
              label={t('tool.time.localTime')}
              value={
                derivedDate
                  ? format(derivedDate, 'yyyy-MM-dd HH:mm:ss.SSS xxx')
                  : '-'
              }
            />
            <TimeFormatItem
              label={t('tool.time.utc')}
              value={derivedDate ? derivedDate.toISOString() : '-'}
            />
            <TimeFormatItem
              label={t('tool.time.unixSeconds')}
              value={
                derivedDate
                  ? Math.floor(derivedDate.getTime() / 1000).toString()
                  : '-'
              }
            />
            <TimeFormatItem
              label={t('tool.time.unixMilliseconds')}
              value={derivedDate ? derivedDate.getTime().toString() : '-'}
            />
          </div>

          {/* Standard Formats Section */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('tool.time.standardFormats')}
            </h3>
          </div>
          <div className="p-4 space-y-1">
            <TimeFormatItem
              label="RFC 2822"
              value={derivedDate ? formatRFC2822(derivedDate) : '-'}
            />
            <TimeFormatItem
              label="RFC 3339"
              value={derivedDate ? formatRFC3339(derivedDate) : '-'}
            />
            <TimeFormatItem
              label="ISO 8601"
              value={derivedDate ? formatISO(derivedDate) : '-'}
            />
          </div>

          {/* Human Readable Formats Section */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('tool.time.humanReadable')}
            </h3>
          </div>
          <div className="p-4 space-y-1">
            <TimeFormatItem
              label={t('tool.time.humanReadableGlobal')}
              value={
                derivedDate
                  ? format(derivedDate, 'MMMM dd, yyyy, hh:mm:ss a')
                  : '-'
              }
            />
            <TimeFormatItem
              label={t('tool.time.humanReadableKorea')}
              value={
                derivedDate
                  ? (() => {
                      const koreaDate = new Date(
                        derivedDate.toLocaleString('en-US', {
                          timeZone: 'Asia/Seoul',
                        })
                      );
                      const year = koreaDate.getFullYear();
                      const month = koreaDate.getMonth() + 1;
                      const day = koreaDate.getDate();
                      const hours24 = koreaDate.getHours();
                      const minutes = koreaDate.getMinutes();
                      const seconds = koreaDate.getSeconds();

                      const ampm = hours24 < 12 ? '오전' : '오후';
                      const hours12 =
                        hours24 === 0
                          ? 12
                          : hours24 > 12
                          ? hours24 - 12
                          : hours24;

                      return `${year}년 ${month}월 ${day}일 ${ampm} ${hours12}시 ${minutes}분 ${seconds}초`;
                    })()
                  : '-'
              }
            />
            <TimeFormatItem
              label={t('tool.time.dayOfWeek')}
              value={
                derivedDate ? format(derivedDate, 'EEEE, MMMM dd, yyyy') : '-'
              }
            />
          </div>

          {/* Timezone Formats Section */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('tool.time.timezoneFormats')}
            </h3>
          </div>
          <div className="p-4 space-y-1">
            <TimeFormatItem
              label={`${t('tool.time.usEastern')} (${
                derivedDate
                  ? getTimezoneAbbr(derivedDate, 'America/New_York')
                  : 'EST/EDT'
              })`}
              value={
                derivedDate
                  ? `${formatInTimezone(
                      derivedDate,
                      'America/New_York',
                      'yyyy-MM-dd HH:mm:ss'
                    )} ${getTimezoneAbbr(derivedDate, 'America/New_York')}`
                  : '-'
              }
            />
            <TimeFormatItem
              label={`${t('tool.time.usPacific')} (${
                derivedDate
                  ? getTimezoneAbbr(derivedDate, 'America/Los_Angeles')
                  : 'PST/PDT'
              })`}
              value={
                derivedDate
                  ? `${formatInTimezone(
                      derivedDate,
                      'America/Los_Angeles',
                      'yyyy-MM-dd HH:mm:ss'
                    )} ${getTimezoneAbbr(derivedDate, 'America/Los_Angeles')}`
                  : '-'
              }
            />
            <TimeFormatItem
              label={`${t('tool.time.uk')} (${
                derivedDate
                  ? getTimezoneAbbr(derivedDate, 'Europe/London')
                  : 'GMT/BST'
              })`}
              value={
                derivedDate
                  ? `${formatInTimezone(
                      derivedDate,
                      'Europe/London',
                      'yyyy-MM-dd HH:mm:ss'
                    )} ${getTimezoneAbbr(derivedDate, 'Europe/London')}`
                  : '-'
              }
            />
            <TimeFormatItem
              label={`${t('tool.time.koreaJapan')} (${
                derivedDate
                  ? getTimezoneAbbr(derivedDate, 'Asia/Seoul')
                  : 'KST/JST'
              })`}
              value={
                derivedDate
                  ? `${formatInTimezone(
                      derivedDate,
                      'Asia/Seoul',
                      'yyyy-MM-dd HH:mm:ss'
                    )} ${getTimezoneAbbr(derivedDate, 'Asia/Seoul')}`
                  : '-'
              }
            />
            <TimeFormatItem
              label={`${t('tool.time.china')} (${
                derivedDate
                  ? getTimezoneAbbr(derivedDate, 'Asia/Shanghai')
                  : 'CST'
              })`}
              value={
                derivedDate
                  ? `${formatInTimezone(
                      derivedDate,
                      'Asia/Shanghai',
                      'yyyy-MM-dd HH:mm:ss'
                    )} ${getTimezoneAbbr(derivedDate, 'Asia/Shanghai')}`
                  : '-'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function convertEpoch(
  value: string,
  unit: 'ms' | 's',
  timezone: 'local' | 'utc',
  t: (key: string) => string
) {
  const trimmed = value.trim();
  if (!trimmed) return { iso: '', error: null };
  if (!/^[-]?\d+(\.\d+)?$/.test(trimmed)) {
    return { iso: '', error: t('tool.time.pleaseEnterNumeric') };
  }
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    return { iso: '', error: t('tool.time.numberOutOfRange') };
  }
  const ms = unit === 's' ? numeric * 1000 : numeric;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) {
    return { iso: '', error: t('tool.time.epochValueInvalid') };
  }
  const iso = timezone === 'utc' ? date.toISOString() : formatISO(date);
  return { iso, error: null };
}

function convertIso(value: string, unit: 'ms' | 's', t: (key: string) => string) {
  const trimmed = value.trim();
  if (!trimmed) return { epoch: '', error: null };
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return { epoch: '', error: t('tool.time.isoFormatInvalid') };
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
  keywords: ['time', 'epoch', 'timestamp', 'iso', 'date', 'convert', 'utc', 'kst'],
  category: 'converter',
  defaultState: DEFAULT_STATE,
  Component: TimeTool,
};
