import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertTriangle, Heart, Ban, Shield, Info } from 'lucide-react';

export interface ConflictIndicatorProps {
  conflicts?: string[];
}

export function ConflictIndicator({ conflicts }: ConflictIndicatorProps) {
  if (!conflicts?.length) return null;

  const getConflictIcon = (conflict: string) => {
    if (conflict.includes('Favorite')) return '🍳';
    if (conflict.includes('Allergy')) return '⚠️';
    if (conflict.includes('clash')) return '❗'; // Assuming 'çakış' translates to clash/conflict
    return '⚠️';
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {conflicts.map((conflict, idx) => (
        <Badge key={idx} variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
          {getConflictIcon(conflict)} {conflict}
        </Badge>
      ))}
    </div>
  );
}

export interface SeverityConfirmationProps {
  severity: 'mild' | 'severe';
  onConfirm: () => void;
  onCancel: () => void;
  allergyName: string;
}

export function SeverityConfirmation({ severity, onConfirm, onCancel, allergyName }: SeverityConfirmationProps) {
  if (severity !== 'severe') return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-md p-6 max-w-sm w-full border-2 border-red-500">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">SEVERE Confirmation</h3>
          <p className="text-sm text-red-800 mb-4">
            You have selected the "Severe" level for <strong>{allergyName}</strong>.
            This should only be used for allergies that may require immediate medical attention.
          </p>
          <p className="text-xs text-red-700 mb-6">
            Confirmation is required to prevent accidental touches.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm} className="flex-1">
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface QuickActionButtonsProps {
  onAddFavorite: () => void;
  onAddAvoid: () => void;
  onAddAllergy: () => void;
  selectedType?: 'favorite' | 'avoid' | 'allergy';
}

export function QuickActionButtons({
  onAddFavorite,
  onAddAvoid,
  onAddAllergy,
  selectedType
}: QuickActionButtonsProps) {
  return (
    <div className="flex gap-1 mt-2">
      <Button
        size="sm"
        variant={selectedType === 'favorite' ? 'default' : 'outline'}
        onClick={onAddFavorite}
        className="h-7 px-2 text-xs"
      >
        <Heart className="h-3 w-3 mr-1" />
        Add to favorites
      </Button>
      <Button
        size="sm"
        variant={selectedType === 'avoid' ? 'default' : 'outline'}
        onClick={onAddAvoid}
        className="h-7 px-2 text-xs"
      >
        <Ban className="h-3 w-3 mr-1" />
        Mark as never serve
      </Button>
      <Button
        size="sm"
        variant={selectedType === 'allergy' ? 'destructive' : 'outline'}
        onClick={onAddAllergy}
        className="h-7 px-2 text-xs"
      >
        <Shield className="h-3 w-3 mr-1" />
        Move to allergy
      </Button>
    </div>
  );
}

export interface ProcessingStateProps {
  isProcessing: boolean;
  step: string;
  progress: number;
}

export function ProcessingState({ isProcessing, step, progress }: ProcessingStateProps) {
  if (!isProcessing) return null;

  const getStepText = (step: string) => {
    switch (step) {
      case 'analyzing': return 'Analyzing...';
      case 'extracting': return 'Extracting information...';
      case 'validating': return 'Validating...';
      case 'finalizing': return 'Finalizing...';
      default: return 'Processing...';
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
      <div className="flex items-center gap-3">
        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">{getStepText(step)}</p>
          <div className="w-full bg-blue-200 rounded-full h-1 mt-2">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export interface PrivacyNoticeProps {
  show: boolean;
}

export function PrivacyNotice({ show }: PrivacyNoticeProps) {
  if (!show) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">Privacy & Security</p>
          <p>Voice recordings and images are only processed to extract preferences and are not stored.</p>
        </div>
      </div>
    </div>
  );
}

export interface LanguageSupportProps {
  className?: string;
}

export function LanguageSupport({ className = "" }: LanguageSupportProps) {
  return (
    <div className={`text-xs text-muted-foreground ${className}`}>
      <p><strong>Supported languages:</strong> Turkish, English, German</p>
    </div>
  );
}

export interface MicroCopyProps {
  section: 'favorites' | 'dislikes' | 'allergies' | 'notes';
  type: 'voice' | 'text' | 'photo' | 'suggest';
}

export function MicroCopy({ section, type }: MicroCopyProps) {
  const getPlaceholder = () => {
    if (type === 'voice') {
      switch (section) {
        case 'favorites':
          return "Example: 'Loves cake, prefers Italian cuisine, soft textures'";
        case 'dislikes':
          return "Example: 'Doesn't like spicy, never mushrooms, doesn't prefer cold food'";
        case 'allergies':
          return "Example: 'Nut allergy, lactose-free, severe shellfish allergy'";
        case 'notes':
          return "Example: 'Needs soft food, prefers it hot, kosher diet'";
      }
    }

    if (type === 'text') {
      return "Paste care notes, doctor's reports, nutritional plans here...";
    }

    if (type === 'photo') {
      return "Upload a menu photo, recipe card, medical report";
    }

    return "Ready for AI suggestions";
  };

  const getTip = () => {
    if (type === 'voice') {
      return "💡 Tip: Speak clearly at your normal talking speed";
    }

    if (type === 'text') {
      return "💡 Tip: Doctor's reports, care notes, and family notes give the best results";
    }

    if (type === 'photo') {
      return "⚠️ Example: Clear written documents like recipe labels, menu lists, doctor's reports";
    }

    return "💡 Personalized suggestions based on existing data";
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground bg-muted rounded p-2">
        <strong>Example:</strong> {getPlaceholder()}
      </p>
      <p className="text-xs text-muted-foreground">
        {getTip()}
      </p>
    </div>
  );
}