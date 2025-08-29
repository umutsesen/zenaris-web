import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Label from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  ChevronDown, 
  ChevronUp,
  Ban,
} from "lucide-react";
import { VoiceInput } from "./VoiceInput";

type DislikeLevel = "mild" | "moderate" | "absolute";

interface DislikedFood {
  id: string;
  name: string;
  level: DislikeLevel;
}

interface EnhancedDislikesListProps {
  items: DislikedFood[];
  onAdd: (name: string, level: DislikeLevel) => void;
  onUpdate: (id: string, name: string, level: DislikeLevel) => void;
  onRemove: (id: string) => void;
}

export function EnhancedDislikesList({
  items,
  onAdd,
  onUpdate,
  onRemove
}: EnhancedDislikesListProps) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState<DislikeLevel>("mild");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState<DislikeLevel>("mild");
  const [showAll, setShowAll] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name, level);
    setName("");
    setLevel("mild");
  };

  const startEdit = (item: DislikedFood) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditLevel(item.level);
  };

  const handleUpdate = () => {
    if (!editName.trim() || !editingId) return;
    onUpdate(editingId, editName, editLevel);
    setEditingId(null);
    setEditName("");
    setEditLevel("mild");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditLevel("mild");
  };

  const getSeverityStyles = (level: DislikeLevel) => {
    switch (level) {
      case "absolute": return "bg-red-50 border-red-200 text-red-800 border-l-4 border-l-red-500";
      case "moderate": return "bg-yellow-50 border-yellow-200 text-yellow-800 border-l-2 border-l-yellow-400";
      default: return "bg-orange-50 border-orange-200 text-orange-800 border-l-2 border-l-orange-300";
    }
  };

  const getSeverityBadge = (level: DislikeLevel) => {
    switch (level) {
      case "absolute": 
        return (
          <div className="flex items-center gap-2">
            <Ban className="h-4 w-4 text-red-600" />
            <Badge variant="destructive" className="text-xs font-medium">NEVER SERVE</Badge>
          </div>
        );
      case "moderate": 
        return <Badge className="bg-yellow-500 text-white text-xs">Strong dislike</Badge>;
      default: 
        return <Badge variant="secondary" className="text-xs">Mild dislike</Badge>;
    }
  };

  // Sort by severity: absolute -> moderate -> mild
  const sortedItems = [...items].sort((a, b) => {
    const levelOrder = ["absolute", "moderate", "mild"];
    const aLevel = levelOrder.indexOf(a.level);
    const bLevel = levelOrder.indexOf(b.level);
    if (aLevel !== bLevel) {
      return aLevel - bLevel;
    }
    return a.name.localeCompare(b.name);
  });

  const visibleItems = items.length > 8 && !showAll ? sortedItems.slice(0, 8) : sortedItems;



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
          <X className="h-6 w-6 text-orange-500" />
          What should we avoid serving?
        </h3>
        <p className="text-sm text-muted-foreground">
          Foods they dislike or refuse to eat
        </p>
      </div>

      {/* Add Form */}
      <Card className="bg-accent/30 border border-border">
        <CardContent className="p-4">
          <Label className="text-base font-medium mb-4 block">Add something to avoid:</Label>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
              <VoiceInput
                placeholder="e.g., Spicy foods, Raw onions..."
                value={name}
                onChange={setName}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="h-12 text-base"
                onVoiceResult={(text) => {
                  setName(text);
                  if (text.trim()) {
                    setTimeout(() => handleAdd(), 500);
                  }
                }}
              />
              <Select value={level} onValueChange={(value: DislikeLevel) => setLevel(value)}>
                <SelectTrigger style={{ height: '43px'}}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild dislike</SelectItem>
                  <SelectItem value="moderate">Strong dislike</SelectItem>
                  <SelectItem value="absolute">Never serve</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} disabled={!name.trim()} size="lg" className="h-12 px-6">
              <Plus className="h-5 w-5 mr-2" />
              Add to Avoid
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Show/Hide Toggle for long lists */}
      {items.length > 8 && (
        <div className="flex justify-center py-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All {items.length} Items
              </>
            )}
          </Button>
        </div>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-8 px-2 bg-orange-50/50 rounded-md border border-orange-200">
          <X className="h-12 w-12 text-orange-400 mx-auto mb-3" />
          <p className="text-orange-800 font-medium mb-2">No foods to avoid listed</p>
          <p className="text-orange-600 text-sm">Add any foods they dislike. Use "Never serve" for absolute dislikes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Group by severity levels for better organization */}
          {["absolute", "moderate", "mild"].map(severityLevel => {
            const levelItems = visibleItems.filter(item => item.level === severityLevel);
            if (levelItems.length === 0) return null;

            const getLevelTitle = (level: string) => {
              switch (level) {
                case "absolute": return "⛔ Never Serve";
                case "moderate": return "⚠️ Strong Dislikes";
                case "mild": return "😐 Mild Dislikes";
                default: return level;
              }
            };

            return (
              <div key={severityLevel}>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-muted-foreground">
                  {getLevelTitle(severityLevel)}
                  <span className="text-xs">({levelItems.length})</span>
                </h4>
                <ul className="space-y-2">
                  {levelItems.map(item => (
                    <li key={item.id} className={`rounded-md border p-3 ${getSeverityStyles(item.level)}`}>
                      {editingId === item.id ? (
                        <div className="grid sm:grid-cols-[1fr_140px_auto] gap-2">
                          <Input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                            className="h-10"
                          />
                          <Select value={editLevel} onValueChange={(value: DislikeLevel) => setEditLevel(value)}>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mild">Mild</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="absolute">Absolute</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={handleUpdate} className="h-10">Save</Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit} className="h-10">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{item.name}</span>
                            <div className="mt-2">{getSeverityBadge(item.level)}</div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button size="sm" variant="ghost" onClick={() => startEdit(item)} className="h-8 w-8 p-0">
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => onRemove(item.id)} className="h-8 w-8 p-0">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}


    </div>
  );
}