import { formatCurrency } from '../utils/formatters'
import Hoverable from './Hoverable'

export default function TopBar({ darkMode, setDarkMode, simulationParams, resetSimulation }) {
  const { startAge, endAge, investmentReturn } = simulationParams
  
  const handleNewScenario = () => {
    if (confirm('Create a new scenario? This will clear your current work.')) {
      resetSimulation()
    }
  }
  
  const handleCompare = () => {
    alert('Compare feature coming soon! This will let you compare multiple scenarios.')
  }
  
  const handleReset = () => {
    if (confirm('Reset all events? This cannot be undone.')) {
      resetSimulation()
    }
  }
  
  return (
    <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      {/* Left - App Title */}
      <Hoverable
        hoverInfo={{
          title: 'Financial Life Simulator',
          type: 'Application',
          icon: '📊',
          stats: {
            'Version': 'MVP v0.1',
            'Total Events': 3
          },
          description: 'Simulate your financial journey through life'
        }}
      >
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-2xl">📊</div>
          <h1 className="text-xl font-bold text-slate-100">Financial Life Simulator</h1>
        </div>
      </Hoverable>
      
      {/* Center - Simulation Summary */}
      <Hoverable
        hoverInfo={{
          title: 'Simulation Parameters',
          type: 'Settings',
          icon: '⚙️',
          stats: {
            'Age Range': `${startAge} - ${endAge}`,
            'Investment Return': `${investmentReturn}%`,
            'Currency': 'BRL'
          }
        }}
      >
        <div className="flex items-center gap-4 text-sm text-slate-300 cursor-pointer">
          <span>Age {startAge} → {endAge}</span>
          <span className="text-slate-500">|</span>
          <span>Growth: {investmentReturn}%</span>
          <span className="text-slate-500">|</span>
          <span>Currency: BRL</span>
        </div>
      </Hoverable>
      
      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        <Hoverable
          hoverInfo={{
            title: 'New Scenario',
            icon: '🆕',
            description: 'Clear all events and start fresh'
          }}
        >
          <button 
            onClick={handleNewScenario}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            New Scenario
          </button>
        </Hoverable>
        
        <Hoverable
          hoverInfo={{
            title: 'Compare',
            icon: '📊',
            description: 'Compare multiple scenarios side-by-side (coming soon)'
          }}
        >
          <button 
            onClick={handleCompare}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Compare
          </button>
        </Hoverable>
        
        <Hoverable
          hoverInfo={{
            title: 'Reset',
            icon: '🔄',
            description: 'Remove all events from the timeline'
          }}
        >
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </Hoverable>
        
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  )
}
