import { useState, useCallback, useMemo } from 'react';
import { useToolState } from './useToolState';
import { useI18n } from './useI18nHooks';
import { useTitle } from './useTitle';
import { isMobileDevice } from '@/lib/utils';

interface UseToolSetupOptions<T extends object> {
  /**
   * Filter function to select only necessary fields for sharing.
   * This helps reduce URL length by excluding UI-only state or large computed values.
   */
  shareStateFilter?: (state: T) => Partial<T>;
  /**
   * Whether the tool contains sensitive data (shows warning in ShareModal)
   */
  isSensitive?: boolean;
}

/**
 * Combined hook for common tool setup patterns.
 * Reduces boilerplate code in tool components by combining:
 * - useI18n for translations
 * - useTitle for page title
 * - useToolState for state management
 * - ShareModal state management
 * - Mobile device detection
 *
 * @param toolId - Unique tool identifier (e.g., 'json', 'url', 'base64')
 * @param i18nKey - i18n key for the tool (e.g., 'json', 'url', 'base64')
 * @param defaultState - Default state object for the tool
 * @param options - Optional configuration for share filtering and sensitivity
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   updateState,
 *   resetState,
 *   t,
 *   handleShare,
 *   shareModalProps,
 *   isMobile,
 * } = useToolSetup('json', 'json', DEFAULT_STATE, {
 *   shareStateFilter: ({ input, indent }) => ({ input, indent }),
 * });
 * ```
 */
export function useToolSetup<T extends object>(
  toolId: string,
  i18nKey: string,
  defaultState: T,
  options?: UseToolSetupOptions<T>
) {
  const { t } = useI18n();
  useTitle(t(`tool.${i18nKey}.title`));

  const {
    state,
    setState,
    updateState,
    resetState,
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    generateShareUrl,
  } = useToolState<T>(toolId, defaultState, {
    shareStateFilter: options?.shareStateFilter,
  });

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const isMobile = useMemo(() => isMobileDevice(), []);

  const handleShare = useCallback(() => {
    // Both mobile and PC now show the modal first
    setIsShareModalOpen(true);
  }, []);

  const handleShareModalClose = useCallback(() => {
    setIsShareModalOpen(false);
  }, []);

  const handleShareModalConfirm = useCallback(async () => {
    setIsShareModalOpen(false);
    if (isMobile) {
      // Mobile: Use Web Share API
      await shareViaWebShare();
    } else {
      // PC: Copy to clipboard
      await copyShareLink();
    }
  }, [isMobile, shareViaWebShare, copyShareLink]);

  const shareInfo = useMemo(() => getShareStateInfo(), [getShareStateInfo]);

  // ShareModal props object for easy spreading
  const shareModalProps = useMemo(
    () => ({
      isOpen: isShareModalOpen,
      onClose: handleShareModalClose,
      onConfirm: handleShareModalConfirm,
      includedFields: shareInfo.includedFields,
      excludedFields: shareInfo.excludedFields,
      toolName: t(`tool.${i18nKey}.title`),
      isSensitive: options?.isSensitive,
      isMobile,
    }),
    [
      isShareModalOpen,
      handleShareModalClose,
      handleShareModalConfirm,
      shareInfo.includedFields,
      shareInfo.excludedFields,
      t,
      i18nKey,
      options?.isSensitive,
      isMobile,
    ]
  );

  return {
    // State management
    state,
    setState,
    updateState,
    resetState,
    // i18n
    t,
    // Share functionality
    handleShare,
    shareModalProps,
    copyShareLink,
    shareViaWebShare,
    generateShareUrl,
    getShareStateInfo,
    // Device detection
    isMobile,
  } as const;
}

