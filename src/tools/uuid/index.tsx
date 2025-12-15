/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import type { ToolDefinition } from '@/tools/types';
import { KeyRound, Copy } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useToolState } from '@/hooks/useToolState';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';
import { isMobileDevice } from '@/lib/utils';
import { ShareModal } from '@/components/common/ShareModal';

interface UuidToolState {
  type: 'uuid-v4' | 'uuid-v7' | 'ulid';
  count: number;
  format: 'lowercase' | 'uppercase';
}

const DEFAULT_STATE: UuidToolState = {
  type: 'uuid-v4',
  count: 1,
  format: 'lowercase',
};

// UUID v4 generator (using crypto.randomUUID)
const generateUuidV4 = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// UUID v7 generator (timestamp-based, sortable)
// UUID v7 format: [timestamp (48 bits)][version (4 bits)][rand_a (12 bits)][variant (2 bits)][rand_b (62 bits)]
const generateUuidV7 = (): string => {
  const timestamp = Date.now();
  const timestampMs = BigInt(timestamp);
  
  // 48-bit timestamp (milliseconds since Unix epoch)
  const timestamp48 = Number(timestampMs & BigInt(0xffffffffffff));
  
  // Random values for the remaining bits
  const randomA = Math.floor(Math.random() * 0x1000); // 12 bits
  const randomB = Math.floor(Math.random() * 0x40000000); // 30 bits
  const randomC = Math.floor(Math.random() * 0x40000000); // 30 bits
  
  // Construct UUID v7
  // Format: xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx
  const hex = (n: number, length: number) => n.toString(16).padStart(length, '0');
  
  const part1 = hex(timestamp48 >>> 16, 8);
  const part2 = hex((timestamp48 & 0xffff) | 0x7000, 4); // version 7
  const part3 = hex((randomA | 0x8000), 4); // variant 10
  const part4 = hex(randomB, 8);
  const part5 = hex(randomC, 12);
  
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
};

// ULID generator (26 characters, Crockford's Base32)
// ULID format: [timestamp (48 bits)][random (80 bits)]
const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const generateUlid = (): string => {
  const timestamp = Date.now();
  const timestamp48 = BigInt(timestamp);
  
  // Encode timestamp (10 characters)
  let timestampStr = '';
  let ts = timestamp48;
  for (let i = 0; i < 10; i++) {
    timestampStr = CROCKFORD_BASE32[Number(ts & BigInt(31))] + timestampStr;
    ts = ts >> BigInt(5);
  }
  
  // Generate random part (16 characters)
  let randomStr = '';
  const randomBytes = new Uint8Array(10);
  crypto.getRandomValues(randomBytes);
  
  for (let i = 0; i < 10; i++) {
    const byte = randomBytes[i];
    randomStr += CROCKFORD_BASE32[byte & 31];
    randomStr += CROCKFORD_BASE32[(byte >> 5) & 31];
  }
  
  return timestampStr + randomStr;
};

const UuidTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.uuid.title'));
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } = useToolState<UuidToolState>(
    'uuid',
    DEFAULT_STATE,
    {
      shareStateFilter: ({ type, count, format }) => ({
        type,
        count,
        format,
      }),
    }
  );

  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const shareInfo = getShareStateInfo();
  const isMobile = React.useMemo(() => isMobileDevice(), []);
  const [generatedIds, setGeneratedIds] = React.useState<string[]>([]);

  const generateIds = React.useCallback(() => {
    const ids: string[] = [];
    for (let i = 0; i < state.count; i++) {
      let id: string;
      switch (state.type) {
        case 'uuid-v4':
          id = generateUuidV4();
          break;
        case 'uuid-v7':
          id = generateUuidV7();
          break;
        case 'ulid':
          id = generateUlid();
          break;
        default:
          id = generateUuidV4();
      }
      
      ids.push(state.format === 'uppercase' ? id.toUpperCase() : id.toLowerCase());
    }
    setGeneratedIds(ids);
  }, [state.type, state.count, state.format]);

  // Auto-generate on mount and when options change
  React.useEffect(() => {
    generateIds();
  }, [generateIds]);

  const handleCopy = async (id?: string) => {
    const textToCopy = id || generatedIds.join('\n');
    if (textToCopy) {
      await copyToClipboard(textToCopy, t('common.copiedToClipboard'));
      toast.success(id ? t('tool.uuid.idCopied') : t('tool.uuid.allIdsCopied'));
    }
  };

  const outputText = generatedIds.join('\n');

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title={t('tool.uuid.title')}
        description={t('tool.uuid.description')}
        onReset={resetState}
        onShare={async () => {
          if (isMobile) {
            setIsShareModalOpen(true);
          } else {
            await copyShareLink();
          }
        }}
      />

      {/* Options */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-4">
          <OptionLabel tooltip={t('tool.uuid.typeTooltip')}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tool.uuid.type')}
            </label>
            <select
              value={state.type}
              onChange={(e) =>
                updateState({
                  type: e.target.value as UuidToolState['type'],
                })
              }
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="uuid-v4">{t('tool.uuid.uuidV4')}</option>
              <option value="uuid-v7">{t('tool.uuid.uuidV7')}</option>
              <option value="ulid">{t('tool.uuid.ulid')}</option>
            </select>
          </OptionLabel>

          <OptionLabel tooltip={t('tool.uuid.countTooltip')}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tool.uuid.count')}
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={state.count}
              onChange={(e) => {
                const count = Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1));
                updateState({ count });
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
            />
          </OptionLabel>

          <OptionLabel tooltip={t('tool.uuid.formatTooltip')}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tool.uuid.format')}
            </label>
            <select
              value={state.format}
              onChange={(e) =>
                updateState({
                  format: e.target.value as 'lowercase' | 'uppercase',
                })
              }
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lowercase">{t('tool.uuid.lowercase')}</option>
              <option value="uppercase">{t('tool.uuid.uppercase')}</option>
            </select>
          </OptionLabel>
        </div>

        <button
          onClick={generateIds}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          {t('tool.uuid.regenerate')}
        </button>
      </div>

      {/* Output */}
      <div className="mb-4 flex-1 min-h-0">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tool.uuid.generatedIds')} ({generatedIds.length})
          </label>
          {state.count === 1 && (
            <button
              onClick={() => handleCopy()}
              disabled={!outputText}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('common.copy')}
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="h-full overflow-auto">
          {state.count === 1 ? (
            <EditorPanel
              value={outputText}
              onChange={() => {}}
              placeholder={t('tool.uuid.resultPlaceholder')}
              mode="text"
              readOnly={true}
            />
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 p-4 max-h-[400px] overflow-auto">
              {generatedIds.map((id, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                    {id}
                  </code>
                  <button
                    onClick={() => handleCopy(id)}
                    className="ml-4 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title={t('common.copy')}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
        toolName={t('tool.uuid.title')}
      />
    </div>
  );
};

export const uuidTool: ToolDefinition<UuidToolState> = {
  id: 'uuid',
  title: 'UUID/ULID Generator',
  description: 'Generate UUID v4, UUID v7, and ULID identifiers',
  path: '/uuid',
  icon: KeyRound,
  keywords: [
    'uuid',
    'ulid',
    'uuid generator',
    'uuid v4',
    'uuid v7',
    'ulid generator',
    'unique identifier',
    'guid',
    'random id',
    'timestamp id',
  ],
  category: 'Generators',
  defaultState: DEFAULT_STATE,
  Component: UuidTool,
};
