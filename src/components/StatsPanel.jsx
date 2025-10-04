import { memo } from 'react'
import { useHover } from '../contexts/HoverContext'
import { formatCurrency } from '../utils/formatters'
import { eventRegistry } from '../events/EventRegistry'

const StatsPanel = memo(() => {
  const { hoverInfo } = useHover()
  
  if (!hoverInfo) {
    return (
      <div className="w-80 bg-slate-800 border-l border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Statistics</h3>
        <div className="text-center text-slate-400 mt-8">
          <p className="text-4xl mb-2">📈</p>
          <p className="text-sm">Hover over any element to see detailed information</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">
        {hoverInfo.title || 'Statistics'}
      </h3>
      
      <div className="space-y-4">
        {/* Type indicator */}
        {hoverInfo.type && (
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{hoverInfo.icon}</span>
              <span className="text-sm font-medium text-slate-200">{hoverInfo.type}</span>
            </div>
          </div>
        )}
        
        {/* Main stats */}
        {hoverInfo.stats && Object.entries(hoverInfo.stats).map(([key, value]) => (
          <div key={key} className="bg-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">{key}</p>
            <p className="text-lg font-bold text-slate-100">
              {typeof value === 'number' && key.toLowerCase().includes('worth') 
                ? formatCurrency(value, 'BRL', false)
                : typeof value === 'number' && !key.includes('%')
                ? formatCurrency(value, 'BRL', true)
                : value}
            </p>
          </div>
        ))}
        
        {/* Events list */}
        {hoverInfo.events && hoverInfo.events.length > 0 && (
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-2">Events</p>
            <div className="space-y-2">
              {hoverInfo.events.map(event => {
                const config = eventRegistry.getConfig(event.type)
                if (!config) return null
                
                return (
                  <div key={event.id} className="flex items-center gap-2">
                    <span className="text-xl">{config.icon}</span>
                    <span className="text-sm text-slate-200">{config.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Additional info */}
        {hoverInfo.description && (
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400">{hoverInfo.description}</p>
          </div>
        )}
        
        {/* Hints */}
        {hoverInfo.hints && hoverInfo.hints.length > 0 && (
          <div className="mt-4 space-y-1">
            {hoverInfo.hints.map((hint, idx) => (
              <p key={idx} className="text-xs text-slate-500">{hint}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

StatsPanel.displayName = 'StatsPanel'

export default StatsPanel
