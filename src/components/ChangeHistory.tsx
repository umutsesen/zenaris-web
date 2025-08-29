import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Clock, ChevronDown, ChevronUp, History, User, FileText, AlertCircle } from 'lucide-react';
import { useChangeHistory, type ChangeType, type ChangeEntry } from '../utils/change-history-hooks';

interface ChangeHistoryProps {
  elderId: string;
  defaultExpanded?: boolean;
  compact?: boolean;
}

export function ChangeHistory({ elderId, defaultExpanded = false, compact = false }: ChangeHistoryProps) {
  const { history, clearHistory } = useChangeHistory(elderId);
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  // Reset showAll when collapsible is closed
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setShowAll(false);
    }
  };

  const getChangeIcon = (type: ChangeType) => {
    switch (type) {
      case 'added': return <span className="text-green-600 text-sm">+</span>;
      case 'removed': return <span className="text-red-600 text-sm">−</span>;
      case 'updated': return <span className="text-blue-600 text-sm">✎</span>;
      case 'notes_changed': return <FileText className="h-3 w-3 text-blue-600" />;
    }
  };

  const getChangeColor = (type: ChangeType) => {
    switch (type) {
      case 'added': return 'bg-green-50 border-green-200';
      case 'removed': return 'bg-red-50 border-red-200';
      case 'updated': return 'bg-blue-50 border-blue-200';
      case 'notes_changed': return 'bg-purple-50 border-purple-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'favorites': return '❤️';
      case 'dislikes': return '👎';
      case 'allergies': return '🛡️';
      case 'notes': return '📝';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return then.toLocaleDateString();
  };

  // Get the display history based on showAll state
  const displayHistory = showAll ? history : history.slice(0, 5);
  const hasMoreItems = history.length > 5;

  const groupedHistory = displayHistory.reduce((acc, change) => {
    const date = new Date(change.timestamp).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(change);
    return acc;
  }, {} as Record<string, ChangeEntry[]>);

  if (history.length === 0) {
    return (
      <Card className="card-shadow border-border no-print">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-muted-foreground" />
            {compact ? 'Recent Changes' : 'Change History'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No changes recorded yet</p>
            <p className="text-xs">Updates will appear here as you modify preferences</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create the common content component
  const renderHistoryContent = () => (
    <>
      {/* Status indicator when showing partial results */}
      {hasMoreItems && !showAll && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Showing latest 5 changes</span>
            <span className="text-blue-600 ml-2">• {history.length - 5} more available</span>
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        {Object.entries(groupedHistory).map(([date, changes]) => (
          <div key={date}>
            <div className="text-xs font-medium text-muted-foreground mb-2 sticky top-0">
              {new Date(date).toLocaleDateString(undefined, { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="space-y-2 ml-2">
              {changes.map(change => (
                <div 
                  key={change.id} 
                  className={`p-3 rounded-md border ${getChangeColor(change.type)}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex items-center gap-1 mt-0.5">
                      {getChangeIcon(change.type)}
                      <span className="text-xs">{getCategoryIcon(change.category)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{change.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(change.timestamp)}</span>
                        {change.updatedBy && (
                          <>
                            <User className="h-3 w-3" />
                            <span>{change.updatedBy}</span>
                          </>
                        )}
                      </div>
                      {(change.oldValue || change.newValue) && (
                        <div className="mt-2 text-xs">
                          {change.oldValue && (
                            <div className="text-red-600">
                              <span className="font-medium">Was:</span> {change.oldValue}
                            </div>
                          )}
                          {change.newValue && (
                            <div className="text-green-600">
                              <span className="font-medium">Now:</span> {change.newValue}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Show More / Show Less Button */}
      {hasMoreItems && (
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAll(!showAll)}
            className="text-sm border-dashed border-muted-foreground/30 hover:border-primary hover:text-primary bg-accent/30 hover:bg-accent/50"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show {history.length - 5} More Changes
              </>
            )}
          </Button>
        </div>
      )}
      
      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearHistory}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Clear History
          </Button>
        </div>
      )}
    </>
  );

  // If defaultExpanded is true, render without collapsible wrapper
  if (defaultExpanded) {
    return (
      <Card className="card-shadow border-border no-print">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" />
              Change History
              <Badge variant="secondary" className="text-xs">
                {history.length}
              </Badge>
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete timeline of all preference updates
          </p>
        </CardHeader>
        <CardContent>
          {renderHistoryContent()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow border-border no-print  hover:bg-accent/50 transition-colors">
      <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger asChild className="pt-3 pb-2">
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Recent Changes
                <Badge variant="secondary" className="text-xs">
                  {history.length}
                </Badge>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {renderHistoryContent()}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}