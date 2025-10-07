import { useState } from 'react'
import TopBar from './components/TopBar'
import InputSidebar from './components/InputSidebar'
import GraphArea from './components/GraphArea'
import BottomBar from './components/BottomBar'
import StatsPanel from './components/StatsPanel'
import EditEventModal from './components/EditEventModal'
import { useSimulation } from './hooks/useSimulation'
import { HoverProvider } from './contexts/HoverContext'

function App() {
  const [selectedInputType, setSelectedInputType] = useState('financial-phase')
  const [darkMode, setDarkMode] = useState(true)
  const [editingEvent, setEditingEvent] = useState(null)

  const {
    events,
    addEvent,
    updateEvent,
    removeEvent,
    resetSimulation,
    results,
    simulationParams,
    updateSimulationParams
  } = useSimulation()

  const handleSaveEvent = (eventId, newParams) => {
    updateEvent(eventId, { params: newParams })
  }

  return (
    <HoverProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-slate-900">
        <TopBar 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          simulationParams={simulationParams}
          updateSimulationParams={updateSimulationParams}
          resetSimulation={resetSimulation}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <div className="w-[20%]">
            <InputSidebar
              selectedInputType={selectedInputType}
              addEvent={addEvent}
            />
          </div>

          <div className="w-[70%] flex flex-col">
            <GraphArea
              events={events}
              results={results}
              addEvent={addEvent}
              removeEvent={removeEvent}
              updateEvent={updateEvent}
              onEditEvent={setEditingEvent}
              simulationParams={simulationParams}
            />
            <BottomBar
              selectedInputType={selectedInputType}
              setSelectedInputType={setSelectedInputType}
            />
          </div>

          <div className="w-[20%]">
            <StatsPanel />
          </div>
        </div>
        
        {/* Edit Modal */}
        {editingEvent && (
          <EditEventModal
            event={editingEvent}
            onClose={() => setEditingEvent(null)}
            onSave={handleSaveEvent}
            onDelete={removeEvent}
          />
        )}
      </div>
    </HoverProvider>
  )
}

export default App
