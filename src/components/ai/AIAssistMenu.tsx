import { useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { 
  Bot, 
  Mic, 
  FileText, 
  Wand2, 
  Sparkles, 
  Brain,
  ChevronRight
} from "lucide-react";

interface AIAssistMenuProps {
  onVoiceAdd: () => void;
  onPasteIngredients: () => void;
  onExtractFromNotes: () => void;
  onSuggestRelated: () => void;
  disabled?: boolean;
  trigger?: React.ReactNode;
  className?: string;
}

export function AIAssistMenu({ 
  onVoiceAdd, 
  onPasteIngredients, 
  onExtractFromNotes, 
  onSuggestRelated,
  disabled = false,
  trigger,
  className = ""
}: AIAssistMenuProps) {
  const [open, setOpen] = useState(false);

  const handleMenuAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="lg" 
      className={`h-12 px-6 border-ai-border hover:bg-ai-bg text-ai-brand ${className}`}
      disabled={disabled}
    >
      <Bot className="h-5 w-5 mr-2" />
      Use AI
      <Sparkles className="h-4 w-4 ml-2 opacity-60" />
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 border-ai-border shadow-lg" 
        align="end"
        sideOffset={8}
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-ai-border">
            <div className="h-8 w-8 rounded-md bg-ai-brand/10 grid place-content-center">
              <Bot className="h-4 w-4 text-ai-brand" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">AI Assist</h3>
              <p className="text-xs text-muted-foreground">Choose how to add items</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 px-4 hover:bg-ai-bg"
              onClick={() => handleMenuAction(onVoiceAdd)}
            >
              <div className="h-8 w-8 rounded-md bg-blue-50 grid place-content-center mr-3">
                <Mic className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">Voice Add</div>
                <div className="text-xs text-muted-foreground">Speak your allergies and preferences</div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 px-4 hover:bg-ai-bg"
              onClick={() => handleMenuAction(onPasteIngredients)}
            >
              <div className="h-8 w-8 rounded-md bg-green-50 grid place-content-center mr-3">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">Paste Label</div>
                <div className="text-xs text-muted-foreground">Extract from ingredient lists</div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 px-4 hover:bg-ai-bg"
              onClick={() => handleMenuAction(onExtractFromNotes)}
            >
              <div className="h-8 w-8 rounded-md bg-purple-50 grid place-content-center mr-3">
                <Wand2 className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">Extract from Notes</div>
                <div className="text-xs text-muted-foreground">Scan special instructions</div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 px-4 hover:bg-ai-bg"
              onClick={() => handleMenuAction(onSuggestRelated)}
            >
              <div className="h-8 w-8 rounded-md bg-orange-50 grid place-content-center mr-3">
                <Brain className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">Suggest Related</div>
                <div className="text-xs text-muted-foreground">Find similar allergens</div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </Button>
          </div>

          <div className="mt-4 pt-3 border-t border-ai-border">
            <p className="text-xs text-muted-foreground text-center">
              AI suggestions should be reviewed for accuracy
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}