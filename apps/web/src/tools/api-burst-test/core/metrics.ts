/**
 * Metrics calculation utilities for API Burst Test
 * 
 * Provides accurate percentile calculation, histogram generation,
 * and summary metrics computation.
 */

import type { LatencyMetrics, HistogramBucket } from '../types';
import { HARD_LIMITS } from '../types';

/**
 * Calculate percentile value from a sorted array
 * Uses linear interpolation for more accurate results
 */
export function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];
  
  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) {
    return sortedValues[lower];
  }
  
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

/**
 * Calculate all latency metrics from raw latency samples
 */
export function calculateLatencyMetrics(latencySamples: number[]): LatencyMetrics {
  if (latencySamples.length === 0) {
    return {
      avg: 0,
      min: 0,
      max: 0,
      p50: 0,
      p90: 0,
      p95: 0,
      p99: 0,
    };
  }
  
  // Sort samples for percentile calculation
  const sorted = [...latencySamples].sort((a, b) => a - b);
  
  // Calculate average
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const avg = sum / sorted.length;
  
  return {
    avg,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p50: calculatePercentile(sorted, 50),
    p90: calculatePercentile(sorted, 90),
    p95: calculatePercentile(sorted, 95),
    p99: calculatePercentile(sorted, 99),
  };
}

/**
 * Generate histogram buckets for latency distribution chart
 * Mimics hey CLI's histogram output style
 */
export function generateHistogramBuckets(
  latencySamples: number[],
  bucketCount: number = 10
): HistogramBucket[] {
  if (latencySamples.length === 0) {
    return [];
  }
  
  const sorted = [...latencySamples].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  // Handle edge case where all values are the same
  if (min === max) {
    return [{
      rangeStart: min,
      rangeEnd: max + 1,
      count: sorted.length,
      label: formatBucketLabel(min),
    }];
  }
  
  const bucketSize = (max - min) / bucketCount;
  const buckets: HistogramBucket[] = [];
  
  for (let i = 0; i < bucketCount; i++) {
    const rangeStart = min + i * bucketSize;
    const rangeEnd = min + (i + 1) * bucketSize;
    
    // Count samples in this bucket
    const count = sorted.filter(sample => {
      if (i === bucketCount - 1) {
        // Last bucket includes the max value
        return sample >= rangeStart && sample <= rangeEnd;
      }
      return sample >= rangeStart && sample < rangeEnd;
    }).length;
    
    buckets.push({
      rangeStart,
      rangeEnd,
      count,
      label: formatBucketLabel(rangeStart),
    });
  }
  
  return buckets;
}

/**
 * Format bucket label for display (e.g., "0.000s", "1.234s")
 */
function formatBucketLabel(ms: number): string {
  const seconds = ms / 1000;
  return `${seconds.toFixed(3)}s`;
}

/**
 * Calculate requests per second (RPS)
 */
export function calculateRps(requestCount: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  return requestCount / (durationMs / 1000);
}

/**
 * Reservoir sampling for memory-efficient sample storage
 * Keeps a representative sample of at most maxSize items
 */
export class ReservoirSampler {
  private samples: number[] = [];
  private count: number = 0;
  private readonly maxSize: number;
  
  constructor(maxSize: number = HARD_LIMITS.MAX_SAMPLES) {
    this.maxSize = maxSize;
  }
  
  /**
   * Add a sample using reservoir sampling algorithm
   */
  add(value: number): void {
    this.count++;
    
    if (this.samples.length < this.maxSize) {
      this.samples.push(value);
    } else {
      // Reservoir sampling: replace with decreasing probability
      const index = Math.floor(Math.random() * this.count);
      if (index < this.maxSize) {
        this.samples[index] = value;
      }
    }
  }
  
  /**
   * Get all collected samples
   */
  getSamples(): number[] {
    return [...this.samples];
  }
  
  /**
   * Get the total count of items seen (may exceed maxSize)
   */
  getTotalCount(): number {
    return this.count;
  }
  
  /**
   * Reset the sampler
   */
  reset(): void {
    this.samples = [];
    this.count = 0;
  }
}

/**
 * Running statistics calculator for real-time metrics
 * Uses Welford's online algorithm for numerical stability
 */
export class RunningStats {
  private count: number = 0;
  private sum: number = 0;
  private min: number = Infinity;
  private max: number = -Infinity;
  private mean: number = 0;
  private m2: number = 0; // For variance calculation
  
  /**
   * Add a new value to the running statistics
   */
  add(value: number): void {
    this.count++;
    this.sum += value;
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);
    
    // Welford's algorithm for running mean and variance
    const delta = value - this.mean;
    this.mean += delta / this.count;
    const delta2 = value - this.mean;
    this.m2 += delta * delta2;
  }
  
  getCount(): number {
    return this.count;
  }
  
  getSum(): number {
    return this.sum;
  }
  
  getMean(): number {
    return this.count > 0 ? this.mean : 0;
  }
  
  getMin(): number {
    return this.count > 0 ? this.min : 0;
  }
  
  getMax(): number {
    return this.count > 0 ? this.max : 0;
  }
  
  getVariance(): number {
    return this.count > 1 ? this.m2 / (this.count - 1) : 0;
  }
  
  getStdDev(): number {
    return Math.sqrt(this.getVariance());
  }
  
  /**
   * Reset statistics
   */
  reset(): void {
    this.count = 0;
    this.sum = 0;
    this.min = Infinity;
    this.max = -Infinity;
    this.mean = 0;
    this.m2 = 0;
  }
}

