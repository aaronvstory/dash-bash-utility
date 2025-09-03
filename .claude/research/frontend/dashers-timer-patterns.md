# React Timer & Drag-and-Drop Implementation Research

## Timer/Countdown Feature Best Practices

### Core Architecture Pattern

#### 1. Custom Hook for Timer Logic (useElapsedTime)
```typescript
interface UseElapsedTimeOptions {
  startTime: string | Date;
  updateInterval?: number; // milliseconds
  onThresholdChange?: (threshold: 'critical' | 'warning' | 'normal') => void;
}

const useElapsedTime = ({ startTime, updateInterval = 60000 }: UseElapsedTimeOptions) => {
  const [elapsed, setElapsed] = useState<number>(0);
  const [threshold, setThreshold] = useState<'critical' | 'warning' | 'normal'>('normal');
  
  useEffect(() => {
    const calculateElapsed = () => {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      return Math.floor((now - start) / 1000); // seconds
    };
    
    const updateTimer = () => {
      const seconds = calculateElapsed();
      setElapsed(seconds);
      
      // Threshold logic
      const hours = seconds / 3600;
      if (hours >= 24) setThreshold('critical');
      else if (hours >= 23) setThreshold('warning'); 
      else setThreshold('normal');
    };
    
    updateTimer(); // Initial calculation
    
    // Dynamic interval: every second in final hour, otherwise every minute
    const seconds = calculateElapsed();
    const hours = seconds / 3600;
    const interval = hours >= 23 ? 1000 : updateInterval;
    
    const timer = setInterval(updateTimer, interval);
    return () => clearInterval(timer);
  }, [startTime, updateInterval]);
  
  return { elapsed, threshold };
};
```

#### 2. Optimized Multi-Timer Management
```typescript
// Single shared timer for all components
const TimerContext = React.createContext<{
  currentTime: number;
  subscribe: (callback: () => void) => () => void;
}>({ currentTime: Date.now(), subscribe: () => () => {} });

const TimerProvider: React.FC = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const callbacks = useRef(new Set<() => void>());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      callbacks.current.forEach(cb => cb());
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);
  
  const subscribe = useCallback((callback: () => void) => {
    callbacks.current.add(callback);
    return () => callbacks.current.delete(callback);
  }, []);
  
  return (
    <TimerContext.Provider value={{ currentTime, subscribe }}>
      {children}
    </TimerContext.Provider>
  );
};
```

### Performance Optimization Strategies

#### 1. RequestAnimationFrame for Smooth Updates
```typescript
const useAnimatedTimer = (startTime: string) => {
  const [display, setDisplay] = useState('');
  const frameRef = useRef<number>();
  
  useEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - new Date(startTime).getTime();
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      
      setDisplay(`${hours}h ${minutes}m ${seconds}s`);
      
      // Only request next frame if component is visible
      if (document.visibilityState === 'visible') {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    // Pause when tab is hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        animate();
      } else if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startTime]);
  
  return display;
};
```

#### 2. Memoization for Color Calculations
```typescript
const getTimerColor = useMemo(() => {
  return (elapsedHours: number): string => {
    if (elapsedHours >= 24) return 'text-red-400';
    if (elapsedHours >= 23) return 'text-orange-400';
    return 'text-green-400';
  };
}, []);
```

### State Persistence Pattern
```typescript
interface TimerState {
  id: string;
  startTime: string;
  label: string;
  isPaused?: boolean;
  pausedAt?: string;
}

// Persist to localStorage
const usePersistedTimers = () => {
  const [timers, setTimers] = useState<TimerState[]>(() => {
    const saved = localStorage.getItem('dashBashTimers');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('dashBashTimers', JSON.stringify(timers));
  }, [timers]);
  
  return [timers, setTimers] as const;
};
```

## HTML5 Drag-and-Drop Best Practices

### Core Implementation Pattern

#### 1. Drag State Management
```typescript
interface DragState {
  draggedItem: any | null;
  draggedFrom: string | null; // category ID
  draggedOverItem: any | null;
  draggedOverCategory: string | null;
}

const useDragAndDrop = () => {
  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    draggedFrom: null,
    draggedOverItem: null,
    draggedOverCategory: null
  });
  
  const handleDragStart = (e: React.DragEvent, item: any, categoryId: string) => {
    // Store data in dataTransfer for cross-browser support
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, categoryId }));
    
    // Visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
    
    setDragState({
      draggedItem: item,
      draggedFrom: categoryId,
      draggedOverItem: null,
      draggedOverCategory: null
    });
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    // Reset visual state
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    
    setDragState({
      draggedItem: null,
      draggedFrom: null,
      draggedOverItem: null,
      draggedOverCategory: null
    });
  };
  
  return { dragState, handleDragStart, handleDragEnd, ...otherHandlers };
};
```

#### 2. Drop Zone Management
```typescript
const DropZone: React.FC<{ categoryId: string; onDrop: (item: any, from: string, to: string) => void }> = ({ 
  categoryId, 
  onDrop,
  children 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0); // Handle nested elements
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setIsDragOver(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      onDrop(data.item, data.categoryId, categoryId);
    } catch (error) {
      console.error('Drop failed:', error);
    }
  };
  
  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`transition-colors ${isDragOver ? 'bg-gray-700/50 border-blue-500' : ''}`}
    >
      {children}
    </div>
  );
};
```

### Accessibility Enhancements

#### Keyboard Navigation Support
```typescript
const useKeyboardDragDrop = () => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [mode, setMode] = useState<'normal' | 'moving'>('normal');
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (mode === 'normal' && e.key === ' ' && selectedItem) {
      e.preventDefault();
      setMode('moving');
    } else if (mode === 'moving') {
      switch(e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          // Move between categories
          break;
        case 'Enter':
        case ' ':
          // Drop item
          setMode('normal');
          break;
        case 'Escape':
          // Cancel move
          setMode('normal');
          setSelectedItem(null);
          break;
      }
    }
  };
  
  return { selectedItem, mode, handleKeyDown };
};
```

### Visual Feedback Patterns

#### 1. Drag Preview
```typescript
const DraggableItem: React.FC = ({ item }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        // Create custom drag image
        const dragImage = document.createElement('div');
        dragImage.className = 'bg-blue-500 text-white p-2 rounded shadow-lg';
        dragImage.textContent = item.label;
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => document.body.removeChild(dragImage), 0);
      }}
      onDragEnd={() => setIsDragging(false)}
      className={`
        cursor-move transition-all
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'}
      `}
    >
      {item.label}
    </div>
  );
};
```

#### 2. Drop Zone Indicators
```typescript
const dropZoneStyles = {
  idle: 'border-2 border-dashed border-gray-600',
  active: 'border-2 border-dashed border-blue-400 bg-blue-500/10',
  invalid: 'border-2 border-dashed border-red-400 bg-red-500/10',
  willAccept: 'border-2 border-solid border-green-400 bg-green-500/10'
};
```

## Integration Recommendations

### 1. Combined Timer & Drag-Drop State
```typescript
interface DashBashItem {
  id: string;
  categoryId: string;
  startTime: string;
  label: string;
  order: number;
}

const useDashBashState = () => {
  const [items, setItems] = useState<DashBashItem[]>([]);
  
  // Timer integration
  const timers = items.map(item => ({
    ...item,
    elapsed: useElapsedTime({ startTime: item.startTime })
  }));
  
  // Drag-drop integration
  const moveItem = (itemId: string, toCategoryId: string, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const itemIndex = newItems.findIndex(i => i.id === itemId);
      const [item] = newItems.splice(itemIndex, 1);
      
      // Update category and reorder
      item.categoryId = toCategoryId;
      
      // Insert at new position
      const categoryItems = newItems.filter(i => i.categoryId === toCategoryId);
      categoryItems.splice(toIndex, 0, item);
      
      // Update order values
      categoryItems.forEach((item, index) => {
        item.order = index;
      });
      
      return newItems;
    });
  };
  
  return { timers, moveItem };
};
```

### 2. Performance Monitoring
```typescript
const usePerformanceMonitor = () => {
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.startsWith('timer-')) {
            console.log(`Timer update took ${entry.duration}ms`);
          }
        });
      });
      observer.observe({ entryTypes: ['measure'] });
    }
  }, []);
};
```

## Best Practices Summary

### Timer Implementation
1. **Use single shared timer** for all components to reduce overhead
2. **Implement dynamic intervals** (1s for critical, 60s for normal)
3. **Pause updates when tab hidden** using Page Visibility API
4. **Memoize calculations** to prevent unnecessary re-renders
5. **Use requestAnimationFrame** for smooth visual updates

### Drag-and-Drop Implementation
1. **Store minimal data** in dataTransfer (just IDs)
2. **Use drag counter** for nested element handling
3. **Provide keyboard alternatives** for accessibility
4. **Clear visual feedback** at all drag states
5. **Implement undo functionality** for accidental moves

### State Persistence
1. **Debounce localStorage writes** (500ms delay)
2. **Use versioned schema** for migrations
3. **Implement error recovery** for corrupted data
4. **Batch updates** to reduce write frequency
5. **Use IndexedDB** for large datasets (>5MB)

## Code Examples for Dash Bash Integration

### Timer Component
```typescript
const DashTimer: React.FC<{ startTime: string; label: string }> = ({ startTime, label }) => {
  const { elapsed, threshold } = useElapsedTime({ startTime });
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };
  
  const colorClass = {
    critical: 'text-red-400',
    warning: 'text-orange-400', 
    normal: 'text-green-400'
  }[threshold];
  
  return (
    <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
      <span className="text-gray-300">{label}</span>
      <span className={`font-mono ${colorClass}`}>
        {formatTime(elapsed)}
      </span>
    </div>
  );
};
```

### Draggable Category Manager
```typescript
const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { dragState, handleDragStart, handleDragEnd } = useDragAndDrop();
  
  const handleItemMove = (itemId: string, fromCat: string, toCat: string) => {
    setCategories(prev => {
      // Implementation details...
      return updatedCategories;
    });
    
    // Persist to localStorage
    localStorage.setItem('dashBashCategories', JSON.stringify(categories));
  };
  
  return (
    <div className="space-y-4">
      {categories.map(category => (
        <DropZone
          key={category.id}
          categoryId={category.id}
          onDrop={handleItemMove}
        >
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-gray-100 mb-2">{category.name}</h3>
            <div className="space-y-2">
              {category.items.map(item => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  onDragStart={(e) => handleDragStart(e, item, category.id)}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        </DropZone>
      ))}
    </div>
  );
};
```

## Testing Strategies

### Timer Testing
```typescript
// Mock Date.now() for consistent testing
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2024-01-01T12:00:00'));
});

test('timer updates color threshold correctly', () => {
  const { result, rerender } = renderHook(() => 
    useElapsedTime({ startTime: '2024-01-01T00:00:00' })
  );
  
  expect(result.current.threshold).toBe('normal');
  
  // Fast-forward 23 hours
  act(() => {
    jest.advanceTimersByTime(23 * 60 * 60 * 1000);
  });
  
  rerender();
  expect(result.current.threshold).toBe('warning');
});
```

### Drag-Drop Testing
```typescript
test('item moves between categories', () => {
  const { getByTestId } = render(<CategoryManager />);
  
  const item = getByTestId('item-1');
  const dropZone = getByTestId('category-2');
  
  fireEvent.dragStart(item, {
    dataTransfer: { 
      setData: jest.fn(),
      effectAllowed: ''
    }
  });
  
  fireEvent.drop(dropZone, {
    dataTransfer: {
      getData: () => JSON.stringify({ item: { id: '1' }, categoryId: '1' })
    }
  });
  
  expect(dropZone).toContainElement(item);
});
```

## Performance Benchmarks

### Expected Performance Metrics
- Timer update: <5ms per timer
- Drag start: <10ms response time
- Drop operation: <20ms including state update
- localStorage write: <10ms for typical dataset
- Re-render on timer update: <16ms (60fps)

### Optimization Thresholds
- >50 timers: Switch to virtual scrolling
- >100 draggable items: Implement lazy loading
- >1MB localStorage: Migrate to IndexedDB
- >10 categories: Add search/filter functionality