import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Mic, 
  MicOff, 
  Loader2, 
  Check, 
  X, 
  Edit3,
  AlertTriangle,
  Settings
} from "lucide-react";
import { toast } from "sonner";

type VoiceState = "idle" | "listening" | "processing" | "results" | "error";
type AllergySeverity = "mild" | "severe";
type DislikeLevel = "mild" | "moderate" | "absolute";

interface DetectedItem {
  id: string;
  text: string;
  type: "allergy" | "dislike";
  severity?: AllergySeverity;
  level?: DislikeLevel;
  confidence: "high" | "medium" | "low";
  selected: boolean;
}

interface VoiceAddProps {
  onResult: (text: string) => void;
  onClose: () => void;
}

export function VoiceAdd({ onResult, onClose }: VoiceAddProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [transcript, setTranscript] = useState("");
  const [, setMicPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [, setIsRecording] = useState(false);

  const startListening = async () => {
    try {
      // Check for microphone permission
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicPermission(permission.state);
      
      if (permission.state === 'denied') {
        setVoiceState("error");
        return;
      }

      setVoiceState("listening");
      setIsRecording(true);
      
      setTimeout(() => {
        setVoiceState("processing");
        setTranscript("No peanuts, dairy mild. Avoid spicy foods, never serve shellfish.");
        
        setTimeout(() => {
          simulateResults();
        }, 2000);
      }, 3000);
      
    } catch {
      setVoiceState("error");
      toast.error("Microphone access failed");
    }
  };

  const stopListening = () => {
    setIsRecording(false);
    if (voiceState === "listening") {
      setVoiceState("processing");
      setTranscript("Processing what you said...");
      setTimeout(() => simulateResults(), 1500);
    }
  };

  const simulateResults = () => {
    const mockItems: DetectedItem[] = [
      {
        id: "1",
        text: "peanuts",
        type: "allergy",
        severity: "severe",
        confidence: "high",
        selected: true
      },
      {
        id: "2", 
        text: "dairy",
        type: "allergy",
        severity: "mild",
        confidence: "high",
        selected: true
      },
      {
        id: "3",
        text: "spicy foods",
        type: "dislike",
        level: "moderate",
        confidence: "medium",
        selected: true
      },
      {
        id: "4",
        text: "shellfish",
        type: "allergy",
        severity: "severe",
        confidence: "high",
        selected: true
      }
    ];
    
    setDetectedItems(mockItems);
    setVoiceState("results");
  };

  const toggleItemSelection = (id: string) => {
    setDetectedItems(items => 
      items.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updateItemSeverity = (id: string, severity: AllergySeverity) => {
    setDetectedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, severity } : item
      )
    );
  };

  const updateItemLevel = (id: string, level: DislikeLevel) => {
    setDetectedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, level } : item
      )
    );
  };

  const handleAddSelected = () => {
    const selectedItems = detectedItems.filter(item => item.selected);
    // For now, just send the first detected item as text
    // Later this could be enhanced to handle multiple items
    if (selectedItems.length > 0) {
      onResult(selectedItems[0].text);
    }
    onClose();
    toast.success(`Added ${selectedItems.length} items`);
  };

  const handleReset = () => {
    setVoiceState("idle");
    setDetectedItems([]);
    setTranscript("");
    setIsRecording(false);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const Content = () => (
    <div className="space-y-6">
      {voiceState === "idle" && (
        <div className="text-center py-8">
          <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full grid place-content-center mb-6">
            <Mic className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">Ready to listen</h3>
          <p className="text-muted-foreground mb-6">
            Tap to speak and tell us about allergies and food preferences
          </p>
          <Button onClick={startListening} size="lg" className="h-14 px-8">
            <Mic className="h-5 w-5 mr-2" />
            Tap to speak
          </Button>
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              💡 You can say: "No peanuts, dairy mild. Avoid spicy foods."
            </p>
          </div>
        </div>
      )}

      {voiceState === "listening" && (
        <div className="text-center py-8">
          <div className="mx-auto w-24 h-24 bg-red-50 rounded-full grid place-content-center mb-6 relative">
            <Mic className="h-12 w-12 text-red-600" />
            <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
          </div>
          <h3 className="text-lg font-medium mb-2 text-red-600">Listening...</h3>
          <p className="text-muted-foreground mb-6">
            Speak clearly about allergies and food preferences
          </p>
          
          {/* Simulated waveform */}
          <div className="flex justify-center items-end gap-1 mb-6">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="w-1 bg-red-500 rounded-full animate-pulse"
                style={{ 
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
          
          <Button onClick={stopListening} variant="outline" size="lg">
            <MicOff className="h-5 w-5 mr-2" />
            Stop recording
          </Button>
        </div>
      )}

      {voiceState === "processing" && (
        <div className="text-center py-8">
          <div className="mx-auto w-24 h-24 bg-purple-50 rounded-full grid place-content-center mb-6">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
          </div>
          <h3 className="text-lg font-medium mb-2">Processing...</h3>
          <p className="text-muted-foreground mb-4">
            Analyzing for known allergens and preferences
          </p>
          {transcript && (
            <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700 italic">
              "{transcript}"
            </div>
          )}
        </div>
      )}

      {voiceState === "results" && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">We heard these items</h3>
            <p className="text-muted-foreground">Review and confirm what to add</p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Allergies detected
              </h4>
              <div className="space-y-2">
                {detectedItems.filter(item => item.type === "allergy").map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-md">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItemSelection(item.id)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <span className="font-medium capitalize">{item.text}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getConfidenceColor(item.confidence)}`}></div>
                        <span className="text-xs text-muted-foreground">
                          {item.confidence} confidence
                        </span>
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
                    <Button size="sm" variant="ghost">
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <X className="h-4 w-4 text-orange-500" />
                Foods to avoid
              </h4>
              <div className="space-y-2">
                {detectedItems.filter(item => item.type === "dislike").map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-md">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItemSelection(item.id)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <span className="font-medium capitalize">{item.text}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getConfidenceColor(item.confidence)}`}></div>
                        <span className="text-xs text-muted-foreground">
                          {item.confidence} confidence
                        </span>
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
                    <Button size="sm" variant="ghost">
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleAddSelected} 
              className="flex-1"
              disabled={!detectedItems.some(item => item.selected)}
            >
              <Check className="h-4 w-4 mr-2" />
              Add selected ({detectedItems.filter(item => item.selected).length})
            </Button>
            <Button variant="outline" onClick={() => setDetectedItems(items => items.map(item => ({ ...item, selected: false })))}>
              Deselect all
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {voiceState === "error" && (
        <div className="text-center py-8">
          <div className="mx-auto w-24 h-24 bg-red-50 rounded-full grid place-content-center mb-6">
            <MicOff className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-red-600">Microphone access needed</h3>
          <p className="text-muted-foreground mb-6">
            Please allow microphone access to use voice input
          </p>
          <div className="space-y-3">
            <Button onClick={() => setVoiceState("idle")} size="lg">
              <Settings className="h-5 w-5 mr-2" />
              Try again
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Render as a Card component that can be embedded inline
  return (
    <Card className="mt-4 border-ai-border bg-ai-bg/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Mic className="h-5 w-5" />
          Voice Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Content />
      </CardContent>
    </Card>
  );
}