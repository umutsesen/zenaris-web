import { toast } from 'sonner';
import { Undo2 } from 'lucide-react';

interface UndoAction {
  type: 'add' | 'remove' | 'update';
  section: 'favorites' | 'dislikes' | 'allergies' | 'notes';
  item?: unknown;
  previousValue?: unknown;
  undoFn: () => void;
}

export class UndoToastManager {
  private static instance: UndoToastManager;
  private undoActions: Map<string, UndoAction> = new Map();

  static getInstance(): UndoToastManager {
    if (!UndoToastManager.instance) {
      UndoToastManager.instance = new UndoToastManager();
    }
    return UndoToastManager.instance;
  }

  showUndoToast(
    message: string,
    undoAction: UndoAction,
    duration: number = 10000
  ): string {
    const actionId = Math.random().toString(36).slice(2, 9);
    this.undoActions.set(actionId, undoAction);

    const toastId = toast.success(message, {
      duration,
      action: {
        label: (
          <div className="flex items-center gap-1">
            <Undo2 className="h-3 w-3" />
            Undo
          </div>
        ),
        onClick: () => {
          this.executeUndo(actionId);
          toast.dismiss(toastId);
        },
      },
      onDismiss: () => {
        this.undoActions.delete(actionId);
      },
    });

    // Auto-cleanup after duration
    setTimeout(() => {
      this.undoActions.delete(actionId);
    }, duration);

    return toastId.toString();
  }

  private executeUndo(actionId: string): void {
    const action = this.undoActions.get(actionId);
    if (action) {
      action.undoFn();
      this.undoActions.delete(actionId);
      
      // Show confirmation that undo was successful
      toast.info(`Undid: ${this.getUndoMessage(action)}`, {
        duration: 3000,
      });
    }
  }

  private getUndoMessage(action: UndoAction): string {
    const sectionName = this.getSectionDisplayName(action.section);
    
    const getItemName = (item: unknown): string => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'name' in item) return (item as { name: string }).name;
      return String(item);
    };
    
    switch (action.type) {
      case 'add':
        return `Removed "${getItemName(action.item)}" from ${sectionName}`;
      case 'remove':
        return `Restored "${getItemName(action.item)}" to ${sectionName}`;
      case 'update':
        return `Reverted changes to ${sectionName}`;
      default:
        return `Undid changes to ${sectionName}`;
    }
  }

  private getSectionDisplayName(section: string): string {
    switch (section) {
      case 'favorites': return 'favorites';
      case 'dislikes': return 'avoid list';
      case 'allergies': return 'allergies';
      case 'notes': return 'notes';
      default: return section;
    }
  }
}

// Helper functions for common undo scenarios
export const undoToast = UndoToastManager.getInstance();

export function showAddUndoToast(
  itemName: string,
  section: 'favorites' | 'dislikes' | 'allergies' | 'notes',
  undoFn: () => void
): void {
  const sectionName = section === 'dislikes' ? 'avoid list' : section;
  undoToast.showUndoToast(
    `Added "${itemName}" to ${sectionName}`,
    {
      type: 'add',
      section,
      item: itemName,
      undoFn,
    }
  );
}

export function showRemoveUndoToast(
  itemName: string,
  section: 'favorites' | 'dislikes' | 'allergies' | 'notes',
  undoFn: () => void
): void {
  const sectionName = section === 'dislikes' ? 'avoid list' : section;
  undoToast.showUndoToast(
    `Removed "${itemName}" from ${sectionName}`,
    {
      type: 'remove',
      section,
      item: itemName,
      undoFn,
    }
  );
}

export function showUpdateUndoToast(
  itemName: string,
  section: 'favorites' | 'dislikes' | 'allergies' | 'notes',
  undoFn: () => void
): void {
  const sectionName = section === 'dislikes' ? 'avoid list' : section;
  undoToast.showUndoToast(
    `Updated "${itemName}" in ${sectionName}`,
    {
      type: 'update',
      section,
      item: itemName,
      undoFn,
    }
  );
}