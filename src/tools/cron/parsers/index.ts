/**
 * Cron Parser Utilities (v1.3.2)
 *
 * Main entry point for cron parsing with multi-spec support.
 */

import type {
  CronSpec,
  ParsedCronResult,
  ParsedCronField,
  CronFieldType,
  CronWarning,
} from '../types';
import { CRON_MACROS, CRON_SPECS, FIELD_ORDER, SPECIAL_TOKENS } from '../types';

/**
 * Normalize cron expression by removing wrappers and trimming whitespace
 */
export function normalizeCronExpression(expression: string): {
  normalized: string;
  isAwsWrapper: boolean;
  isJenkinsPipeline: boolean;
} {
  let normalized = expression.trim();
  let isAwsWrapper = false;
  let isJenkinsPipeline = false;

  // Check for AWS EventBridge wrapper: cron(...) or cron('...') or cron("...")
  const awsWrapperMatch = normalized.match(
    /^cron\s*\(\s*(['"])?(.+?)\1?\s*\)$/i
  );
  if (awsWrapperMatch) {
    normalized = awsWrapperMatch[2].trim();
    isAwsWrapper = true;
  }

  // Check for Jenkins Pipeline string wrapper: cron('...') or cron("...")
  // This is already handled above, but we track if it had quotes
  if (expression.match(/cron\s*\(\s*['"]/i)) {
    isJenkinsPipeline = true;
  }

  // Remove any surrounding quotes (sometimes copy-pasted)
  normalized = normalized.replace(/^['"]|['"]$/g, '');

  return { normalized, isAwsWrapper, isJenkinsPipeline };
}

/**
 * Detect cron spec from expression
 */
export function detectCronSpec(expression: string): CronSpec {
  const { normalized, isAwsWrapper } = normalizeCronExpression(expression);

  // AWS wrapper detected
  if (isAwsWrapper) {
    return 'aws';
  }

  // Check for K8s macros
  if (normalized.startsWith('@')) {
    const macro = normalized.toLowerCase();
    if (CRON_MACROS[macro]) {
      return 'k8s';
    }
  }

  // Check for Jenkins H token
  if (/\bH\b|\bH\s*\(/.test(normalized)) {
    return 'jenkins';
  }

  // Split into fields
  const fields = normalized.split(/\s+/);
  const fieldCount = fields.length;

  // Check for Quartz/AWS special tokens
  const hasQuestionMark = fields.some((f) => f.includes('?'));
  const hasLWHash = fields.some(
    (f) => /\bL\b/.test(f) || /\bW\b/.test(f) || /#/.test(f)
  );

  // Quartz: 6-7 fields with ? or L/W/#
  if (fieldCount >= 6 && (hasQuestionMark || hasLWHash)) {
    return 'quartz';
  }

  // AWS: 6 fields (no wrapper but has ? or year field patterns)
  if (fieldCount === 6 && hasQuestionMark) {
    return 'aws';
  }

  // Based on field count
  if (fieldCount === 6) {
    // Could be unix-seconds or quartz without special tokens
    // Default to unix-seconds for 6 fields without special tokens
    return 'unix-seconds';
  }

  if (fieldCount === 7) {
    return 'quartz';
  }

  // Default to unix for 5 fields
  return 'unix';
}

/**
 * Get field order for a spec
 */
export function getFieldOrder(spec: CronSpec, fieldCount: number): CronFieldType[] {
  const baseOrder = FIELD_ORDER[spec] || FIELD_ORDER.unix;
  
  // Adjust for actual field count
  if (spec === 'auto') {
    if (fieldCount === 5) return FIELD_ORDER.unix;
    if (fieldCount === 6) return FIELD_ORDER['unix-seconds'];
    if (fieldCount === 7) return FIELD_ORDER.quartz;
  }
  
  return baseOrder.slice(0, fieldCount);
}

/**
 * Parse individual cron field
 */
export function parseField(
  value: string,
  type: CronFieldType,
  spec: CronSpec,
  startPos: number
): ParsedCronField {
  const specialTokens: { symbol: string; supportedSpecs: CronSpec[]; description: string }[] = [];
  let hasSpecialTokens = false;

  // Check for special tokens
  for (const [symbol, tokenInfo] of Object.entries(SPECIAL_TOKENS)) {
    if (value.includes(symbol)) {
      specialTokens.push(tokenInfo);
      hasSpecialTokens = true;
    }
  }

  // Generate basic description
  let description = getFieldDescription(value, type);

  return {
    type,
    raw: value,
    description,
    hasSpecialTokens,
    specialTokens,
    startPos,
    endPos: startPos + value.length,
  };
}

/**
 * Get human-readable description for a field value
 */
function getFieldDescription(value: string, type: CronFieldType): string {
  if (value === '*') {
    return 'every';
  }
  if (value === '?') {
    return 'no specific value';
  }
  if (value.startsWith('*/')) {
    const interval = value.slice(2);
    return `every ${interval}`;
  }
  if (value.includes(',')) {
    return value.split(',').join(', ');
  }
  if (value.includes('-')) {
    const [start, end] = value.split('-');
    return `${start} through ${end}`;
  }
  if (value === 'L') {
    return type === 'dayOfMonth' ? 'last day of month' : 'last day of week';
  }
  if (value.includes('W')) {
    return `nearest weekday to ${value.replace('W', '')}`;
  }
  if (value.includes('#')) {
    const [day, nth] = value.split('#');
    return `${nth}th occurrence of day ${day}`;
  }
  if (value.includes('H')) {
    return 'hash-distributed value';
  }
  return value;
}

/**
 * Validate DOM/DOW constraints for Quartz and AWS
 */
export function validateDomDowConstraints(
  fields: ParsedCronField[],
  spec: CronSpec
): CronWarning[] {
  const warnings: CronWarning[] = [];
  
  const domField = fields.find((f) => f.type === 'dayOfMonth');
  const dowField = fields.find((f) => f.type === 'dayOfWeek');

  if (!domField || !dowField) return warnings;

  const specInfo = CRON_SPECS[spec];

  if (specInfo.domDowRule === 'exclusive') {
    // Quartz/AWS: Must use ? in one of DOM/DOW
    const domHasQuestion = domField.raw === '?';
    const dowHasQuestion = dowField.raw === '?';
    const domIsWildcard = domField.raw === '*';
    const dowIsWildcard = dowField.raw === '*';

    if (spec === 'aws') {
      // AWS: Cannot use * in both DOM and DOW
      if (domIsWildcard && dowIsWildcard) {
        warnings.push({
          type: 'dom-dow-exclusive',
          message: 'AWS EventBridge: Cannot use * in both day-of-month and day-of-week. Use ? in one field.',
        });
      }
    }

    if (spec === 'quartz') {
      // Quartz: Must use ? in one of DOM/DOW
      if (!domHasQuestion && !dowHasQuestion) {
        warnings.push({
          type: 'dom-dow-exclusive',
          message: 'Quartz: Must use ? in either day-of-month or day-of-week field.',
        });
      }
    }
  }

  if (specInfo.domDowRule === 'or') {
    // UNIX: If both DOM and DOW are restricted (not *), they use OR semantics
    const domIsRestricted = domField.raw !== '*';
    const dowIsRestricted = dowField.raw !== '*';

    if (domIsRestricted && dowIsRestricted) {
      warnings.push({
        type: 'dom-dow-or',
        message: 'UNIX cron: When both day-of-month and day-of-week are specified, they use OR semantics (runs if either matches).',
      });
    }
  }

  return warnings;
}

/**
 * Check for Jenkins H token warnings
 */
export function checkJenkinsWarnings(
  expression: string,
  spec: CronSpec
): CronWarning[] {
  const warnings: CronWarning[] = [];

  if (spec === 'jenkins' && expression.includes('H')) {
    // Check for short interval with H in DOM
    if (/H\/[1-3]\s/.test(expression) || /H\s/.test(expression)) {
      warnings.push({
        type: 'jenkins-hash',
        message: 'Jenkins H token: Short intervals (H/3 or less) in day-of-month may cause irregular execution at month boundaries.',
      });
    }
  }

  return warnings;
}

/**
 * Generate AWS format string
 */
export function toAwsFormat(normalized: string, spec: CronSpec): string | undefined {
  if (spec === 'aws' || spec === 'quartz') {
    // Ensure 6 fields for AWS
    const fields = normalized.split(/\s+/);
    if (fields.length === 5) {
      // Add year field
      return `cron(${normalized} *)`;
    }
    return `cron(${normalized})`;
  }
  return undefined;
}

/**
 * Expand K8s macro to standard cron expression
 */
export function expandMacro(expression: string): string | null {
  const macro = expression.trim().toLowerCase();
  const macroInfo = CRON_MACROS[macro];
  return macroInfo ? macroInfo.expression : null;
}

/**
 * Main parsing function
 */
export function parseCronExpression(
  expression: string,
  requestedSpec: CronSpec = 'auto'
): ParsedCronResult {
  try {
    const { normalized, isAwsWrapper } = normalizeCronExpression(expression);

    // Handle macros
    const expandedMacro = expandMacro(normalized);
    const effectiveExpression = expandedMacro || normalized;

    // Detect or use specified spec
    let detectedSpec: CronSpec;
    if (requestedSpec === 'auto') {
      detectedSpec = detectCronSpec(expression);
    } else {
      detectedSpec = requestedSpec;
    }

    // If AWS wrapper was detected, override spec
    if (isAwsWrapper && requestedSpec === 'auto') {
      detectedSpec = 'aws';
    }

    // Split into fields
    const fieldValues = effectiveExpression.split(/\s+/);
    const fieldCount = fieldValues.length;

    // Validate field count
    const specInfo = CRON_SPECS[detectedSpec];
    const expectedCount = specInfo.fieldCount;
    const minFields = Array.isArray(expectedCount) ? expectedCount[0] : expectedCount;
    const maxFields = Array.isArray(expectedCount) ? expectedCount[1] : expectedCount;

    if (fieldCount < minFields || fieldCount > maxFields) {
      return {
        success: false,
        detectedSpec,
        normalized: effectiveExpression,
        fields: [],
        description: '',
        nextRuns: [],
        error: `Expected ${minFields === maxFields ? minFields : `${minFields}-${maxFields}`} fields for ${specInfo.name}, but got ${fieldCount}.`,
        warnings: [],
      };
    }

    // Get field order
    const fieldOrder = getFieldOrder(detectedSpec, fieldCount);

    // Parse each field
    let position = 0;
    const fields: ParsedCronField[] = fieldValues.map((value, index) => {
      const field = parseField(value, fieldOrder[index], detectedSpec, position);
      position += value.length + 1; // +1 for space
      return field;
    });

    // Collect warnings
    const warnings: CronWarning[] = [
      ...validateDomDowConstraints(fields, detectedSpec),
      ...checkJenkinsWarnings(effectiveExpression, detectedSpec),
    ];

    // Generate AWS format if applicable
    const awsFormat = toAwsFormat(effectiveExpression, detectedSpec);

    return {
      success: true,
      detectedSpec,
      normalized: effectiveExpression,
      awsFormat,
      fields,
      description: '', // Will be filled by cronstrue
      nextRuns: [], // Will be filled by cron-parser
      warnings,
    };
  } catch (error) {
    return {
      success: false,
      detectedSpec: requestedSpec === 'auto' ? 'unix' : requestedSpec,
      normalized: expression,
      fields: [],
      description: '',
      nextRuns: [],
      error: (error as Error).message,
      warnings: [],
    };
  }
}

/**
 * Check if a spec supports a given special token
 */
export function isTokenSupported(token: string, spec: CronSpec): boolean {
  const tokenInfo = SPECIAL_TOKENS[token];
  if (!tokenInfo) return false;
  return tokenInfo.supportedSpecs.includes(spec);
}

/**
 * Get supported specs for a detected expression
 */
export function getSupportedSpecs(expression: string): CronSpec[] {
  const detectedSpec = detectCronSpec(expression);
  const { normalized } = normalizeCronExpression(expression);
  const fields = normalized.split(/\s+/);
  
  const supported: CronSpec[] = ['unix'];
  
  if (fields.length >= 6) {
    supported.push('unix-seconds', 'quartz');
  }
  
  if (fields.some(f => f.includes('?') || f.includes('L') || f.includes('W') || f.includes('#'))) {
    // Only Quartz and AWS support these
    return supported.filter(s => s === 'quartz' || s === 'aws');
  }
  
  if (fields.some(f => f.includes('H'))) {
    // Only Jenkins supports H
    return ['jenkins'];
  }
  
  // Add detected spec if not already included
  if (!supported.includes(detectedSpec)) {
    supported.push(detectedSpec);
  }
  
  return supported;
}

