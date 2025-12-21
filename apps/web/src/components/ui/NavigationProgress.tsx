import React from 'react';
import { useNavigationProgress } from '@/hooks/useNavigationProgress';
import { cn } from '@/lib/utils';

// Delay before showing progress bar (ms)
// Must match the value in useNavigationProgress
const SHOW_DELAY_MS = 250;

/**
 * NProgress-style navigation progress bar.
 * 
 * Key features:
 * - Uses transform: scaleX() instead of width for GPU-accelerated animation
 * - GPU animations run on compositor thread, NOT blocked by JS main thread
 * - CSS animation-delay handles the 250ms delay (also not blocked)
 * - If navigation completes within 250ms, nothing is shown
 */
export const NavigationProgress: React.FC = () => {
  const { state, wasShown } = useNavigationProgress();

  // Don't render anything if idle, or if completing but was never actually shown
  if (state === 'idle') {
    return null;
  }
  
  if (state === 'completing' && !wasShown) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes nprogress-fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* GPU-accelerated progress using scaleX transform */
        @keyframes nprogress-scale {
          0% { transform: scaleX(0); }
          10% { transform: scaleX(0.3); }
          30% { transform: scaleX(0.5); }
          50% { transform: scaleX(0.65); }
          70% { transform: scaleX(0.78); }
          85% { transform: scaleX(0.86); }
          100% { transform: scaleX(0.9); }
        }
        
        @keyframes nprogress-complete {
          from { transform: scaleX(1); }
          to { transform: scaleX(1); }
        }
        
        @keyframes nprogress-fadeout {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes shimmer-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .nprogress-bar {
          transform-origin: left center;
          will-change: transform, opacity;
        }
        
        .nprogress-shimmer {
          will-change: transform;
        }
      `}</style>

      {/* Container */}
      <div
        className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
        style={{
          opacity: 0,
          animation: state === 'loading'
            ? `nprogress-fadein 0.15s ease-out ${SHOW_DELAY_MS}ms forwards`
            : state === 'completing'
              ? 'nprogress-fadeout 0.2s ease-out forwards'
              : undefined,
        }}
      >
        {/* Progress bar - uses scaleX for GPU acceleration */}
        <div
          className={cn(
            'nprogress-bar h-full',
            'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600',
            'shadow-[0_0_10px_rgba(59,130,246,0.7),0_0_5px_rgba(59,130,246,0.5)]'
          )}
          style={{
            transformOrigin: 'left center',
            transform: 'scaleX(0)',
            // Just keep the current animation state, container handles fade out
            animation: state === 'loading'
              ? `nprogress-scale 12s cubic-bezier(0.25, 0.1, 0.25, 1) ${SHOW_DELAY_MS}ms forwards`
              : state === 'completing'
                ? `nprogress-scale 12s cubic-bezier(0.25, 0.1, 0.25, 1) ${SHOW_DELAY_MS}ms forwards`
                : undefined,
            // Pause animation on completing to freeze current position
            animationPlayState: state === 'completing' ? 'paused' : 'running',
          }}
        />
        
        {/* Shimmer effect - also GPU accelerated */}
        <div className="absolute top-0 left-0 h-full w-full overflow-hidden">
          <div
            className="nprogress-shimmer h-full w-[25%] bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{
              animation: 'shimmer-move 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Pulse dot at the right edge */}
        <div
          className="absolute top-0 right-0 h-full w-[100px] pointer-events-none"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.3))',
          }}
        />
      </div>

      {/* Spinner (separate element, always visible during loading) */}
      {state === 'loading' && (
        <div
          className="fixed top-2 right-2 z-[9999] pointer-events-none"
          style={{
            opacity: 0,
            animation: `nprogress-fadein 0.15s ease-out ${SHOW_DELAY_MS}ms forwards`,
          }}
        >
          <div
            className="w-4 h-4"
            style={{ animation: 'spin 0.8s linear infinite' }}
          >
            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      )}
    </>
  );
};
