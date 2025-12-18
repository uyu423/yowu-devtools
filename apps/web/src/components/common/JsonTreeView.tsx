/**
 * JsonTreeView - Reusable JSON tree viewer with collapsible nodes
 * Shared between JSON Viewer tool and API Tester response viewer
 */

import React, { useCallback } from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * Main JsonTreeView component
 */
export const JsonTreeView: React.FC<{
  data: unknown;
  expandLevel: number | typeof Infinity;
  isDark: boolean;
}> = React.memo(({ data, expandLevel, isDark }) => {
  return (
    <JsonNode
      data={data}
      depth={0}
      expandLevel={expandLevel}
      isDark={isDark}
      isLast={true}
    />
  );
});
JsonTreeView.displayName = 'JsonTreeView';

/**
 * Recursive JSON Node component with URL link support and collapse/expand functionality
 */
const JsonNode: React.FC<{
  data: unknown;
  depth: number;
  expandLevel: number | typeof Infinity;
  isDark: boolean;
  fieldName?: string;
  isLast?: boolean;
}> = React.memo(({ data, depth, expandLevel, isDark, fieldName, isLast = false }) => {
  const [isExpanded, setIsExpanded] = React.useState(() => 
    expandLevel === Infinity || depth < expandLevel
  );

  // Update expanded state when expandLevel changes
  React.useEffect(() => {
    setIsExpanded(expandLevel === Infinity || depth < expandLevel);
  }, [expandLevel, depth]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const indent = depth * 16;

  // Null value
  if (data === null) {
    return (
      <div className="flex items-start" style={{ paddingLeft: indent }}>
        {fieldName !== undefined && (
          <>
            <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        <span className="text-gray-500 dark:text-gray-400">null</span>
        {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
      </div>
    );
  }

  // Undefined value
  if (data === undefined) {
    return (
      <div className="flex items-start" style={{ paddingLeft: indent }}>
        {fieldName !== undefined && (
          <>
            <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        <span className="text-gray-500 dark:text-gray-400">undefined</span>
        {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
      </div>
    );
  }

  // String value with URL detection
  if (typeof data === 'string') {
    const isUrl = /^https?:\/\//i.test(data);
    return (
      <div className="flex items-start flex-wrap" style={{ paddingLeft: indent }}>
        {fieldName !== undefined && (
          <>
            <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        {isUrl ? (
          <a
            href={data}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            "{data}"
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        ) : (
          <span className={`break-all ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            "{data}"
          </span>
        )}
        {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
      </div>
    );
  }

  // Number value
  if (typeof data === 'number') {
    return (
      <div className="flex items-start" style={{ paddingLeft: indent }}>
        {fieldName !== undefined && (
          <>
            <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>{data}</span>
        {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
      </div>
    );
  }

  // Boolean value
  if (typeof data === 'boolean') {
    return (
      <div className="flex items-start" style={{ paddingLeft: indent }}>
        {fieldName !== undefined && (
          <>
            <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>{data.toString()}</span>
        {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
      </div>
    );
  }

  // Array value
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <div className="flex items-start" style={{ paddingLeft: indent }}>
          {fieldName !== undefined && (
            <>
              <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
              <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
            </>
          )}
          <span className="text-gray-600 dark:text-gray-300">[]</span>
          {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
        </div>
      );
    }

    return (
      <div>
        <div
          className="flex items-start cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded"
          style={{ paddingLeft: indent }}
          onClick={toggleExpand}
        >
          <span className="text-gray-500 dark:text-gray-400 select-none mr-1 w-3 inline-block">
            {isExpanded ? '▾' : '▸'}
          </span>
          {fieldName !== undefined && (
            <>
              <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
              <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
            </>
          )}
          <span className="text-gray-600 dark:text-gray-300">[</span>
          {!isExpanded && (
            <>
              <span className="text-gray-500 dark:text-gray-400 mx-1">...</span>
              <span className="text-gray-600 dark:text-gray-300">]</span>
              <span className="text-gray-400 dark:text-gray-500 ml-1 text-xs">
                ({data.length} items)
              </span>
              {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
            </>
          )}
        </div>
        {isExpanded && (
          <>
            {data.map((item, index) => (
              <JsonNode
                key={index}
                data={item}
                depth={depth + 1}
                expandLevel={expandLevel}
                isDark={isDark}
                isLast={index === data.length - 1}
              />
            ))}
            <div style={{ paddingLeft: indent }}>
              <span className="text-gray-600 dark:text-gray-300 ml-4">]</span>
              {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
            </div>
          </>
        )}
      </div>
    );
  }

  // Object value
  if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return (
        <div className="flex items-start" style={{ paddingLeft: indent }}>
          {fieldName !== undefined && (
            <>
              <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
              <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
            </>
          )}
          <span className="text-gray-600 dark:text-gray-300">{'{}'}</span>
          {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
        </div>
      );
    }

    return (
      <div>
        <div
          className="flex items-start cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded"
          style={{ paddingLeft: indent }}
          onClick={toggleExpand}
        >
          <span className="text-gray-500 dark:text-gray-400 select-none mr-1 w-3 inline-block">
            {isExpanded ? '▾' : '▸'}
          </span>
          {fieldName !== undefined && (
            <>
              <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
              <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
            </>
          )}
          <span className="text-gray-600 dark:text-gray-300">{'{'}</span>
          {!isExpanded && (
            <>
              <span className="text-gray-500 dark:text-gray-400 mx-1">...</span>
              <span className="text-gray-600 dark:text-gray-300">{'}'}</span>
              <span className="text-gray-400 dark:text-gray-500 ml-1 text-xs">
                ({entries.length} keys)
              </span>
              {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
            </>
          )}
        </div>
        {isExpanded && (
          <>
            {entries.map(([key, value], index) => (
              <JsonNode
                key={key}
                data={value}
                depth={depth + 1}
                expandLevel={expandLevel}
                isDark={isDark}
                fieldName={key}
                isLast={index === entries.length - 1}
              />
            ))}
            <div style={{ paddingLeft: indent }}>
              <span className="text-gray-600 dark:text-gray-300 ml-4">{'}'}</span>
              {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
            </div>
          </>
        )}
      </div>
    );
  }

  // Other values
  return (
    <div className="flex items-start" style={{ paddingLeft: indent }}>
      {fieldName !== undefined && (
        <>
          <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
          <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
        </>
      )}
      <span className="text-gray-600 dark:text-gray-300">{String(data)}</span>
      {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
    </div>
  );
});
JsonNode.displayName = 'JsonNode';

