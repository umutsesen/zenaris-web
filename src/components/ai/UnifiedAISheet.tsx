import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Mic, FileText, Image, Lightbulb, Upload } from 'lucide-react';
import { VoiceInputWithStates } from './VoiceInputWithStates';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { Food, DislikedFood, Allergy } from '../DataManager';

interface UnifiedAISheetProps {
  isOpen: boolean;
  onClose: () => void;
  section: 'favorites' | 'dislikes' | 'allergies' | 'notes';
  elderName: string;
  onAdd: (items: (Food | DislikedFood | Allergy)[]) => void;
}

interface PreviewItem {
  id: string;
  text: string;
  type: 'favorite' | 'avoid' | 'allergy';
  severity?: 'mild' | 'severe';
  level?: 'mild' | 'moderate' | 'absolute';
  category?: string;
  confidence: number;
  conflicts?: string[];
  selected?: boolean;
}

export function UnifiedAISheet({ 
  isOpen, 
  onClose, 
  section, 
  elderName, 
  onAdd 
}: UnifiedAISheetProps) {
  const [activeTab, setActiveTab] = useState('voice');
  const [pasteText, setPasteText] = useState('');
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const getSectionTitle = () => {
    switch (section) {
      case 'favorites':
        return `AI Assist: ${elderName}'s Favorites`;
      case 'dislikes':
        return `AI Assist: ${elderName}'s Avoid List`;
      case 'allergies':
        return `AI Assist: ${elderName}'s Allergies`;
      case 'notes':
        return `AI Assist: ${elderName}'s Special Needs`;
      default:
        return `AI Assist: ${elderName}`;
    }
  };

  const getSectionDescription = () => {
    switch (section) {
      case 'favorites':
        return 'Add foods and meals that they love using voice, text, or images';
      case 'dislikes':
        return 'Add foods and preferences they want to avoid';
      case 'allergies':
        return 'Add allergies and dietary restrictions';
      case 'notes':
        return 'Add special instructions and preferences';
      default:
        return 'Get AI assistance with meal preferences';
    }
  };

  const getVoiceHint = () => {
    switch (section) {
      case 'favorites':
        return "Say: 'loves pasta and chicken, enjoys Italian food, likes soft textures'";
      case 'dislikes':
        return "Say: 'hates spicy food, never serve mushrooms, dislikes cold meals'";
      case 'allergies':
        return "Say: 'allergic to nuts and dairy, lactose intolerant, severe shellfish allergy'";
      case 'notes':
        return "Say: 'needs soft foods, prefers warm meals, requires kosher diet'";
      default:
        return "Tell me about their preferences...";
    }
  };

  const handleVoiceAdd = () => {
    const mockItems: PreviewItem[] = [
      {
        id: '1',
        text: 'Chicken soup',
        type: section === 'favorites' ? 'favorite' : section === 'dislikes' ? 'avoid' : 'allergy',
        category: 'Main dishes',
        confidence: 95,
        conflicts: section === 'allergies' ? ['Previously marked as favorite'] : undefined
      },
      {
        id: '2', 
        text: 'Pasta dishes',
        type: section === 'favorites' ? 'favorite' : section === 'dislikes' ? 'avoid' : 'allergy',
        category: 'Main dishes',
        confidence: 90
      }
    ];
    
    setPreviewItems(mockItems);
    setShowPreview(true);
  };

  const handlePasteProcess = () => {
    if (!pasteText.trim()) return;
    
    const mockItems: PreviewItem[] = [
      {
        id: '3',
        text: 'Lactose intolerance',
        type: 'allergy',
        severity: 'mild',
        confidence: 98,
      },
      {
        id: '4',
        text: 'Tree nuts',
        type: 'allergy', 
        severity: 'severe',
        confidence: 95,
        conflicts: ['EpiPen required - verify with caregiver']
      }
    ];
    
    setPreviewItems(mockItems);
    setShowPreview(true);
  };

  const handleAddAll = () => {
    onAdd(previewItems);
    setPreviewItems([]);
    setShowPreview(false);
    setPasteText('');
    onClose();
  };

  const toggleItemSelection = (id: string) => {
    setPreviewItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, selected: !item.selected } 
          : item
      )
    );
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'favorite': return '❤️';
      case 'avoid': return '❌';
      case 'allergy': return '⚠️';
      default: return '📝';
    }
  };

  const getConflictBadge = (conflicts?: string[]) => {
    if (!conflicts?.length) return null;
    
    return (
      <Badge variant="destructive" className="text-xs">
        Conflict detected
      </Badge>
    );
  };

  if (showPreview) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Review & Add Items</SheetTitle>
            <SheetDescription>
              Review the AI suggestions and choose what to add
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {previewItems.map((item) => (
              <Card key={item.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getItemTypeIcon(item.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-base">{item.text}</h3>
                        <div className="flex gap-2">
                          {getConflictBadge(item.conflicts)}
                          <Badge variant="outline" className="text-xs">
                            {item.confidence}% confident
                          </Badge>
                        </div>
                      </div>
                      
                      {item.category && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Category: {item.category}
                        </p>
                      )}
                      
                      {item.conflicts && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border">
                          <strong>⚠️ Conflicts:</strong>
                          <ul className="list-disc ml-4 mt-1">
                            {item.conflicts.map((conflict, idx) => (
                              <li key={idx}>{conflict}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant={item.type === 'favorite' ? 'default' : 'outline'}
                          className="h-8"
                          onClick={() => toggleItemSelection(item.id)}
                        >
                          ❤️ Favorite
                        </Button>
                        <Button
                          size="sm" 
                          variant={item.type === 'avoid' ? 'default' : 'outline'}
                          className="h-8"
                          onClick={() => toggleItemSelection(item.id)}
                        >
                          ❌ Avoid
                        </Button>
                        <Button
                          size="sm"
                          variant={item.type === 'allergy' ? 'destructive' : 'outline'}
                          className="h-8"
                          onClick={() => toggleItemSelection(item.id)}
                        >
                          ⚠️ Allergy
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setShowPreview(false)} variant="outline" className="flex-1">
                Back to Edit
              </Button>
              <Button onClick={handleAddAll} className="flex-1 bg-ai-success hover:bg-ai-success/90">
                Add All Selected
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{getSectionTitle()}</SheetTitle>
          <SheetDescription>
            {getSectionDescription()}
          </SheetDescription>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
            <TabsTrigger value="suggest" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Suggest</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="voice" className="mt-6">
            <VoiceInputWithStates
              onAdd={handleVoiceAdd}
              placeholder={`Tell me about ${elderName}'s ${section}`}
              hint={getVoiceHint()}
            />
          </TabsContent>
          
          <TabsContent value="import" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Import from Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={`Paste notes about ${elderName}'s preferences, medical records, or care instructions...`}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  className="min-h-[120px] mb-4"
                />
                <Button 
                  onClick={handlePasteProcess}
                  disabled={!pasteText.trim()}
                  className="w-full"
                >
                  Process Text with AI
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-dashed border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Import from Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Drag & drop an image or</p>
                  <Button variant="outline" className="mt-2">
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="image" className="mt-6">
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Extract from Photos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload photos of meal lists, medical records, or care notes
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="suggest" className="mt-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Lightbulb className="h-16 w-16 mx-auto mb-4 text-ai-brand" />
                <h3 className="font-medium mb-2">AI Suggestions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get personalized recommendations based on {elderName}'s current preferences
                </p>
                <Button className="bg-ai-brand hover:bg-ai-brand/90">
                  Generate Suggestions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}