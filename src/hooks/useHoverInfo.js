import { useCallback } from 'react'
import { useHover } from '../contexts/HoverContext'
import { eventRegistry } from '../events/EventRegistry'
import { useTranslation } from 'react-i18next'

export function useHoverInfo() {
  const { updateHover, clearHover } = useHover()
  const { t } = useTranslation()
  
  // Generate hover info for event type buttons
  const getEventTypeHoverInfo = useCallback((eventType) => {
    const config = eventRegistry.getConfig(eventType)
    if (!config) return null
    
    return {
      title: t(config.label),
      type: t('hoverInfo.eventType.type'),
      icon: config.icon,
      stats: {
        [t('hoverInfo.eventType.fields')]: config.fields.length,
        [t('hoverInfo.eventType.color')]: config.color
      },
      description: t('hoverInfo.eventType.description', { label: t(config.label) }),
      hints: [t('hoverInfo.eventType.hint')]
    }
  }, [t])
  
  // Generate hover info for form fields
  const getFieldHoverInfo = useCallback((field, config) => {
    const typeDescriptions = {
      currency: t('hoverInfo.field.typeDescription.currency'),
      percentage: t('hoverInfo.field.typeDescription.percentage'),
      number: t('hoverInfo.field.typeDescription.number')
    }
    
    return {
      title: t(field.label),
      type: t('hoverInfo.field.type'),
      icon: '✏️',
      stats: {
        [t('hoverInfo.field.stats.type')]: field.type,
        [t('hoverInfo.field.stats.default')]: field.default,
        [t('hoverInfo.field.stats.event')]: t(config.label)
      },
      description: typeDescriptions[field.type] || t('hoverInfo.field.typeDescription.default'),
      hints: field.linkedFields 
        ? [t('hoverInfo.field.hint.linkedFields', { linkedFields: field.linkedFields.join(', ')})]
        : []
    }
  }, [t])
  
  return {
    updateHover,
    clearHover,
    getEventTypeHoverInfo,
    getFieldHoverInfo
  }
}
