# 📘 Financial Life Simulator - Developer's Guide

## Project Overview

The **Financial Life Simulator** is a fully modular, client-side financial planning tool designed for individual users and educational purposes. It empowers users to simulate their financial journey through a visual, interactive timeline using a plugin-based event system.

### Core Principles

- ✅ **100% Front-End** - No backend, runs entirely in the browser
- ✅ **Radical Modularity** - Every component is swappable and extensible
- ✅ **Configuration-Driven** - Events define their own behavior through handlers
- ✅ **Zero Hardcoded Logic** - The calculation engine is event-agnostic
- ✅ **Free & Open-Source** - Self-hostable, community-driven

### Key Features

- **Interactive Timeline:** Drag-and-drop financial events directly onto a graph representing your life.
- **Dynamic Calculations:** The graph and simulation results update instantly as you add, remove, or modify events.
- **Configurable Simulation:** Easily change the simulation's start and end ages directly from the UI.
- **Visual Analysis:** The graph uses a smooth, monotone curve with inflection point markers to clearly visualize changes in your financial trajectory.
- **Zoom & Pan:** Zoom in on specific periods of your life to get a more detailed view.

---

## 📁 Project Structure

```
financial-life-simulator/
├── src/
│   ├── components/          # React UI components
│   │   ├── TopBar.jsx       # Header with global controls (e.g., age range)
│   │   ├── InputSidebar.jsx # Event configuration panel
│   │   ├── BottomBar.jsx    # Event type selector
│   │   ├── GraphArea.jsx    # Main timeline visualization with zoom
│   │   ├── StatsPanel.jsx   # Right sidebar hover info
│   │   ├── EditEventModal.jsx # Event editing interface
│   │   └── Hoverable.jsx    # Wrapper for hover interactions
│   │
│   ├── contexts/            # React Context providers
│   │   └── HoverContext.jsx # Global hover state management
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useSimulation.js # Main state management for events and params
│   │   ├── useEventForm.js  # Form state with field rules
│   │   └── useGraphTooltip.js # Logic for graph hover/tooltip display
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

Events are the **fundamental building blocks** of the simulator. The `FinancialPhaseHandler` is a special event that drives savings and growth, while other events like `IncomePulseHandler` represent singular financial moments.

The system is designed to be robust, with logic in place to handle multiple sequential `FinancialPhase` events correctly and to ensure one-time events properly contribute to the net worth base for future growth.

***

## 🧮 Calculation Engine (`src/utils/calculations.js`)

The engine is **completely generic** and knows nothing about specific event types. The simulation range is controlled by parameters passed from the UI.

### Execution Flow (Per Year)

```
For age = simulationParams.startAge to simulationParams.endAge:
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

***

## 🎨 Component Integration

### Data Flow

```
User Action (e.g., Change Age in TopBar)
        ↓
TopBar.jsx → updateSimulationParams()
        ↓
useSimulation hook → setSimulationParams()
        ↓
App.jsx re-renders, passes new params down
        ↓
useMemo() in useSimulation → calculateProjection()
        ↓
GraphArea receives new results & params
        ↓
Line animates to reflect the new data
```

***

## 📊 State Management

### Current State Structure

The entire application state is managed within the `useSimulation` hook.

```javascript
{
  // All user-added events
  events: [
    { id: '...', type: '...', age: 25, params: { ... } }
  ],
  
  // Parameters controlling the simulation
  simulationParams: {
    startAge: 15,
    endAge: 80
  },
  
  // The calculated output
  results: [
    { age: 15, netWorth: 0 },
    { age: 16, netWorth: 1000 },
    // ...
  ]
}
```

### State Updates Trigger Recalculation

```javascript
// In useSimulation.js
function useSimulation() {
  const [events, setEvents] = useState([]);
  const [simulationParams, setSimulationParams] = useState({ startAge: 15, endAge: 80 });

  // Auto-recalculate when events or params change
  const results = useMemo(() => {
    return calculateProjection(events, simulationParams);
  }, [events, simulationParams]);
  
  const updateSimulationParams = (newParams) => {
    setSimulationParams(prev => ({ ...prev, ...newParams }));
  };

  return { events, results, simulationParams, updateSimulationParams, ... };
}
```

**Key:** `useMemo` ensures calculations only run when necessary.

***

## 🐛 Debugging

### Animation Issues

If the graph line animates unexpectedly, it means the `events` prop passed to `GraphArea` is changing. The component uses a memoized "checksum" of the events array to determine if an animation is warranted. If this checksum changes, the graph animates. This is a useful place to start debugging if the animation feels buggy.

### React DevTools

Install React DevTools extension to:
- Inspect component hierarchy
- View props/state
- Track re-renders

### Common Issues

**Events not appearing:** Check `EventRegistry.register()` was called.

**Calculations wrong:** Verify the event handler's `calculationConfig` and check the logic in its `calculate...` methods.

**Hover not updating:** Ensure the component calling `updateHover()` is a child of the `HoverProvider`.

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
