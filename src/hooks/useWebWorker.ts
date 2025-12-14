import { useState, useEffect, useRef, useMemo } from 'react';

interface UseWebWorkerOptions<TRequest, TResponse> {
  workerUrl: string | (() => Worker);
  shouldUseWorker: boolean;
  request: TRequest | null;
  onMessage?: (response: TResponse) => void;
  onError?: (error: Error) => void;
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
}: UseWebWorkerOptions<TRequest, TResponse>): UseWebWorkerResult<TResponse> {
  const [result, setResult] = useState<TResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Worker 지원 여부 확인
  const isWorkerSupported = useMemo(() => typeof Worker !== 'undefined', []);

  // Worker 생성
  useEffect(() => {
    if (!shouldUseWorker || !isWorkerSupported || !request) {
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setError(null);

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
    const handleMessage = (e: MessageEvent<TResponse & { success?: boolean; error?: string }>) => {
      const data = e.data as TResponse & { success?: boolean; error?: string };
      
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
      const errorMessage = e.message || 'Worker error occurred';
      setError(errorMessage);
      setResult(null);
      setIsProcessing(false);
      onError?.(new Error(errorMessage));
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    // Worker에 요청 전송
    worker.postMessage(request);

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
    };
  }, [shouldUseWorker, isWorkerSupported, request, workerUrl, onMessage, onError]);

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

