import { z } from "zod";
import type { Food, DislikedFood, Allergy } from '../components/DataManager';
import { toast } from "sonner";

// Schema validation
export const PrefsSchema = z.object({
  favorites: z.array(z.object({ 
    id: z.string(),
    name: z.string().min(2).max(100), 
    category: z.enum(["breakfast","lunch","dinner","snack"]).optional() 
  })),
  dislikes: z.array(z.object({ 
    id: z.string(),
    name: z.string().min(2).max(100), 
    level: z.enum(["mild","moderate","absolute"]) 
  })),
  allergies: z.array(z.object({ 
    id: z.string(),
    label: z.string().min(2).max(100), 
    severity: z.enum(["mild","severe"]) 
  })),
  notes: z.string().max(500)
});

// Text normalization for consistent comparison
export const normalize = (s: string) => s.trim().toLowerCase().normalize("NFKC");

// Check if item exists by name/label
export const existsBy = <T extends {name?: string; label?: string}>(
  arr: T[], 
  key: "name"|"label", 
  value: string
): boolean => {
  return arr.some(x => normalize((x[key] as string) || "") === normalize(value));
};

// Safe add functions with conflict detection
export function safeAddFavorite(
  name: string, 
  category: Food["category"] | undefined,
  favorites: Food[],
  dislikes: DislikedFood[],
  onAdd: (name: string, category: Food["category"] | undefined) => void
): boolean {
  const trimmedName = name.trim();
  
  if (!trimmedName || trimmedName.length < 2) {
    toast.error("Food name must be at least 2 characters long");
    return false;
  }

  if (trimmedName.length > 100) {
    toast.error("Food name is too long (max 100 characters)");
    return false;
  }
  
  // Check for conflicts with dislikes
  const conflictingDislike = dislikes.find(d => normalize(d.name) === normalize(trimmedName));
  if (conflictingDislike) {
    const levelText = conflictingDislike.level === 'absolute' ? 'Never serve' : 
                     conflictingDislike.level === 'moderate' ? 'Strong dislike' : 'Mild dislike';
    toast.error(`'${trimmedName}' is already listed as ${levelText}. Remove it first if you want to add it as a favorite.`);
    return false;
  }
  
  // Check for duplicates
  if (existsBy(favorites, "name", trimmedName)) {
    toast.message(`'${trimmedName}' is already in favorites`);
    return false;
  }
  
  onAdd(trimmedName, category);
  return true;
}

export function safeAddDislike(
  name: string,
  level: DislikedFood["level"],
  favorites: Food[],
  dislikes: DislikedFood[],
  onAdd: (name: string, level: DislikedFood["level"]) => void
): boolean {
  const trimmedName = name.trim();
  
  if (!trimmedName || trimmedName.length < 2) {
    toast.error("Food name must be at least 2 characters long");
    return false;
  }

  if (trimmedName.length > 100) {
    toast.error("Food name is too long (max 100 characters)");
    return false;
  }
  
  // Check for conflicts with favorites
  const conflictingFavorite = favorites.find(f => normalize(f.name) === normalize(trimmedName));
  if (conflictingFavorite) {
    toast.error(`'${trimmedName}' is already listed as a favorite. Remove it first if you want to avoid it.`);
    return false;
  }
  
  // Check for duplicates
  if (existsBy(dislikes, "name", trimmedName)) {
    toast.message(`'${trimmedName}' is already in the avoid list`);
    return false;
  }
  
  onAdd(trimmedName, level);
  return true;
}

export function safeAddAllergy(
  label: string, 
  severity: Allergy["severity"],
  allergies: Allergy[],
  onAdd: (label: string, severity: Allergy["severity"]) => void
): boolean {
  const trimmedLabel = label.trim();
  
  if (!trimmedLabel || trimmedLabel.length < 2) {
    toast.error("Allergy name must be at least 2 characters long");
    return false;
  }

  if (trimmedLabel.length > 100) {
    toast.error("Allergy name is too long (max 100 characters)");
    return false;
  }
  
  // Check for duplicates
  if (existsBy(allergies, "label", trimmedLabel)) {
    toast.message(`Allergy '${trimmedLabel}' already exists`);
    return false;
  }
  
  onAdd(trimmedLabel, severity);
  return true;
}

// Get consistent level text
export function getDislikeLevelText(level: DislikedFood["level"]): string {
  switch(level) {
    case "absolute": return "Never serve";
    case "moderate": return "Strong dislike";
    case "mild": return "Mild dislike";
  }
}

export function getSeverityText(severity: Allergy["severity"]): string {
  return severity === "severe" ? "SEVERE" : "Mild";
}