import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  FileText, 
  Scan, 
  Check, 
  X, 
  Loader2,
  AlertTriangle,
  Info,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

type AllergySeverity = "mild" | "severe";
type DislikeLevel = "mild" | "moderate" | "absolute";

interface ExtractedItem {
  id: string;
  text: string;
  type: "allergy" | "dislike";
  severity?: AllergySeverity;
  level?: DislikeLevel;
  explanation: string;
  selected: boolean;
  highlighted: boolean;
}

interface PasteIngredientsProps {
  onResult: (items: string[]) => void;
  onClose: () => void;
}

export function PasteIngredients({ onResult, onClose }: PasteIngredientsProps) {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [highlightedText, setHighlightedText] = useState("");

  const simulateExtraction = () => {
    if (!inputText.trim()) {
      toast.error("Please paste some text first");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const mockExtracted: ExtractedItem[] = [
        {
          id: "1",
          text: "milk",
          type: "allergy",
          severity: "mild",
          explanation: "Found 'milk powder' in ingredients",
          selected: true,
          highlighted: true
        },
        {
          id: "2",
          text: "wheat",
          type: "allergy", 
          severity: "mild",
          explanation: "Contains 'wheat flour'",
          selected: true,
          highlighted: true
        },
        {
          id: "3",
          text: "nuts",
          type: "allergy",
          severity: "severe",
          explanation: "May contain traces of nuts",
          selected: true,
          highlighted: true
        },
        {
          id: "4",
          text: "artificial colors",
          type: "dislike",
          level: "moderate",
          explanation: "Contains Red 40, Yellow 5",
          selected: false,
          highlighted: true
        }
      ];

      // Create highlighted version of text
      let highlighted = inputText;
      const highlightTerms = ["milk powder", "wheat flour", "nuts", "Red 40", "Yellow 5"];
      highlightTerms.forEach(term => {
        const regex = new RegExp(`(${term})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
      });

      setExtractedItems(mockExtracted);
      setHighlightedText(highlighted);
      setIsProcessing(false);
    }, 2000);
  };

  const toggleItemSelection = (id: string) => {
    setExtractedItems(items => 
      items.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updateItemSeverity = (id: string, severity: AllergySeverity) => {
    setExtractedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, severity } : item
      )
    );
  };

  const updateItemLevel = (id: string, level: DislikeLevel) => {
    setExtractedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, level } : item
      )
    );
  };

  const handleAddSelected = () => {
    const selectedItems = extractedItems.filter(item => item.selected);
    const itemNames = selectedItems.map(item => item.text);
    
    onResult(itemNames);
    onClose();
    toast.success(`Added ${selectedItems.length} items from label`);
  };

  const handleReset = () => {
    setInputText("");
    setExtractedItems([]);
    setHighlightedText("");
    setIsProcessing(false);
  };

  const Content = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Paste ingredient list or food label text:
          </label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste ingredient list here... e.g., 'Contains: Wheat flour, milk powder, eggs, may contain traces of nuts'"
            className="min-h-[120px] text-sm"
            disabled={isProcessing}
          />
        </div>

        <Button 
          onClick={simulateExtraction} 
          disabled={!inputText.trim() || isProcessing}
          className="w-full h-12"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing text...
            </>
          ) : (
            <>
              <Scan className="h-4 w-4 mr-2" />
              Scan for allergens
            </>
          )}
        </Button>
      </div>

      {highlightedText && !isProcessing && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-600" />
              Highlighted ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightedText }}
            />
          </CardContent>
        </Card>
      )}

      {extractedItems.length > 0 && !isProcessing && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Found potential items</h3>
            <p className="text-muted-foreground text-sm">Review and select what to add</p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Potential allergies
              </h4>
              <div className="space-y-3">
                {extractedItems.filter(item => item.type === "allergy").map(item => (
                  <div key={item.id} className="p-4 border rounded-md bg-red-50/30 border-red-200">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleItemSelection(item.id)}
                        className="h-4 w-4 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium capitalize">{item.text}</span>
                          <Badge variant="secondary" className="text-xs">
                            Allergen
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Info className="h-3 w-3" />
                          <span>{item.explanation}</span>
                        </div>
                      </div>
                      <Select 
                        value={item.severity} 
                        onValueChange={(value: AllergySeverity) => updateItemSeverity(item.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {extractedItems.filter(item => item.type === "dislike").length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <X className="h-4 w-4 text-orange-500" />
                  Potential preferences
                </h4>
                <div className="space-y-3">
                  {extractedItems.filter(item => item.type === "dislike").map(item => (
                    <div key={item.id} className="p-4 border rounded-md bg-orange-50/30 border-orange-200">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItemSelection(item.id)}
                          className="h-4 w-4 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium capitalize">{item.text}</span>
                            <Badge variant="outline" className="text-xs">
                              Ingredient
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Info className="h-3 w-3" />
                            <span>{item.explanation}</span>
                          </div>
                        </div>
                        <Select 
                          value={item.level} 
                          onValueChange={(value: DislikeLevel) => updateItemLevel(item.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">Mild dislike</SelectItem>
                            <SelectItem value="moderate">Strong dislike</SelectItem>
                            <SelectItem value="absolute">Never serve</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleAddSelected} 
              className="flex-1"
              disabled={!extractedItems.some(item => item.selected)}
            >
              <Check className="h-4 w-4 mr-2" />
              Add selected ({extractedItems.filter(item => item.selected).length})
            </Button>
            <Button variant="outline" onClick={() => setExtractedItems(items => items.map(item => ({ ...item, selected: false })))}>
              Deselect all
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {extractedItems.length === 0 && !isProcessing && inputText && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No allergens detected in the text</p>
          <p className="text-sm mt-1">Try pasting a more complete ingredient list</p>
        </div>
      )}
    </div>
  );

  // Render as a Card component that can be embedded inline
  return (
    <Card className="mt-4 border-ai-border bg-ai-bg/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5" />
          Paste Ingredients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Content />
      </CardContent>
    </Card>
  );
}