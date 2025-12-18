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
  onTimeUpdate,
  onSeek,
  t,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [showMobileWarning, setShowMobileWarning] = React.useState(false);

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

  if (!videoUrl) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center w-full h-64 md:h-96',
          'border-2 border-dashed rounded-lg transition-colors cursor-pointer',
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
          className="flex flex-col items-center cursor-pointer"
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

      {/* Metadata display */}
      {metadata && (
        <div className="absolute top-2 right-2 z-10 px-2 py-1 text-xs bg-black/60 text-white rounded">
          {metadata.width} × {metadata.height} • {formatTime(metadata.duration)}
        </div>
      )}

      {/* Video container */}
      <div className="relative flex items-center justify-center">
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
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />
            <div
              className="absolute border-2 border-white bg-transparent pointer-events-none"
              style={getCropOverlayStyle()}
            >
              {/* Grid lines */}
              <div className="absolute inset-0">
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/50" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/50" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/50" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/50" />
              </div>
            </div>
          </>
        )}

        {/* Play button overlay */}
        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-white/90 rounded-full">
              <Play className="w-8 h-8 text-gray-900 ml-1" />
            </div>
          </button>
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

