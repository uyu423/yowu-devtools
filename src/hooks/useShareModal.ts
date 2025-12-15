import { useState, useCallback, useMemo } from 'react';
import { isMobileDevice } from '@/lib/utils';

interface ShareStateInfo {
  includedFields: string[];
  excludedFields: string[];
  urlLength: number;
  maxUrlLength: number;
  isUrlTooLong: boolean;
}

interface UseShareModalOptions {
  /**
   * Function to copy share link to clipboard
   */
  copyShareLink: () => Promise<string | null>;
  /**
   * Function to share via Web Share API
   */
  shareViaWebShare: () => Promise<string | null>;
  /**
   * Function to get share state info (fields, URL length, etc.)
   */
  getShareStateInfo: () => ShareStateInfo;
  /**
   * Tool name to display in the modal
   */
  toolName: string;
  /**
   * Whether the tool contains sensitive data (shows warning in ShareModal)
   */
  isSensitive?: boolean;
}

/**
 * Hook to manage ShareModal state and props.
 * Provides all the props needed for ShareModal component.
 *
 * @example
 * ```tsx
 * const { state, copyShareLink, shareViaWebShare, getShareStateInfo } = useToolState('json', DEFAULT_STATE);
 * const { handleShare, shareModalProps } = useShareModal({
 *   copyShareLink,
 *   shareViaWebShare,
 *   getShareStateInfo,
 *   toolName: t('tool.json.title'),
 * });
 *
 * return (
 *   <>
 *     <ToolHeader onShare={handleShare} />
 *     <ShareModal {...shareModalProps} />
 *   </>
 * );
 * ```
 */
export function useShareModal(options: UseShareModalOptions) {
  const {
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName,
    isSensitive,
  } = options;

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const isMobile = useMemo(() => isMobileDevice(), []);

  const handleShare = useCallback(() => {
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
      toolName,
      isSensitive,
      isMobile,
      // URL length info
      urlLength: shareInfo.urlLength,
      maxUrlLength: shareInfo.maxUrlLength,
      isUrlTooLong: shareInfo.isUrlTooLong,
    }),
    [
      isShareModalOpen,
      handleShareModalClose,
      handleShareModalConfirm,
      shareInfo.includedFields,
      shareInfo.excludedFields,
      shareInfo.urlLength,
      shareInfo.maxUrlLength,
      shareInfo.isUrlTooLong,
      toolName,
      isSensitive,
      isMobile,
    ]
  );

  return {
    /** Whether the share modal is open */
    isShareModalOpen,
    /** Function to set the share modal open state */
    setIsShareModalOpen,
    /** Function to open the share modal (use as onShare handler) */
    handleShare,
    /** Props to spread to ShareModal component */
    shareModalProps,
    /** Whether the device is mobile */
    isMobile,
  } as const;
}

