import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '../ui/utils';
import { Input } from '../ui/input';
import { AIBadge } from './AIBadge';
import { AISkeleton } from './AISkeleton';

export interface FoodSuggestion {
  id: string;
  name: string;
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  conflicts?: {
    type: 'allergy' | 'never-serve' | 'similar';
    item: string;
  }[];
}

export interface AIAutocompleteProps {
  placeholder?: string;
  onSelect: (suggestion: FoodSuggestion) => void;
  onSearch?: (query: string) => Promise<FoodSuggestion[]>;
  className?: string;
}

const MOCK_SUGGESTIONS: FoodSuggestion[] = [
  { id: '1', name: 'Chicken soup', category: 'lunch' },
  { id: '2', name: 'Apple pie', category: 'snack' },
  { id: '3', name: 'Grilled salmon', category: 'dinner' },
  { id: '4', name: 'Oatmeal', category: 'breakfast' },
  { id: '5', name: 'Peanut butter sandwich', category: 'lunch', conflicts: [{ type: 'allergy', item: 'nuts' }] },
  { id: '6', name: 'Spicy curry', category: 'dinner', conflicts: [{ type: 'never-serve', item: 'spicy foods' }] },
];

export function AIAutocomplete({
  placeholder = "Search or type a food…",
  onSelect,
  onSearch,
  className
}: AIAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setIsOpen(true);
      
      try {
        if (onSearch) {
          const results = await onSearch(query);
          setSuggestions(results);
        } else {
          const filtered = MOCK_SUGGESTIONS.filter(s => 
            s.name.toLowerCase().includes(query.toLowerCase())
          );
          setSuggestions(filtered);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && suggestions[focusedIndex]) {
          const suggestion = suggestions[focusedIndex];
          if (!hasConflicts(suggestion)) {
            handleSelect(suggestion);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const hasConflicts = (suggestion: FoodSuggestion): boolean => {
    return Boolean(suggestion.conflicts && suggestion.conflicts.length > 0);
  };

  const handleSelect = (suggestion: FoodSuggestion) => {
    if (hasConflicts(suggestion)) return;
    
    onSelect(suggestion);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    return (
      <AIBadge variant="info" size="sm">
        {category}
      </AIBadge>
    );
  };

  const getConflictBadges = (conflicts?: FoodSuggestion['conflicts']) => {
    if (!conflicts || conflicts.length === 0) return null;
    
    return conflicts.map((conflict, index) => (
      <AIBadge 
        key={index}
        variant={conflict.type === 'allergy' ? 'danger' : 'warning'}
        size="sm"
      >
        {conflict.type === 'allergy' && `Contains ${conflict.item}`}
        {conflict.type === 'never-serve' && 'Never serve'}
        {conflict.type === 'similar' && `Similar to: ${conflict.item}`}
      </AIBadge>
    ));
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
        )}
      </div>

      {query.length > 0 && query.length < 2 && (
        <div className="mt-2 text-sm text-muted-foreground">
          Type at least 2 letters
        </div>
      )}

      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <AISkeleton key={i} variant="row" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <div className="mb-2">No results found</div>
              <div className="text-xs">Try simpler names like "chicken" or "apple"</div>
            </div>
          ) : (
            <ul ref={listRef} className="max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => {
                const conflicts = hasConflicts(suggestion);
                return (
                  <li key={suggestion.id}>
                    <button
                      type="button"
                      disabled={conflicts}
                      onClick={() => handleSelect(suggestion)}
                      className={cn(
                        'w-full text-left p-3 hover:bg-accent transition-colors',
                        'focus:bg-accent focus:outline-none',
                        focusedIndex === index && 'bg-accent',
                        conflicts && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {conflicts && (
                              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                            )}
                            <span className="font-medium">{suggestion.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {getCategoryBadge(suggestion.category)}
                            {getConflictBadges(suggestion.conflicts)}
                          </div>
                        </div>
                      </div>
                      {conflicts && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Click blocked due to conflicts
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {query.length >= 2 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Prefer simple names (e.g., 'Chicken soup')
        </div>
      )}
    </div>
  );
}