import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { 
  AlertTriangle, 
  Shield, 
  ArrowRight, 
  Check, 
  X,
  Info,
  Lightbulb
} from "lucide-react";

interface Conflict {
  id: string;
  type: "allergy" | "dislike";
  severity: "severe" | "mild" | "moderate" | "absolute";
  allergen: string;
  reason: string;
}

interface Substitution {
  id: string;
  original: string;
  replacement: string;
  explanation: string;
}

interface ConflictAlertProps {
  mealName: string;
  conflicts: Conflict[];
  substitutions?: Substitution[];
  onUseSubstitutions?: (substitutions: Substitution[]) => void;
  onDismiss?: () => void;
  className?: string;
}

export function ConflictAlert({ 
  mealName, 
  conflicts, 
  substitutions = [], 
  onUseSubstitutions,
  onDismiss,
  className = ""
}: ConflictAlertProps) {
  const [showSubstitutions, setShowSubstitutions] = useState(false);

  const getConflictSeverityColor = (conflict: Conflict) => {
    if (conflict.type === "allergy" && conflict.severity === "severe") {
      return "bg-red-100 text-red-900 border-red-300";
    }
    if (conflict.type === "dislike" && conflict.severity === "absolute") {
      return "bg-orange-100 text-orange-900 border-orange-300";
    }
    return "bg-yellow-100 text-yellow-900 border-yellow-300";
  };

  const getConflictIcon = (conflict: Conflict) => {
    if (conflict.type === "allergy" && conflict.severity === "severe") {
      return <Shield className="h-4 w-4 text-red-600" />;
    }
    return <AlertTriangle className="h-4 w-4 text-orange-600" />;
  };

  const getConflictBadge = (conflict: Conflict) => {
    if (conflict.type === "allergy" && conflict.severity === "severe") {
      return <Badge variant="destructive" className="text-xs">BLOCKED</Badge>;
    }
    if (conflict.type === "dislike" && conflict.severity === "absolute") {
      return <Badge className="bg-orange-500 text-white text-xs">NEVER SERVE</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">CAUTION</Badge>;
  };

  const hasSevereConflicts = conflicts.some(c => 
    (c.type === "allergy" && c.severity === "severe") || 
    (c.type === "dislike" && c.severity === "absolute")
  );

  return (
    <Card className={`border-l-4 ${hasSevereConflicts ? 'border-l-red-500' : 'border-l-yellow-500'} ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main conflict header */}
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${hasSevereConflicts ? 'bg-red-100' : 'bg-yellow-100'}`}>
              {hasSevereConflicts ? (
                <Shield className="h-5 w-5 text-red-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">
                  {hasSevereConflicts ? '🚫 Cannot serve' : '⚠️ Potential issue with'} "{mealName}"
                </h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} detected with preferences
              </p>
            </div>
          </div>

          {/* Conflict details */}
          <div className="space-y-2">
            {conflicts.map(conflict => (
              <div 
                key={conflict.id} 
                className={`flex items-center gap-3 p-3 rounded-md border ${getConflictSeverityColor(conflict)}`}
              >
                {getConflictIcon(conflict)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium capitalize">{conflict.allergen}</span>
                    {getConflictBadge(conflict)}
                  </div>
                  <p className="text-xs opacity-80">{conflict.reason}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Substitutions section */}
          {substitutions.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Safe substitutions available</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubstitutions(!showSubstitutions)}
                >
                  {showSubstitutions ? 'Hide' : 'Show'} options
                </Button>
              </div>

              {showSubstitutions && (
                <div className="space-y-2">
                  {substitutions.map(sub => (
                    <div key={sub.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium">{sub.original}</span>
                        <ArrowRight className="h-3 w-3 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700">{sub.replacement}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Info className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-blue-600">{sub.explanation}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex gap-2 pt-2">
                    {onUseSubstitutions && (
                      <Button 
                        size="sm" 
                        onClick={() => onUseSubstitutions(substitutions)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Use substitutions
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Info className="h-3 w-3 mr-1" />
                      Why these?
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {!hasSevereConflicts && !substitutions.length && (
              <Button size="sm" variant="outline">
                <Check className="h-3 w-3 mr-1" />
                Serve anyway
              </Button>
            )}
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                <X className="h-3 w-3 mr-1" />
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for showing recent safety events
interface SafetyHistoryProps {
  events: Array<{
    id: string;
    type: "blocked" | "substituted" | "warning";
    mealName: string;
    reason: string;
    timestamp: Date;
  }>;
  className?: string;
}

export function SafetyHistory({ events, className = "" }: SafetyHistoryProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "blocked": return <Shield className="h-3 w-3 text-red-500" />;
      case "substituted": return <ArrowRight className="h-3 w-3 text-blue-500" />;
      case "warning": return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      default: return <Info className="h-3 w-3 text-gray-500" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "blocked": return "text-red-700";
      case "substituted": return "text-blue-700"; 
      case "warning": return "text-yellow-700";
      default: return "text-gray-700";
    }
  };

  return (
    <Card className={`border-orange-200 bg-orange-50/30 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-orange-600" />
          <h4 className="font-medium text-sm text-orange-900">Recent safety events</h4>
        </div>
        
        {events.length === 0 ? (
          <p className="text-xs text-orange-700 opacity-75">No safety events today</p>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 3).map(event => (
              <div key={event.id} className="flex items-center gap-2 text-xs">
                {getEventIcon(event.type)}
                <span className={`flex-1 ${getEventColor(event.type)}`}>
                  {event.type === "blocked" && "Blocked "}
                  {event.type === "substituted" && "Modified "}
                  {event.type === "warning" && "Warning for "}
                  <span className="font-medium">{event.mealName}</span>
                  {" → " + event.reason}
                </span>
                <span className="text-orange-600 opacity-75">
                  {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {events.length > 3 && (
              <Button variant="ghost" size="sm" className="h-6 text-xs text-orange-700 p-0">
                View all {events.length} events
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}