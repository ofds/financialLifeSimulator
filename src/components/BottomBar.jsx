import { eventRegistry } from '../events/EventRegistry'
import { useHoverInfo } from '../hooks/useHoverInfo'

export default function BottomBar({ selectedInputType, setSelectedInputType }) {
  const eventTypes = Array.from(eventRegistry.handlers.keys())
  const { getEventTypeHoverInfo, updateHover, clearHover } = useHoverInfo()
  
  return (
    <div className="bg-slate-800 border-t border-slate-700 px-6 py-4">
      <div className="flex items-center justify-center gap-2">
        {eventTypes.map(type => {
          const config = eventRegistry.getConfig(type)
          if (!config) return null
          
          const isActive = selectedInputType === type
          const hoverInfo = getEventTypeHoverInfo(type)
          
          return (
            <button
              key={type}
              onClick={() => setSelectedInputType(type)}
              onMouseEnter={() => updateHover(hoverInfo)}
              onMouseLeave={clearHover}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg scale-105' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
            >
              <span className="text-lg">{config.icon}</span>
              <span>{config.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
