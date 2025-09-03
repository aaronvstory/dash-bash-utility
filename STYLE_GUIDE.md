# Dash Bash Utility Style Guide

This comprehensive style guide ensures consistent visual design and interaction patterns across all current and future development of the Dash Bash Utility application.

## 🎨 Color Palette

### Primary Colors
```css
/* Background Hierarchy */
--bg-primary: gray-900    /* Main app background */
--bg-secondary: gray-800  /* Section backgrounds */
--bg-tertiary: gray-700   /* Nested components */
--bg-quaternary: gray-600 /* Hover states */

/* Text Hierarchy */
--text-primary: gray-100   /* Main content */
--text-secondary: gray-300 /* Secondary content */
--text-muted: gray-400    /* Subtle text, placeholders */
--text-disabled: gray-500  /* Disabled state */
```

### Semantic Colors
```css
/* Action Colors */
--action-primary: blue-500    /* Primary actions, copy buttons */
--action-success: green-500   /* Save, add, confirm */
--action-warning: yellow-500  /* Edit, caution states */
--action-danger: red-500      /* Delete, remove, errors */
--action-info: purple-500     /* Special features, notes */

/* Status Colors (Time-based) */
--status-open: green-400      /* >2 hours remaining */
--status-warning: yellow-400  /* 1-2 hours remaining */
--status-urgent: orange-400   /* <1 hour remaining */
--status-closed: red-400      /* Closed/unavailable */
```

### Transparency Levels
```css
/* Background Overlays */
--opacity-subtle: /40   /* Subtle backgrounds */
--opacity-medium: /50   /* Standard overlays */
--opacity-strong: /60   /* Emphasized overlays */
--opacity-solid: /100   /* Solid backgrounds */
```

## 📐 Layout Structure

### Container Hierarchy
```html
<!-- Main Container -->
<div class="min-h-screen bg-gray-900 p-2 md:p-4">
  <!-- Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto">
    <!-- Section Container -->
    <div class="bg-gray-800 rounded-lg p-4">
      <!-- Section Content -->
      <div class="space-y-4">
        <!-- Components -->
      </div>
    </div>
  </div>
</div>
```

### Spacing Convention
- **Container padding**: `p-4` (1rem)
- **Section spacing**: `space-y-4` (1rem vertical gaps)
- **Inline spacing**: `space-x-2` (0.5rem horizontal gaps)
- **Compact spacing**: `space-y-2` for related items
- **Grid gaps**: `gap-4` for major sections, `gap-2` for items

## 🧩 Component Patterns

### Collapsible Section Header
```jsx
<div class="bg-gray-800 rounded-lg p-4">
  <button 
    onClick={toggleSection}
    class="w-full flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
  >
    <div class="flex items-center space-x-3">
      <Icon name="section-icon" size={20} class="text-blue-400" />
      <span class="text-lg font-medium">Section Title ({count} items)</span>
      <span class="text-sm text-gray-400">Optional subtitle</span>
    </div>
    <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={20} />
  </button>
  
  {isOpen && (
    <div class="mt-4 space-y-4">
      {/* Section content */}
    </div>
  )}
</div>
```

### Button Styles
```jsx
/* Primary Action */
<button class="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
  Action
</button>

/* Success Action */
<button class="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
  Save
</button>

/* Warning Action */
<button class="px-3 py-1.5 bg-yellow-500 text-gray-900 rounded hover:bg-yellow-600 transition-colors">
  Edit
</button>

/* Danger Action */
<button class="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
  Delete
</button>

/* Ghost Button */
<button class="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors">
  Cancel
</button>

/* Icon Button */
<button class="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
  <Icon size={16} />
</button>
```

### Input Fields
```jsx
/* Standard Input */
<input
  type="text"
  class="w-full px-3 py-2 bg-gray-700 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Placeholder text..."
/>

/* Small Input */
<input
  type="text"
  class="px-2 py-1 bg-gray-700 text-gray-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

/* Textarea */
<textarea
  class="w-full px-3 py-2 bg-gray-700 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
  rows={3}
/>
```

### Card/Item Container
```jsx
<div class="p-3 bg-gray-700/50 rounded-lg space-y-2 hover:bg-gray-700/60 transition-colors">
  {/* Card Header */}
  <div class="flex items-center justify-between">
    <span class="font-medium text-gray-100">Item Title</span>
    <div class="flex items-center space-x-1">
      {/* Action buttons */}
    </div>
  </div>
  
  {/* Card Content */}
  <div class="text-sm text-gray-300">
    Content here...
  </div>
</div>
```

## 🎭 Interactive States

### Hover Effects
- **Buttons**: Add darker shade with `hover:bg-[color]-600`
- **Cards**: Lighten background with `hover:bg-gray-700/60`
- **Text links**: Brighten with `hover:text-white`
- **Always include**: `transition-colors` for smooth transitions

### Focus States
- **Inputs/Textareas**: `focus:outline-none focus:ring-2 focus:ring-blue-500`
- **Buttons**: Browser default or custom ring
- **Accessibility**: Never remove focus indicators completely

### Drag and Drop
```jsx
/* Dragging State */
class="opacity-50 cursor-grabbing"

/* Drag Over State */
class="border-2 border-dashed border-blue-400 bg-blue-500/10"

/* Drag Handle */
<div class="cursor-grab hover:bg-gray-600 p-1 rounded">
  <GripVertical size={16} class="text-gray-400" />
</div>
```

## 🔔 Notifications

### Toast Notification
```jsx
<div class="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
  <Icon name="check" size={16} class="text-green-400" />
  <span>Action completed successfully</span>
</div>
```

### Inline Status Messages
```jsx
/* Success */
<div class="text-green-400 text-sm">✓ Saved successfully</div>

/* Error */
<div class="text-red-400 text-sm">✗ Error: Invalid input</div>

/* Info */
<div class="text-blue-400 text-sm">ℹ Tip: Press Enter to save</div>
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large screens */
2xl: 1536px /* Extra large */
```

### Grid Layouts
```jsx
/* Responsive columns */
class="grid grid-cols-1 lg:grid-cols-2 gap-4"

/* Responsive padding */
class="p-2 md:p-4"

/* Responsive text */
class="text-sm md:text-base"
```

## 🎯 Icon Guidelines

### Icon Sizes
- **Section headers**: 20px
- **Buttons**: 16px
- **Inline actions**: 14px
- **Decorative**: 12px

### Icon Colors
- **Primary actions**: `text-blue-400`
- **Success**: `text-green-400`
- **Warning**: `text-yellow-400`
- **Danger**: `text-red-400`
- **Muted/inactive**: `text-gray-400`

### Common Icons (Lucide)
```jsx
import { 
  ChevronDown, ChevronUp,     // Collapse/Expand
  Plus, Trash2,                // Add/Delete
  Edit2, Save, X,             // Edit/Save/Cancel
  Copy, Check,                 // Copy/Success
  GripVertical,               // Drag handle
  Clock, MapPin,              // Time/Location
  Calculator, MessageSquare,   // Features
  Building2, FileText         // Categories
} from 'lucide-react';
```

## 🔧 Adding New Sections

### Template for New Collapsible Section
```jsx
const NewSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <YourIcon size={20} className="text-blue-400" />
          <span className="text-lg font-medium">
            Section Name ({items.length} items)
          </span>
        </div>
        <ChevronIcon size={20} />
      </button>
      
      {/* Content */}
      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Add New Item Button */}
          <button className="w-full px-3 py-2 bg-gray-700/50 border border-dashed border-gray-600 rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-colors">
            <Plus size={16} className="inline mr-2" />
            Add New Item
          </button>
          
          {/* Items List */}
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="p-3 bg-gray-700/50 rounded-lg">
                {/* Item content */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## 📋 Checklist for New Features

When adding new features, ensure:

- [ ] Uses gray-900 as base background
- [ ] Follows container hierarchy (800 → 700 → 600)
- [ ] Includes hover states with transitions
- [ ] Has proper focus indicators for accessibility
- [ ] Uses semantic colors consistently
- [ ] Includes toast notifications for user actions
- [ ] Supports drag-and-drop if items are reorderable
- [ ] Has collapsible UI if containing multiple items
- [ ] Follows responsive design patterns
- [ ] Uses appropriate icon sizes and colors
- [ ] Includes proper spacing (p-4, space-y-4)
- [ ] Saves state to localStorage if persistent
- [ ] Has inline editing with save/cancel if editable
- [ ] Shows item counts in headers
- [ ] Uses consistent button styles

## 🚫 Anti-Patterns to Avoid

1. **Don't use pure white** (`text-white`) for body text - use `text-gray-100`
2. **Don't skip hover states** - Always include visual feedback
3. **Don't use sharp corners** everywhere - Use `rounded-lg` for containers
4. **Don't mix color semantics** - Keep action colors consistent
5. **Don't forget transitions** - Add `transition-colors` to interactive elements
6. **Don't use excessive shadows** - The dark theme relies on elevation through color
7. **Don't break the grid** - Maintain consistent spacing and alignment
8. **Don't override focus rings** without providing alternatives

## 🎬 Animation Guidelines

### Transitions
- **Duration**: Use default Tailwind duration (150ms)
- **Properties**: Primarily `transition-colors`, occasionally `transition-all`
- **Avoid**: Excessive animations that distract from functionality

### Collapse/Expand
- Use conditional rendering with smooth height transitions
- Consider `max-height` transitions for smoother animations

## 📝 Code Organization

### Component Structure
```jsx
1. State declarations (useState hooks)
2. Effect hooks (useEffect)
3. Event handlers
4. Render helpers
5. Main return JSX
```

### Naming Conventions
- **State**: `isOpen`, `hasError`, `canEdit` (boolean flags)
- **Handlers**: `handleClick`, `handleDragStart` (action-based)
- **Components**: PascalCase for components, camelCase for functions
- **CSS classes**: Use Tailwind utilities, avoid custom CSS

## 🔗 Integration with Existing Code

When modifying existing sections:
1. Maintain the established color scheme
2. Keep consistent spacing and padding
3. Follow the existing state management pattern
4. Preserve localStorage keys and structure
5. Ensure backward compatibility with saved data

This style guide should be referenced for all future development to maintain the cohesive, professional appearance of the Dash Bash Utility application.