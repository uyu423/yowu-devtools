/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Regex, Copy, Info } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useToolState } from '@/hooks/useToolState';
import { useShareModal } from '@/hooks/useShareModal';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';
import { ShareModal } from '@/components/common/ShareModal';
import { AdsenseFooter } from '@/components/common/AdsenseFooter';
import { cn } from '@/lib/utils';
import regexSpecs from './regex-specs.json';
import { REGEX_PRESETS, type RegexPreset } from './regex-presets';
import { ChevronDown } from 'lucide-react';

interface RegexToolState {
  pattern: string; // Regular expression pattern
  flags: {
    g: boolean; // global
    i: boolean; // ignore case
    m: boolean; // multiline
    s: boolean; // dotAll
    u: boolean; // unicode
    y: boolean; // sticky
    d?: boolean; // hasIndices (browser support)
    v?: boolean; // unicodeSets (browser support)
  };
  text: string; // Test text (multiline)
  replacementEnabled: boolean; // Replacement preview enabled
  replacement: string; // Replacement string
  replaceMode: 'first' | 'all'; // replace / replaceAll mode
  selectedMatchIndex?: number; // Selected match index
}

const DEFAULT_STATE: RegexToolState = {
  pattern: '',
  flags: {
    g: false,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  },
  text: '',
  replacementEnabled: false,
  replacement: '',
  replaceMode: 'first',
};

// Group colors for highlighting (distinct colors)
const GROUP_COLORS = [
  'bg-blue-200 dark:bg-blue-900',
  'bg-green-200 dark:bg-green-900',
  'bg-yellow-200 dark:bg-yellow-900',
  'bg-purple-200 dark:bg-purple-900',
  'bg-pink-200 dark:bg-pink-900',
  'bg-indigo-200 dark:bg-indigo-900',
  'bg-red-200 dark:bg-red-900',
  'bg-orange-200 dark:bg-orange-900',
];

// Preset Selector Component
interface PresetSelectorProps {
  onSelect: (preset: RegexPreset) => void;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelect }) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const categories = [
    {
      id: 'validation',
      name: t('tool.regex.validation'),
      presets: REGEX_PRESETS.filter((p) => p.category === 'validation'),
    },
    {
      id: 'extraction',
      name: t('tool.regex.extraction'),
      presets: REGEX_PRESETS.filter((p) => p.category === 'extraction'),
    },
    {
      id: 'formatting',
      name: t('tool.regex.formatting'),
      presets: REGEX_PRESETS.filter((p) => p.category === 'formatting'),
    },
  ];

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
      >
        <span>{t('tool.regex.presets')}</span>
        <ChevronDown
          className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
        >
          <div className="p-2">
            {categories.map((category) => (
              <div key={category.id} className="mb-3 last:mb-0">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {category.name}
                </div>
                {category.presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onSelect(preset);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    title={preset.description}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono truncate">
                      {preset.pattern}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface MatchResult {
  match: string;
  index: number;
  groups: (string | undefined)[];
  namedGroups: Record<string, string>;
  fullMatch: string;
}

const RegexTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.regex.title'));
  const {
    state,
    updateState,
    resetState,
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
  } = useToolState<RegexToolState>('regex', DEFAULT_STATE, {
    shareStateFilter: ({
      pattern,
      flags,
      text,
      replacementEnabled,
      replacement,
      replaceMode,
    }) => ({
      pattern,
      flags,
      text,
      replacementEnabled,
      replacement,
      replaceMode,
      // selectedMatchIndex는 UI 전용이므로 제외
    }),
  });

  const { handleShare, shareModalProps } = useShareModal({
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName: t('tool.regex.title'),
  });

  const debouncedPattern = useDebouncedValue(state.pattern, 200);
  const debouncedText = useDebouncedValue(state.text, 200);

  const [matches, setMatches] = React.useState<MatchResult[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [replaceResult, setReplaceResult] = React.useState<string>('');

  // Check browser support for advanced flags
  const supportsHasIndices = React.useMemo(() => {
    try {
      new RegExp('', 'd');
      return true;
    } catch {
      return false;
    }
  }, []);

  const supportsUnicodeSets = React.useMemo(() => {
    try {
      new RegExp('', 'v');
      return true;
    } catch {
      return false;
    }
  }, []);

  // Build regex flags string
  const buildFlagsString = React.useCallback(() => {
    let flagsStr = '';
    if (state.flags.g) flagsStr += 'g';
    if (state.flags.i) flagsStr += 'i';
    if (state.flags.m) flagsStr += 'm';
    if (state.flags.s) flagsStr += 's';
    if (state.flags.u) flagsStr += 'u';
    if (state.flags.y) flagsStr += 'y';
    if (supportsHasIndices && state.flags.d) flagsStr += 'd';
    if (supportsUnicodeSets && state.flags.v) flagsStr += 'v';
    return flagsStr;
  }, [state.flags, supportsHasIndices, supportsUnicodeSets]);

  // Execute regex matching
  React.useEffect(() => {
    if (!debouncedPattern.trim() || !debouncedText.trim()) {
      setMatches([]);
      setError(null);
      setReplaceResult('');
      return;
    }

    setError(null);

    // Use setTimeout to allow UI to update
    const timeoutId = setTimeout(() => {
      try {
        const flagsStr = buildFlagsString();
        const regex = new RegExp(debouncedPattern, flagsStr);
        const matchResults: MatchResult[] = [];

        // Execute matching
        if (state.flags.g) {
          // Global match - find all matches
          let lastIndex = 0;
          let matchCount = 0;
          const maxMatches = 1000; // Limit matches to prevent performance issues

          while (lastIndex < debouncedText.length && matchCount < maxMatches) {
            regex.lastIndex = lastIndex;
            const match = regex.exec(debouncedText);

            if (!match) break;

            const groups: (string | undefined)[] = [];
            for (let i = 1; i < match.length; i++) {
              groups.push(match[i]);
            }

            const namedGroups: Record<string, string> = {};
            if (match.groups) {
              for (const [name, value] of Object.entries(match.groups)) {
                if (value !== undefined) {
                  namedGroups[name] = value;
                }
              }
            }

            matchResults.push({
              match: match[0],
              index: match.index!,
              groups,
              namedGroups,
              fullMatch: match[0],
            });

            lastIndex = match.index! + (match[0].length || 1);
            matchCount++;

            // Prevent infinite loop
            if (match[0].length === 0) {
              lastIndex++;
            }
          }
        } else {
          // Single match
          const match = regex.exec(debouncedText);
          if (match) {
            const groups: (string | undefined)[] = [];
            for (let i = 1; i < match.length; i++) {
              groups.push(match[i]);
            }

            const namedGroups: Record<string, string> = {};
            if (match.groups) {
              for (const [name, value] of Object.entries(match.groups)) {
                if (value !== undefined) {
                  namedGroups[name] = value;
                }
              }
            }

            matchResults.push({
              match: match[0],
              index: match.index!,
              groups,
              namedGroups,
              fullMatch: match[0],
            });
          }
        }

        setMatches(matchResults);

        // Calculate replacement result
        if (state.replacementEnabled && state.replacement) {
          let result: string;
          if (state.replaceMode === 'all' || state.flags.g) {
            result = debouncedText.replace(regex, state.replacement);
          } else {
            result = debouncedText.replace(regex, state.replacement);
          }
          setReplaceResult(result);
        } else {
          setReplaceResult('');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t('tool.regex.invalidRegex')
        );
        setMatches([]);
        setReplaceResult('');
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [
    debouncedPattern,
    debouncedText,
    state.flags,
    state.replacementEnabled,
    state.replacement,
    state.replaceMode,
    buildFlagsString,
    t,
  ]);

  // Sync replaceMode with g flag
  React.useEffect(() => {
    if (state.flags.g && state.replaceMode === 'first') {
      updateState({ replaceMode: 'all' });
    } else if (!state.flags.g && state.replaceMode === 'all') {
      updateState({ replaceMode: 'first' });
    }
  }, [state.flags.g, state.replaceMode, updateState]);

  // Note: Scroll to selected match functionality is simplified
  // CodeMirror doesn't easily support programmatic scrolling to match positions

  const handleCopy = async (text: string) => {
    await copyToClipboard(text, t('common.copiedToClipboard'));
  };

  // Category key to i18n key mapping
  const getCategoryI18n = React.useCallback(
    (categoryKey: string): { name: string; description: string } => {
      const categoryMap: Record<string, { nameKey: string; descKey: string }> =
        {
          characterClasses: {
            nameKey: 'tool.regex.specCharacterClasses',
            descKey: 'tool.regex.specCharacterClassesDesc',
          },
          quantifiers: {
            nameKey: 'tool.regex.specQuantifiers',
            descKey: 'tool.regex.specQuantifiersDesc',
          },
          anchors: {
            nameKey: 'tool.regex.specAnchors',
            descKey: 'tool.regex.specAnchorsDesc',
          },
          groups: {
            nameKey: 'tool.regex.specGroups',
            descKey: 'tool.regex.specGroupsDesc',
          },
          characterSets: {
            nameKey: 'tool.regex.specCharacterSets',
            descKey: 'tool.regex.specCharacterSetsDesc',
          },
          flags: {
            nameKey: 'tool.regex.specFlags',
            descKey: 'tool.regex.specFlagsDesc',
          },
          unicode: {
            nameKey: 'tool.regex.specUnicode',
            descKey: 'tool.regex.specUnicodeDesc',
          },
        };
      const keys = categoryMap[categoryKey];
      if (keys) {
        return { name: t(keys.nameKey), description: t(keys.descKey) };
      }
      // Fallback to original category name from JSON
      const category =
        regexSpecs.features[categoryKey as keyof typeof regexSpecs.features];
      return {
        name: category?.name || categoryKey,
        description: category?.description || '',
      };
    },
    [t]
  );

  // Pattern name to i18n key mapping
  const getPatternI18n = React.useCallback(
    (
      patternName: string,
      fallback: { name: string; description: string; example: string }
    ): { name: string; description: string; example: string } => {
      const patternMap: Record<
        string,
        { nameKey: string; descKey: string; exampleKey: string }
      > = {
        // Character Classes
        Digit: {
          nameKey: 'tool.regex.patternDigitName',
          descKey: 'tool.regex.patternDigitDesc',
          exampleKey: 'tool.regex.patternDigitExample',
        },
        'Non-digit': {
          nameKey: 'tool.regex.patternNonDigitName',
          descKey: 'tool.regex.patternNonDigitDesc',
          exampleKey: 'tool.regex.patternNonDigitExample',
        },
        'Word Character': {
          nameKey: 'tool.regex.patternWordCharName',
          descKey: 'tool.regex.patternWordCharDesc',
          exampleKey: 'tool.regex.patternWordCharExample',
        },
        'Non-word Character': {
          nameKey: 'tool.regex.patternNonWordCharName',
          descKey: 'tool.regex.patternNonWordCharDesc',
          exampleKey: 'tool.regex.patternNonWordCharExample',
        },
        Whitespace: {
          nameKey: 'tool.regex.patternWhitespaceName',
          descKey: 'tool.regex.patternWhitespaceDesc',
          exampleKey: 'tool.regex.patternWhitespaceExample',
        },
        'Non-whitespace': {
          nameKey: 'tool.regex.patternNonWhitespaceName',
          descKey: 'tool.regex.patternNonWhitespaceDesc',
          exampleKey: 'tool.regex.patternNonWhitespaceExample',
        },
        'Dot (Escaped)': {
          nameKey: 'tool.regex.patternDotEscapedName',
          descKey: 'tool.regex.patternDotEscapedDesc',
          exampleKey: 'tool.regex.patternDotEscapedExample',
        },
        Newline: {
          nameKey: 'tool.regex.patternNewlineName',
          descKey: 'tool.regex.patternNewlineDesc',
          exampleKey: 'tool.regex.patternNewlineExample',
        },
        Tab: {
          nameKey: 'tool.regex.patternTabName',
          descKey: 'tool.regex.patternTabDesc',
          exampleKey: 'tool.regex.patternTabExample',
        },
        'Carriage Return': {
          nameKey: 'tool.regex.patternCarriageReturnName',
          descKey: 'tool.regex.patternCarriageReturnDesc',
          exampleKey: 'tool.regex.patternCarriageReturnExample',
        },
        // Quantifiers
        'Zero or More': {
          nameKey: 'tool.regex.patternZeroOrMoreName',
          descKey: 'tool.regex.patternZeroOrMoreDesc',
          exampleKey: 'tool.regex.patternZeroOrMoreExample',
        },
        'One or More': {
          nameKey: 'tool.regex.patternOneOrMoreName',
          descKey: 'tool.regex.patternOneOrMoreDesc',
          exampleKey: 'tool.regex.patternOneOrMoreExample',
        },
        'Zero or One': {
          nameKey: 'tool.regex.patternZeroOrOneName',
          descKey: 'tool.regex.patternZeroOrOneDesc',
          exampleKey: 'tool.regex.patternZeroOrOneExample',
        },
        'Exactly N': {
          nameKey: 'tool.regex.patternExactlyNName',
          descKey: 'tool.regex.patternExactlyNDesc',
          exampleKey: 'tool.regex.patternExactlyNExample',
        },
        'N or More': {
          nameKey: 'tool.regex.patternNOrMoreName',
          descKey: 'tool.regex.patternNOrMoreDesc',
          exampleKey: 'tool.regex.patternNOrMoreExample',
        },
        'Between N and M': {
          nameKey: 'tool.regex.patternBetweenNMName',
          descKey: 'tool.regex.patternBetweenNMDesc',
          exampleKey: 'tool.regex.patternBetweenNMExample',
        },
        'Lazy Zero or More': {
          nameKey: 'tool.regex.patternLazyZeroOrMoreName',
          descKey: 'tool.regex.patternLazyZeroOrMoreDesc',
          exampleKey: 'tool.regex.patternLazyZeroOrMoreExample',
        },
        'Lazy One or More': {
          nameKey: 'tool.regex.patternLazyOneOrMoreName',
          descKey: 'tool.regex.patternLazyOneOrMoreDesc',
          exampleKey: 'tool.regex.patternLazyOneOrMoreExample',
        },
        'Lazy Zero or One': {
          nameKey: 'tool.regex.patternLazyZeroOrOneName',
          descKey: 'tool.regex.patternLazyZeroOrOneDesc',
          exampleKey: 'tool.regex.patternLazyZeroOrOneExample',
        },
        // Anchors
        'Start of String': {
          nameKey: 'tool.regex.patternStartOfStringName',
          descKey: 'tool.regex.patternStartOfStringDesc',
          exampleKey: 'tool.regex.patternStartOfStringExample',
        },
        'End of String': {
          nameKey: 'tool.regex.patternEndOfStringName',
          descKey: 'tool.regex.patternEndOfStringDesc',
          exampleKey: 'tool.regex.patternEndOfStringExample',
        },
        'Word Boundary': {
          nameKey: 'tool.regex.patternWordBoundaryName',
          descKey: 'tool.regex.patternWordBoundaryDesc',
          exampleKey: 'tool.regex.patternWordBoundaryExample',
        },
        'Non-word Boundary': {
          nameKey: 'tool.regex.patternNonWordBoundaryName',
          descKey: 'tool.regex.patternNonWordBoundaryDesc',
          exampleKey: 'tool.regex.patternNonWordBoundaryExample',
        },
        // Groups
        'Capturing Group': {
          nameKey: 'tool.regex.patternCapturingGroupName',
          descKey: 'tool.regex.patternCapturingGroupDesc',
          exampleKey: 'tool.regex.patternCapturingGroupExample',
        },
        'Non-capturing Group': {
          nameKey: 'tool.regex.patternNonCapturingGroupName',
          descKey: 'tool.regex.patternNonCapturingGroupDesc',
          exampleKey: 'tool.regex.patternNonCapturingGroupExample',
        },
        'Named Capturing Group': {
          nameKey: 'tool.regex.patternNamedCapturingGroupName',
          descKey: 'tool.regex.patternNamedCapturingGroupDesc',
          exampleKey: 'tool.regex.patternNamedCapturingGroupExample',
        },
        'Positive Lookahead': {
          nameKey: 'tool.regex.patternPositiveLookaheadName',
          descKey: 'tool.regex.patternPositiveLookaheadDesc',
          exampleKey: 'tool.regex.patternPositiveLookaheadExample',
        },
        'Negative Lookahead': {
          nameKey: 'tool.regex.patternNegativeLookaheadName',
          descKey: 'tool.regex.patternNegativeLookaheadDesc',
          exampleKey: 'tool.regex.patternNegativeLookaheadExample',
        },
        'Positive Lookbehind': {
          nameKey: 'tool.regex.patternPositiveLookbehindName',
          descKey: 'tool.regex.patternPositiveLookbehindDesc',
          exampleKey: 'tool.regex.patternPositiveLookbehindExample',
        },
        'Negative Lookbehind': {
          nameKey: 'tool.regex.patternNegativeLookbehindName',
          descKey: 'tool.regex.patternNegativeLookbehindDesc',
          exampleKey: 'tool.regex.patternNegativeLookbehindExample',
        },
        Backreference: {
          nameKey: 'tool.regex.patternBackreferenceName',
          descKey: 'tool.regex.patternBackreferenceDesc',
          exampleKey: 'tool.regex.patternBackreferenceExample',
        },
        'Named Backreference': {
          nameKey: 'tool.regex.patternNamedBackreferenceName',
          descKey: 'tool.regex.patternNamedBackreferenceDesc',
          exampleKey: 'tool.regex.patternNamedBackreferenceExample',
        },
        // Character Sets
        'Character Class': {
          nameKey: 'tool.regex.patternCharacterClassName',
          descKey: 'tool.regex.patternCharacterClassDesc',
          exampleKey: 'tool.regex.patternCharacterClassExample',
        },
        'Negated Character Class': {
          nameKey: 'tool.regex.patternNegatedCharacterClassName',
          descKey: 'tool.regex.patternNegatedCharacterClassDesc',
          exampleKey: 'tool.regex.patternNegatedCharacterClassExample',
        },
        'Character Range': {
          nameKey: 'tool.regex.patternCharacterRangeName',
          descKey: 'tool.regex.patternCharacterRangeDesc',
          exampleKey: 'tool.regex.patternCharacterRangeExample',
        },
        // Flags
        Global: {
          nameKey: 'tool.regex.patternGlobalFlagName',
          descKey: 'tool.regex.patternGlobalFlagDesc',
          exampleKey: 'tool.regex.patternGlobalFlagExample',
        },
        'Case Insensitive': {
          nameKey: 'tool.regex.patternCaseInsensitiveFlagName',
          descKey: 'tool.regex.patternCaseInsensitiveFlagDesc',
          exampleKey: 'tool.regex.patternCaseInsensitiveFlagExample',
        },
        Multiline: {
          nameKey: 'tool.regex.patternMultilineFlagName',
          descKey: 'tool.regex.patternMultilineFlagDesc',
          exampleKey: 'tool.regex.patternMultilineFlagExample',
        },
        DotAll: {
          nameKey: 'tool.regex.patternDotAllFlagName',
          descKey: 'tool.regex.patternDotAllFlagDesc',
          exampleKey: 'tool.regex.patternDotAllFlagExample',
        },
        Unicode: {
          nameKey: 'tool.regex.patternUnicodeFlagName',
          descKey: 'tool.regex.patternUnicodeFlagDesc',
          exampleKey: 'tool.regex.patternUnicodeFlagExample',
        },
        Sticky: {
          nameKey: 'tool.regex.patternStickyFlagName',
          descKey: 'tool.regex.patternStickyFlagDesc',
          exampleKey: 'tool.regex.patternStickyFlagExample',
        },
        HasIndices: {
          nameKey: 'tool.regex.patternHasIndicesFlagName',
          descKey: 'tool.regex.patternHasIndicesFlagDesc',
          exampleKey: 'tool.regex.patternHasIndicesFlagExample',
        },
        UnicodeSets: {
          nameKey: 'tool.regex.patternUnicodeSetsFlagName',
          descKey: 'tool.regex.patternUnicodeSetsFlagDesc',
          exampleKey: 'tool.regex.patternUnicodeSetsFlagExample',
        },
        // Unicode
        'Unicode Escape': {
          nameKey: 'tool.regex.patternUnicodeEscapeName',
          descKey: 'tool.regex.patternUnicodeEscapeDesc',
          exampleKey: 'tool.regex.patternUnicodeEscapeExample',
        },
        'Unicode Code Point': {
          nameKey: 'tool.regex.patternUnicodeCodePointName',
          descKey: 'tool.regex.patternUnicodeCodePointDesc',
          exampleKey: 'tool.regex.patternUnicodeCodePointExample',
        },
        'Unicode Property': {
          nameKey: 'tool.regex.patternUnicodePropertyName',
          descKey: 'tool.regex.patternUnicodePropertyDesc',
          exampleKey: 'tool.regex.patternUnicodePropertyExample',
        },
        'Negated Unicode Property': {
          nameKey: 'tool.regex.patternNegatedUnicodePropertyName',
          descKey: 'tool.regex.patternNegatedUnicodePropertyDesc',
          exampleKey: 'tool.regex.patternNegatedUnicodePropertyExample',
        },
      };
      const keys = patternMap[patternName];
      if (keys) {
        return {
          name: t(keys.nameKey),
          description: t(keys.descKey),
          example: t(keys.exampleKey),
        };
      }
      // Fallback to original pattern info from JSON
      return fallback;
    },
    [t]
  );

  // Analyze pattern to detect used features
  const detectedFeatures = React.useMemo(() => {
    if (!debouncedPattern.trim()) {
      return [];
    }

    const features: Array<{
      category: string;
      categoryName: string;
      categoryDescription: string;
      feature: {
        name: string;
        description: string;
        example: string;
      };
    }> = [];

    // Check each feature category
    Object.entries(regexSpecs.features).forEach(([categoryKey, category]) => {
      // Skip flags category, handled separately
      if (categoryKey === 'flags') {
        return;
      }

      category.patterns.forEach((patternSpec) => {
        try {
          // Create regex from pattern spec (pattern is already a regex pattern)
          const regex = new RegExp(patternSpec.pattern);
          if (regex.test(debouncedPattern)) {
            // Check if already added (avoid duplicates)
            const alreadyAdded = features.some(
              (f) =>
                f.category === categoryKey &&
                f.feature.name === patternSpec.name
            );
            if (!alreadyAdded) {
              const categoryI18n = getCategoryI18n(categoryKey);
              const patternI18n = getPatternI18n(patternSpec.name, {
                name: patternSpec.name,
                description: patternSpec.description,
                example: patternSpec.example,
              });
              features.push({
                category: categoryKey,
                categoryName: categoryI18n.name,
                categoryDescription: categoryI18n.description,
                feature: patternI18n,
              });
            }
          }
        } catch {
          // Invalid regex pattern, skip
        }
      });
    });

    // Also check flags
    Object.entries(state.flags).forEach(([flag, enabled]) => {
      if (enabled) {
        const flagSpec = regexSpecs.features.flags.patterns.find(
          (p) => p.pattern === flag
        );
        if (flagSpec) {
          const alreadyAdded = features.some(
            (f) => f.category === 'flags' && f.feature.name === flagSpec.name
          );
          if (!alreadyAdded) {
            const categoryI18n = getCategoryI18n('flags');
            const patternI18n = getPatternI18n(flagSpec.name, {
              name: flagSpec.name,
              description: flagSpec.description,
              example: flagSpec.example,
            });
            features.push({
              category: 'flags',
              categoryName: categoryI18n.name,
              categoryDescription: categoryI18n.description,
              feature: patternI18n,
            });
          }
        }
      }
    });

    return features;
  }, [debouncedPattern, state.flags, getCategoryI18n, getPatternI18n]);

  // Build highlights array for CodeMirror decoration
  const highlights = React.useMemo(() => {
    if (!debouncedText || matches.length === 0) {
      return [];
    }

    const getGroupColor = (groupIndex: number): string => {
      return GROUP_COLORS[groupIndex % GROUP_COLORS.length];
    };

    const highlightRanges: Array<{
      from: number;
      to: number;
      className: string;
    }> = [];

    matches.forEach((match, matchIndex) => {
      const matchStart = match.index;
      const matchEnd = match.index + match.match.length;

      if (state.selectedMatchIndex === matchIndex) {
        // Highlight selected match's groups with different colors
        let currentPos = matchStart;
        match.groups.forEach((group, groupIndex) => {
          if (group !== undefined && group.length > 0) {
            // Find group position within match
            const groupStart = debouncedText.indexOf(group, currentPos);
            if (groupStart !== -1 && groupStart < matchEnd) {
              // Add match text before group
              if (groupStart > currentPos) {
                highlightRanges.push({
                  from: currentPos,
                  to: groupStart,
                  className: 'bg-yellow-200 dark:bg-yellow-900',
                });
              }
              // Add group with specific color
              highlightRanges.push({
                from: groupStart,
                to: groupStart + group.length,
                className: cn('font-semibold', getGroupColor(groupIndex)),
              });
              currentPos = groupStart + group.length;
            }
          }
        });
        // Add remaining match text
        if (currentPos < matchEnd) {
          highlightRanges.push({
            from: currentPos,
            to: matchEnd,
            className: 'bg-yellow-200 dark:bg-yellow-900',
          });
        }
      } else {
        // Just highlight full match
        highlightRanges.push({
          from: matchStart,
          to: matchEnd,
          className: 'bg-yellow-200 dark:bg-yellow-900',
        });
      }
    });

    return highlightRanges;
  }, [matches, debouncedText, state.selectedMatchIndex]);

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 max-w-[90rem] mx-auto">
      <ToolHeader
        title={t('tool.regex.title')}
        description={t('tool.regex.description')}
        onReset={resetState}
        onShare={handleShare}
      />

      {error && <ErrorBanner message={error} className="mb-4" />}

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Left column: Input and settings */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Pattern Input with Preset */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tool.regex.pattern')}
              </label>
              <PresetSelector
                onSelect={(preset) => {
                  updateState({
                    pattern: preset.pattern,
                    flags: {
                      ...state.flags,
                      ...preset.flags,
                    },
                  });
                  if (preset.exampleText) {
                    updateState({ text: preset.exampleText });
                  }
                  toast.success(
                    t('tool.regex.presetApplied').replace('{name}', preset.name)
                  );
                }}
              />
            </div>
            <input
              type="text"
              value={state.pattern}
              onChange={(e) => updateState({ pattern: e.target.value })}
              placeholder={t('tool.regex.patternPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Flags */}
          <div className="mb-4">
            <OptionLabel tooltip={t('tool.regex.flagsTooltip')}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tool.regex.flags')}
              </label>
            </OptionLabel>
            <div className="flex flex-wrap gap-2">
              {(['g', 'i', 'm', 's', 'u', 'y'] as const).map((flag) => (
                <label
                  key={flag}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={state.flags[flag]}
                    onChange={(e) =>
                      updateState({
                        flags: { ...state.flags, [flag]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {flag}
                  </span>
                </label>
              ))}
              {supportsHasIndices && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.flags.d || false}
                    onChange={(e) =>
                      updateState({
                        flags: { ...state.flags, d: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    d
                  </span>
                </label>
              )}
              {supportsUnicodeSets && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.flags.v || false}
                    onChange={(e) =>
                      updateState({
                        flags: { ...state.flags, v: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    v
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Test Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tool.regex.testText')}
            </label>
            <EditorPanel
              value={state.text}
              onChange={(value) => updateState({ text: value })}
              placeholder={t('tool.regex.testTextPlaceholder')}
              mode="text"
              readOnly={false}
              highlights={highlights}
              resizable
              minHeight={150}
              maxHeight={600}
              heightStorageKey="regex-test-text-height"
            />
          </div>

          {/* Replacement Preview */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.replacementEnabled}
                  onChange={(e) =>
                    updateState({ replacementEnabled: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tool.regex.replacementPreview')}
                </span>
              </label>
              {state.replacementEnabled && (
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="replaceMode"
                      checked={state.replaceMode === 'first'}
                      onChange={() => updateState({ replaceMode: 'first' })}
                      disabled={state.flags.g}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {t('tool.regex.replaceFirst')}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="replaceMode"
                      checked={state.replaceMode === 'all'}
                      onChange={() => updateState({ replaceMode: 'all' })}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {t('tool.regex.replaceAll')}
                    </span>
                  </label>
                </div>
              )}
            </div>
            {state.replacementEnabled && (
              <>
                <div className="mb-2">
                  <input
                    type="text"
                    value={state.replacement}
                    onChange={(e) =>
                      updateState({ replacement: e.target.value })
                    }
                    placeholder={t('tool.regex.replacementPlaceholder')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                {replaceResult && (
                  <div className="h-32">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('tool.regex.replacementResult')}
                      </label>
                      <button
                        onClick={() => handleCopy(replaceResult)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title={t('common.copy')}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <EditorPanel
                      value={replaceResult}
                      onChange={() => {}} // Read-only
                      placeholder={t('tool.regex.replacementResultPlaceholder')}
                      mode="text"
                      readOnly={true}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Security Note */}
          <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong className="text-gray-700 dark:text-gray-300">
                {t('tool.regex.note')}:
              </strong>{' '}
              {t('tool.regex.securityNote')}
            </p>
          </div>

          {/* Feature Detection & Explanation - Compact collapsible version */}
          {detectedFeatures.length > 0 && (
            <div className="mb-4">
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer list-none p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {t('tool.regex.patternFeatures')} ({detectedFeatures.length}
                    )
                  </span>
                  <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 group-open:hidden">
                    {t('tool.regex.clickToExpand')}
                  </span>
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <div className="space-y-3">
                    {Object.entries(
                      detectedFeatures.reduce((acc, item) => {
                        if (!acc[item.category]) {
                          acc[item.category] = {
                            categoryName: item.categoryName,
                            categoryDescription: item.categoryDescription,
                            features: [],
                          };
                        }
                        acc[item.category].features.push(item.feature);
                        return acc;
                      }, {} as Record<string, { categoryName: string; categoryDescription: string; features: Array<{ name: string; description: string; example: string }> }>)
                    ).map(([category, data]) => (
                      <div key={category} className="text-xs">
                        <div className="font-semibold text-blue-800 dark:text-blue-200 mb-0.5">
                          {data.categoryName}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 mb-1.5 text-[11px]">
                          {data.categoryDescription}
                        </div>
                        <div className="space-y-2 pl-2 border-l-2 border-blue-300 dark:border-blue-700">
                          {data.features.map((feature, idx) => (
                            <div
                              key={idx}
                              className="text-blue-700 dark:text-blue-300"
                            >
                              <div className="font-medium mb-0.5">
                                {feature.name}
                              </div>
                              <div className="text-blue-600 dark:text-blue-400 mb-1 text-[11px] leading-relaxed">
                                {feature.description}
                              </div>
                              <div className="font-mono text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-[10px]">
                                {feature.example}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Right column: Match Results */}
        <div className="flex flex-col lg:w-80 xl:w-96 flex-shrink-0">
          {matches.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tool.regex.matches')} ({matches.length})
                </label>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                {matches.map((match, index) => (
                  <div
                    key={index}
                    onClick={() => updateState({ selectedMatchIndex: index })}
                    className={cn(
                      'p-2 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                      state.selectedMatchIndex === index &&
                        'bg-blue-50 dark:bg-blue-900/20'
                    )}
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('tool.regex.matchInfo')
                        .replace('{n}', String(index + 1))
                        .replace('{index}', String(match.index))
                        .replace('{length}', String(match.match.length))}
                    </div>
                    <div className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {match.match}
                    </div>
                    {match.groups.some((g) => g !== undefined) && (
                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {t('tool.regex.groups')}:{' '}
                        {match.groups
                          .filter((g) => g !== undefined)
                          .map((g, i) => `$${i + 1}=${g}`)
                          .join(', ')}
                      </div>
                    )}
                    {Object.keys(match.namedGroups).length > 0 && (
                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {t('tool.regex.named')}:{' '}
                        {Object.entries(match.namedGroups)
                          .map(([name, value]) => `$${name}=${value}`)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 min-h-0 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {t('tool.regex.noMatches')}
              </p>
            </div>
          )}
        </div>
      </div>

      <ShareModal {...shareModalProps} />
      <AdsenseFooter />
    </div>
  );
};

export const regexTool: ToolDefinition<RegexToolState> = {
  id: 'regex',
  title: 'Regex Tester',
  description: 'Test and visualize regular expressions',
  path: '/regex',
  icon: Regex,
  keywords: [
    'regex',
    'regular expression',
    'pattern matching',
    'regexp',
    'regex tester',
    'pattern test',
    'regex validator',
    'regex debugger',
  ],
  category: 'Text',
  defaultState: DEFAULT_STATE,
  Component: RegexTool,
};
