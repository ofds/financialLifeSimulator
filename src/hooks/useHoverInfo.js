import { useCallback } from 'react'
import { useHover } from '../contexts/HoverContext'
import { eventRegistry } from '../events/EventRegistry'

export function useHoverInfo() {
  const { updateHover, clearHover } = useHover()
  
  // Generate hover info for event type buttons
  const getEventTypeHoverInfo = useCallback((eventType) => {
    const config = eventRegistry.getConfig(eventType)
    if (!config) return null
    
    return {
      title: config.label,
      type: 'Event Type',
      icon: config.icon,
      stats: {
        'Fields': config.fields.length,
        'Color': config.color
      },
      description: `Click to configure ${config.label} events`,
      hints: ['💡 Configure parameters then drag to timeline']
    }
  }, [])
  
  // Generate hover info for form fields
  const getFieldHoverInfo = useCallback((field, config) => {
    const typeDescriptions = {
      currency: 'Enter monetary value in BRL',
      percentage: 'Enter percentage (0-100)',
      number: 'Enter numeric value'
    }
    
    return {
      title: field.label,
      type: 'Input Field',
      icon: '✏️',
      stats: {
        'Type': field.type,
        'Default': field.default,
        'Event': config.label
      },
      description: typeDescriptions[field.type] || 'Enter value',
      hints: field.linkedFields 
        ? ['💡 This field is synchronized with ' + field.linkedFields.join(', ')]
        : []
    }
  }, [])
  
  return {
    updateHover,
    clearHover,
    getEventTypeHoverInfo,
    getFieldHoverInfo
  }
}
