import { Clock, AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { AIBadge } from './AIBadge';
import { AIAlert } from './AIAlert';

  {/* WithWhy feature has been reserved for future development.
    It will allow caretakers to implement important notes for every allergy or intolerance. */}

export interface AIResultCardProps {
  title: string;
  description: string;
  safety: 'safe' | 'caution' | 'avoid';
  tags?: string[];
  prepTime?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  matches?: string[];
  issues?: string[];
  onUse?: () => void;
  onRefresh?: () => void;
  onCopy?: () => void;
/*   withWhy?: boolean; */
  compact?: boolean;
  className?: string;
}

const safetyIndicators = {
  safe: {
    icon: <div className="h-3 w-3 rounded-full bg-green-500" />,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  caution: {
    icon: <div className="h-3 w-3 rounded-full bg-yellow-500" />,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  avoid: {
    icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

const difficultyColors = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
} as const;

export function AIResultCard({
  title,
  description,
  safety,
  tags = [],
  prepTime,
  difficulty,
  onUse,
  onRefresh,
  onCopy,
/*   withWhy = true, */
  compact = false,
  className
}: AIResultCardProps) {
 /*  const [isWhyOpen, setIsWhyOpen] = useState(false); */
  const safetyConfig = safetyIndicators[safety];
  const isAvoid = safety === 'avoid';

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        safetyConfig.bgColor,
        safetyConfig.borderColor,
        compact ? 'p-3' : 'p-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Safety Indicator */}
        <div className="flex-shrink-0 mt-1">
          {safetyConfig.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-semibold mb-1', compact ? 'text-sm' : 'text-base')}>
            {title}
          </h3>
          <p className={cn('text-muted-foreground mb-2', compact ? 'text-xs' : 'text-sm')}>
            {description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.map((tag, index) => (
                <AIBadge key={index} variant="neutral" size="sm">
                  {tag}
                </AIBadge>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Metadata */}
        {!compact && (
          <div className="text-right space-y-2 flex-shrink-0">
            {prepTime && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {prepTime}
              </div>
            )}
            {difficulty && (
              <AIBadge variant={difficultyColors[difficulty]} size="sm">
                {difficulty}
              </AIBadge>
            )}
          </div>
        )}
      </div>

      {/* Why This? Section */}
    {/*   {withWhy && (matches.length > 0 || issues.length > 0) && (
        <Collapsible open={isWhyOpen} onOpenChange={setIsWhyOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between p-2 h-auto text-left mb-2"
            >
              <span className="text-sm font-medium">Why this suggestion?</span>
              {isWhyOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mb-3">
            {matches.length > 0 && (
              <div>
                <div className="text-xs font-medium text-green-700 mb-1 flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Matches favorites:
                </div>
                <div className="text-xs text-green-600 pl-4">
                  {matches.join(', ')}
                </div>
              </div>
            )}
            {issues.length > 0 && (
              <div>
                <div className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Potential issues:
                </div>
                <div className="text-xs text-red-600 pl-4">
                  {issues.join(', ')}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
 */}
      {/* Avoid Warning */}
      {isAvoid && (
        <AIAlert variant="danger" title="Cannot use this suggestion" className="mb-3">
          This item conflicts with their dietary restrictions. Please choose another option.
        </AIAlert>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={onUse}
          disabled={isAvoid}
          className={cn(
            'flex-1',
            isAvoid && 'opacity-50 cursor-not-allowed'
          )}
          size={compact ? 'sm' : 'default'}
        >
          Use this
        </Button>
        
        <Button
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          onClick={onRefresh}
          className="px-3"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          onClick={onCopy}
          className="px-3"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      {/* Compact metadata */}
      {compact && (prepTime || difficulty) && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
          {prepTime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {prepTime}
            </div>
          )}
          {difficulty && (
            <AIBadge variant={difficultyColors[difficulty]} size="sm">
              {difficulty}
            </AIBadge>
          )}
        </div>
      )}
    </div>
  );
}