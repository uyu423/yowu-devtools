import React from 'react';
import { Play, Pause, Volume2, VolumeX, Upload, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VideoMetadata, CropArea, TimeRange } from '../types';
import { formatTime, MOBILE_WARNING_THRESHOLD } from '../constants';

interface VideoPreviewProps {
  videoUrl: string | null;
  metadata: VideoMetadata | null;
  cropArea: CropArea | null;
  trimRange: TimeRange | null;
  showCropOverlay: boolean;
  showTrimOverlay: boolean;
  thumbnailTime: number | null;
  onFileSelect: (file: File) => void;
  onCropAreaChange?: (area: CropArea) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onSeek?: (time: number) => void;
  t: (key: string) => string;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoUrl,
  metadata,
  cropArea,
  trimRange,
  showCropOverlay,
  showTrimOverlay,
  thumbnailTime,
  onFileSelect,
  onCropAreaChange,
  onTimeUpdate,
  onSeek,
  t,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [showMobileWarning, setShowMobileWarning] = React.useState(false);

  // Crop dragging state
  const [cropDragState, setCropDragState] = React.useState<{
    isDragging: boolean;
    handle: string | null;
    startX: number;
    startY: number;
    startCropArea: CropArea | null;
  }>({
    isDragging: false,
    handle: null,
    startX: 0,
    startY: 0,
    startCropArea: null,
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      checkFileAndLoad(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      checkFileAndLoad(file);
    }
  };

  const checkFileAndLoad = (file: File) => {
    // Check if mobile and file is large
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && file.size > MOBILE_WARNING_THRESHOLD) {
      setShowMobileWarning(true);
      // Still load the file, but show warning
    }
    onFileSelect(file);
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    onTimeUpdate?.(videoRef.current.currentTime);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !metadata || !videoRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * metadata.duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    onSeek?.(newTime);
  };

  // Seek to thumbnail time when it changes
  React.useEffect(() => {
    if (thumbnailTime !== null && videoRef.current) {
      videoRef.current.currentTime = thumbnailTime;
    }
  }, [thumbnailTime]);

  // Calculate trim overlay position
  const getTrimOverlayStyle = () => {
    if (!trimRange || !metadata) return { left: '0%', right: '0%' };
    return {
      left: `${(trimRange.start / metadata.duration) * 100}%`,
      right: `${100 - (trimRange.end / metadata.duration) * 100}%`,
    };
  };

  // Calculate crop overlay position as percentage
  const getCropOverlayStyle = () => {
    if (!cropArea || !metadata) return {};

    return {
      left: `${(cropArea.x / metadata.width) * 100}%`,
      top: `${(cropArea.y / metadata.height) * 100}%`,
      width: `${(cropArea.width / metadata.width) * 100}%`,
      height: `${(cropArea.height / metadata.height) * 100}%`,
    };
  };

  // Handle crop mouse down
  const handleCropMouseDown = (e: React.MouseEvent, handle?: string) => {
    if (!cropArea || !metadata || !onCropAreaChange) return;
    e.preventDefault();
    e.stopPropagation();

    setCropDragState({
      isDragging: true,
      handle: handle || 'move',
      startX: e.clientX,
      startY: e.clientY,
      startCropArea: { ...cropArea },
    });
  };

  // Handle crop mouse move
  const handleCropMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!cropDragState.isDragging || !cropDragState.startCropArea || !metadata || !videoContainerRef.current || !onCropAreaChange) return;

      const videoElement = videoRef.current;
      if (!videoElement) return;

      const videoRect = videoElement.getBoundingClientRect();

      // Calculate scale between displayed video and actual video dimensions
      const scaleX = metadata.width / videoRect.width;
      const scaleY = metadata.height / videoRect.height;

      const deltaX = (e.clientX - cropDragState.startX) * scaleX;
      const deltaY = (e.clientY - cropDragState.startY) * scaleY;

      const startArea = cropDragState.startCropArea;
      const newCropArea = { ...startArea };

      if (cropDragState.handle === 'move') {
        // Move the entire crop area
        newCropArea.x = Math.max(0, Math.min(metadata.width - startArea.width, startArea.x + deltaX));
        newCropArea.y = Math.max(0, Math.min(metadata.height - startArea.height, startArea.y + deltaY));
      } else {
        // Resize based on handle
        const handle = cropDragState.handle;
        const minSize = 50;

        if (handle?.includes('w')) {
          const newX = Math.max(0, Math.min(startArea.x + startArea.width - minSize, startArea.x + deltaX));
          newCropArea.width = startArea.width - (newX - startArea.x);
          newCropArea.x = newX;
        }
        if (handle?.includes('e')) {
          newCropArea.width = Math.max(minSize, Math.min(metadata.width - startArea.x, startArea.width + deltaX));
        }
        if (handle?.includes('n')) {
          const newY = Math.max(0, Math.min(startArea.y + startArea.height - minSize, startArea.y + deltaY));
          newCropArea.height = startArea.height - (newY - startArea.y);
          newCropArea.y = newY;
        }
        if (handle?.includes('s')) {
          newCropArea.height = Math.max(minSize, Math.min(metadata.height - startArea.y, startArea.height + deltaY));
        }
      }

      onCropAreaChange(newCropArea);
    },
    [cropDragState, metadata, onCropAreaChange]
  );

  // Handle crop mouse up
  const handleCropMouseUp = React.useCallback(() => {
    setCropDragState({
      isDragging: false,
      handle: null,
      startX: 0,
      startY: 0,
      startCropArea: null,
    });
  }, []);

  // Add/remove global mouse event listeners for crop dragging
  React.useEffect(() => {
    if (cropDragState.isDragging) {
      window.addEventListener('mousemove', handleCropMouseMove);
      window.addEventListener('mouseup', handleCropMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCropMouseMove);
        window.removeEventListener('mouseup', handleCropMouseUp);
      };
    }
  }, [cropDragState.isDragging, handleCropMouseMove, handleCropMouseUp]);

  // Get dark overlay clip path (darkens area outside crop)
  const getDarkOverlayClipPath = () => {
    if (!cropArea || !metadata) return undefined;
    const left = (cropArea.x / metadata.width) * 100;
    const top = (cropArea.y / metadata.height) * 100;
    const right = ((cropArea.x + cropArea.width) / metadata.width) * 100;
    const bottom = ((cropArea.y + cropArea.height) / metadata.height) * 100;

    // Polygon that covers entire area EXCEPT the crop rectangle
    return `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${left}% ${top}%, ${left}% ${bottom}%, ${right}% ${bottom}%, ${right}% ${top}%, ${left}% ${top}%)`;
  };

  if (!videoUrl) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'w-full h-64 md:h-96',
          'border-2 border-dashed rounded-lg transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        )}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleFileInputChange}
          className="hidden"
          id="video-studio-file-input"
        />
        <label
          htmlFor="video-studio-file-input"
          className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
        >
          <Upload className="w-12 h-12 mb-4 text-gray-400 dark:text-gray-500" />
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tool.videoStudio.dropVideoHere')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('tool.videoStudio.supportedFormats')}
          </p>
        </label>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Hidden file input for replacing video */}
      <input
        type="file"
        accept="video/*"
        onChange={handleFileInputChange}
        className="hidden"
        id="video-studio-replace-input"
      />

      {/* Mobile Warning */}
      {showMobileWarning && (
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-3 py-2 bg-amber-500 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{t('tool.videoStudio.mobileWarning')}</span>
          <button
            onClick={() => setShowMobileWarning(false)}
            className="ml-auto font-medium hover:underline"
          >
            {t('common.close')}
          </button>
        </div>
      )}

      {/* Replace video button */}
      <label
        htmlFor="video-studio-replace-input"
        className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-black/60 hover:bg-black/80 text-white rounded cursor-pointer transition-colors"
      >
        <Upload className="w-3.5 h-3.5" />
        {t('common.changeFile')}
      </label>

      {/* Metadata display */}
      {metadata && (
        <div className="absolute top-2 right-2 z-10 px-2 py-1 text-xs bg-black/60 text-white rounded">
          {metadata.width} × {metadata.height} • {formatTime(metadata.duration)}
        </div>
      )}

      {/* Video container */}
      <div ref={videoContainerRef} className="relative flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoUrl}
          className="max-w-full max-h-[50vh] object-contain"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onClick={handlePlayPause}
        />

        {/* Crop overlay */}
        {showCropOverlay && cropArea && metadata && (
          <>
            {/* Darkened area outside crop (using clip-path) */}
            <div
              className="absolute inset-0 bg-black/50 pointer-events-none"
              style={{ clipPath: getDarkOverlayClipPath() }}
            />
            {/* Crop selection area - interactive */}
            <div
              className={cn(
                'absolute border-2 border-white bg-transparent',
                onCropAreaChange ? 'cursor-move' : 'pointer-events-none'
              )}
              style={getCropOverlayStyle()}
              onMouseDown={(e) => handleCropMouseDown(e)}
            >
              {/* Grid lines */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/50" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/50" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/50" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/50" />
              </div>

              {/* Resize handles */}
              {onCropAreaChange && ['nw', 'ne', 'sw', 'se'].map((handle) => (
                <div
                  key={handle}
                  className={cn(
                    'absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-sm',
                    handle === 'nw' && '-left-2 -top-2 cursor-nw-resize',
                    handle === 'ne' && '-right-2 -top-2 cursor-ne-resize',
                    handle === 'sw' && '-left-2 -bottom-2 cursor-sw-resize',
                    handle === 'se' && '-right-2 -bottom-2 cursor-se-resize'
                  )}
                  onMouseDown={(e) => handleCropMouseDown(e, handle)}
                />
              ))}

              {/* Crop dimensions display */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs bg-black/80 text-white rounded whitespace-nowrap">
                {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
              </div>
            </div>
          </>
        )}

      </div>

      {/* Controls */}
      <div className="px-4 py-3 bg-gray-800">
        {/* Timeline */}
        <div
          ref={timelineRef}
          className="relative h-2 bg-gray-600 rounded-full cursor-pointer mb-3"
          onClick={handleTimelineClick}
        >
          {/* Trim overlay on timeline */}
          {showTrimOverlay && trimRange && (
            <>
              <div
                className="absolute top-0 bottom-0 bg-gray-800/80 rounded-l-full"
                style={{ left: 0, width: getTrimOverlayStyle().left }}
              />
              <div
                className="absolute top-0 bottom-0 bg-gray-800/80 rounded-r-full"
                style={{ right: 0, width: getTrimOverlayStyle().right }}
              />
              <div
                className="absolute top-0 bottom-0 bg-blue-500/30"
                style={{
                  left: getTrimOverlayStyle().left,
                  right: getTrimOverlayStyle().right,
                }}
              />
            </>
          )}

          {/* Progress bar */}
          <div
            className="absolute top-0 bottom-0 bg-blue-500 rounded-full"
            style={{ width: `${metadata ? (currentTime / metadata.duration) * 100 : 0}%` }}
          />

          {/* Playhead */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"
            style={{ left: `calc(${metadata ? (currentTime / metadata.duration) * 100 : 0}% - 6px)` }}
          />

          {/* Thumbnail marker */}
          {thumbnailTime !== null && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-yellow-400 rounded-sm"
              style={{ left: `calc(${metadata ? (thumbnailTime / metadata.duration) * 100 : 0}% - 4px)` }}
              title={`Thumbnail: ${formatTime(thumbnailTime)}`}
            />
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={handleMuteToggle}
              className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          <div className="text-sm text-white font-mono">
            {formatTime(currentTime)} / {formatTime(metadata?.duration || 0)}
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 border-2 border-dashed border-blue-500">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {t('tool.videoStudio.dropToReplace')}
          </p>
        </div>
      )}
    </div>
  );
};

