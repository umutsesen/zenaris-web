import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ChefHat, Clock, Utensils, RefreshCw, Heart, AlertTriangle } from 'lucide-react';
import type { Food, DislikedFood, Allergy } from './DataManager';
import { ConflictAlert } from './ai/ConflictAlert';

type MealSuggestion = {
  id: string;
  name: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  description: string;
  difficulty: "easy" | "medium" | "hard";
  prepTime: string;
  tags: string[];
  ingredients: string[];
  safetyScore: "safe" | "caution" | "avoid";
  matchedFavorites: string[];
  possibleIssues: string[];
};

const MEAL_DATABASE: Omit<MealSuggestion, 'id' | 'safetyScore' | 'matchedFavorites' | 'possibleIssues'>[] = [
  // Breakfast Options
  {
    name: "Gentle Chicken Soup",
    category: "lunch",
    description: "Soft, warm, and comforting with tender vegetables",
    difficulty: "easy",
    prepTime: "45 min",
    tags: ["soft", "warm", "protein", "vegetables"],
    ingredients: ["chicken breast", "carrots", "celery", "onion", "rice", "chicken broth"]
  },
  {
    name: "Creamy Mashed Potatoes",
    category: "dinner",
    description: "Smooth and creamy with butter and cream",
    difficulty: "easy",
    prepTime: "20 min",
    tags: ["soft", "comfort", "carbs", "dairy"],
    ingredients: ["potatoes", "butter", "cream", "salt"]
  },
  {
    name: "Banana Smoothie",
    category: "breakfast",
    description: "Thick, nutritious smoothie with banana and yogurt",
    difficulty: "easy",
    prepTime: "5 min",
    tags: ["soft", "cold", "fruit", "dairy"],
    ingredients: ["banana", "yogurt", "honey", "milk"]
  },
  {
    name: "Soft Scrambled Eggs",
    category: "breakfast",
    description: "Gentle, creamy eggs perfect for easy eating",
    difficulty: "easy",
    prepTime: "10 min",
    tags: ["soft", "protein", "warm"],
    ingredients: ["eggs", "butter", "cream", "chives"]
  },
  {
    name: "Oatmeal with Fruit",
    category: "breakfast",
    description: "Warm, creamy oatmeal with soft seasonal fruit",
    difficulty: "easy",
    prepTime: "15 min",
    tags: ["soft", "warm", "fiber", "fruit"],
    ingredients: ["oats", "milk", "banana", "berries", "honey"]
  },
  {
    name: "French Toast (Soft)",
    category: "breakfast",
    description: "Tender, custard-like French toast, easy to eat",
    difficulty: "easy",
    prepTime: "15 min",
    tags: ["soft", "sweet", "comfort", "dairy"],
    ingredients: ["bread", "eggs", "milk", "cinnamon", "butter"]
  },
  {
    name: "Cottage Cheese Bowl",
    category: "breakfast",
    description: "Protein-rich cottage cheese with soft fruits",
    difficulty: "easy",
    prepTime: "3 min",
    tags: ["soft", "protein", "dairy", "cold"],
    ingredients: ["cottage cheese", "peaches", "honey", "cinnamon"]
  },
  // Lunch Options  
  {
    name: "Tomato Basil Soup",
    category: "lunch",
    description: "Smooth, warming soup with fresh basil",
    difficulty: "easy",
    prepTime: "25 min",
    tags: ["soft", "warm", "vegetables", "comfort"],
    ingredients: ["tomatoes", "basil", "cream", "onion", "garlic"]
  },
  {
    name: "Tuna Salad (Soft)",
    category: "lunch",
    description: "Well-mashed tuna salad with soft bread",
    difficulty: "easy",
    prepTime: "10 min",
    tags: ["soft", "protein", "fish"],
    ingredients: ["tuna", "mayonnaise", "soft bread", "celery"]
  },
  {
    name: "Vegetable Puree Soup",
    category: "lunch",
    description: "Smooth, nutritious soup with mixed vegetables",
    difficulty: "medium",
    prepTime: "40 min",
    tags: ["soft", "vegetables", "warm", "healthy"],
    ingredients: ["mixed vegetables", "vegetable broth", "cream", "herbs"]
  },
  {
    name: "Chicken Noodle Soup",
    category: "lunch",
    description: "Classic comfort soup with tender noodles",
    difficulty: "medium",
    prepTime: "50 min",
    tags: ["soft", "warm", "protein", "comfort"],
    ingredients: ["chicken", "noodles", "carrots", "celery", "chicken broth"]
  },
  // Dinner Options
  {
    name: "Fish with White Sauce",
    category: "dinner",
    description: "Tender white fish with gentle cream sauce",
    difficulty: "medium",
    prepTime: "25 min",
    tags: ["soft", "protein", "fish", "creamy"],
    ingredients: ["white fish", "cream", "butter", "herbs", "lemon"]
  },
  {
    name: "Beef Stew",
    category: "dinner",
    description: "Tender slow-cooked beef with vegetables",
    difficulty: "hard",
    prepTime: "2 hours",
    tags: ["soft", "protein", "vegetables", "warm"],
    ingredients: ["beef", "potatoes", "carrots", "onions", "beef broth"]
  },
  {
    name: "Shepherd's Pie",
    category: "dinner",
    description: "Soft ground meat with mashed potato topping",
    difficulty: "medium",
    prepTime: "45 min",
    tags: ["soft", "protein", "comfort", "vegetables"],
    ingredients: ["ground lamb", "potatoes", "peas", "carrots", "gravy"]
  },
  {
    name: "Baked Chicken Breast",
    category: "dinner",
    description: "Tender, well-cooked chicken with herbs",
    difficulty: "easy",
    prepTime: "35 min",
    tags: ["soft", "protein", "warm"],
    ingredients: ["chicken breast", "herbs", "olive oil", "garlic"]
  },
  {
    name: "Pasta with Butter Sauce",
    category: "dinner",
    description: "Soft pasta with gentle butter and herb sauce",
    difficulty: "easy",
    prepTime: "20 min",
    tags: ["soft", "comfort", "carbs"],
    ingredients: ["pasta", "butter", "herbs", "parmesan cheese"]
  },
  // Snacks
  {
    name: "Rice Pudding",
    category: "snack",
    description: "Sweet, creamy dessert with cinnamon",
    difficulty: "medium",
    prepTime: "30 min",
    tags: ["soft", "sweet", "dairy", "comfort"],
    ingredients: ["rice", "milk", "sugar", "cinnamon", "vanilla"]
  },
  {
    name: "Apple Sauce",
    category: "snack",
    description: "Smooth, naturally sweet fruit puree",
    difficulty: "easy",
    prepTime: "25 min",
    tags: ["soft", "fruit", "sweet", "fiber"],
    ingredients: ["apples", "cinnamon", "sugar", "lemon juice"]
  },
  {
    name: "Yogurt Parfait",
    category: "breakfast",
    description: "Layered yogurt with soft fruits",
    difficulty: "easy",
    prepTime: "5 min",
    tags: ["soft", "dairy", "fruit", "cold"],
    ingredients: ["yogurt", "soft berries", "honey", "granola"]
  },
  {
    name: "Banana Bread (Soft)",
    category: "snack",
    description: "Moist, tender banana bread slice",
    difficulty: "medium",
    prepTime: "60 min",
    tags: ["soft", "sweet", "fruit", "baked"],
    ingredients: ["bananas", "flour", "butter", "sugar", "eggs"]
  },
  {
    name: "Pudding Cup",
    category: "snack",
    description: "Smooth, creamy pudding in favorite flavors",
    difficulty: "easy",
    prepTime: "2 min",
    tags: ["soft", "sweet", "dairy", "cold"],
    ingredients: ["milk", "pudding mix", "vanilla", "sugar"]
  },
  {
    name: "Smoothie Bowl",
    category: "snack",
    description: "Thick fruit smoothie topped with soft additions",
    difficulty: "easy",
    prepTime: "8 min",
    tags: ["soft", "fruit", "cold", "healthy"],
    ingredients: ["mixed berries", "banana", "yogurt", "honey"]
  }
];

interface MealSuggestionsProps {
  favorites: Food[];
  dislikes: DislikedFood[];
  allergies: Allergy[];
  notes: string;
  elderName: string;
}

export function MealSuggestions({ favorites, dislikes, allergies, notes, elderName }: MealSuggestionsProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Check if we have any preferences to work with
  const hasAnyPreferences = favorites.length > 0 || dislikes.length > 0 || allergies.length > 0 || notes.trim().length > 0;

  const processedSuggestions = useMemo(() => {
    return MEAL_DATABASE.map((meal) => {
      const id = `${meal.name.toLowerCase().replace(/\s+/g, '-')}-${refreshKey}`;
      
      // Check for allergy conflicts
      const allergyConflicts = allergies.filter(allergy => 
        meal.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(allergy.label.toLowerCase()) ||
          allergy.label.toLowerCase().includes(ingredient.toLowerCase())
        )
      );

      // Check for strong dislikes
      const strongDislikes = dislikes.filter(dislike => 
        dislike.level === 'absolute' && 
        (meal.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(dislike.name.toLowerCase()) ||
          dislike.name.toLowerCase().includes(ingredient.toLowerCase())
        ) || meal.name.toLowerCase().includes(dislike.name.toLowerCase()))
      );

      // Check for favorite matches
      const matchedFavorites = favorites.filter(fav => 
        meal.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(fav.name.toLowerCase()) ||
          fav.name.toLowerCase().includes(ingredient.toLowerCase())
        ) || meal.name.toLowerCase().includes(fav.name.toLowerCase())
      ).map(f => f.name);

      // Check for moderate dislikes
      const moderateDislikes = dislikes.filter(dislike => 
        dislike.level === 'moderate' && 
        (meal.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(dislike.name.toLowerCase()) ||
          dislike.name.toLowerCase().includes(ingredient.toLowerCase())
        ) || meal.name.toLowerCase().includes(dislike.name.toLowerCase()))
      );

      // Determine safety score
      let safetyScore: "safe" | "caution" | "avoid" = "safe";
      const possibleIssues: string[] = [];

      if (allergyConflicts.length > 0) {
        safetyScore = "avoid";
        allergyConflicts.forEach(allergy => {
          possibleIssues.push(`Contains ${allergy.label} (${allergy.severity} allergy)`);
        });
      } else if (strongDislikes.length > 0) {
        safetyScore = "avoid";
        strongDislikes.forEach(dislike => {
          possibleIssues.push(`Contains ${dislike.name} (never serve)`);
        });
      } else if (moderateDislikes.length > 0) {
        safetyScore = "caution";
        moderateDislikes.forEach(dislike => {
          possibleIssues.push(`Contains ${dislike.name} (strong dislike)`);
        });
      }

      return {
        ...meal,
        id,
        safetyScore,
        matchedFavorites,
        possibleIssues,
      };
    }).sort((a, b) => {
      // Sort by safety first, then by favorite matches
      const safetyOrder = { safe: 0, caution: 1, avoid: 2 };
      if (safetyOrder[a.safetyScore] !== safetyOrder[b.safetyScore]) {
        return safetyOrder[a.safetyScore] - safetyOrder[b.safetyScore];
      }
      return b.matchedFavorites.length - a.matchedFavorites.length;
    });
  }, [favorites, dislikes, allergies, refreshKey]);

  const getSuggestionsByCategory = (category: string) => {
    const filtered = processedSuggestions.filter(s => s.category === category);
    // Show more suggestions if they're safe, fewer if many are problematic
    const safeCount = filtered.filter(s => s.safetyScore === 'safe').length;
    const maxShow = safeCount >= 3 ? 6 : 8;
    return filtered.slice(0, maxShow);
  };

  const getSafetyIcon = (score: "safe" | "caution" | "avoid") => {
    switch (score) {
      case "safe": return <div className="h-3 w-3 rounded-full bg-green-500"></div>;
      case "caution": return <div className="h-3 w-3 rounded-full bg-yellow-500"></div>;
      case "avoid": return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getSafetyStyles = (score: "safe" | "caution" | "avoid") => {
    switch (score) {
      case "safe": return "border-green-200 bg-green-50/50";
      case "caution": return "border-yellow-200 bg-yellow-50/50";
      case "avoid": return "border-red-200 bg-red-50/50 opacity-60";
    }
  };

  // Show empty state if no preferences
  if (!hasAnyPreferences) {
    return (
      <div className="space-y-6">
        <Card className="card-shadow border-border">
          <CardContent className="py-12">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6">
                <ChefHat className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-muted-foreground mb-2">
                  Ready to suggest meals for {elderName}!
                </h3>
                <p className="text-muted-foreground">
                  Add some preferences in the <strong>Preferences</strong> tab first, then come back here for personalized meal recommendations.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-md p-6 text-left">
                <h4 className="font-medium text-blue-900 mb-3">What I need to get started:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-pink-400"></div>
                    <span className="text-sm text-blue-800">Some favorite foods they love</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                    <span className="text-sm text-blue-800">Any foods they prefer to avoid</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-400"></div>
                    <span className="text-sm text-blue-800">Important allergies or restrictions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <span className="text-sm text-blue-800">Special notes about their needs</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Preview of what's coming */}
        <Card className="card-shadow border-border border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Utensils className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">Coming Soon: Smart Meal Plans</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-md border border-orange-200">
                <div className="h-8 w-8 bg-orange-200 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-orange-800">Breakfast Ideas</p>
                <p className="text-xs text-orange-600 mt-1">Safe, nutritious options</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-md border border-green-200">
                <div className="h-8 w-8 bg-green-200 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-green-800">Lunch Suggestions</p>
                <p className="text-xs text-green-600 mt-1">Easy preparation</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-md border border-blue-200">
                <div className="h-8 w-8 bg-blue-200 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-blue-800">Dinner Options</p>
                <p className="text-xs text-blue-600 mt-1">Comfort food favorites</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-md border border-purple-200">
                <div className="h-8 w-8 bg-purple-200 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-purple-800">Healthy Snacks</p>
                <p className="text-xs text-purple-600 mt-1">Between meal treats</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="card-shadow border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            Meal Suggestions for {elderName}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setRefreshKey(k => k + 1)}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            New Ideas
          </Button>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Personalized recommendations based on their preferences and restrictions
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {favorites.length > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {favorites.length} favorite{favorites.length !== 1 ? 's' : ''} 
              </Badge>
            )}
            {allergies.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {allergies.length} allergen{allergies.length !== 1 ? 's' : ''} avoided
              </Badge>
            )}
            {dislikes.length > 0 && (
              <Badge variant="outline" className="text-orange-800 border-orange-300">
                {dislikes.length} dislike{dislikes.length !== 1 ? 's' : ''} noted
              </Badge>
            )}
            {notes.trim() && (
              <Badge variant="outline" className="text-blue-800 border-blue-300">
                Special instructions
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Stats Summary */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {processedSuggestions.filter(s => s.safetyScore === 'safe').length}
              </div>
              <div className="text-xs text-green-700">Safe Options</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600">
                {processedSuggestions.filter(s => s.matchedFavorites.length > 0).length}
              </div>
              <div className="text-xs text-pink-700">Match Favorites</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {processedSuggestions.filter(s => s.safetyScore === 'caution').length}
              </div>
              <div className="text-xs text-yellow-700">Need Caution</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {processedSuggestions.filter(s => s.safetyScore === 'avoid').length}
              </div>
              <div className="text-xs text-red-700">To Avoid</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="breakfast" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="breakfast" className="relative">
              Breakfast
              <span className="ml-1 text-xs opacity-60">
                ({getSuggestionsByCategory('breakfast').filter(s => s.safetyScore === 'safe').length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="lunch" className="relative">
              Lunch
              <span className="ml-1 text-xs opacity-60">
                ({getSuggestionsByCategory('lunch').filter(s => s.safetyScore === 'safe').length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="dinner" className="relative">
              Dinner
              <span className="ml-1 text-xs opacity-60">
                ({getSuggestionsByCategory('dinner').filter(s => s.safetyScore === 'safe').length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="snack" className="relative">
              Snacks
              <span className="ml-1 text-xs opacity-60">
                ({getSuggestionsByCategory('snack').filter(s => s.safetyScore === 'safe').length})
              </span>
            </TabsTrigger>
          </TabsList>
          
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(category => (
            <TabsContent key={category} value={category} className="space-y-3 mt-4">
              {getSuggestionsByCategory(category).map(suggestion => (
                <div 
                  key={suggestion.id} 
                  className={`p-4 rounded-md border-2 transition-all ${getSafetyStyles(suggestion.safetyScore)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getSafetyIcon(suggestion.safetyScore)}
                        <h4 className="font-medium">{suggestion.name}</h4>
                        {suggestion.matchedFavorites.length > 0 && (
                          <Heart className="h-4 w-4 text-pink-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                      
                      {suggestion.matchedFavorites.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-green-700 mb-1">Contains favorites:</p>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.matchedFavorites.map(fav => (
                              <Badge key={fav} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                {fav}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {suggestion.possibleIssues.length > 0 && suggestion.safetyScore === 'avoid' && (
                        <ConflictAlert
                          mealName={suggestion.name}
                          conflicts={suggestion.possibleIssues.map((issue, i) => ({
                            id: `${suggestion.id}-${i}`,
                            type: issue.includes('allergy') ? 'allergy' as const : 'dislike' as const,
                            severity: issue.includes('severe') ? 'severe' as const : issue.includes('never serve') ? 'absolute' as const : 'mild' as const,
                            allergen: issue.split(' ')[1] || 'unknown',
                            reason: issue
                          }))}
                          substitutions={[
                            {
                              id: "1",
                              original: "Dairy milk",
                              replacement: "Oat milk",
                              explanation: "Lactose-free alternative"
                            },
                            {
                              id: "2", 
                              original: "Butter",
                              replacement: "Olive oil",
                              explanation: "Dairy-free cooking fat"
                            }
                          ]}
                          onUseSubstitutions={(subs) => console.log("Using substitutions:", subs)}
                          className="mt-3"
                        />
                      )}
                      
                      {suggestion.possibleIssues.length > 0 && suggestion.safetyScore === 'caution' && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-yellow-700 mb-1">⚠️ Concerns:</p>
                          <div className="space-y-1">
                            {suggestion.possibleIssues.map((issue, i) => (
                              <p key={i} className="text-xs text-yellow-600">• {issue}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        {suggestion.prepTime}
                      </div>
                      <Badge 
                        variant={suggestion.difficulty === 'easy' ? 'secondary' : 'outline'} 
                        className="text-xs"
                      >
                        {suggestion.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {suggestion.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              
              {getSuggestionsByCategory(category).length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-md p-6 border border-gray-200">
                    <Utensils className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium text-gray-700 mb-1">No safe {category} ideas right now</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Current restrictions are filtering out available options
                    </p>
                    <div className="text-xs text-gray-500 bg-white rounded-md p-3 border">
                      💡 Try adding more favorite foods or adjusting restriction levels in the Preferences tab
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}