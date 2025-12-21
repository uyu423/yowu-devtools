/**
 * TimeSeriesChart - Simple time series line chart for RPS and Latency
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import type { TimeSeriesPoint } from '../types';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  metric: 'rps' | 'latency' | 'errors';
  height?: number;
}

// Format time as MM:SS
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  metric,
  height = 120,
}) => {
  const { t } = useI18n();

  const { values, maxValue, points, labels } = useMemo(() => {
    if (data.length === 0) {
      return { values: [], maxValue: 0, points: '', labels: [] };
    }

    // Extract values based on metric
    const vals = data.map(d => {
      switch (metric) {
        case 'rps': return d.rps;
        case 'latency': return d.avgLatencyMs;
        case 'errors': return d.errorCount;
        default: return 0;
      }
    });

    const max = Math.max(...vals, 1); // At least 1 to avoid division by zero

    // Generate SVG path points
    const chartWidth = 100; // percentage
    const chartHeight = height - 30; // Leave space for labels
    const padding = 5;

    const pts = vals.map((val, i) => {
      const x = (i / Math.max(vals.length - 1, 1)) * (chartWidth - padding * 2) + padding;
      const y = chartHeight - (val / max) * (chartHeight - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');

    // Generate time labels (start, middle, end)
    const lbls = [];
    if (data.length > 0) {
      lbls.push({ pos: 0, label: formatTime(data[0].timestamp) });
      if (data.length > 2) {
        const midIdx = Math.floor(data.length / 2);
        lbls.push({ pos: 50, label: formatTime(data[midIdx].timestamp) });
      }
      lbls.push({ pos: 100, label: formatTime(data[data.length - 1].timestamp) });
    }

    return { values: vals, maxValue: max, points: pts, labels: lbls };
  }, [data, metric, height]);

  const metricConfig = {
    rps: {
      title: t('tool.apiBurstTest.graph.rps'),
      color: '#3B82F6', // blue
      unit: 'req/s',
    },
    latency: {
      title: t('tool.apiBurstTest.graph.latency'),
      color: '#10B981', // emerald
      unit: 'ms',
    },
    errors: {
      title: t('tool.apiBurstTest.graph.errors'),
      color: '#EF4444', // red
      unit: '',
    },
  };

  const config = metricConfig[metric];

  if (data.length === 0) {
    return (
      <div className={cn(
        'p-4 rounded-xl',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700'
      )}>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          {config.title}
        </div>
        <div
          className="flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm"
          style={{ height: `${height}px` }}
        >
          {t('tool.apiBurstTest.results.noData')}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'p-4 rounded-xl',
      'bg-white dark:bg-gray-800',
      'border border-gray-200 dark:border-gray-700'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {config.title}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Max: {maxValue.toFixed(metric === 'latency' ? 1 : 0)}{config.unit}
        </div>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        {/* SVG Chart */}
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          <line x1="0" y1={height - 25} x2="100" y2={height - 25} stroke="#E5E7EB" strokeWidth="0.5" />
          <line x1="0" y1={(height - 25) / 2} x2="100" y2={(height - 25) / 2} stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="2,2" />

          {/* Area fill */}
          {points && (
            <polygon
              points={`5,${height - 30} ${points} 95,${height - 30}`}
              fill={config.color}
              fillOpacity="0.1"
            />
          )}

          {/* Line */}
          {points && (
            <polyline
              points={points}
              fill="none"
              stroke={config.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Data points (show only a few to avoid clutter) */}
          {values.length <= 20 && values.map((val, i) => {
            const x = (i / Math.max(values.length - 1, 1)) * 90 + 5;
            const y = (height - 30) - (val / maxValue) * (height - 40) - 5;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill={config.color}
              />
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 dark:text-gray-500">
          {labels.map((lbl, i) => (
            <span key={i} style={{ marginLeft: i === 0 ? '0' : 'auto', marginRight: i === labels.length - 1 ? '0' : 'auto' }}>
              {lbl.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesChart;

