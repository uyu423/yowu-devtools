/**
 * Cron Parser Types (v1.3.2)
 *
 * Supports multiple cron dialects/specs:
 * - UNIX/Vixie: Standard 5-field cron
 * - UNIX + Seconds: 6-field with seconds
 * - Quartz: 6-7 field with advanced operators (? L W #)
 * - AWS EventBridge: cron(...) wrapper with year field
 * - Kubernetes CronJob: Macros (@hourly, @daily, etc.)
 * - Jenkins: H hash token and aliases
 */

/**
 * Cron specification/dialect types
 */
export type CronSpec =
  | 'auto'
  | 'unix'
  | 'unix-seconds'
  | 'quartz'
  | 'aws'
  | 'k8s'
  | 'jenkins';

/**
 * Cron tool state (v1.3.2)
 */
export interface CronToolState {
  /** Cron expression input */
  expression: string;
  /** Cron spec/dialect (default: 'auto') */
  spec: CronSpec;
  /** Include seconds field (6-field format) - synced with spec */
  hasSeconds: boolean;
  /** Timezone for calculations */
  timezone: 'local' | 'utc';
  /** Number of next runs to display */
  nextCount: 10 | 20 | 50;
  /** Base datetime for next runs calculation (ISO string, default: now) */
  fromDateTime?: string;
}

/**
 * Default state for Cron tool
 */
export const DEFAULT_CRON_STATE: CronToolState = {
  expression: '*/5 * * * *',
  spec: 'auto',
  hasSeconds: false,
  timezone: 'local',
  nextCount: 10,
  fromDateTime: undefined,
};

/**
 * Cron field types
 */
export type CronFieldType =
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'dayOfMonth'
  | 'month'
  | 'dayOfWeek'
  | 'year';

/**
 * Parsed cron field with metadata
 */
export interface ParsedCronField {
  /** Field type */
  type: CronFieldType;
  /** Original raw value */
  raw: string;
  /** Human-readable description */
  description: string;
  /** Whether this field uses spec-specific tokens */
  hasSpecialTokens: boolean;
  /** Special tokens found in this field */
  specialTokens: SpecialToken[];
  /** Start position in original expression */
  startPos: number;
  /** End position in original expression */
  endPos: number;
}

/**
 * Special tokens used in various cron specs
 */
export type SpecialToken = {
  /** Token symbol */
  symbol: string;
  /** Supported specs */
  supportedSpecs: CronSpec[];
  /** Description */
  description: string;
};

/**
 * Special tokens registry
 */
export const SPECIAL_TOKENS: Record<string, SpecialToken> = {
  '?': {
    symbol: '?',
    supportedSpecs: ['quartz', 'aws'],
    description: 'No specific value (placeholder)',
  },
  L: {
    symbol: 'L',
    supportedSpecs: ['quartz', 'aws'],
    description: 'Last day of month/week',
  },
  W: {
    symbol: 'W',
    supportedSpecs: ['quartz', 'aws'],
    description: 'Nearest weekday',
  },
  '#': {
    symbol: '#',
    supportedSpecs: ['quartz', 'aws'],
    description: 'Nth weekday of month (e.g., 2#1 = first Monday)',
  },
  H: {
    symbol: 'H',
    supportedSpecs: ['jenkins'],
    description: 'Hash-based value for load distribution',
  },
};

/**
 * Cron macros (K8s style)
 */
export const CRON_MACROS: Record<
  string,
  { expression: string; description: string }
> = {
  '@yearly': { expression: '0 0 1 1 *', description: 'Run once a year' },
  '@annually': { expression: '0 0 1 1 *', description: 'Run once a year' },
  '@monthly': { expression: '0 0 1 * *', description: 'Run once a month' },
  '@weekly': { expression: '0 0 * * 0', description: 'Run once a week' },
  '@daily': { expression: '0 0 * * *', description: 'Run once a day' },
  '@midnight': { expression: '0 0 * * *', description: 'Run once a day' },
  '@hourly': { expression: '0 * * * *', description: 'Run once an hour' },
};

/**
 * Spec information with metadata
 */
export interface CronSpecInfo {
  id: CronSpec;
  name: string;
  description: string;
  fieldCount: number | [number, number]; // exact or range
  specialTokens: string[];
  domDowRule: 'or' | 'and' | 'exclusive'; // DOM/DOW semantics
}

/**
 * Cron spec definitions
 */
export const CRON_SPECS: Record<CronSpec, CronSpecInfo> = {
  auto: {
    id: 'auto',
    name: 'Auto Detect',
    description: 'Automatically detect the cron format',
    fieldCount: [5, 7],
    specialTokens: [],
    domDowRule: 'or',
  },
  unix: {
    id: 'unix',
    name: 'UNIX/Vixie',
    description: 'Standard 5-field cron (minute hour dom month dow)',
    fieldCount: 5,
    specialTokens: [],
    domDowRule: 'or', // UNIX uses OR when both are restricted
  },
  'unix-seconds': {
    id: 'unix-seconds',
    name: 'UNIX + Seconds',
    description: '6-field cron with seconds (second minute hour dom month dow)',
    fieldCount: 6,
    specialTokens: [],
    domDowRule: 'or',
  },
  quartz: {
    id: 'quartz',
    name: 'Quartz',
    description: 'Quartz Scheduler format (6-7 fields, supports ? L W #)',
    fieldCount: [6, 7],
    specialTokens: ['?', 'L', 'W', '#'],
    domDowRule: 'exclusive', // Must use ? in one of DOM/DOW
  },
  aws: {
    id: 'aws',
    name: 'AWS EventBridge',
    description: 'AWS cron format with cron(...) wrapper and year field',
    fieldCount: 6,
    specialTokens: ['?', 'L', 'W'],
    domDowRule: 'exclusive', // Cannot use * in both DOM and DOW
  },
  k8s: {
    id: 'k8s',
    name: 'Kubernetes',
    description: 'Kubernetes CronJob format (supports @hourly, @daily macros)',
    fieldCount: 5,
    specialTokens: [],
    domDowRule: 'or',
  },
  jenkins: {
    id: 'jenkins',
    name: 'Jenkins',
    description: 'Jenkins Pipeline cron with H hash token',
    fieldCount: 5,
    specialTokens: ['H'],
    domDowRule: 'or',
  },
};

/**
 * Parsed cron result
 */
export interface ParsedCronResult {
  /** Whether parsing was successful */
  success: boolean;
  /** Detected or specified spec */
  detectedSpec: CronSpec;
  /** Normalized expression (wrapper removed, whitespace trimmed) */
  normalized: string;
  /** AWS format if applicable */
  awsFormat?: string;
  /** Parsed fields */
  fields: ParsedCronField[];
  /** Human-readable description */
  description: string;
  /** Next scheduled runs */
  nextRuns: Date[];
  /** Error message if parsing failed */
  error?: string;
  /** Warnings (e.g., DOM/DOW OR rule, spec-specific notes) */
  warnings: CronWarning[];
}

/**
 * Warning types for cron parsing
 */
export interface CronWarning {
  type:
    | 'dom-dow-or'
    | 'dom-dow-exclusive'
    | 'jenkins-hash'
    | 'aws-tz'
    | 'k8s-tz'
    | 'unknown-token';
  message: string;
  field?: CronFieldType;
}

/**
 * Field order for different specs
 */
export const FIELD_ORDER: Record<CronSpec, CronFieldType[]> = {
  auto: ['minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek'],
  unix: ['minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek'],
  'unix-seconds': [
    'seconds',
    'minutes',
    'hours',
    'dayOfMonth',
    'month',
    'dayOfWeek',
  ],
  quartz: [
    'seconds',
    'minutes',
    'hours',
    'dayOfMonth',
    'month',
    'dayOfWeek',
    'year',
  ],
  aws: [
    'minutes',
    'hours',
    'dayOfMonth',
    'month',
    'dayOfWeek',
    'year',
  ],
  k8s: ['minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek'],
  jenkins: ['minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek'],
};

