import { useState } from 'react';
import { Bot } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import  Label  from '../ui/label';
import { AIResultCard } from './AIResultCard';
import { AISkeleton } from './AISkeleton';
import { AIAlert } from './AIAlert';

interface MealSuggestion {
  id: string;
  title: string;
  description: string;
  safety: 'safe' | 'caution';
  tags: string[];
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  matches: string[];
  issues: string[];
  meal?: string;
}

export interface AIGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elderName?: string;
  onUseSuggestion?: (suggestion: MealSuggestion) => void;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
type GenerationState = 'idle' | 'loading' | 'results' | 'error';

const MOCK_SUGGESTIONS = {
  single: [
    {
      id: '1',
      title: 'Creamy Mushroom Soup',
      description: 'Warm, comforting soup with soft texture and mild flavors',
      safety: 'safe' as const,
      tags: ['warm', 'soft texture', 'dairy-free'],
      prepTime: '15 min',
      difficulty: 'Easy' as const,
      matches: ['mushrooms', 'warm foods'],
      issues: [],
    },
    {
      id: '2',
      title: 'Grilled Salmon with Herbs',
      description: 'Fresh fish with gentle seasoning, perfect for dinner',
      safety: 'caution' as const,
      tags: ['protein', 'omega-3', 'herbs'],
      prepTime: '20 min',
      difficulty: 'Medium' as const,
      matches: ['fish', 'healthy options'],
      issues: ['Contains fish - check for allergies'],
    },
  ],
  day: [
    {
      id: 'b1',
      title: 'Oatmeal with Banana',
      description: 'Soft, nutritious breakfast with natural sweetness',
      safety: 'safe' as const,
      tags: ['fiber', 'soft', 'naturally sweet'],
      prepTime: '5 min',
      difficulty: 'Easy' as const,
      matches: ['oats', 'bananas'],
      issues: [],
      meal: 'Breakfast',
    },
    {
      id: 'l1',
      title: 'Chicken Noodle Soup',
      description: 'Classic comfort food with tender chicken and vegetables',
      safety: 'safe' as const,
      tags: ['protein', 'warm', 'familiar'],
      prepTime: '25 min',
      difficulty: 'Easy' as const,
      matches: ['chicken', 'soup'],
      issues: [],
      meal: 'Lunch',
    },
    {
      id: 'd1',
      title: 'Baked Cod with Rice',
      description: 'Mild fish with fluffy rice and steamed vegetables',
      safety: 'safe' as const,
      tags: ['lean protein', 'mild flavors', 'soft'],
      prepTime: '30 min',
      difficulty: 'Medium' as const,
      matches: ['fish', 'rice'],
      issues: [],
      meal: 'Dinner',
    },
    {
      id: 's1',
      title: 'Vanilla Pudding',
      description: 'Smooth, creamy dessert that\'s easy to swallow',
      safety: 'caution' as const,
      tags: ['smooth', 'sweet', 'dairy'],
      prepTime: '5 min',
      difficulty: 'Easy' as const,
      matches: ['pudding', 'vanilla'],
      issues: ['Contains dairy'],
      meal: 'Snack',
    },
  ],
};

export function AIGenerationModal({
  open,
  onOpenChange,
  elderName = "them",
  onUseSuggestion
}: AIGenerationModalProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'day'>('single');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');
  const [preferences, setPreferences] = useState({
    softTexture: false,
    warm: false,
    lowPrep: false,
  });
  const [regionalPreference, setRegionalPreference] = useState('');
  const [state, setState] = useState<GenerationState>('idle');
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);

  const handleGenerate = async () => {
    setState('loading');
    
    setTimeout(() => {
      try {
        if (activeTab === 'single') {
          setSuggestions(MOCK_SUGGESTIONS.single);
        } else {
          setSuggestions(MOCK_SUGGESTIONS.day);
        }
        setState('results');
      } catch {
        setState('error');
      }
    }, 2000);
  };

  const handleRetry = () => {
    setState('idle');
    setSuggestions([]);
  };

  const handleUseSuggestion = (suggestion: MealSuggestion) => {
    onUseSuggestion?.(suggestion);
    onOpenChange(false);
  };

  const renderMealSegments = () => {
    const meals: { value: MealType; label: string }[] = [
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
      { value: 'dinner', label: 'Dinner' },
      { value: 'snack', label: 'Snack' },
      { value: 'drink', label: 'Drink' },
    ];

    return (
      <div className="flex flex-wrap gap-2">
        {meals.map((meal) => (
          <Button
            key={meal.value}
            variant={selectedMeal === meal.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMeal(meal.value)}
            className="h-8"
          >
            {meal.label}
          </Button>
        ))}
      </div>
    );
  };

  const renderPreferenceToggles = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="soft-texture">Soft texture</Label>
        <Switch
          id="soft-texture"
          checked={preferences.softTexture}
          onCheckedChange={(checked) => 
            setPreferences(prev => ({ ...prev, softTexture: checked }))
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="warm">Warm temperature</Label>
        <Switch
          id="warm"
          checked={preferences.warm}
          onCheckedChange={(checked) => 
            setPreferences(prev => ({ ...prev, warm: checked }))
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="low-prep">Low prep time</Label>
        <Switch
          id="low-prep"
          checked={preferences.lowPrep}
          onCheckedChange={(checked) => 
            setPreferences(prev => ({ ...prev, lowPrep: checked }))
          }
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Create a safe meal with AI
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            We consider allergies, dislikes and favorites for {elderName}
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'single' | 'day')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single item</TabsTrigger>
            <TabsTrigger value="day">Full day plan</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-3 block">
                What type of meal?
              </Label>
              {renderMealSegments()}
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                Optional preferences
              </Label>
              {renderPreferenceToggles()}
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={state === 'loading'}
              className="w-full"
              size="lg"
            >
              {state === 'loading' ? 'Generating...' : 'Generate suggestion'}
            </Button>
          </TabsContent>

          <TabsContent value="day" className="space-y-4">
            <div>
              <Label htmlFor="regional" className="text-base font-medium mb-3 block">
                Regional preference (optional)
              </Label>
              <Select value={regionalPreference} onValueChange={setRegionalPreference}>
                <SelectTrigger>
                  <SelectValue placeholder="Any cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any cuisine</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="european">European</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={state === 'loading'}
              className="w-full"
              size="lg"
            >
              {state === 'loading' ? 'Generating day plan...' : 'Generate day plan'}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Results Section */}
        <div className="space-y-4">
          {state === 'loading' && (
            <div className="space-y-3">
              {Array.from({ length: activeTab === 'single' ? 2 : 4 }).map((_, i) => (
                <AISkeleton key={i} variant="card" />
              ))}
            </div>
          )}

          {state === 'error' && (
            <AIAlert
              variant="danger"
              title="Something went wrong"
              action={{
                label: "Try again",
                onClick: handleRetry
              }}
            >
              We couldn't generate suggestions right now. Please try again.
            </AIAlert>
          )}

          {state === 'results' && (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id}>
                  {activeTab === 'day' && suggestion.meal && (
                    <Badge variant="secondary" className="mb-2">
                      {suggestion.meal}
                    </Badge>
                  )}
                  <AIResultCard
                    {...suggestion}
                    onUse={() => handleUseSuggestion(suggestion)}
                    onRefresh={handleGenerate}
                    onCopy={() => navigator.clipboard.writeText(suggestion.title)}
                    compact={activeTab === 'day'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-700">
            Not medical advice. Always confirm with caregivers.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}