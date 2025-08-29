import React, { useState } from 'react';
import { Progress } from './ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Check, Circle, Heart, X, AlertTriangle, FileText } from 'lucide-react';
import type { Elder, Food, DislikedFood, Allergy } from './DataManager';

interface ProgressBarProps {
  elder: Elder;
  favorites: Food[];
  dislikes: DislikedFood[];
  allergies: Allergy[];
  notes: string;
}

interface SectionStatus {
  id: string;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  count: number;
  description: string;
  color: string;
}

export function ProgressBar({ elder, favorites, dislikes, allergies, notes }: ProgressBarProps) {
  const [showChecklist, setShowChecklist] = useState(false);

  const sections: SectionStatus[] = [
    {
      id: 'favorites',
      title: 'Favorite Foods',
      icon: <Heart className="h-5 w-5 text-pink-500" />,
      completed: favorites.length > 0,
      count: favorites.length,
      description: 'Foods they really enjoy and ask for',
      color: 'text-pink-600'
    },
    {
      id: 'dislikes', 
      title: 'Foods to Avoid',
      icon: <X className="h-5 w-5 text-orange-500" />,
      completed: dislikes.length > 0,
      count: dislikes.length,
      description: 'Foods they dislike or want to avoid',
      color: 'text-orange-600'
    },
    {
      id: 'allergies',
      title: 'Allergies & Restrictions',
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      completed: allergies.length > 0,
      count: allergies.length,
      description: 'Allergies and dietary restrictions',
      color: 'text-red-600'
    },
    {
      id: 'notes',
      title: 'Special Instructions',
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      completed: notes.length > 0,
      count: notes.length > 0 ? 1 : 0,
      description: 'Additional preferences and requirements',
      color: 'text-blue-600'
    }
  ];

  const completedSections = sections.filter(s => s.completed).length;
  const progressPercentage = (completedSections / sections.length) * 100;
  const isComplete = completedSections === sections.length;

  return (
    <>
      <div className="space-y-3">
        {/* Progress Bar */}
        <button 
          type="button"
          className="cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors w-full text-left"
          onClick={() => setShowChecklist(true)}
          aria-label="Show profile completion checklist"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Profile Progress
            </span>
            <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-muted-foreground'}`}>
              {completedSections}/{sections.length}
            </span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${isComplete ? 'bg-green-100' : 'bg-gray-100'}`}
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`Profile ${Math.round(progressPercentage)}% complete. ${completedSections} of ${sections.length} sections filled.`}
            role="progressbar"
          />
          
          <div className="flex items-center gap-1 mt-2">
            <div className={`h-2 w-2 rounded-full ${isComplete ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
            <span className="text-xs text-muted-foreground">
              {isComplete ? 'Complete' : 'Tap to see checklist'}
            </span>
          </div>
        </button>
      </div>

      {/* Checklist Sheet */}
      <Sheet open={showChecklist} onOpenChange={setShowChecklist}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 grid place-content-center font-medium text-primary">
                {elder.initial}
              </div>
              {elder.name}'s Profile Checklist
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4 px-4">
            {/* Overall Progress */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-md border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-primary">Overall Progress</h3>
                <span className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-primary/70 mt-2">
                {isComplete 
                  ? '🎉 Profile is complete! All sections filled.' 
                  : `${4 - completedSections} more section${4 - completedSections !== 1 ? 's' : ''} to complete.`
                }
              </p>
            </div>

            {/* Section Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground mb-3">Section Details</h4>
              {sections.map((section) => (
                <div 
                  key={section.id}
                  className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                    section.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {section.completed ? (
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {section.icon}
                      <h5 className="font-medium text-foreground">{section.title}</h5>
                      {section.count > 0 && (
                        <span className={`text-sm px-2 py-1 rounded-full bg-white border ${section.color}`}>
                          {section.count} item{section.count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                    
                    {!section.completed && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 h-8"
                        onClick={() => {
                          setShowChecklist(false);
                          setTimeout(() => {
                            const element = document.getElementById(section.id);
                            element?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                      >
                        Complete This Section
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Next Steps */}
            {!isComplete && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">💡 Quick Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Start with favorites - what do they love to eat?</li>
                  <li>• Add any critical allergies for safety</li>
                  <li>• Use the "Use AI" button for quick suggestions</li>
                  <li>• Notes section is great for texture preferences</li>
                </ul>
              </div>
            )}

            {isComplete && (
              <div className="bg-green-50 p-4 rounded-md border border-green-200 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h4 className="font-medium text-green-900 mb-1">Profile Complete!</h4>
                <p className="text-sm text-green-800">
                  {elder.name}'s meal preferences are all set up. You can now get personalized meal suggestions.
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}