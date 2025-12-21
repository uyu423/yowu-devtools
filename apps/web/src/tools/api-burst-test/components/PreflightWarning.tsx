/**
 * PreflightWarning - Shows warnings when request configuration triggers CORS preflight
 *
 * CORS preflight (OPTIONS request) doubles latency because browser sends
 * an extra request before each actual request. This component detects
 * settings that trigger preflight and warns the user.
 */

import React, { useMemo } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import type { ApiBurstTestState, PreflightWarning as PreflightWarningType } from '../types';
import { detectPreflightTriggers } from '../types';

interface PreflightWarningProps {
  state: ApiBurstTestState;
  className?: string;
}

export const PreflightWarning: React.FC<PreflightWarningProps> = ({
  state,
  className,
}) => {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const warnings = useMemo(() => {
    return detectPreflightTriggers(state);
  }, [state]);

  if (warnings.length === 0) {
    return null;
  }

  const formatWarning = (warning: PreflightWarningType): string => {
    switch (warning.type) {
      case 'method':
        return warning.message;
      case 'authorization':
        return t('tool.apiBurstTest.warning.preflightAuth');
      case 'custom-header':
        return t('tool.apiBurstTest.warning.preflightHeader').replace(
          '{header}',
          warning.header || ''
        );
      case 'content-type':
        return warning.message;
      default:
        return warning.message;
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        'bg-orange-50 dark:bg-orange-900/20',
        'border border-orange-200 dark:border-orange-800',
        className
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-3 p-3 text-left',
          'hover:bg-orange-100 dark:hover:bg-orange-900/30',
          'transition-colors'
        )}
      >
        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
            {t('tool.apiBurstTest.warning.preflightWarning')}
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-300 truncate">
            {warnings.length} {warnings.length === 1 ? 'setting' : 'settings'}{' '}
            will trigger preflight
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-orange-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-orange-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-orange-200 dark:border-orange-800/50">
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-2 mb-2">
            {t('tool.apiBurstTest.warning.preflightDesc')}
          </p>
          <ul className="space-y-1 mb-3">
            {warnings.map((warning, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs text-orange-700 dark:text-orange-300"
              >
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{formatWarning(warning)}</span>
              </li>
            ))}
          </ul>
          <div
            className={cn(
              'flex items-start gap-2 p-2 rounded',
              'bg-orange-100 dark:bg-orange-900/30'
            )}
          >
            <Lightbulb className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-orange-700 dark:text-orange-300">
              {t('tool.apiBurstTest.warning.preflightTip')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreflightWarning;

