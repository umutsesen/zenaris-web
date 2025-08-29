# Zenaris AI Component System

A comprehensive AI-enhanced design system for the Zenaris meal preferences application, featuring smart autocomplete, meal generation, and safety-first interactions.

## Design Tokens

### Colors
- **AI Brand**: `#103A3A` - Primary AI brand color
- **AI Background**: `#F8FAF9` - Very light teal for AI contexts
- **AI Border**: `#DCE8E7` - Subtle borders for AI components
- **AI Info**: `#0EA5A3` - Information and success states
- **AI Warning**: `#F59E0B` - Caution and warning states
- **AI Danger**: `#B91C1C` - Error and conflict states

### Typography
- **H1**: 28px/36px semibold
- **H2**: 18px/24px semibold  
- **Body**: 14px/22px normal
- **Small**: 12px/18px medium
- **Code**: 12px/18px monospace

### Spacing
Follows 8pt grid system with variables for consistent spacing.

## Components

### Core Components

#### AIBadge
```tsx
<AIBadge variant="info" size="sm">Contains dairy</AIBadge>
```
- **Variants**: neutral, info, warning, danger, success
- **Sizes**: sm, md

#### AIAlert  
```tsx
<AIAlert variant="warning" title="Conflict detected">
  This item conflicts with their allergies.
</AIAlert>
```
- **Variants**: info, warning, danger
- **Features**: Dismissible, action buttons, icons

#### AISkeleton
```tsx
<AISkeleton variant="card" />
```
- **Variants**: row, card
- **Use**: Loading states for AI operations

### Smart Input Components

#### AIAutocomplete
Intelligent food suggestion combobox with conflict detection.

```tsx
<AIAutocomplete
  placeholder="Search or type a food…"
  onSelect={handleSelect}
  favorites={["soup", "pasta"]}
  allergies={["nuts", "dairy"]}
  neverServe={["spicy foods"]}
/>
```

**Features**:
- 200ms debounced search
- Conflict detection and visual warnings
- Keyboard navigation (Arrow keys, Enter, Escape)
- Accessibility compliant
- Category badges and safety indicators

#### AIActionsBar
Top-level AI shortcuts for quick actions.

```tsx
<AIActionsBar
  elderName="Michael"
  onAddFavorite={handleAdd}
  favorites={favorites}
  allergies={allergies}
/>
```

### Advanced Components

#### AIResultCard
Displays AI-generated meal suggestions with safety indicators.

```tsx
<AIResultCard
  title="Chicken Soup"
  description="Warm, comforting soup"
  safety="safe"
  tags={["warm", "soft"]}
  prepTime="15 min"
  difficulty="Easy"
  matches={["chicken", "soup"]}
  onUse={handleUse}
/>
```

**Safety Levels**:
- **Safe**: Green dot, fully actionable
- **Caution**: Yellow dot, warnings shown
- **Avoid**: Red triangle, disabled interactions

#### AIGenerationModal
Comprehensive meal planning modal with single item and full day options.

```tsx
<AIGenerationModal
  open={isOpen}
  onOpenChange={setOpen}
  elderName="Michael"
  onUseSuggestion={handleUse}
/>
```

**Features**:
- Tabbed interface (Single item / Full day plan)
- Preference toggles (soft texture, warm, low prep)
- Regional cuisine selection
- Loading states with skeletons
- Error handling with retry

#### AIFavoritesList
Enhanced favorites management with AI integration.

```tsx
<AIFavoritesList
  items={favorites}
  dislikes={dislikes}
  allergies={allergies}
  elderName="Michael"
  onAdd={handleAdd}
  onUpdate={handleUpdate}
  onRemove={handleRemove}
/>
```

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Comprehensive ARIA labels and live regions
- **Focus Management**: Logical tab order and visible focus indicators
- **High Contrast**: Support for high contrast mode
- **Touch Targets**: 44px minimum touch targets on mobile
- **Reduced Motion**: Respects user's motion preferences

## Safety & Conflicts

The AI system prioritizes safety through:

1. **Conflict Detection**: Automatically detects conflicts between suggestions and:
   - Known allergies
   - "Never serve" items
   - Existing dislikes

2. **Visual Indicators**: Clear safety status with:
   - Green dots for safe items
   - Yellow dots for cautions
   - Red triangles for conflicts

3. **Interaction Blocking**: Prevents selection of conflicting items with clear messaging

4. **Transparency**: "Why this?" explanations show reasoning behind suggestions

## Usage Examples

### Basic Integration
```tsx
import { AIFavoritesList, AIActionsBar } from './components/ai';

function MyComponent() {
  return (
    <div>
      <AIActionsBar elderName="Michael" onAddFavorite={handleAdd} />
      <AIFavoritesList 
        items={favorites}
        dislikes={dislikes}
        allergies={allergies}
        onAdd={handleAdd}
      />
    </div>
  );
}
```

### Custom Styling
All components accept `className` props and follow the design system tokens:

```tsx
<AIBadge className="custom-styling" variant="info">
  Custom Badge
</AIBadge>
```

## State Management

Components are designed to be controlled, requiring parent state management:

- **Data Flow**: Unidirectional from parent to child
- **Events**: Callback functions for user interactions
- **Validation**: Built-in safety checks and conflict detection
- **Persistence**: Integrates with existing data persistence layer

## Responsive Design

- **Mobile-first**: Components designed for mobile interaction first
- **Breakpoints**: Adapts to tablet and desktop layouts
- **Touch-friendly**: Appropriate sizing for touch interactions
- **Flexible layouts**: Grid and flexbox based responsive layouts

## Performance

- **Debounced Search**: 200ms debounce on autocomplete
- **Lazy Loading**: Skeleton states during async operations
- **Optimized Rendering**: Minimal re-renders through React best practices
- **Bundle Size**: Tree-shakeable exports for optimal bundle size

---

Built with empathy for caregivers and their loved ones • Zenaris AI © 2025