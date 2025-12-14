import { useState, useEffect, useRef, useMemo } from 'react';

interface UseWebWorkerOptions<TRequest, TResponse> {
  workerUrl: string | URL | (() => Worker);
  shouldUseWorker: boolean;
  request: TRequest | null;
  onMessage?: (response: TResponse) => void;
  onError?: (error: Error) => void;
  // Request ID for ensuring response order (v1.2.0)
  requestId?: number | string;
  // Timeout in milliseconds (default: 10000ms = 10 seconds)
  timeout?: number;
}

interface UseWebWorkerResult<TResponse> {
  result: TResponse | null;
  isProcessing: boolean;
  error: string | null;
}

/**
 * Web Worker를 사용하여 무거운 작업을 백그라운드에서 처리하는 커스텀 훅
 * 
 * @param options - Worker 설정 옵션
 * @returns Worker 처리 결과, 로딩 상태, 에러 정보
 * 
 * @example
 * ```tsx
 * const { result, isProcessing, error } = useWebWorker({
 *   workerUrl: new URL('../workers/json-parser.worker.ts', import.meta.url),
 *   shouldUseWorker: inputSize > 1_000_000,
 *   request: { input, indent, sortKeys },
 *   onMessage: (response) => console.log('Success:', response),
 *   onError: (error) => console.error('Error:', error),
 * });
 * ```
 */
export function useWebWorker<TRequest, TResponse>({
  workerUrl,
  shouldUseWorker,
  request,
  onMessage,
  onError,
  requestId,
  timeout = 10_000, // Default 10 seconds
}: UseWebWorkerOptions<TRequest, TResponse>): UseWebWorkerResult<TResponse> {
  // Worker 지원 여부 확인
  const isWorkerSupported = useMemo(() => typeof Worker !== 'undefined', []);

  const [result, setResult] = useState<TResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const currentRequestIdRef = useRef<number | string | undefined>(undefined);
  const timeoutRef = useRef<number | null>(null);

  // Worker 생성
  useEffect(() => {
    // Worker를 사용하지 않는 경우 처리하지 않음 (상태는 이미 false)
    if (!shouldUseWorker || !isWorkerSupported || !request) {
      return;
    }

    // Worker 시작 전 상태 설정 (필수)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsProcessing(true);
    setError(null);

    // Store current request ID
    const thisRequestId = requestId ?? Date.now();
    currentRequestIdRef.current = thisRequestId;

    // Worker 생성 (이미 있으면 재사용)
    if (!workerRef.current) {
      try {
        if (typeof workerUrl === 'function') {
          workerRef.current = workerUrl();
        } else {
          workerRef.current = new Worker(workerUrl, { type: 'module' });
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create worker');
        setError(error.message);
        setIsProcessing(false);
        onError?.(error);
        return;
      }
    }

    const worker = workerRef.current;

    // 메시지 핸들러
    const handleMessage = (e: MessageEvent<TResponse & { success?: boolean; error?: string; requestId?: number | string }>) => {
      const data = e.data as TResponse & { success?: boolean; error?: string; requestId?: number | string };
      
      // Check if this response is for the current request (prevent race conditions)
      const responseRequestId = data.requestId ?? undefined;
      if (responseRequestId !== undefined && responseRequestId !== currentRequestIdRef.current) {
        // This response is for an older request, ignore it
        return;
      }
      
      // 타임아웃 클리어 (성공적으로 응답 받음)
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (data.success === false || data.error) {
        const errorMessage = data.error || 'Unknown error occurred';
        setError(errorMessage);
        setResult(null);
        setIsProcessing(false);
        onError?.(new Error(errorMessage));
        return;
      }

      setResult(data as TResponse);
      setIsProcessing(false);
      onMessage?.(data as TResponse);
    };

    // 에러 핸들러
    const handleError = (e: ErrorEvent) => {
      // 타임아웃 클리어 (에러 발생 시)
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      const errorMessage = e.message || 'Worker error occurred';
      setError(errorMessage);
      setResult(null);
      setIsProcessing(false);
      onError?.(new Error(errorMessage));
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    // 타임아웃 설정
    timeoutRef.current = window.setTimeout(() => {
      // 타임아웃 발생 시 Worker 종료 및 에러 표시
      const timeoutError = `Processing timeout: The operation took longer than ${timeout / 1000} seconds and was cancelled. The input may be too large to process.`;
      setError(timeoutError);
      setResult(null);
      setIsProcessing(false);
      onError?.(new Error(timeoutError));
      
      // Worker 종료 (새 요청을 위해 재생성됨)
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    }, timeout);

    // Worker에 요청 전송 (requestId 포함)
    worker.postMessage({ ...request, requestId: thisRequestId });

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      // 타임아웃 클리어
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [shouldUseWorker, isWorkerSupported, request, requestId, timeout, workerUrl, onMessage, onError]);

  // Worker 정리
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return {
    result,
    isProcessing,
    error,
  };
}

/**
 * Worker 사용 여부를 결정하는 헬퍼 함수
 * 
 * @param size - 데이터 크기 (bytes)
 * @param lines - 줄 수
 * @param sizeThreshold - 크기 임계값 (기본값: 1MB)
 * @param linesThreshold - 줄 수 임계값 (기본값: 10,000)
 * @returns Worker 사용 여부
 */
export function shouldUseWorkerForData(
  size: number,
  lines: number,
  sizeThreshold: number = 1_000_000,
  linesThreshold: number = 10_000
): boolean {
  if (typeof Worker === 'undefined') {
    return false;
  }
  return size > sizeThreshold || lines > linesThreshold;
}

/**
 * 텍스트 데이터의 Worker 사용 여부를 결정하는 헬퍼 함수
 * 
 * @param text - 텍스트 데이터
 * @param sizeThreshold - 크기 임계값 (기본값: 1MB)
 * @param linesThreshold - 줄 수 임계값 (기본값: 10,000)
 * @returns Worker 사용 여부
 */
export function shouldUseWorkerForText(
  text: string,
  sizeThreshold: number = 1_000_000,
  linesThreshold: number = 10_000
): boolean {
  if (!text.trim() || typeof Worker === 'undefined') {
    return false;
  }
  const size = new Blob([text]).size;
  const lines = text.split('\n').length;
  return shouldUseWorkerForData(size, lines, sizeThreshold, linesThreshold);
}

