/**
 * useDomainPresets - Domain Preset 관리 훅
 */

import { useState, useCallback, useEffect } from 'react';
import type { DomainPreset, DomainPresetsStore } from '../types';
import { generateId } from '../constants';

const STORAGE_KEY = 'yowu-devtools:v1:api-diff:domain-presets';

const DEFAULT_STORE: DomainPresetsStore = {
  version: 1,
  presets: [],
};

function loadPresets(): DomainPresetsStore {
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

function savePresets(store: DomainPresetsStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage errors
  }
}

export function useDomainPresets() {
  const [presets, setPresets] = useState<DomainPreset[]>(() => loadPresets().presets);

  // Sync to localStorage when presets change
  useEffect(() => {
    savePresets({ version: 1, presets });
  }, [presets]);

  // Add a new preset
  const addPreset = useCallback((title: string, domain: string) => {
    const newPreset: DomainPreset = {
      id: generateId(),
      title: title.trim(),
      domain: domain.trim(),
    };
    setPresets((prev) => [...prev, newPreset]);
    return newPreset;
  }, []);

  // Update a preset
  const updatePreset = useCallback((id: string, updates: Partial<Omit<DomainPreset, 'id'>>) => {
    setPresets((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...(updates.title !== undefined && { title: updates.title.trim() }),
              ...(updates.domain !== undefined && { domain: updates.domain.trim() }),
            }
          : p
      )
    );
  }, []);

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
    const data: DomainPresetsStore = { version: 1, presets };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `domain-presets-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [presets]);

  // Import presets from JSON (overwrites existing)
  const importPresets = useCallback((file: File): Promise<{ success: boolean; count: number; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.version === 1 && Array.isArray(parsed.presets)) {
            // Validate and regenerate IDs to avoid conflicts
            const validPresets: DomainPreset[] = parsed.presets
              .filter((p: unknown) => {
                if (typeof p !== 'object' || p === null) return false;
                const preset = p as Record<string, unknown>;
                return typeof preset.title === 'string' && typeof preset.domain === 'string';
              })
              .map((p: Record<string, unknown>) => ({
                id: generateId(),
                title: String(p.title).trim(),
                domain: String(p.domain).trim(),
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
  }, []);

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

export default useDomainPresets;

