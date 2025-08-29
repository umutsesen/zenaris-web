import { Button } from '../ui/button';
import { Bot, ChevronRight } from 'lucide-react';

interface UnifiedAIButtonProps {
  section: 'favorites' | 'dislikes' | 'allergies' | 'notes';
  elderName: string;
  isEmpty?: boolean;
  onClick: () => void;
  className?: string;
}

export function UnifiedAIButton({ 
  section, 
  elderName, 
  isEmpty = false, 
  onClick, 
  className = "" 
}: UnifiedAIButtonProps) {
  const getSectionText = () => {
    switch (section) {
      case 'favorites':
        return 'Use AI for favorites';
      case 'dislikes':
        return 'Use AI for dislikes';
      case 'allergies':
        return 'Use AI for allergies';
      case 'notes':
        return 'Use AI for notes';
      default:
        return 'Use AI';
    }
  };

  const getEmptyStateText = () => {
    switch (section) {
      case 'favorites':
        return `Tell AI about ${elderName}'s favorite foods`;
      case 'dislikes':
        return `Tell AI about ${elderName}'s food dislikes`;
      case 'allergies':
        return `Tell AI about ${elderName}'s allergies`;
      case 'notes':
        return `Tell AI about ${elderName}'s special needs`;
      default:
        return 'Use AI for help';
    }
  };

  if (isEmpty) {
    return (
      <Button
        onClick={onClick}
        variant="outline"
        className={`w-full h-12 bg-ai-bg hover:bg-ai-bg/80 border-ai-border text-ai-brand hover:text-ai-brand border-2 border-dashed ${className} cursor-pointer`}
        aria-label={`Open AI assistant for ${section} section. ${getEmptyStateText()}`}
      >
        <Bot className="h-5 w-5 mr-2" aria-hidden="true" />
        <span className="flex-1">{getEmptyStateText()}</span>
        <ChevronRight className="h-4 w-4 ml-2 opacity-60" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className={`bg-ai-bg hover:bg-ai-bg/80 border-ai-border text-ai-brand hover:text-ai-brand ${className}`}
      aria-label={`Open AI assistant for ${section} section`}
    >
      <Bot className="h-4 w-4 mr-2" aria-hidden="true" />
      {getSectionText()}
      <ChevronRight className="h-4 w-4 ml-2" aria-hidden="true" />
    </Button>
  );
}