import { useState } from 'react';
import { Bot, Mic, FileText, ScanText } from 'lucide-react';
import { Button } from '../ui/button';
import { VoiceAdd } from './VoiceAdd';
import { PasteIngredients } from './PasteIngredients';
import { toast } from 'sonner';
import { Food } from '../DataManager';

export interface AIActionsBarProps {
  onAddFavorite?: (item: Food) => void;
  className?: string;
}

export function AIActionsBar({
  onAddFavorite,
  className
}: AIActionsBarProps) {
  const [showVoice, setShowVoice] = useState(false);
  const [showPaste, setShowPaste] = useState(false);

  const handleUseAI = () => {
    // This will be handled by the parent component's "Use AI" toggle
    toast.info("Use the 'Use AI' toggle in the add section for AI assistance");
  };

  const handleVoiceResult = (text: string) => {
    if (onAddFavorite && text.trim()) {
      onAddFavorite({
        name: text.trim(),
        category: '', 
        source: 'voice'
      });
    }
  };

  const handlePasteResult = (items: string[]) => {
    items.forEach(item => {
      if (onAddFavorite && item.trim()) {
        onAddFavorite({
          name: item.trim(),
          category: '',
          source: 'paste'
        });
      }
    });
  };

  const handleExtract = () => {
    toast.info("Extract from image feature coming soon");
  };

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <Button 
          onClick={handleUseAI}
          variant="ghost"
          size="sm"
          className="h-10 px-4 text-ai-brand hover:bg-ai-bg"
        >
          <Bot className="h-4 w-4 mr-2" />
          Use AI
        </Button>
        
        <Button 
          onClick={() => setShowVoice(!showVoice)}
          variant="ghost"
          size="sm"
          className="h-10 px-4 text-ai-brand hover:bg-ai-bg"
        >
          <Mic className="h-4 w-4 mr-2" />
          Voice
        </Button>

        <Button 
          onClick={() => setShowPaste(!showPaste)}
          variant="ghost"
          size="sm"
          className="h-10 px-4 text-ai-brand hover:bg-ai-bg"
        >
          <FileText className="h-4 w-4 mr-2" />
          Paste
        </Button>

        <Button 
          onClick={handleExtract}
          variant="ghost"
          size="sm"
          className="h-10 px-4 text-ai-brand hover:bg-ai-bg"
        >
          <ScanText className="h-4 w-4 mr-2" />
          Extract
        </Button>
      </div>

      {showVoice && (
        <VoiceAdd
          onResult={handleVoiceResult}
          onClose={() => setShowVoice(false)}
        />
      )}

      {showPaste && (
        <PasteIngredients
          onResult={handlePasteResult}
          onClose={() => setShowPaste(false)}
        />
      )}
    </>
  );
}