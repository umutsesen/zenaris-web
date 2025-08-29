import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import  Label  from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Shield, 
  Activity
} from "lucide-react";
import { VoiceInput } from "./VoiceInput";

type AllergySeverity = "mild" | "severe";

interface Allergy {
  id: string;
  label: string;
  severity: AllergySeverity;
}

interface EnhancedAllergyListProps {
  items: Allergy[];
  onAdd: (label: string, severity: AllergySeverity) => void;
  onUpdate: (id: string, label: string, severity: AllergySeverity) => void;
  onRemove: (id: string) => void;
}

const QUICK_ALLERGENS = [
  "nuts", "dairy", "gluten", "egg", "soy", "shellfish", "fish", "sesame"
] as const;

export function EnhancedAllergyList({
  items,
  onAdd,
  onUpdate,
  onRemove
}: EnhancedAllergyListProps) {
  const [label, setLabel] = useState("");
  const [severity, setSeverity] = useState<AllergySeverity>("mild");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editSeverity, setEditSeverity] = useState<AllergySeverity>("mild");

  const handleAdd = () => {
    if (!label.trim()) return;
    onAdd(label, severity);
    setLabel("");
    setSeverity("mild");
  };

  const handleQuickAdd = (allergen: string) => {
    onAdd(allergen, "mild");
  };

  const startEdit = (item: Allergy) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditSeverity(item.severity);
  };

  const handleUpdate = () => {
    if (!editLabel.trim() || !editingId) return;
    onUpdate(editingId, editLabel, editSeverity);
    setEditingId(null);
    setEditLabel("");
    setEditSeverity("mild");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
    setEditSeverity("mild");
  };

  const getSeverityStyles = (severity: AllergySeverity) => {
    return severity === "severe"
      ? "bg-red-50 border-red-300 text-red-900 border-l-4 border-l-red-500"
      : "bg-blue-50 border-blue-200 text-blue-900 border-l-2 border-l-blue-300";
  };

  const getSeverityIndicator = (severity: AllergySeverity) => {
    if (severity === "severe") {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4 text-red-600" />
            <Activity className="h-3 w-3 text-red-600" />
          </div>
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
          </div>
          <Badge variant="destructive" className="text-xs font-medium">SEVERE</Badge>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500" />
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-blue-300"></div>
            <div className="h-2 w-2 rounded-full bg-gray-200"></div>
            <div className="h-2 w-2 rounded-full bg-gray-200"></div>
          </div>
          <Badge variant="secondary" className="text-xs">Mild</Badge>
        </div>
      );
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
          <div className="p-2 rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
         Are there any allergies or intolerances?
         
        </h3>
        <p className="text-sm text-red-700 mb-4">
          IMPORTANT: Medical information that affects food safety
        </p>
      </div>

      {/* Quick Add Chips */}
      <Card className="bg-red-50/50 border border-red-200">
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-3 block text-red-800">
            Quick-add common allergens:
          </Label>
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_ALLERGENS.map(allergen => (
              <Button
                key={allergen}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd(allergen)}
                className="text-sm capitalize border-red-200 hover:bg-red-50 h-8"
                disabled={items.some(item => item.label.toLowerCase() === allergen)}
              >
                {allergen}
              </Button>
            ))}
          </div>

          {/* Manual Add Form */}
          <Label className="text-base font-medium mb-4 block text-red-900">
            Add specific allergy or intolerance:
          </Label>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
              <VoiceInput
                placeholder="e.g., Peanuts, Lactose..."
                value={label}
                onChange={setLabel}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="h-12 text-base"
                onVoiceResult={(text) => {
                  setLabel(text);
                  if (text.trim()) {
                    setTimeout(() => handleAdd(), 500);
                  }
                }}
              />
              <Select value={severity} onValueChange={(value: AllergySeverity) => setSeverity(value)}>
                <SelectTrigger style={{ height: '43px'}}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild reaction</SelectItem>
                  <SelectItem value="severe">SEVERE - Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAdd} 
              disabled={!label.trim()} 
              size="lg" 
              className="h-12 px-6 bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Allergy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Allergy List */}
      {items.length === 0 ? (
        <div className="text-center py-8 bg-red-50/50 rounded-md border border-red-200">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-800 font-medium mb-2">No allergies or intolerances recorded</p>
          <p className="text-red-600 text-sm">Please review with care.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map(item => (
            <li key={item.id} className={`rounded-md border p-4 ${getSeverityStyles(item.severity)}`}>
              {editingId === item.id ? (
                <div className="grid sm:grid-cols-[1fr_120px_auto] gap-3">
                  <Input
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                    className="h-10"
                  />
                  <Select value={editSeverity} onValueChange={(value: AllergySeverity) => setEditSeverity(value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdate} className="h-10">Save</Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit} className="h-10">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-base">{item.label}</span>
                      {/* this feature has been reserved for future development. */}
                    {/*   <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <Info className="h-3 w-3 mr-1" />
                        Why?
                      </Button> */}
                    </div>
                    <div className="mt-2">{getSeverityIndicator(item.severity)}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
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
      )}


    </div>
  );
}