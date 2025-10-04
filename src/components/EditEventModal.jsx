import { useState, useEffect } from 'react'
import { eventRegistry } from '../events/EventRegistry'
import { useEventForm } from '../hooks/useEventForm'

export default function EditEventModal({ event, onClose, onSave, onDelete }) {
  const config = eventRegistry.getConfig(event?.type)
  const { formData, handleFieldChange } = useEventForm(config)
  
  // Initialize form with event's current data
  useEffect(() => {
    if (event && config) {
      const initialData = { ...event.params }
      Object.keys(initialData).forEach(key => {
        handleFieldChange(key, initialData[key])
      })
    }
  }, [event])
  
  if (!event || !config) return null
  
  const handleSave = () => {
    onSave(event.id, formData)
    onClose()
  }
  
  const handleDelete = () => {
    if (confirm(`Delete this ${config.label}?`)) {
      onDelete(event.id)
      onClose()
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Edit {config.label}</h2>
              <p className="text-sm text-slate-400">Age {event.age}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {config.fields.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {field.label}
                </label>
                {renderField(field, formData[field.name] ?? field.default, handleFieldChange)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Delete Event
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function renderField(field, value, onChange) {
  switch (field.type) {
    case 'currency':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(field.name, parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
      )
    
    case 'percentage':
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(field.name, parseFloat(e.target.value) || 0)}
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            step="0.1"
          />
          <span className="text-slate-400">%</span>
        </div>
      )
    
    case 'number':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(field.name, parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
      )
    
    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {field.options.map(option => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
      )
    
    default:
      return null
  }
}
