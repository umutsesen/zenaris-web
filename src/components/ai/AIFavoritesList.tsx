import { useState } from 'react';
import { Plus, Heart, Edit3, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { AIAutocomplete } from './AIAutocomplete';
import type {  FoodSuggestion } from './AIAutocomplete';
import { VoiceInput } from './VoiceInput';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { Food } from '../DataManager';

export interface AIFavoritesListProps {
  items: Food[];
  onAdd: (name: string, category?: string) => void;
  onUpdate: (id: string, name: string, category?: string) => void;
  onRemove: (id: string) => void;
}

export function AIFavoritesList({
  items,
  onAdd,
  onUpdate,
  onRemove
}: AIFavoritesListProps) {
  const [useAI] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [showAll, setShowAll] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name, category);
    setName("");
    setCategory("");
  };

  const handleAISelect = (suggestion: FoodSuggestion) => {
    onAdd(suggestion.name, suggestion.category);
  };


  const startEdit = (item: Food) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditCategory(item.category || "");
  };

  const handleUpdate = () => {
    if (!editName.trim() || !editingId) return;
    onUpdate(editingId, editName, editCategory);
    setEditingId(null);
    setEditName("");
    setEditCategory("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCategory("");
  };

  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
  const visibleItems = items.length > 8 && !showAll ? sortedItems.slice(0, 8) : sortedItems;


  return (
    <div className="space-y-6">
      {/* Add New Favorite */}
      <Card className="bg-ai-bg/50 border-ai-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Add a favorite food
          </CardTitle>
        </CardHeader>
        <CardContent>
          {useAI ? (
            <div className="space-y-4">
              <AIAutocomplete
                placeholder="Search or type a food…"
                onSelect={handleAISelect}
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                <VoiceInput
                  placeholder="e.g., Chicken soup, Apple pie..."
                  value={name}
                  onChange={setName}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="h-12 text-base"
                  onVoiceResult={(text) => {
                    setName(text);
                    // Auto-add if we have both name and it's a simple case
                    if (text.trim()) {
                      setTimeout(() => handleAdd(), 500);
                    }
                  }}
                />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger style={{ height: '43px'}}>
                    <SelectValue placeholder="When?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} disabled={!name.trim()} size="lg" className="h-12 px-6">
                <Plus className="h-5 w-5 mr-2" />
                Add Favorite
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show/Hide Toggle */}
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

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="text-center py-8 bg-green-50/50 rounded-md border border-green-200">
          <Heart className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-green-800 font-medium mb-2">No favorite foods added yet</p>
          <p className="text-green-600 text-sm">Add a few foods they love using the form above</p>
        </div>
      ) : (
        /* Favorites List */
        <ul className="space-y-2">
          {visibleItems.map((item) => (
            <li key={item.id} className="bg-green-50 border border-green-200 rounded-md p-3">
              {editingId === item.id ? (
                <div className="grid sm:grid-cols-[1fr_140px_auto] gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                  />
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No category</SelectItem>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleUpdate}>Save</Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-green-800">{item.name}</span>
                    {item.category && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onRemove(item.id)}>
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