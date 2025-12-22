/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Lock, Copy, HelpCircle } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToolState } from '@/hooks/useToolState';
import { useShareModal } from '@/hooks/useShareModal';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ShareModal } from '@/components/common/ShareModal';
import { GoogleAdsenseBlock } from '@/components/common/GoogleAdsenseBlock';

interface PasswordToolState {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  count: number;
}

const DEFAULT_STATE: PasswordToolState = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false,
  count: 1,
};

// Character sets
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

// Ambiguous symbols to exclude
const AMBIGUOUS_SYMBOLS = '{}[]()/\\\'"`~,;:.<>';

// Calculate password strength based on entropy
type StrengthLevel = 'weak' | 'medium' | 'strong' | 'very-strong';

function calculateStrength(password: string, charsetSize: number): StrengthLevel {
  const entropy = Math.log2(Math.pow(charsetSize, password.length));
  
  if (entropy < 28) return 'weak';
  if (entropy < 40) return 'medium';
  if (entropy < 60) return 'strong';
  return 'very-strong';
}

function getStrengthColor(strength: StrengthLevel): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
    case 'very-strong':
      return 'bg-emerald-600';
  }
}

// Generate password based on options
function generatePassword(state: PasswordToolState): string {
  // Build character set
  let charset = '';
  
  if (state.includeUppercase) {
    let uppercase = UPPERCASE;
    if (state.excludeSimilar) {
      uppercase = uppercase.replace(/[ILO]/g, '');
    }
    charset += uppercase;
  }
  
  if (state.includeLowercase) {
    let lowercase = LOWERCASE;
    if (state.excludeSimilar) {
      lowercase = lowercase.replace(/[ilo]/g, '');
    }
    charset += lowercase;
  }
  
  if (state.includeNumbers) {
    let numbers = NUMBERS;
    if (state.excludeSimilar) {
      numbers = numbers.replace(/[01]/g, '');
    }
    charset += numbers;
  }
  
  if (state.includeSymbols) {
    let symbols = SYMBOLS;
    if (state.excludeAmbiguous) {
      // Remove ambiguous symbols
      for (const char of AMBIGUOUS_SYMBOLS) {
        symbols = symbols.replace(char, '');
      }
    }
    charset += symbols;
  }
  
  // Validate that at least one character type is selected
  if (charset.length === 0) {
    throw new Error('At least one character type must be selected');
  }
  
  // Generate password using crypto.getRandomValues for secure randomness
  const randomBytes = new Uint8Array(state.length);
  crypto.getRandomValues(randomBytes);
  
  let password = '';
  for (let i = 0; i < state.length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}

const PasswordTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.password.title'));
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } = useToolState<PasswordToolState>(
    'password',
    DEFAULT_STATE,
    {
      shareStateFilter: ({ length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, excludeAmbiguous, count }) => ({
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        excludeSimilar,
        excludeAmbiguous,
        count,
      }),
    }
  );

  const { handleShare, shareModalProps } = useShareModal({
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName: t('tool.password.title'),
  });

  const [passwords, setPasswords] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // Calculate character set size for strength calculation
  const getCharsetSize = React.useCallback((): number => {
    let size = 0;
    
    if (state.includeUppercase) {
      size += state.excludeSimilar ? 23 : 26; // Exclude I, L, O if excludeSimilar
    }
    if (state.includeLowercase) {
      size += state.excludeSimilar ? 23 : 26; // Exclude i, l, o if excludeSimilar
    }
    if (state.includeNumbers) {
      size += state.excludeSimilar ? 8 : 10; // Exclude 0, 1 if excludeSimilar
    }
    if (state.includeSymbols) {
      let symbolCount = SYMBOLS.length;
      if (state.excludeAmbiguous) {
        symbolCount -= AMBIGUOUS_SYMBOLS.length;
      }
      size += symbolCount;
    }
    
    return size;
  }, [state]);

  const generatePasswords = React.useCallback(() => {
    try {
      setError(null);
      
      // Validate at least one character type is selected
      if (!state.includeUppercase && !state.includeLowercase && !state.includeNumbers && !state.includeSymbols) {
        setError(t('tool.password.atLeastOneCharType'));
        setPasswords([]);
        return;
      }
      
      // Validate length
      if (state.length < 4 || state.length > 128) {
        setError(t('tool.password.lengthError'));
        setPasswords([]);
        return;
      }
      
      const generated: string[] = [];
      for (let i = 0; i < state.count; i++) {
        generated.push(generatePassword(state));
      }
      setPasswords(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tool.password.failedToGenerate'));
      setPasswords([]);
    }
  }, [state, t]);

  // Auto-generate on mount and when options change
  React.useEffect(() => {
    generatePasswords();
  }, [generatePasswords]);

  const handleCopy = async (password?: string) => {
    const textToCopy = password || passwords.join('\n');
    if (textToCopy) {
      await copyToClipboard(textToCopy, t('common.copiedToClipboard'));
      toast.success(password ? t('tool.password.passwordCopied') : t('tool.password.allPasswordsCopied'));
    }
  };

  const charsetSize = getCharsetSize();
  const strength = passwords.length > 0 && passwords[0] ? calculateStrength(passwords[0], charsetSize) : null;

  const getStrengthLabel = (s: StrengthLevel): string => {
    switch (s) {
      case 'weak':
        return t('tool.password.weak');
      case 'medium':
        return t('tool.password.medium');
      case 'strong':
        return t('tool.password.strong');
      case 'very-strong':
        return t('tool.password.veryStrong');
    }
  };

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title={t('tool.password.title')}
        description={t('tool.password.description')}
        onReset={resetState}
        onShare={handleShare}
      />

      {/* Options */}
      <div className="mb-4 space-y-4">
        {/* Length */}
        <div>
          <OptionLabel tooltip={t('tool.password.lengthTooltip')}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tool.password.length')}: {state.length}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={4}
                max={128}
                value={state.length}
                onChange={(e) => {
                  const length = parseInt(e.target.value, 10);
                  updateState({ length });
                }}
                className="flex-1"
              />
              <input
                type="number"
                min={4}
                max={128}
                value={state.length}
                onChange={(e) => {
                  const length = Math.max(4, Math.min(128, parseInt(e.target.value, 10) || 4));
                  updateState({ length });
                }}
                className="w-20 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </OptionLabel>
        </div>

        {/* Character Types */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span>{t('tool.password.characterTypes')}</span>
            <Tooltip content={t('tool.password.characterTypesTooltip')} position="bottom" nowrap={false}>
              <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help" />
            </Tooltip>
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.includeUppercase}
                onChange={(e) => updateState({ includeUppercase: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('tool.password.uppercase')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.includeLowercase}
                onChange={(e) => updateState({ includeLowercase: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('tool.password.lowercase')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.includeNumbers}
                onChange={(e) => updateState({ includeNumbers: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('tool.password.numbers')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.includeSymbols}
                onChange={(e) => updateState({ includeSymbols: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('tool.password.symbols')}</span>
            </label>
          </div>
        </div>

        {/* Exclusion Options */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span>{t('tool.password.exclusionOptions')}</span>
            <Tooltip content={t('tool.password.exclusionOptionsTooltip')} position="bottom" nowrap={false}>
              <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help" />
            </Tooltip>
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.excludeSimilar}
                onChange={(e) => updateState({ excludeSimilar: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                {t('tool.password.excludeSimilar')}
                <Tooltip content={t('tool.password.excludeSimilarTooltip')} position="bottom" nowrap={false}>
                  <HelpCircle className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help" />
                </Tooltip>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.excludeAmbiguous}
                onChange={(e) => updateState({ excludeAmbiguous: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                {t('tool.password.excludeAmbiguous')}
                <Tooltip content={t('tool.password.excludeAmbiguousTooltip')} position="bottom" nowrap={false}>
                  <HelpCircle className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help" />
                </Tooltip>
              </span>
            </label>
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center gap-4">
          <OptionLabel tooltip={t('tool.password.countTooltip')}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tool.password.count')}
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={state.count}
              onChange={(e) => {
                const count = Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1));
                updateState({ count });
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
            />
          </OptionLabel>

          <button
            onClick={generatePasswords}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors mt-6"
          >
            {t('tool.password.regenerate')}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Output */}
      <div className="mb-4 flex-1 min-h-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tool.password.generatedPasswords')} ({passwords.length})
            </label>
            {strength && state.count === 1 && (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('tool.password.strength')}
                  <Tooltip content={t('tool.password.strengthTooltip')} position="bottom" nowrap={false}>
                    <HelpCircle className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help" />
                  </Tooltip>
                  :
                </span>
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', getStrengthColor(strength))} />
                  <span className={cn(
                    'text-xs font-medium',
                    strength === 'weak' && 'text-red-600 dark:text-red-400',
                    strength === 'medium' && 'text-yellow-600 dark:text-yellow-400',
                    strength === 'strong' && 'text-green-600 dark:text-green-400',
                    strength === 'very-strong' && 'text-emerald-600 dark:text-emerald-400'
                  )}>
                    {getStrengthLabel(strength)}
                  </span>
                </div>
              </div>
            )}
          </div>
          {state.count === 1 && passwords.length > 0 && (
            <button
              onClick={() => handleCopy()}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title={t('common.copy')}
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* AdSense - Before Generated Password */}
        <GoogleAdsenseBlock />

        <div className="h-full overflow-auto">
          {state.count === 1 ? (
            <EditorPanel
              value={passwords[0] || ''}
              onChange={() => {}}
              placeholder={t('tool.password.resultPlaceholder')}
              mode="text"
              readOnly={true}
            />
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 p-4 max-h-[400px] overflow-auto">
              {passwords.map((password, index) => {
                const pwdStrength = calculateStrength(password, charsetSize);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                        {password}
                      </code>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={cn('w-2 h-2 rounded-full', getStrengthColor(pwdStrength))} />
                        <span className={cn(
                          'text-xs font-medium',
                          pwdStrength === 'weak' && 'text-red-600 dark:text-red-400',
                          pwdStrength === 'medium' && 'text-yellow-600 dark:text-yellow-400',
                          pwdStrength === 'strong' && 'text-green-600 dark:text-green-400',
                          pwdStrength === 'very-strong' && 'text-emerald-600 dark:text-emerald-400'
                        )}>
                          {getStrengthLabel(pwdStrength)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(password)}
                      className="ml-4 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors shrink-0"
                      title={t('common.copy')}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <ShareModal {...shareModalProps} />
    </div>
  );
};

export const passwordTool: ToolDefinition<PasswordToolState> = {
  id: 'password',
  title: 'Password Generator',
  description: 'Generate secure passwords with customizable options',
  path: '/password',
  icon: Lock,
  keywords: [
    'password',
    'password generator',
    'secure password',
    'random password',
    'password creator',
    'strong password',
    'password maker',
    'password tool',
    'password strength',
    'password checker',
  ],
  category: 'Generators',
  defaultState: DEFAULT_STATE,
  Component: PasswordTool,
};
