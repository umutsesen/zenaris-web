import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import  Label from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import {  Plus, Heart, AlertTriangle, FileText, Save, Phone, Bot, Archive, UserPlus, } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useDataPersistence } from "./components/DataManager";
import type {  Elder, Food, DislikedFood, Allergy } from './components/DataManager'
import { useChangeHistory } from "./utils/change-history-hooks"
import { MealSuggestions } from "./components/MealSuggestions";
import { ExportManager } from "./components/ExportManager";
import { ChangeHistory } from "./components/ChangeHistory";
import { 
  safeAddFavorite, 
  safeAddDislike, 
  safeAddAllergy, 
  getDislikeLevelText,
  getSeverityText,
  PrefsSchema 
} from "./utils/data-validation-utils";
import { AIFavoritesList } from "./components/ai/AIFavoritesList";
import { EnhancedAllergyList } from "./components/ai/EnhancedAllergyList";
import { EnhancedDislikesList } from "./components/ai/EnhancedDislikesList";
import { SafetyHistory } from "./components/ai/ConflictAlert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./components/ui/dialog";
import { UnifiedAIButton } from "./components/ai/UnifiedAIButton";
import { MobileAIInterface } from "./components/ai/MobileAIInterface";
import { ProgressBar } from "./components/ProgressBar";
import { showAddUndoToast, showRemoveUndoToast, showUpdateUndoToast } from "./components/UndoToast";


const uid = () => Math.random().toString(36).slice(2, 9);

const MOCK_ELDERS: Elder[] = [
  { 
    id: "1", 
    name: "Michael Mohr", 
    initial: "M", 
    birthday: "16.12.1970", 
    status: "🚀 Active", 
    lastOnline: "2 months ago",
    emergencyContact: "+49 030 123456789",
    primaryCaregiver: "Anna Mohr (Daughter)"
  },
  { 
    id: "2", 
    name: "Emma Schneider", 
    initial: "E", 
    birthday: "23.08.1965", 
    status: "💤 Resting", 
    lastOnline: "1 week ago",
    emergencyContact: "+49 040 987654321",
    primaryCaregiver: "Thomas Schneider (Son)"
  },
  { 
    id: "3", 
    name: "Heinrich Weber", 
    initial: "H", 
    birthday: "12.03.1948", 
    status: "🌱 Recovering", 
    lastOnline: "3 days ago",
    emergencyContact: "+49 089 555123456",
    primaryCaregiver: "Care Home Staff"
  },
];

export default function App() {
  const [elders, setElders] = useState<Elder[]>(MOCK_ELDERS);
  const [selectedElder, setSelectedElder] = useState<Elder>(MOCK_ELDERS[0]);
  const { data, isLoading, lastSaved, saveData } = useDataPersistence(selectedElder.id);
  const { addChange } = useChangeHistory(selectedElder.id);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [showAISheet, setShowAISheet] = useState(false);
  const [aiSection, setAISection] = useState<'favorites' | 'dislikes' | 'allergies' | 'notes'>('favorites');

  // Use data from persistence
  const favorites = data.favorites;
  const dislikes = data.dislikes;
  const allergies = data.allergies;
  const notes = data.notes;

  const setFavorites = (newFavorites: Food[] | ((prev: Food[]) => Food[])) => {
    const updatedFavorites = typeof newFavorites === 'function' ? newFavorites(favorites) : newFavorites;
    saveData({ favorites: updatedFavorites });
  };

  const setDislikes = (newDislikes: DislikedFood[] | ((prev: DislikedFood[]) => DislikedFood[])) => {
    const updatedDislikes = typeof newDislikes === 'function' ? newDislikes(dislikes) : newDislikes;
    saveData({ dislikes: updatedDislikes });
  };

  const setAllergies = (newAllergies: Allergy[] | ((prev: Allergy[]) => Allergy[])) => {
    const updatedAllergies = typeof newAllergies === 'function' ? newAllergies(allergies) : newAllergies;
    saveData({ allergies: updatedAllergies });
  };

  const setNotes = (newNotes: string) => {
    saveData({ notes: newNotes });
  };

  const openAISheet = useCallback((section: 'favorites' | 'dislikes' | 'allergies' | 'notes') => {
    setAISection(section);
    setShowAISheet(true);
  }, []);

  const handleAIProcessedItems = () => {
    setShowAISheet(false);
  };

  // Check if there are any safety blockers for tab badge
  const hasSafetyBlockers = allergies.some(a => a.severity === 'severe') || 
                          dislikes.some(d => d.level === 'absolute');


                            const handleSavePreferences = useCallback(() => {
    // Validate data before saving
    const validation = PrefsSchema.safeParse(data);
    if (!validation.success) {
      toast.error("Invalid data detected. Please check your entries.");
      return;
    }

    const success = saveData(data, "Manual Save");
    if (success) {
      toast.success("Meal preferences saved successfully!");
      addChange('updated', 'notes', 'Manual save triggered', 'User');
    } else {
      toast.error("Failed to save preferences");
    }
  }, [data, saveData, addChange]);

  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '/':
          e.preventDefault();
          // Focus search (would implement search in real app)
          break;
        case 'v':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            // Start voice input (would implement in real app)
            openAISheet('favorites');
          }
          break;
        case 'a':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            openAISheet('favorites');
          }
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleSavePreferences();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [openAISheet, handleSavePreferences]);


  const handlePrintSummary = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const handleAddPerson = (personData: Omit<Elder, 'id'>) => {
    const newPerson: Elder = {
      ...personData,
      id: uid(),
    };
    setElders(prev => [...prev, newPerson]);
    setSelectedElder(newPerson);
    setShowAddPersonModal(false);
    toast.success(`Added ${newPerson.name} to the system`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading preferences...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to content
      </a>
      
      {/* Live region for save status announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : ""}
      </div>

      <main id="main" className="min-h-screen bg-background mobile-container">
        <PersonSelector 
          elders={elders} 
          selectedElder={selectedElder} 
          onElderChange={setSelectedElder}
          onAddPerson={() => setShowAddPersonModal(true)}
        />
        <Header 
          elder={selectedElder} 
          favorites={favorites}
          dislikes={dislikes}
          allergies={allergies}
          notes={notes}
          lastSaved={lastSaved}
          onSave={handleSavePreferences} 
          onPrint={handlePrintSummary}
        />

        {/* Add Person Modal */}
        <AddPersonModal 
          isOpen={showAddPersonModal}
          onClose={() => setShowAddPersonModal(false)}
          onAdd={handleAddPerson}
        />

        {/* Mobile AI Interface */}
        <MobileAIInterface
          isOpen={showAISheet}
          onClose={() => setShowAISheet(false)}
          section={aiSection}
          elderName={selectedElder.name}
          onAdd={handleAIProcessedItems}
        />

        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8  main-content-spacing mobile-container">
          <Tabs defaultValue="preferences" className="w-full ">
            <div className="flex  mb-2 ">
              <TabsList className="grid grid-cols-3 max-w-md tabs-list-enhanced rounded-md gap-2 py-1 px-2 h-14 w-full sm:w-auto sm:min-w-[384px] shadow-sm " role="tablist">
                <TabsTrigger 
                  value="preferences" 
                  className="flex items-center gap-2 h-10 px-4 text-sm font-medium relative cursor-pointer"
                  aria-label="Meal preferences and dietary requirements"
                >
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Preferences</span>
                  <span className="sm:hidden">Prefs</span>
                  {hasSafetyBlockers && (
                    <div 
                      className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border border-white"
                      role="img"
                      aria-label="Warning: Severe allergies or absolute dislikes noted"
                    ></div>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="suggestions" 
                  className="flex items-center gap-2 h-10 px-4 text-sm font-medium cursor-pointer"
                  aria-label="AI-powered meal suggestions"
                >
                  <Bot className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Suggestions</span>
                  <span className="sm:hidden">AI</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex items-center gap-2 h-10 px-4 text-sm font-medium cursor-pointer"
                  aria-label="Change history and activity log"
                >
                  <Archive className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">History</span>
                  <span className="sm:hidden">Log</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preferences" className="grid gap-4 lg:gap-6 lg:grid-cols-[1fr_380px]">
              <div className="space-y-4 lg:space-y-6">
                <Card className="card-shadow border-border" id="favorites">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-6 w-6 text-pink-500" aria-hidden="true" />
                      What does {selectedElder.name} love to eat?
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Foods they really enjoy and ask for</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* AI Button */}
                     
                        <UnifiedAIButton
                          section="favorites"
                          elderName={selectedElder.name}
                            isEmpty={favorites.length === 0}
                          onClick={() => openAISheet('favorites')}
                          className="w-full justify-start"
                        />
                   

                      {/* Manual Entry & List */}
                      <AIFavoritesList 
                        items={favorites}
                        onAdd={(n,c)=>{
                          safeAddFavorite(n, c as 'breakfast' | 'lunch' | 'dinner' | 'snack' | undefined, favorites, dislikes, (name, category) => {
                            const newItem = {id:uid(),name,category};
                            setFavorites(p=>[...p,newItem] as Food[]);
                            addChange('added', 'favorites', `Added "${name}" to favorites`);
                            showAddUndoToast(name, 'favorites', () => {
                              setFavorites(p=>p.filter(i=>i.id!==newItem.id));
                            });
                          });
                        }}
                        onUpdate={(id,n,c)=>{
                          const oldItem = favorites.find(f => f.id === id);
                          const oldName = oldItem?.name || '';
                          setFavorites(p=>p.map(i=>i.id===id?{...i,name:n,category:(c as 'breakfast' | 'lunch' | 'dinner' | 'snack' | undefined)||undefined}:i));
                          addChange('updated', 'favorites', `Updated favorite: "${oldName}" → "${n}"`);
                          showUpdateUndoToast(n, 'favorites', () => {
                            setFavorites(p=>p.map(i=>i.id===id?{...i,name:oldName,category:oldItem?.category}:i));
                          });
                        }}
                        onRemove={(id)=>{
                          const item = favorites.find(f => f.id === id);
                          if (!item) return;
                          setFavorites(p=>p.filter(i=>i.id!==id));
                          addChange('removed', 'favorites', `Removed "${item.name}" from favorites`);
                          showRemoveUndoToast(item.name, 'favorites', () => {
                            setFavorites(p=>[...p,item]);
                          });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow border-border" id="dislikes">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* AI Button */}
                  
                        <UnifiedAIButton
                          section="dislikes"
                          elderName={selectedElder.name}
                            isEmpty={dislikes.length === 0}
                          onClick={() => openAISheet('dislikes')}
                          className="w-full justify-start"
                        />
                 

                      {/* Manual Entry & List */}
                      <EnhancedDislikesList 
                        items={dislikes}
                        onAdd={(n,l)=>{
                          safeAddDislike(n, l, favorites, dislikes, (name, level) => {
                            const newItem = {id:uid(),name,level};
                            setDislikes(p=>[...p,newItem]);
                            addChange('added', 'dislikes', `Added "${name}" to avoid list (${getDislikeLevelText(level)})`);
                            showAddUndoToast(name, 'dislikes', () => {
                              setDislikes(p=>p.filter(i=>i.id!==newItem.id));
                            });
                          });
                        }}
                        onUpdate={(id,n,l)=>{
                          const oldItem = dislikes.find(d => d.id === id);
                          const oldName = oldItem?.name || '';
                          setDislikes(p=>p.map(i=>i.id===id?{...i,name:n,level:l as 'mild' | 'moderate' | 'absolute'}:i));
                          addChange('updated', 'dislikes', `Updated dislike: "${oldName}" → "${n}" (${l})`);
                          showUpdateUndoToast(n, 'dislikes', () => {
                            setDislikes(p=>p.map(i=>i.id===id?{...i,name:oldName,level:oldItem?.level as 'mild' | 'moderate' | 'absolute'}:i));
                          });
                        }}
                        onRemove={(id)=>{
                          const item = dislikes.find(d => d.id === id);
                          if (!item) return;
                          setDislikes(p=>p.filter(i=>i.id!==id));
                          addChange('removed', 'dislikes', `Removed "${item.name}" from avoid list`);
                          showRemoveUndoToast(item.name, 'dislikes', () => {
                            setDislikes(p=>[...p,item]);
                          });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow border-border border-[1.5px] border-destructive bg-red-50/30" id="allergies">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* AI Button */}
                    
                        <UnifiedAIButton
                          section="allergies"
                          elderName={selectedElder.name}
                            isEmpty={allergies.length === 0}
                          onClick={() => openAISheet('allergies')}
                          className="w-full justify-start"
                        />
                    

                      {/* Manual Entry & List */}
                      <EnhancedAllergyList 
                        items={allergies}
                        onAdd={(l,s)=>{
                          safeAddAllergy(l, s, allergies, (label, severity) => {
                            const newItem = {id:uid(),label,severity};
                            setAllergies(p=>[...p,newItem]);
                            addChange('added', 'allergies', `Added "${label}" allergy (${getSeverityText(severity)})`);
                            showAddUndoToast(label, 'allergies', () => {
                              setAllergies(p=>p.filter(i=>i.id!==newItem.id));
                            });
                          });
                        }}
                        onUpdate={(id,l,s)=>{
                          const oldItem = allergies.find(a => a.id === id);
                          const oldLabel = oldItem?.label || '';
                          setAllergies(p=>p.map(i=>i.id===id?{...i,label:l,severity:s as 'mild' | 'severe'}:i));
                          addChange('updated', 'allergies', `Updated allergy: "${oldLabel}" → "${l}" (${s})`);
                          showUpdateUndoToast(l, 'allergies', () => {
                            setAllergies(p=>p.map(i=>i.id===id?{...i,label:oldLabel,severity:oldItem?.severity as 'mild' | 'severe'}:i));
                          });
                        }}
                        onRemove={(id)=>{
                          const item = allergies.find(a => a.id === id);
                          if (!item) return;
                          setAllergies(p=>p.filter(i=>i.id!==id));
                          addChange('removed', 'allergies', `Removed "${item.label}" allergy`);
                          showRemoveUndoToast(item.label, 'allergies', () => {
                            setAllergies(p=>[...p,item]);
                          });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow border-border" id="notes">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
                      Any other important details?
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Texture preferences, temperature needs, cultural foods, religious requirements, etc.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* AI Button */}
               
                        <UnifiedAIButton
                          section="notes"
                          elderName={selectedElder.name}
                            isEmpty={notes.length === 0}
                          onClick={() => openAISheet('notes')}
                          className="w-full justify-start"
                        />
             

                      {/* Manual Entry */}
                      <Notes 
                        value={notes} 
                        onChange={(newNotes) => {
                          const oldNotes = notes;
                          setNotes(newNotes);
                          if (oldNotes !== newNotes) {
                            addChange('notes_changed', 'notes', 'Updated special instructions', undefined, oldNotes, newNotes);
                          }
                        }} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <aside className="space-y-6">
                {/* Safety History First on Mobile */}
                <div className="lg:hidden">
                  <SafetyHistory 
                    events={[
                      {
                        id: "1",
                        type: "blocked",
                        mealName: "Chicken Korma",
                        reason: "contains nuts",
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
                      },
                      {
                        id: "2",
                        type: "substituted",
                        mealName: "Pasta Alfredo",
                        reason: "dairy → oat cream",
                        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
                      }
                    ]}
                  />
                </div>

                <Summary favorites={favorites} dislikes={dislikes} allergies={allergies} notes={notes} />
                
                {/* Safety History on Desktop */}
                <div className="hidden lg:block">
                  <SafetyHistory 
                    events={[
                      {
                        id: "1",
                        type: "blocked",
                        mealName: "Chicken Korma",
                        reason: "contains nuts",
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
                      },
                      {
                        id: "2",
                        type: "substituted",
                        mealName: "Pasta Alfredo",
                        reason: "dairy → oat cream",
                        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
                      }
                    ]}
                  />
                </div>
                
                <ChangeHistory elderId={selectedElder.id} compact={true} />
                <HelpfulTips />
              </aside>
            </TabsContent>

            <TabsContent value="suggestions">
              <MealSuggestions 
                favorites={favorites}
                dislikes={dislikes}
                allergies={allergies}
                notes={notes}
                elderName={selectedElder.name}
              />
            </TabsContent>

            <TabsContent value="history" className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <ChangeHistory elderId={selectedElder.id} defaultExpanded={true} />
              <aside className="space-y-6">
                <Summary favorites={favorites} dislikes={dislikes} allergies={allergies} notes={notes} />
              </aside>
            </TabsContent>
          </Tabs>
        </section>

        <Footer />
        <Toaster richColors position="top-right" />
      </main>
    </>
  );
}

function PersonSelector({ elders, selectedElder, onElderChange, onAddPerson }: {
  elders: Elder[];
  selectedElder: Elder;
  onElderChange: (elder: Elder) => void;
  onAddPerson: () => void;
}) {
  return (
    <div className="bg-white border-b-2 border-primary/20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <Label className="text-lg font-medium text-foreground block mb-2">Who are we planning meals for?</Label>
            <Select 
              value={selectedElder.id} 
              onValueChange={(id) => {
                if (id === "add-new-person") {
                  onAddPerson();
                  return;
                }
                const elder = elders.find(e => e.id === id);
                if (elder) {
                  onElderChange(elder);
                  toast.success(`Now managing ${elder.name}'s meal preferences`);
                }
              }}
              aria-label="Select person to manage meal preferences for"
            >
              <SelectTrigger style={{height: '50px'}} className="w-full max-w-md text-lg border-2 border-primary/30 hover:border-primary focus:border-primary bg-white shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {/* Search functionality would go here in a real app */}
                
                {/* Existing people */}
                {elders.map(elder => (
                  <SelectItem key={elder.id} value={elder.id} className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 grid place-content-center font-medium text-primary text-lg">
                        {elder.initial}
                      </div>
                      <div>
                        <div className="font-medium text-base">{elder.name}</div>
                        <div className="text-sm text-muted-foreground">Born {elder.birthday}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
                
                {/* Sticky footer for adding new person */}
                <div className="sticky bottom-0 bg-white border-t border-border mt-2 pt-2">
                  <SelectItem 
                    value="add-new-person" 
                    className="py-4 text-primary hover:bg-primary/5 focus:bg-primary/5 font-medium border-0 rounded-md mx-1 mb-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 grid place-content-center">
                        <Plus className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-base">+ Add new person...</div>
                        <div className="text-sm text-muted-foreground">Create a new meal profile</div>
                      </div>
                    </div>
                  </SelectItem>
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ elder, favorites, dislikes, allergies, notes, lastSaved, onSave }: { 
  elder: Elder; 
  favorites: Food[];
  dislikes: DislikedFood[];
  allergies: Allergy[];
  notes: string;
  lastSaved: Date | null;
  onSave: () => void; 
  onPrint: () => void;
}) {
  
  return (
    <div className="bg-gradient-to-b from-primary/5 to-transparent no-print header-bottom-spacing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Simple Profile Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 grid place-content-center font-medium text-primary text-2xl flex-shrink-0">
                {elder.initial}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{elder.name}</h1>
                <p className="text-muted-foreground mt-1">Born {elder.birthday}</p>
              </div>
            </div>

            {/* Progress and Actions */}
            <div className="flex-1 sm:ml-auto flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Progress Bar */}
              <div className="min-w-[200px]">
                <ProgressBar
                  elder={elder}
                  favorites={favorites}
                  dislikes={dislikes}
                  allergies={allergies}
                  notes={notes}
                />
              </div>

              {/* Main Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={onSave} 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 shadow-sm h-12 px-6 text-base"
                  aria-label="Save meal preferences changes"
                >
                  <Save className="h-5 w-5 mr-2" aria-hidden="true" />
                  Save Changes
                </Button>
                <ExportManager 
                  elder={elder}
                  favorites={favorites}
                  dislikes={dislikes}
                  allergies={allergies}
                  notes={notes}
                  lastUpdated={lastSaved?.toISOString()}
                />
              </div>
              
              {/* Auto-save status */}
              {lastSaved && (
                <div className="text-xs text-muted-foreground mt-2">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact - Simple and Prominent */}
          {elder.emergencyContact && (
            <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-orange-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="font-medium text-orange-900">Emergency Contact: </span>
                  <span className="text-orange-800">{elder.primaryCaregiver}</span>
                  <span className="mx-2 text-orange-600" aria-hidden="true">•</span>
                  <a 
                    href={`tel:${elder.emergencyContact}`} 
                    className="text-orange-700 underline hover:text-orange-800 font-medium"
                    aria-label={`Call emergency contact ${elder.primaryCaregiver} at ${elder.emergencyContact}`}
                  >
                    {elder.emergencyContact}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Important Safety Notice - Only if allergies exist */}
          {allergies.length > 0 && allergies.some(a => a.severity === 'severe') && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-center gap-3" role="alert">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="font-medium text-red-900">⚠️ SEVERE ALLERGIES NOTED</span>
                  <span className="text-red-800 ml-2">Please review the allergies section carefully before meal preparation</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddPersonModal({ isOpen, onClose, onAdd }: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (personData: Omit<Elder, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    emergencyContact: '',
    primaryCaregiver: '',
  });

  const descriptionId = React.useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    if (!formData.birthday.trim()) {
      toast.error("Please enter a birthday");
      return;
    }

    // Generate initial from the first letter of the name
    const initial = formData.name.trim().charAt(0).toUpperCase();
    
    const personData: Omit<Elder, 'id'> = {
      name: formData.name.trim(),
      initial,
      birthday: formData.birthday.trim(),
      status: "🌱 New",
      lastOnline: "Just added",
      emergencyContact: formData.emergencyContact.trim() || undefined,
      primaryCaregiver: formData.primaryCaregiver.trim() || undefined,
    };

    onAdd(personData);
    
    // Reset form
    setFormData({
      name: '',
      birthday: '',
      emergencyContact: '',
      primaryCaregiver: '',
    });
  };

  const handleClose = () => {
    setFormData({
      name: '',
      birthday: '',
      emergencyContact: '',
      primaryCaregiver: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="h-6 w-6 text-primary" aria-hidden="true" />
            Add New Person
          </DialogTitle>
          <DialogDescription id={descriptionId}>
            Add a new person to manage their meal preferences and dietary requirements.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-base font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Mary Johnson"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-2 h-12 text-base"
                required
              />
            </div>

            <div>
              <Label htmlFor="birthday" className="text-base font-medium">
                Birthday *
              </Label>
              <Input
                id="birthday"
                type="text"
                placeholder="e.g., 15.03.1965 or March 15, 1965"
                value={formData.birthday}
                onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                className="mt-2 h-12 text-base"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Any format is fine - we'll use this for display only
              </p>
            </div>

            <div>
              <Label htmlFor="primaryCaregiver" className="text-base font-medium">
                Primary Caregiver
              </Label>
              <Input
                id="primaryCaregiver"
                type="text"
                placeholder="e.g., Sarah Johnson (Daughter)"
                value={formData.primaryCaregiver}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryCaregiver: e.target.value }))}
                className="mt-2 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="emergencyContact" className="text-base font-medium">
                Emergency Contact Number
              </Label>
              <Input
                id="emergencyContact"
                type="tel"
                placeholder="e.g., +49 030 123456789"
                value={formData.emergencyContact}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                className="mt-2 h-12 text-base"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Include country/area code for best results
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-primary hover:bg-primary/90"
              aria-label="Add new person to the system"
            >
              <UserPlus className="h-5 w-5 mr-2" aria-hidden="true" />
              Add Person
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Notes({value,onChange}:{value:string; onChange:(v:string)=>void}){
  const max = 500; 
  const remaining = max - value.length;
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if(e.target.value.length <= max) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="bg-accent/30 border border-border rounded-md p-4">
      <Label className="text-base font-medium mb-3 block">Tell us more about their needs:</Label>
      <Textarea 
        value={value} 
        onChange={handleChange}
        placeholder="Examples: Needs soft foods, prefers warm meals, no pork for religious reasons, loves Italian food, easy to chew textures only..."
        className="min-h-[120px] resize-none text-base" 
        aria-describedby="note-count"
      />
      <div 
        id="note-count" 
        className={`text-sm mt-2 ${remaining < 50 ? "text-destructive" : "text-muted-foreground"}`}
        aria-live="polite"
      >
        {remaining} characters remaining
      </div>
    </div>
  );
}

function Summary({favorites,dislikes,allergies,notes}:{
  favorites:Food[];
  dislikes:DislikedFood[];
  allergies:Allergy[];
  notes:string;
}){
  const hasAnyData = favorites.length > 0 || dislikes.length > 0 || allergies.length > 0 || notes.length > 0;
  
  if (!hasAnyData) {
    return (
      <Card className="card-shadow border-border">
        <CardHeader>
          <CardTitle className="text-lg">Quick Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Start adding preferences to see a summary here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow border-border">
      <CardHeader>
        <CardTitle className="text-lg">Quick Reference</CardTitle>
        <p className="text-sm text-muted-foreground">Essential info for meal planning</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical Allergies First */}
        {allergies.filter(a => a.severity === 'severe').length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-medium text-red-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              🚨 SEVERE ALLERGIES
            </h3>
            <ul className="space-y-1">
              {allergies.filter(a => a.severity === 'severe').map(a => (
                <li key={a.id} className="text-red-800 font-medium">• {a.label}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Absolute Avoids */}
        {dislikes.filter(d => d.level === 'absolute').length > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <h3 className="font-medium text-orange-900 mb-2">⛔ Never Serve</h3>
            <ul className="space-y-1">
              {dislikes.filter(d => d.level === 'absolute').map(d => (
                <li key={d.id} className="text-orange-800">• {d.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Favorites for Quick Planning */}
        {favorites.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Safe Favorites ({favorites.length})
            </h3>
            <div className="text-sm text-green-800">
              {favorites.slice(0, 5).map(f => f.name).join(', ')}
              {favorites.length > 5 && ` +${favorites.length - 5} more`}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {notes && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">📝 Special Instructions</h3>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HelpfulTips(){
  return (
    <Card className="card-shadow border-border no-print">
      <CardHeader>
        <CardTitle className="text-lg">💡 Features & Shortcuts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <div className="h-2 w-2 rounded-full bg-ai-brand mt-2 flex-shrink-0"></div>
          <p><strong>AI Voice Input:</strong> Use the microphone for hands-free entry</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
          <p><strong>Undo Actions:</strong> All changes can be undone for 10 seconds</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
          <p><strong>Progress Tracking:</strong> Tap the progress bar to see completion checklist</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
          <p><strong>Keyboard Shortcuts:</strong> V = Voice, A = AI Assist, Ctrl+S = Save</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
          <p><strong>Safety Alerts:</strong> Red badge on tabs when severe allergies are noted</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
          <p>Use "Severe" for allergies only if they need emergency medical care</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Footer(){
  return (
    <footer className="mt-12 py-8 text-center text-xs text-muted-foreground no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p>Zenaris • Accesibility-First Meal App • © {new Date().getFullYear()}</p>
        <p className="mt-1">Designed just for you.</p>
      </div>
    </footer>
  );
}