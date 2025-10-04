import { useState, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { eventRegistry } from '../events/EventRegistry'
import { useEventForm } from '../hooks/useEventForm'
import { useHoverInfo } from '../hooks/useHoverInfo'

const InputField = memo(({ field, value, onChange, config }) => {
  const { t } = useTranslation();
  const { getFieldHoverInfo, updateHover, clearHover } = useHoverInfo()
  
  const fieldHoverInfo = getFieldHoverInfo(field, config)
  
  switch (field.type) {
    case 'currency':
      return (
        <div
          onMouseEnter={() => updateHover(fieldHoverInfo)}
          onMouseLeave={clearHover}
        >
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(field.name, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
            placeholder="0"
          />
        </div>
      )
    
    case 'percentage':
      return (
        <div
          onMouseEnter={() => updateHover(fieldHoverInfo)}
          onMouseLeave={clearHover}
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(field.name, parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
              placeholder="0"
              step="0.1"
            />
            <span className="text-slate-400">%</span>
          </div>
        </div>
      )
    
    case 'number':
      return (
        <div
          onMouseEnter={() => updateHover(fieldHoverInfo)}
          onMouseLeave={clearHover}
        >
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(field.name, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
            placeholder="0"
          />
        </div>
      )
    
    case 'select':
      return (
        <div
          onMouseEnter={() => updateHover(fieldHoverInfo)}
          onMouseLeave={clearHover}
        >
          <select
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
          >
            {field.options.map(option => (
              <option key={option} value={option}>
                {t(option)}
              </option>
            ))}
          </select>
        </div>
      )
    
    default:
      return null
  }
})

InputField.displayName = 'InputField'

export default function InputSidebar({ selectedInputType, addEvent }) {
  const { t } = useTranslation();
  const config = eventRegistry.getConfig(selectedInputType)
  const { formData, handleFieldChange } = useEventForm(config)
  const [isDragging, setIsDragging] = useState(false)
  
  const handleDragStart = useCallback((e) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: selectedInputType,
      params: formData,
      config: config
    }))
  }, [selectedInputType, formData, config])
  
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  if (!config) {
    return (
      <div className="h-full bg-slate-850 border-r border-slate-700 flex items-center justify-center">
        <p className="text-slate-400">{t('eventTypeNotFound')}</p>
      </div>
    )
  }
  
  return (
    <div className="h-full bg-slate-850 border-r border-slate-700 flex flex-col">
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{t(config.label)}</h2>
            <p className="text-sm text-slate-400">{t('configureAndDrag')}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {config.fields.map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t(field.label)}
            </label>
            <InputField 
              field={field}
              value={formData[field.name] ?? field.default}
              onChange={handleFieldChange}
              config={config}
            />
          </div>
        ))}
      </div>
      
      <div className="px-6 py-4 border-t border-slate-700">
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={`
            flex items-center justify-center gap-2 px-4 py-3 rounded-lg
            cursor-move border-2 border-dashed transition-all duration-200
            ${isDragging 
              ? 'bg-blue-600/20 border-blue-500 scale-95' 
              : 'bg-slate-700/50 border-slate-600 hover:border-blue-500 hover:bg-slate-700'
            }
          `}
        >
          <span className="text-2xl">{config.icon}</span>
          <span className="text-white font-medium">
            {t('dragToTimeline')}
          </span>
        </div>
        <p className="text-xs text-slate-500 text-center mt-2">
          {t('dragToTimelineDescription')}
        </p>
      </div>
    </div>
  )
}
