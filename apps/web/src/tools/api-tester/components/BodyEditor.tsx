/**
 * BodyEditor - Request body editor with multiple types
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Check } from 'lucide-react';
import type { RequestBody, BodyKind, KeyValueItem, FormDataItem } from '../types';
import { validateJson, formatJson, minifyJson, createKeyValueItem, generateId } from '../utils';
import { KeyValueEditor } from './KeyValueEditor';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { useResolvedTheme } from '@/hooks/useThemeHooks';

interface BodyEditorProps {
  body: RequestBody;
  onChange: (body: RequestBody) => void;
  disabled?: boolean;
}

const BODY_TYPES: { kind: BodyKind; label: string }[] = [
  { kind: 'none', label: 'none' },
  { kind: 'text', label: 'raw' },
  { kind: 'json', label: 'JSON' },
  { kind: 'urlencoded', label: 'x-www-form-urlencoded' },
  { kind: 'multipart', label: 'form-data' },
];

export const BodyEditor: React.FC<BodyEditorProps> = ({ body, onChange, disabled }) => {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  const handleKindChange = (kind: BodyKind) => {
    switch (kind) {
      case 'none':
        onChange({ kind: 'none' });
        break;
      case 'text':
        onChange({ kind: 'text', text: body.kind === 'json' ? body.text : '' });
        break;
      case 'json':
        onChange({ kind: 'json', text: body.kind === 'text' ? body.text : '{\n  \n}' });
        break;
      case 'urlencoded':
        onChange({
          kind: 'urlencoded',
          items: body.kind === 'urlencoded' ? body.items : [createKeyValueItem()],
        });
        break;
      case 'multipart':
        onChange({
          kind: 'multipart',
          items:
            body.kind === 'multipart'
              ? body.items
              : [{ id: generateId(), key: '', type: 'text' as const, textValue: '' }],
        });
        break;
    }
  };

  const handleTextChange = (text: string) => {
    if (body.kind === 'text' || body.kind === 'json') {
      onChange({ ...body, text });
    }
  };

  const handleItemsChange = (items: KeyValueItem[]) => {
    if (body.kind === 'urlencoded') {
      onChange({ ...body, items });
    }
  };

  const handleFormDataChange = (items: FormDataItem[]) => {
    if (body.kind === 'multipart') {
      onChange({ ...body, items });
    }
  };

  // JSON validation
  const jsonValidation = body.kind === 'json' ? validateJson(body.text) : { valid: true };

  return (
    <div className="space-y-3">
      {/* Type selector */}
      <div className="flex items-center gap-2">
        {BODY_TYPES.map((type) => (
          <button
            key={type.kind}
            onClick={() => handleKindChange(type.kind)}
            disabled={disabled}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              body.kind === type.kind
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Body content */}
      {body.kind === 'none' && (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
          This request does not have a body
        </div>
      )}

      {(body.kind === 'text' || body.kind === 'json') && (
        <div className="space-y-2">
          {/* JSON tools */}
          {body.kind === 'json' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                {jsonValidation.valid ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" />
                    Valid JSON
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {jsonValidation.error}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTextChange(formatJson(body.text, 2))}
                  disabled={disabled || !jsonValidation.valid}
                  className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
                >
                  Format
                </button>
                <button
                  onClick={() => handleTextChange(minifyJson(body.text))}
                  disabled={disabled || !jsonValidation.valid}
                  className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
                >
                  Minify
                </button>
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700">
            <CodeMirror
              value={body.text}
              onChange={handleTextChange}
              height="200px"
              extensions={[]}
              theme={isDark ? oneDark : undefined}
              editable={!disabled}
              basicSetup={{
                lineNumbers: true,
                foldGutter: body.kind === 'json',
                highlightActiveLine: true,
              }}
            />
          </div>
        </div>
      )}

      {body.kind === 'urlencoded' && (
        <KeyValueEditor
          items={body.items}
          onChange={handleItemsChange}
          keyPlaceholder="Key"
          valuePlaceholder="Value"
          disabled={disabled}
        />
      )}

      {body.kind === 'multipart' && (
        <FormDataEditor items={body.items} onChange={handleFormDataChange} disabled={disabled} />
      )}
    </div>
  );
};

/**
 * FormDataEditor - Editor for multipart form data with file support
 */
interface FormDataEditorProps {
  items: FormDataItem[];
  onChange: (items: FormDataItem[]) => void;
  disabled?: boolean;
}

const FormDataEditor: React.FC<FormDataEditorProps> = ({ items, onChange, disabled }) => {
  const handleAddItem = (type: 'text' | 'file') => {
    const newItem: FormDataItem = {
      id: generateId(),
      key: '',
      type,
      textValue: type === 'text' ? '' : undefined,
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, updates: Partial<FormDataItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleFileSelect = async (id: string, file: File) => {
    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      handleUpdateItem(id, {
        fileName: file.name,
        fileData: base64,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          {/* Type selector */}
          <select
            value={item.type}
            onChange={(e) => handleUpdateItem(item.id, { type: e.target.value as 'text' | 'file' })}
            disabled={disabled}
            className={cn(
              'h-8 px-2 text-sm rounded border',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100'
            )}
          >
            <option value="text">Text</option>
            <option value="file">File</option>
          </select>

          {/* Key input */}
          <input
            type="text"
            value={item.key}
            onChange={(e) => handleUpdateItem(item.id, { key: e.target.value })}
            placeholder="Key"
            disabled={disabled}
            className={cn(
              'w-32 h-8 px-2 py-1 text-sm rounded border',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100'
            )}
          />

          {/* Value input */}
          {item.type === 'text' ? (
            <input
              type="text"
              value={item.textValue || ''}
              onChange={(e) => handleUpdateItem(item.id, { textValue: e.target.value })}
              placeholder="Value"
              disabled={disabled}
              className={cn(
                'flex-1 h-8 px-2 py-1 text-sm rounded border',
                'border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-900',
                'text-gray-900 dark:text-gray-100'
              )}
            />
          ) : (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(item.id, file);
                }}
                disabled={disabled}
                className="hidden"
                id={`file-${item.id}`}
              />
              <label
                htmlFor={`file-${item.id}`}
                className={cn(
                  'px-3 py-1.5 text-sm rounded border cursor-pointer',
                  'border-gray-200 dark:border-gray-700',
                  'bg-gray-50 dark:bg-gray-800',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                Choose File
              </label>
              {item.fileName && (
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {item.fileName}
                </span>
              )}
            </div>
          )}

          {/* Delete button */}
          <button
            onClick={() => handleRemoveItem(item.id)}
            disabled={disabled}
            className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <span className="sr-only">Remove</span>×
          </button>
        </div>
      ))}

      {/* Add buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAddItem('text')}
          disabled={disabled}
          className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          + Add Text
        </button>
        <button
          onClick={() => handleAddItem('file')}
          disabled={disabled}
          className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          + Add File
        </button>
      </div>
    </div>
  );
};

export default BodyEditor;

