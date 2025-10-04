# 📘 Financial Life Simulator - Developer's Guide

## Project Overview

The **Financial Life Simulator** is a fully modular, client-side financial planning tool designed for individual users and educational purposes. It empowers users to simulate their financial journey through a visual, interactive timeline using a plugin-based event system.

**Core Principles:**
- ✅ **100% Front-End** - No backend, runs entirely in the browser
- ✅ **Radical Modularity** - Every component is swappable and extensible
- ✅ **Configuration-Driven** - Events define their own behavior through handlers
- ✅ **Zero Hardcoded Logic** - The calculation engine is event-agnostic
- ✅ **Free & Open-Source** - Self-hostable, community-driven

---

## 📁 Project Structure

```
financial-life-simulator/
├── src/
│   ├── components/          # React UI components
│   │   ├── TopBar.jsx       # Header with scenario controls
│   │   ├── InputSidebar.jsx # Event configuration panel
│   │   ├── BottomBar.jsx    # Event type selector
│   │   ├── GraphArea.jsx    # Main timeline visualization
│   │   ├── StatsPanel.jsx   # Right sidebar hover info
│   │   ├── EditEventModal.jsx # Event editing interface
│   │   └── Hoverable.jsx    # Wrapper for hover interactions
│   │
│   ├── contexts/            # React Context providers
│   │   └── HoverContext.jsx # Global hover state management
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useSimulation.js # Main state management
│   │   ├── useEventForm.js  # Form state with field rules
│   │   └── useHoverInfo.js  # Hover info generation
│   │
│   ├── events/              # Event System (Plugin Architecture)
│   │   ├── EventRegistry.js      # Central event registration
│   │   ├── BaseEventHandler.js   # Abstract base class
│   │   └── handlers/             # Concrete event implementations
│   │       ├── FinancialPhaseHandler.js
│   │       ├── IncomePulseHandler.js
│   │       └── HouseHandler.js
│   │
│   ├── core/                # Business Logic Layer
│   │   └── fieldRules.js    # Field dependencies & validation
│   │
│   ├── utils/               # Pure utility functions
│   │   ├── calculations.js  # Generic projection engine
│   │   └── formatters.js    # Currency/number formatting
│   │
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles (Tailwind)
│
├── public/                  # Static assets
├── package.json
├── vite.config.js
└── tailwind.config.js
```

***

## 🏗️ Architecture Overview

### Layer Separation

The project follows a **strict separation of concerns**:

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│   (React Components - UI Only)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      State Management Layer         │
│   (Hooks + Contexts)                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Business Logic Layer           │
│   (Event Handlers + Rules)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Calculation Engine             │
│   (Generic, Event-Agnostic)         │
└─────────────────────────────────────┘
```

**Key Design Pattern:** Strategy Pattern + Registry Pattern + Observer Pattern

---

## 🔌 Event System (Core Architecture)

### How Events Work

Events are the **fundamental building blocks** of the simulator. Everything that affects net worth is an event.

#### 1. Event Registry (`src/events/EventRegistry.js`)

The registry is a **singleton** that manages all event types:

```javascript
class EventRegistry {
  handlers = new Map()      // type -> HandlerInstance
  configs = new Map()       // type -> ConfigObject
  
  register(handler, config) {
    this.handlers.set(config.type, new handler(config))
    this.configs.set(config.type, config)
  }
  
  getHandler(type) { return this.handlers.get(type) }
  getConfig(type) { return this.configs.get(type) }
}
```

**Purpose:** Decouples event creation from usage. Components never know specific event types—they query the registry.

#### 2. Base Event Handler (`src/events/BaseEventHandler.js`)

All events **must extend** this abstract class:

```javascript
export class BaseEventHandler {
  // Calculation behavior configuration
  calculationConfig = {
    immediateImpact: true,       // Apply on placement year?
    ongoingImpact: false,         // Apply every year after?
    affectsGrowth: false,         // Contributes to yearly growth?
    impactTiming: 'before-growth', // When to apply?
    priority: 100                 // Execution order
  }
  
  // Lifecycle hooks (override these)
  calculateImmediateImpact(netWorth, eventData, age, allEvents, context) {
    return netWorth
  }
  
  calculateOngoingImpact(netWorth, eventData, currentAge, allEvents, context) {
    return netWorth
  }
  
  contributeToYearlyGrowth(netWorth, eventData, currentAge, context) {
    return 0
  }
  
  getHoverStats(eventData, age) {
    return {}
  }
}
```

**Purpose:** Defines the contract that all events follow. The calculation engine calls these methods without knowing the specific event type.

#### 3. Concrete Event Handler (Example: `IncomePulseHandler.js`)

```javascript
export class IncomePulseHandler extends BaseEventHandler {
  constructor(config) {
    super(config)
    
    // Configure how this event behaves
    this.calculationConfig = {
      immediateImpact: true,
      ongoingImpact: false,
      affectsGrowth: false,
      impactTiming: 'before-growth', // Apply BEFORE investment returns
      includeInGrowthBase: true,     // This money DOES earn returns
      priority: 500
    }
  }
  
  calculateImmediateImpact(netWorth, eventData, age, allEvents, context) {
    const amount = eventData.params.amount || 0
    return netWorth + amount  // Add the income pulse
  }
  
  getHoverStats(eventData, age) {
    return {
      'Income Amount': eventData.params.amount,
      'Type': 'One-time payment'
    }
  }
}

// Configuration defines the UI
export const incomePulseConfig = {
  type: 'outstanding-income',
  label: 'Income Pulse',
  icon: '💰',
  color: '#8b5cf6',
  fields: [
    { name: 'amount', label: 'Total Amount', type: 'currency', default: 50000 }
  ]
}

// Register the event
eventRegistry.register(IncomePulseHandler, incomePulseConfig)
```

***

## 🧮 Calculation Engine (`src/utils/calculations.js`)

The engine is **completely generic** and knows nothing about specific event types.

### Execution Flow (Per Year)

```
For age 15 to 80:
  1. Before Year Calculation
     └─ Call beforeYearCalculation() on all active events
  
  2. Immediate Impacts - BEFORE GROWTH
     └─ Process events with impactTiming: 'before-growth'
        └─ Call calculateImmediateImpact()
  
  3. Immediate Impacts - IMMEDIATE
     └─ Process events with impactTiming: 'immediate'
  
  4. Yearly Growth Contributions
     └─ Process events with affectsGrowth: true
        └─ Call contributeToYearlyGrowth()
        └─ Add all returns to net worth
  
  5. Immediate Impacts - AFTER GROWTH
     └─ Process events with impactTiming: 'after-growth'
  
  6. Ongoing Impacts
     └─ Process past events with ongoingImpact: true
        └─ Call calculateOngoingImpact()
  
  7. After Year Calculation
     └─ Call afterYearCalculation() on all active events
  
  8. Store result { age, netWorth }
```

**Key:** Events control their own timing through `calculationConfig`. No hardcoded logic!

***

## 🎨 Component Integration

### Data Flow

```
User Action (Drag event to graph)
        ↓
App.jsx → addEvent()
        ↓
useSimulation hook → setEvents()
        ↓
useMemo() → calculateProjection()
        ↓
GraphArea receives new results
        ↓
Line animates with ripple effect
```

### Hover System

```
User hovers on element
        ↓
Component calls updateHover(hoverInfo)
        ↓
HoverContext broadcasts to all consumers
        ↓
StatsPanel receives update
        ↓
Right sidebar shows contextual info
```

**Every hoverable element** uses either:
- `<Hoverable>` wrapper component
- Direct `updateHover()` call with structured data

***

## ➕ Adding New Event Types

### Step-by-Step Guide

#### 1. Create Event Handler

Create `src/events/handlers/YourEventHandler.js`:

```javascript
import { BaseEventHandler } from '../BaseEventHandler'

export class YourEventHandler extends BaseEventHandler {
  constructor(config) {
    super(config)
    
    // Define calculation behavior
    this.calculationConfig = {
      immediateImpact: true,      // Does it affect net worth on placement?
      ongoingImpact: false,       // Does it have recurring effects?
      affectsGrowth: false,       // Does it contribute to yearly growth?
      impactTiming: 'immediate',  // 'before-growth' | 'immediate' | 'after-growth'
      priority: 100               // Higher = executes first
    }
  }
  
  // Implement calculation logic
  calculateImmediateImpact(netWorth, eventData, age, allEvents, context) {
    // Your logic here
    return netWorth + eventData.params.amount
  }
  
  // Optional: Recurring effects
  calculateOngoingImpact(netWorth, eventData, currentAge, allEvents, context) {
    return netWorth
  }
  
  // Optional: Yearly growth contribution
  contributeToYearlyGrowth(netWorth, eventData, currentAge, context) {
    return 0
  }
  
  // Define hover information
  getHoverStats(eventData, age) {
    return {
      'Stat Name': eventData.params.value,
      'Another Stat': 'Some value'
    }
  }
}

export const yourEventConfig = {
  type: 'your-event-type',      // Unique identifier
  label: 'Your Event Name',     // Display name
  icon: '🎯',                    // Emoji icon
  color: '#10b981',             // Graph marker color
  fields: [
    {
      name: 'amount',           // Parameter name
      label: 'Amount',          // Field label
      type: 'currency',         // 'currency' | 'percentage' | 'number' | 'select'
      default: 1000             // Default value
    }
  ]
}
```

#### 2. Register Event

In `src/events/EventRegistry.js`:

```javascript
import { YourEventHandler, yourEventConfig } from './handlers/YourEventHandler'

// Add to registration
eventRegistry.register(YourEventHandler, yourEventConfig)
```

**That's it!** Your event now:
- ✅ Appears in the bottom bar automatically
- ✅ Has a configuration form in the left sidebar
- ✅ Can be dragged to the graph
- ✅ Calculates according to your logic
- ✅ Shows hover information
- ✅ Can be edited via modal
- ✅ Animates on changes

***

## 🔗 Field Dependencies (`src/core/fieldRules.js`)

For fields that depend on each other (like annual/monthly income):

```javascript
export const fieldRules = {
  'annualIncome': {
    linkedFields: ['monthlyIncome'],
    calculateLinked: (value) => ({
      monthlyIncome: Math.round(value / 12)
    })
  },
  'monthlyIncome': {
    linkedFields: ['annualIncome'],
    calculateLinked: (value) => ({
      annualIncome: Math.round(value * 12)
    })
  }
}

export function applyFieldRules(fieldName, value, currentData) {
  const rule = fieldRules[fieldName]
  
  if (!rule) {
    return { [fieldName]: value }
  }
  
  const updates = { [fieldName]: value }
  
  if (rule.linkedFields && rule.calculateLinked) {
    const linkedValues = rule.calculateLinked(value)
    Object.assign(updates, linkedValues)
  }
  
  return updates
}
```

The `useEventForm` hook automatically applies these rules when fields change.

***

## 🎯 Extending the System

### Custom Field Types

Edit `InputField` component in `InputSidebar.jsx`:

```javascript
case 'your-custom-type':
  return (
    <YourCustomInput
      value={value}
      onChange={(newValue) => onChange(field.name, newValue)}
    />
  )
```

### Custom Calculation Phases

Want to add a new calculation phase?

1. Add it to `BaseEventHandler.calculationConfig`
2. Implement the method in `BaseEventHandler`
3. Add the phase to the calculation loop in `calculations.js`

### Event Cross-References

Events can access other events:

```javascript
calculateImmediateImpact(netWorth, eventData, age, allEvents, context) {
  // Find another event
  const otherEvent = allEvents.find(e => e.id === eventData.params.sourceId)
  
  // Use its data
  const amount = otherEvent.params.value * 0.20
  
  return netWorth - amount
}
```

***

## 📊 State Management

### Current State Structure

```javascript
{
  events: [
    {
      id: 'unique-id',
      type: 'financial-phase',
      age: 25,
      params: {
        annualIncome: 50000,
        savingsRate: 20,
        investmentReturn: 7
      }
    }
  ],
  results: [
    { age: 15, netWorth: 0 },
    { age: 16, netWorth: 1000 },
    // ...
  ]
}
```

### State Updates Trigger Recalculation

```javascript
useSimulation() {
  const [events, setEvents] = useState([])
  
  // Auto-recalculate when events change
  const results = useMemo(() => {
    return calculateProjection(events, simulationParams)
  }, [events, simulationParams])
  
  return { events, results, addEvent, updateEvent, removeEvent }
}
```

**Key:** `useMemo` ensures calculations only run when necessary.

***

## 🎨 Styling System

### Tailwind CSS v4

All styling uses Tailwind utility classes:

```jsx
<div className="bg-slate-900 border-r border-slate-700 p-6">
  <h2 className="text-lg font-semibold text-slate-100">Title</h2>
</div>
```

### Color Scheme

```javascript
// Event colors
const eventColors = {
  'financial-phase': '#3b82f6',  // Blue
  'outstanding-income': '#8b5cf6', // Purple
  'house': '#f59e0b'             // Orange
}
```

### Animations

Graph updates use CSS animations:

```css
@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.3;
    filter: blur(4px);
  }
  50% {
    opacity: 0.7;
    filter: blur(10px);
  }
}
```

Duration: **150ms** for all event changes.

***

## 🧪 Testing Strategy

### Unit Tests (Recommended)

Test event handlers in isolation:

```javascript
import { IncomePulseHandler } from './handlers/IncomePulseHandler'

test('adds income to net worth', () => {
  const handler = new IncomePulseHandler(incomePulseConfig)
  const eventData = { params: { amount: 50000 } }
  
  const result = handler.calculateImmediateImpact(10000, eventData, 30, [], {})
  
  expect(result).toBe(60000)
})
```

### Integration Tests

Test calculation engine with multiple events:

```javascript
test('income pulse increases net worth with investment returns', () => {
  const events = [
    { type: 'financial-phase', age: 25, params: { investmentReturn: 7 } },
    { type: 'outstanding-income', age: 30, params: { amount: 50000 } }
  ]
  
  const results = calculateProjection(events, { startAge: 25, endAge: 35 })
  
  // At age 30, should have pulse + returns
  expect(results.find(r => r.age === 30).netWorth).toBeGreaterThan(50000)
})
```

***

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` folder with static files

### Self-Hosting

Serve the `dist/` folder with any static host:

```bash
# Using Python
python -m http.server 8000 --directory dist

# Using Node
npx serve dist

# Using Nginx
# Copy dist/ to /var/www/html
```

### GitHub Pages

```bash
# Add to package.json
"homepage": "https://username.github.io/financial-life-simulator",

# Deploy
npm run build
gh-pages -d dist
```

***

## 🤝 Contributing Guidelines

### Adding a New Event Type

1. Fork the repository
2. Create your event handler in `src/events/handlers/`
3. Register it in `EventRegistry.js`
4. Test with multiple scenarios
5. Submit a pull request with:
   - Event handler code
   - Config object
   - Example use cases
   - Any new field types

### Code Style

- Use ES6+ features
- Follow existing naming conventions
- Add JSDoc comments for complex functions
- Keep components small (<200 lines)
- Extract hooks for complex logic

***

## 🐛 Debugging

### Enable Debug Logs

Add console.logs in calculation engine:

```javascript
// In calculations.js
console.log(`Age ${age}: Processing ${events.length} events`)
console.log(`Net worth: ${currentNetWorth}`)
```

### React DevTools

Install React DevTools extension to:
- Inspect component hierarchy
- View props/state
- Track re-renders

### Common Issues

**Events not appearing:** Check `EventRegistry.register()` was called

**Calculations wrong:** Verify `calculationConfig` matches intent

**Hover not updating:** Ensure `updateHover()` is in dependency array

**Graph not animating:** Check `animationKey` changes on event updates

***

## 📚 Further Reading

- **React Docs:** https://react.dev
- **Recharts:** https://recharts.org
- **Tailwind CSS:** https://tailwindcss.com
- **Strategy Pattern:** https://refactoring.guru/design-patterns/strategy
- **Plugin Architecture:** https://www.patterns.dev

***

## 📄 License

MIT License - Free and open-source. Use, modify, and distribute freely.