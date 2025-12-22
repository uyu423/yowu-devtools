import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Preset } from '../logic/constants';

interface PresetSelectorProps {
  preset: Preset;
  onPresetChange: (preset: Preset) => void;
}

const presets: { value: Preset; label: string; description: string }[] = [
  {
    value: 'windows_standard',
    label: 'Windows Standard',
    description: '16, 24, 32, 48, 64, 128, 256 px',
  },
  {
    value: 'favicon_legacy',
    label: 'Favicon Legacy',
    description: '16, 32, 48 px',
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Select sizes manually',
  },
];

export const PresetSelector: React.FC<PresetSelectorProps> = ({ preset, onPresetChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedPreset = presets.find((p) => p.value === preset);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Preset</h3>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full p-3 rounded-lg border text-left',
            'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
            'hover:border-blue-300 dark:hover:border-blue-700 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600'
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedPreset?.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {selectedPreset?.description}
              </div>
            </div>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200',
                isOpen && 'transform rotate-180'
              )}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            {presets.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  onPresetChange(p.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                  'first:rounded-t-lg last:rounded-b-lg',
                  preset === p.value && 'bg-blue-50 dark:bg-blue-950/30'
                )}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">{p.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
        />
      )}
    </div>
  );
};

