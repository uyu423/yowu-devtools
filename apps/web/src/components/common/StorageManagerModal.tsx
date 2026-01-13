import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X, RefreshCcw, Settings } from 'lucide-react';
import { useI18n } from '@/hooks/useI18nHooks';
import { Select } from '@/components/ui/Select';
import { getToolById } from '@/tools';

interface StorageEntry {
  key: string;
  value: string;
  size: number;
  groupId: string;
  groupLabel: string;
}

interface StorageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatSize = (size: number) => {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${size} B`;
};

export const StorageManagerModal: React.FC<StorageManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const VALUE_PREVIEW_LIMIT = 400;
  const { t } = useI18n();
  const [entries, setEntries] = React.useState<StorageEntry[]>([]);
  const [groupFilter, setGroupFilter] = React.useState<string>('all');

  const getGroupInfo = React.useCallback(
    (key: string) => {
      const PREFIX = 'yowu-devtools:';
      if (!key.startsWith(PREFIX)) {
        return {
          groupId: 'legacy',
          groupLabel: t('sidebar.storageGroupLegacy'),
        };
      }

      const parts = key.slice(PREFIX.length).split(':');
      const root = parts[0];

      if (root === 'common') {
        return {
          groupId: 'common',
          groupLabel: t('sidebar.storageGroupCommon'),
        };
      }

      if (root === 'share') {
        return {
          groupId: 'share',
          groupLabel: t('sidebar.storageGroupShared'),
        };
      }

      const toolId = root || t('sidebar.storageMenuUnknown');
      const tool = getToolById(toolId);
      const metaKey = `meta.${toolId}.title`;
      const translatedTitle = t(metaKey);
      const toolTitle =
        translatedTitle !== metaKey
          ? translatedTitle
          : tool?.title ?? toolId;

      return {
        groupId: `tool:${toolId}`,
        groupLabel: t('sidebar.storageGroupTool').replace('{tool}', toolTitle),
      };
    },
    [t]
  );

  const getGroupRank = React.useCallback((groupId: string) => {
    if (groupId === 'common') return 1;
    if (groupId === 'share') return 2;
    if (groupId === 'legacy') return 3;
    if (groupId.startsWith('tool:')) return 4;
    return 5;
  }, []);

  const parseEntries = React.useCallback(() => {
    if (typeof window === 'undefined') return;

    const nextEntries: StorageEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key) ?? '';
      const { groupId, groupLabel } = getGroupInfo(key);

      nextEntries.push({
        key,
        value,
        size: new Blob([value]).size,
        groupId,
        groupLabel,
      });
    }
    setEntries(nextEntries.sort((a, b) => a.key.localeCompare(b.key)));
  }, [getGroupInfo]);

  React.useEffect(() => {
    if (isOpen) {
      parseEntries();
      setGroupFilter('all');
    }
  }, [isOpen, parseEntries]);

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const groups = Array.from(
    new Map(entries.map((entry) => [entry.groupId, entry.groupLabel])).entries()
  ).map(([groupId, groupLabel]) => ({ groupId, groupLabel }));
  const sortedGroups = groups.sort((a, b) => {
    const rankDiff = getGroupRank(a.groupId) - getGroupRank(b.groupId);
    if (rankDiff !== 0) return rankDiff;
    return a.groupLabel.localeCompare(b.groupLabel);
  });

  const filteredEntries =
    groupFilter === 'all'
      ? entries
      : entries.filter((entry) => entry.groupId === groupFilter);

  const handleDeleteKey = (key: string) => {
    const target = entries.find((entry) => entry.key === key);
    const confirmMessage = t('sidebar.storageDeleteKeyConfirm').replace(
      '{key}',
      key
    );
    if (target && window.confirm(confirmMessage)) {
      localStorage.removeItem(key);
      parseEntries();
    }
  };

  const handleDeleteGroup = (groupId: string, groupLabel: string) => {
    const targets = entries.filter((entry) => entry.groupId === groupId);
    if (targets.length === 0) return;
    const confirmMessage = t('sidebar.storageDeleteMenuConfirm')
      .replace('{count}', targets.length.toString())
      .replace('{menu}', groupLabel);
    if (window.confirm(confirmMessage)) {
      targets.forEach((entry) => localStorage.removeItem(entry.key));
      parseEntries();
    }
  };

  const totalSize = filteredEntries.reduce((sum, entry) => sum + entry.size, 0);
  const groupedEntriesMap = filteredEntries.reduce(
    (map, entry) => {
      const next = map.get(entry.groupId) ?? {
        label: entry.groupLabel,
        items: [] as StorageEntry[],
      };
      next.items.push(entry);
      map.set(entry.groupId, next);
      return map;
    },
    new Map<string, { label: string; items: StorageEntry[] }>()
  );

  const grouped = Array.from(groupedEntriesMap.entries())
    .map(([groupId, { label, items }]) => ({
      groupId,
      label,
      items,
      size: items.reduce((sum, item) => sum + item.size, 0),
    }))
    .sort((a, b) => {
      const rankDiff = getGroupRank(a.groupId) - getGroupRank(b.groupId);
      if (rankDiff !== 0) return rankDiff;
      return a.label.localeCompare(b.label);
    });

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60" />
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('sidebar.storageManager')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('sidebar.storageManagerDescription')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={parseEntries}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors"
              title={t('sidebar.storageRefresh')}
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors"
              title={t('common.close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {t('sidebar.storageMenuLabel')}
                </span>
                <Select
                  value={groupFilter}
                  onChange={setGroupFilter}
                  className="min-w-60"
                  options={[
                    { value: 'all', label: t('sidebar.storageMenuAll') },
                    ...sortedGroups.map((group) => ({
                      value: group.groupId,
                      label: group.groupLabel,
                    })),
                  ]}
                  size="md"
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {t('sidebar.storageSummary')
                  .replace('{count}', filteredEntries.length.toString())
                  .replace('{size}', formatSize(totalSize))}
              </div>
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              {t('sidebar.storageNoData')}
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {grouped.map(({ groupId, label, items, size }) => (
                <div
                  key={groupId}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {label}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {items.length} · {formatSize(size)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteGroup(groupId, label)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('sidebar.storageDeleteMenu')}</span>
                    </button>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-50/60 dark:bg-gray-900/40 text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2">
                      <div className="col-span-6">{t('sidebar.storageKey')}</div>
                      <div className="col-span-3">{t('sidebar.storageValuePreview')}</div>
                      <div className="col-span-2">{t('sidebar.storageSize')}</div>
                      <div className="col-span-1 text-right">{t('common.actions')}</div>
                    </div>
                    {items.map((entry) => (
                      <div
                        key={entry.key}
                        className="grid grid-cols-12 gap-3 px-4 py-3 items-start text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                      >
                        <div className="col-span-12 md:col-span-6 space-y-1">
                          <div className="font-mono text-xs text-gray-800 dark:text-gray-100 break-all">
                            {entry.key}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            {t('sidebar.storageMenuLabel')}: {entry.groupLabel}
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-3 mt-2 md:mt-0">
                          <pre className="text-[11px] text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-900/50 rounded-md p-2 max-h-24 overflow-auto whitespace-pre-wrap break-words">
                            {entry.value
                              ? `${entry.value.slice(0, VALUE_PREVIEW_LIMIT)}${
                                  entry.value.length > VALUE_PREVIEW_LIMIT ? '…' : ''
                                }`
                              : t('sidebar.storageEmptyValue')}
                          </pre>
                        </div>
                        <div className="col-span-6 md:col-span-2 mt-2 md:mt-0 text-xs text-gray-600 dark:text-gray-300">
                          {formatSize(entry.size)}
                        </div>
                        <div className="col-span-6 md:col-span-1 mt-2 md:mt-0 flex justify-end">
                          <button
                            onClick={() => handleDeleteKey(entry.key)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors whitespace-nowrap"
                            title={t('sidebar.storageDeleteKey')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t('sidebar.storageDeleteKey')}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
