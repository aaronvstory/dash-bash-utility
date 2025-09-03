# Dash Bash Utility - Comprehensive UI Patterns & Styling Analysis

## 1. Color Palette & Semantic Colors

### Primary Background Colors
- **Base Background**: `bg-gray-900` - Main app background
- **Card/Panel Background**: `bg-gray-800` - Primary container background
- **Secondary Background**: `bg-gray-700/40`, `bg-gray-700/60` - Nested containers
- **Tertiary Background**: `bg-gray-600/50` - Individual items

### Semantic State Colors
- **Success/Green**: `text-green-400`, `bg-green-900/40`, `border-green-500/50`
- **Warning/Yellow**: `text-yellow-400`, `bg-yellow-900/30`, `border-yellow-600/40`
- **Error/Red**: `text-red-400`, `bg-red-900/30`, `border-red-600/30`
- **Info/Blue**: `text-blue-400`, `bg-blue-600`, `hover:bg-blue-700`
- **Purple/Feature**: `text-purple-400`, `bg-purple-600`, `hover:bg-purple-700`
- **Orange/Highlight**: `text-orange-400`, `bg-orange-900/30`, `border-orange-600/40`

### Notification Colors
- **Success Toast**: `bg-green-900/90`, `border-green-600/50`, `text-green-100`
- **Info Toast**: `bg-blue-900/90`, `border-blue-600/50`, `text-blue-100`
- **Import Toast**: `bg-purple-900/90`, `border-purple-600/50`, `text-purple-100`

## 2. Component Structure Patterns

### Collapsible Section Pattern
```tailwind
<div className="bg-gray-800 rounded-lg overflow-hidden">
  <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors">
    <div className="flex items-center gap-3">
      <Icon size={20} className="text-[theme-color]" />
      <span className="text-lg font-medium">Section Title</span>
    </div>
    <ChevronIcon size={20} />
  </button>
  {isOpen && (
    <div className="border-t border-gray-700 p-4">
      {/* Content */}
    </div>
  )}
</div>
```

### Button Patterns
**Primary Action**: `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors`
**Secondary Action**: `bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30`
**Danger Action**: `bg-gray-800/50 hover:bg-gray-700/50 border border-red-900/30 text-red-400`
**Success Action**: `bg-green-600 hover:bg-green-700`
**Add New Button**: `bg-gray-800/50 hover:bg-gray-700 border border-gray-600/50 rounded-lg py-2.5 px-4`

### Input Field Patterns
**Standard Input**: `bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500`
**Editing Input**: `bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500`
**Textarea**: `bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500`

## 3. Spacing & Layout Conventions

### Padding Standards
- **Container Padding**: `p-4` (16px)
- **Section Header**: `p-4` 
- **Content Area**: `p-4`
- **Card/Item Padding**: `p-3` (12px)
- **Compact Items**: `p-2` (8px)

### Gap/Spacing Standards
- **Section Spacing**: `space-y-4` (16px between sections)
- **Item Spacing**: `space-y-2` (8px between items)
- **Inline Icon Gap**: `gap-2` or `gap-3`
- **Button Group Gap**: `gap-1` for compact, `gap-2` for normal

### Border Radius
- **Main Containers**: `rounded-lg` (8px)
- **Buttons**: `rounded-lg`
- **Inputs**: `rounded-lg` for main, `rounded` for inline edits

## 4. Interactive Element Patterns

### Hover States
- **Container Hover**: `hover:bg-gray-700/50` or `hover:bg-gray-700`
- **Button Hover**: Darker shade of base color (e.g., `hover:bg-blue-700`)
- **Text Link Hover**: `hover:text-blue-300`, `hover:text-green-300`
- **Icon Button Hover**: Color shift (e.g., `text-gray-500 hover:text-gray-400`)

### Focus States
- **Input Focus**: `focus:outline-none focus:ring-2 focus:ring-blue-500`
- **Smaller Input Focus**: `focus:outline-none focus:ring-1 focus:ring-blue-500`

### Transition Effects
- **Standard Transition**: `transition-colors`
- **Full Transition**: `transition-all duration-200`
- **Opacity Change**: `transition-opacity`

## 5. Toast Notification Styles

### Structure
```tailwind
className="fixed top-[position] right-4 z-50 bg-[color]/90 border border-[color]/50 text-[color] px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm animate-pulse"
```

### Positioning
- **Primary**: `top-4`
- **Secondary**: `top-16`
- **Tertiary**: `top-28`

## 6. Drag-and-Drop Visual Feedback

### Dragging States
- **Being Dragged**: `opacity-50` or `opacity-50 bg-gray-600`
- **Drag Handle**: `cursor-move` with `grip-vertical` icon
- **Drop Zone**: Maintains normal appearance, uses `onDragOver` prevention

### Drag Handle Pattern
```tailwind
<button className="text-gray-500 hover:text-gray-400 cursor-move p-1">
  <GripVertical size={18} />
</button>
```

## 7. Collapsible Section Patterns

### Header Pattern
- Toggle button spans full width
- Icon + Title on left, chevron on right
- Hover effect on entire header
- Status counts in header (e.g., "3 open • 2 closed")

### Collapse Animation
- Uses conditional rendering (`{isOpen && ...}`)
- Border separator: `border-t border-gray-700`
- Content padding matches container style

## 8. Icon Usage & Sizing

### Icon Size Standards
- **Section Headers**: `size={20}`
- **Regular Buttons**: `size={14}` or `size={16}`
- **Compact Buttons**: `size={12}`
- **Drag Handles**: `size={18}` for messages, `size={14}` for items

### Icon Colors by Function
- **Calculator**: `text-blue-400`
- **Messages**: `text-green-400`
- **Address Book**: `text-orange-400`
- **Notes**: `text-purple-400`
- **Settings**: `text-purple-400`
- **Actions**: Match button color theme

## 9. Typography Patterns

### Font Sizes
- **Main Title**: `text-3xl font-bold`
- **Section Title**: `text-lg font-medium`
- **Subsection Title**: `text-sm font-medium`
- **Body Text**: `text-base` or `text-sm`
- **Small Text**: `text-xs`
- **Labels**: `text-xs text-gray-400`

### Font Weights
- **Headers**: `font-bold` or `font-medium`
- **Regular Text**: Default weight
- **Important Info**: `font-medium`
- **Monospace**: `font-mono` for time/number inputs

## 10. Form Control Patterns

### Toggle Buttons (Target Amount)
```tailwind
className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
  isActive 
    ? 'bg-blue-600 text-white' 
    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
}`}
```

### Edit/Save Toggle Pattern
- Edit button becomes save button when active
- Yellow edit icon → Green save icon
- Inline editing without modal

## 11. Status Indicators

### Time-Based Colors
- **Plenty of Time** (>2hrs): `text-green-400`
- **Warning** (1-2hrs): `text-yellow-400`
- **Urgent** (<1hr): `text-red-400`
- **Closed**: `text-red-400`

### Calculation Result Colors (Distance from Target)
- **Optimal** (best match): `bg-green-900/40`, `border-green-500/50`
- **Very Close** (<5%): `bg-lime-900/30`, `border-lime-600/40`
- **Close** (<15%): `bg-yellow-900/30`, `border-yellow-600/40`
- **Moderate** (<30%): `bg-amber-900/30`, `border-amber-600/40`
- **Far** (<50%): `bg-orange-900/30`, `border-orange-600/40`
- **Very Far** (>50%): `bg-red-900/30`, `border-red-600/40`

## 12. Responsive Breakpoints

### Grid Layouts
- **Mobile**: Single column
- **Tablet/Desktop**: `grid-cols-2`
- **Large Desktop**: `lg:grid-cols-3`

## 13. Special Effects

### Pulse Animation
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Backdrop Blur
- Toast notifications use `backdrop-blur-sm`

### Opacity Layers
- Primary: `/40`, `/50`, `/60` for backgrounds
- Borders: `/30`, `/40`, `/50` for transparency
- Hover states increase opacity slightly

## 14. Accessibility Patterns

### ARIA Labels
- `aria-label="Drag to reorder"` for drag handles
- Proper button titles for icon-only buttons

### Keyboard Navigation
- Enter key handlers for inputs
- Escape key to cancel edits
- Auto-focus on new inputs

### Visual Feedback
- Clear hover states
- Focus rings on inputs
- Status text alongside color coding

## 15. Empty State Patterns

### No Content Messages
```tailwind
<div className="text-center text-gray-500 py-6 text-sm">
  No items yet. Click + to add one.
</div>
```

### Placeholder Text
- Italic style: `italic text-gray-500`
- Examples: "No address entered", "Not set", "No notes"

## Implementation Notes

1. **Consistency**: All similar components use identical styling patterns
2. **Dark Theme**: Entire app uses dark gray palette (gray-900 to gray-500)
3. **Transparency**: Heavy use of `/40`, `/50`, `/60` opacity modifiers
4. **Smooth Transitions**: All interactive elements have transition effects
5. **Visual Hierarchy**: Clear distinction between container levels through background colors
6. **Semantic Colors**: Consistent use of colors for specific functions (blue=primary, green=success, etc.)