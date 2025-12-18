/**
 * usePipelinePresets - Pipeline Preset 관리 훅 (Video Studio)
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'yowu-devtools:v1:video-studio:pipeline-presets';

import type { CutMode, ResizeMode, ExportFormat, QualityPreset } from '../types';

export interface VideoPipelinePreset {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  settings: {
    // Pipeline step activation (thumbnail is separate - outputs image)
    trimEnabled: boolean;
    cutEnabled: boolean;
    cropEnabled: boolean;
    resizeEnabled: boolean;
    // Cut settings
    cutMode: CutMode;
    splitCount: number;
    // Resize settings
    resizeWidth: number;
    resizeHeight: number;
    resizeLockAspect: boolean;
    resizeMode: ResizeMode;
    // Export settings
    exportFormat: ExportFormat;
    qualityPreset: QualityPreset;
    exportSuffix: string;
  };
}

interface PipelinePresetsStore {
  version: number;
  presets: VideoPipelinePreset[];
}

const DEFAULT_STORE: PipelinePresetsStore = {
  version: 1,
  presets: [],
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function loadPresets(): PipelinePresetsStore {
  if (typeof window === 'undefined') return DEFAULT_STORE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STORE;
    const parsed = JSON.parse(stored);
    if (parsed.version === 1 && Array.isArray(parsed.presets)) {
      return parsed;
    }
    return DEFAULT_STORE;
  } catch {
    return DEFAULT_STORE;
  }
}

function savePresets(store: PipelinePresetsStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage errors
  }
}

export function usePipelinePresets() {
  const [presets, setPresets] = useState<VideoPipelinePreset[]>(() => loadPresets().presets);

  // Sync to localStorage when presets change
  useEffect(() => {
    savePresets({ version: 1, presets });
  }, [presets]);

  // Add a new preset
  const addPreset = useCallback(
    (name: string, description: string, settings: VideoPipelinePreset['settings']) => {
      const newPreset: VideoPipelinePreset = {
        id: generateId(),
        name: name.trim(),
        description: description.trim() || undefined,
        createdAt: Date.now(),
        settings,
      };
      setPresets((prev) => [...prev, newPreset]);
      return newPreset;
    },
    []
  );

  // Update a preset
  const updatePreset = useCallback(
    (id: string, updates: Partial<Omit<VideoPipelinePreset, 'id' | 'createdAt'>>) => {
      setPresets((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...(updates.name !== undefined && { name: updates.name.trim() }),
                ...(updates.description !== undefined && {
                  description: updates.description.trim() || undefined,
                }),
                ...(updates.settings !== undefined && { settings: updates.settings }),
              }
            : p
        )
      );
    },
    []
  );

  // Remove a preset
  const removePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Clear all presets
  const clearAllPresets = useCallback(() => {
    setPresets([]);
  }, []);

  // Export presets as JSON
  const exportPresets = useCallback(() => {
    const data: PipelinePresetsStore = { version: 1, presets };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-studio-presets-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [presets]);

  // Import presets from JSON
  const importPresets = useCallback(
    (file: File): Promise<{ success: boolean; count: number; error?: string }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content);
            if (parsed.version === 1 && Array.isArray(parsed.presets)) {
              // Validate and regenerate IDs to avoid conflicts
              const validPresets: VideoPipelinePreset[] = parsed.presets
                .filter((p: unknown) => {
                  if (typeof p !== 'object' || p === null) return false;
                  const preset = p as Record<string, unknown>;
                  return typeof preset.name === 'string' && typeof preset.settings === 'object';
                })
                .map((p: Record<string, unknown>) => ({
                  id: generateId(),
                  name: String(p.name).trim(),
                  description: p.description ? String(p.description).trim() : undefined,
                  createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now(),
                  settings: p.settings as VideoPipelinePreset['settings'],
                }));
              setPresets(validPresets);
              resolve({ success: true, count: validPresets.length });
            } else {
              resolve({ success: false, count: 0, error: 'Invalid file format' });
            }
          } catch {
            resolve({ success: false, count: 0, error: 'Failed to parse JSON' });
          }
        };
        reader.onerror = () => {
          resolve({ success: false, count: 0, error: 'Failed to read file' });
        };
        reader.readAsText(file);
      });
    },
    []
  );

  return {
    presets,
    addPreset,
    updatePreset,
    removePreset,
    clearAllPresets,
    exportPresets,
    importPresets,
  };
}

export default usePipelinePresets;

