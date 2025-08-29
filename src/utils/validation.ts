import { z } from 'zod';

// Type definitions
export type DislikeLevel = 'mild' | 'moderate' | 'absolute';
export type SeverityLevel = 'mild' | 'severe';

// Zod schemas
export const PrefsSchema = z.object({
  favorites: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string().optional()
  })),
  dislikes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    level: z.enum(['mild', 'moderate', 'strong', 'absolute'])
  })),
  allergies: z.array(z.object({
    id: z.string(),
    label: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe'])
  })),
  notes: z.string()
});

// Utility functions
export function getDislikeLevelText(level: DislikeLevel): string {
  const labels = {
    mild: 'Mild preference',
    moderate: 'Would prefer to avoid',
    strong: 'Strongly dislikes',
    absolute: 'Never serve'
  };
  return labels[level];
}

export function getSeverityText(severity: SeverityLevel): string {
  const labels = {
    mild: 'Mild reaction',
    moderate: 'Moderate reaction',
    severe: 'Severe/Life-threatening'
  };
  return labels[severity];
}

export function safeAddFavorite(
  name: string,
  category: string | undefined,
  onSuccess: (name: string, category: string | undefined) => void
) {
  const trimmedName = name.trim();
  if (!trimmedName) return;
  
  onSuccess(trimmedName, category);
}

export function safeAddDislike(
  name: string,
  level: DislikeLevel,
  onSuccess: (name: string, level: DislikeLevel) => void
) {
  const trimmedName = name.trim();
  if (!trimmedName) return;
  
  onSuccess(trimmedName, level);
}

export function safeAddAllergy(
  label: string,
  severity: SeverityLevel,
  onSuccess: (label: string, severity: SeverityLevel) => void
) {
  const trimmedLabel = label.trim();
  if (!trimmedLabel) return;
  
  onSuccess(trimmedLabel, severity);
}

export function getConflictBadgeConfig() {
  return {
    favorites: { color: 'green', text: '✓' },
    mild: { color: 'yellow', text: '!' },
    moderate: { color: 'orange', text: '⚠' },
    strong: { color: 'red', text: '✗' },
    absolute: { color: 'red', text: '🚫' },
    allergy: { color: 'red', text: '⚠' }
  };
}