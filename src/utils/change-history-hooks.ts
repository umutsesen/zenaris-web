import { useState, useEffect, useCallback } from 'react';

type ChangeType = 'added' | 'removed' | 'updated' | 'notes_changed';

type ChangeEntry = {
  id: string;
  timestamp: string;
  type: ChangeType;
  category: 'favorites' | 'dislikes' | 'allergies' | 'notes';
  description: string;
  updatedBy?: string;
  oldValue?: string;
  newValue?: string;
};

const STORAGE_KEY_PREFIX = 'zenaris_history_';

export function useChangeHistory(elderId: string) {
  const [history, setHistory] = useState<ChangeEntry[]>([]);

  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + elderId);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, [elderId]);

  const saveHistory = useCallback((newHistory: ChangeEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + elderId, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }, [elderId]);

  const addChange = useCallback((
    type: ChangeType,
    category: 'favorites' | 'dislikes' | 'allergies' | 'notes',
    description: string,
    oldValue?: string,
    newValue?: string,
    updatedBy?: string
  ) => {
    const newEntry: ChangeEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      category,
      description,
      updatedBy,
      oldValue,
      newValue,
    };

    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, 50); // Keep only last 50 entries
      saveHistory(updated);
      return updated;
    });
  }, [saveHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY_PREFIX + elderId);
  }, [elderId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    addChange,
    clearHistory,
    loadHistory,
  };
}

export type { ChangeType, ChangeEntry };