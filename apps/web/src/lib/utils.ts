import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detect if the current device is mobile
 * Checks user agent and screen width
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as { opera?: string }).opera || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Check screen width (mobile breakpoint is typically 768px)
  const isMobileScreen = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  
  return isMobileUA || isMobileScreen;
}

