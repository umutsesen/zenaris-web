import { useState, useEffect } from 'react';

export type Food = { id: string; name: string; category?: "breakfast"|"lunch"|"dinner"|"snack" };
export type DislikedFood = Food & { level: "mild" | "moderate" | "absolute" };
export type Allergy = { id: string; label: string; severity: "mild" | "severe" };
export type Elder = { 
  id: string; 
  name: string; 
  initial: string; 
  birthday: string; 
  status: string; 
  lastOnline: string;
  emergencyContact?: string;
  primaryCaregiver?: string;
};

export type PreferencesData = {
  favorites: Food[];
  dislikes: DislikedFood[];
  allergies: Allergy[];
  notes: string;
  lastUpdated: string;
  updatedBy?: string;
};

const STORAGE_KEY_PREFIX = 'zenaris_preferences_';

// Check for ephemeral mode
const getStorageMode = () => {
  if (typeof window === 'undefined') return localStorage;
  const params = new URLSearchParams(window.location.search);
  const useEphemeral = params.has("ephemeral") || params.get("persist") === "false";
  return useEphemeral ? sessionStorage : localStorage;
};

export function useDataPersistence(elderId: string) {
  const [data, setData] = useState<PreferencesData>({
    favorites: [],
    dislikes: [],
    allergies: [],
    notes: "",
    lastUpdated: new Date().toISOString(),
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data on elder change
  useEffect(() => {
    const loadData = () => {
      try {
        const storage = getStorageMode();
        const stored = storage.getItem(STORAGE_KEY_PREFIX + elderId);
        if (stored) {
          const parsed = JSON.parse(stored);
          setData(parsed);
          setLastSaved(new Date(parsed.lastUpdated));
        } else {
          // Reset to empty state for new elder
          setData({
            favorites: [],
            dislikes: [],
            allergies: [],
            notes: "",
            lastUpdated: new Date().toISOString(),
          });
          setLastSaved(null);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    loadData();
  }, [elderId]);

  const saveData = (newData: Partial<PreferencesData>, updatedBy?: string) => {
    const updatedData = {
      ...data,
      ...newData,
      lastUpdated: new Date().toISOString(),
      updatedBy,
    };
    
    try {
      const storage = getStorageMode();
      storage.setItem(STORAGE_KEY_PREFIX + elderId, JSON.stringify(updatedData));
      setData(updatedData);
      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  };

  const exportData = () => {
    return {
      ...data,
      elderId,
      exportedAt: new Date().toISOString(),
    };
  };

  const clearData = () => {
    try {
      const storage = getStorageMode();
      storage.removeItem(STORAGE_KEY_PREFIX + elderId);
      setData({
        favorites: [],
        dislikes: [],
        allergies: [],
        notes: "",
        lastUpdated: new Date().toISOString(),
      });
      setLastSaved(null);
      return true;
    } catch (error) {
      console.error('Error clearing preferences:', error);
      return false;
    }
  };

  return {
    data,
    isLoading,
    lastSaved,
    saveData,
    exportData,
    clearData,
  };
}

export function getAllElderIds(): string[] {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_KEY_PREFIX));
    return keys.map(key => key.replace(STORAGE_KEY_PREFIX, ''));
  } catch {
    return [];
  }
}

export function getElderPreferences(elderId: string): PreferencesData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + elderId);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}