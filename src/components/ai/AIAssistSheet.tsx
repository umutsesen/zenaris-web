import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Bot, 
  Mic, 
  FileText, 
  ScanText, 
  Lightbulb,
  Volume2,
  Clipboard,
  Camera,
  Sparkles
} from 'lucide-react';
import { VoiceAdd } from './VoiceAdd';
import { PasteIngredients } from './PasteIngredients';
import { toast } from 'sonner';
import type { Food, DislikedFood, Allergy } from '../DataManager';

const generateId = () => Math.random().toString(36).slice(2, 9);

interface AIAssistSheetProps {
  elderName?: string;
  onAddItem?: (item: Food | DislikedFood | Allergy) => void;
  trigger?: React.ReactNode;
  type?: 'favorites' | 'dislikes' | 'allergies';
}

export function AIAssistSheet({
  elderName = 'them',
  onAddItem,
  trigger,
  type = 'favorites'
}: AIAssistSheetProps) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const getTitle = () => {
    switch (type) {
      case 'allergies':
        return `AI Assist: ${elderName}'s Allergies`;
      case 'dislikes':
        return `AI Assist: Foods to Avoid`;
      default:
        return `AI Assist: ${elderName}'s Favorites`;
    }
  };

  const getHelpText = () => {
    switch (type) {
      case 'allergies':
        return 'Get AI help to identify and add allergies quickly and safely.';
      case 'dislikes':
        return 'Use AI to help identify foods they dislike or should avoid.';
      default:
        return 'Let AI help you discover and add their favorite foods.';
    }
  };

  const handleVoiceResult = (text: string) => {
    if (onAddItem && text.trim()) {
      const trimmedName = text.trim();
      let item: Food | DislikedFood | Allergy;
      
      if (type === 'favorites') {
        item = {
          id: generateId(),
          name: trimmedName,
          category: undefined,
          source: 'voice'
        } as Food;
      } else if (type === 'dislikes') {
        item = {
          id: generateId(),
          name: trimmedName,
          level: 'mild' as const,
          source: 'voice'
        } as DislikedFood;
      } else if (type === 'allergies') {
        item = {
          id: generateId(),
          label: trimmedName,
          severity: 'mild' as const,
          source: 'voice'
        } as Allergy;
      } else {
        return;
      }
      
      onAddItem(item);
    }
    setActiveFeature(null);
  };

  const handlePasteResult = (items: string[]) => {
    items.forEach(item => {
      if (onAddItem && item.trim()) {
        const trimmedName = item.trim();
        let newItem: Food | DislikedFood | Allergy;
        
        if (type === 'favorites') {
          newItem = {
            id: generateId(),
            name: trimmedName,
            category: undefined,
            source: 'paste'
          } as Food;
        } else if (type === 'dislikes') {
          newItem = {
            id: generateId(),
            name: trimmedName,
            level: 'mild' as const,
            source: 'paste'
          } as DislikedFood;
        } else if (type === 'allergies') {
          newItem = {
            id: generateId(),
            label: trimmedName,
            severity: 'mild' as const,
            source: 'paste'
          } as Allergy;
        } else {
          return;
        }
        
        onAddItem(newItem);
      }
    });
    setActiveFeature(null);
  };

  const handleExtractImage = () => {
    toast.info('Extract from image feature coming soon');
    setActiveFeature(null);
  };

  const handleSuggestRelated = () => {
    const suggestions = type === 'favorites' 
      ? ['pasta', 'rice pudding', 'chicken broth']
      : type === 'allergies'
      ? ['shellfish', 'tree nuts', 'soy']
      : ['spicy foods', 'raw vegetables', 'hard textures'];
    
    toast.success(`Suggested: ${suggestions.join(', ')}`);
    setActiveFeature(null);
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-10 px-4 text-ai-brand hover:bg-ai-bg"
    >
      <Sparkles className="h-4 w-4 mr-2" />
      Use AI
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] sm:h-auto sm:max-h-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-ai-brand" />
            {getTitle()}
          </SheetTitle>
          <p className="text-muted-foreground text-sm">{getHelpText()}</p>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {!activeFeature ? (
            <>
              {/* Voice Input - Enhanced */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveFeature('voice')}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-blue-100 grid place-content-center">
                      <Mic className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Voice Input</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        Speak naturally about {type === 'favorites' ? 'favorite foods' : type === 'allergies' ? 'allergies' : 'foods to avoid'}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Volume2 className="h-4 w-4" />
                    <span>Just say: "No peanuts, loves pasta, avoid spicy foods"</span>
                  </div>
                </CardContent>
              </Card>

              {/* Paste Ingredients */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveFeature('paste')}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-green-100 grid place-content-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Paste from Notes</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        Copy and paste from medical notes or care plans
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clipboard className="h-4 w-4" />
                    <span>Paste text and AI will extract relevant items</span>
                  </div>
                </CardContent>
              </Card>

              {/* Extract from Image */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExtractImage}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-purple-100 grid place-content-center">
                      <ScanText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Extract from Image</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        Scan ingredient labels or medical documents
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    <span>Take a photo or upload an image</span>
                  </div>
                </CardContent>
              </Card>

              {/* Suggest Related Items */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleSuggestRelated}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-orange-100 grid place-content-center">
                      <Lightbulb className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium">Suggest Related Items</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        Get AI suggestions based on current preferences
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>AI will suggest similar {type === 'favorites' ? 'favorites' : type === 'allergies' ? 'allergens' : 'items to avoid'}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {activeFeature === 'voice' && (
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveFeature(null)}
                    className="mb-4"
                  >
                    ← Back to AI Options
                  </Button>
                  <VoiceAdd
                    onResult={handleVoiceResult}
                    onClose={() => setActiveFeature(null)}
                  />
                </div>
              )}

              {activeFeature === 'paste' && (
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveFeature(null)}
                    className="mb-4"
                  >
                    ← Back to AI Options
                  </Button>
                  <PasteIngredients
                    onResult={handlePasteResult}
                    onClose={() => setActiveFeature(null)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}