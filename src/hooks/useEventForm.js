import { useState, useEffect, useCallback } from 'react'
import { applyFieldRules } from '../core/fieldRules'

export function useEventForm(config) {
  const [formData, setFormData] = useState({})
  
  // Initialize form with defaults
  useEffect(() => {
    if (!config) return
    
    const defaults = {}
    config.fields.forEach(field => {
      defaults[field.name] = field.default
    })
    setFormData(defaults)
  }, [config])
  
  // Handle field changes with rules
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => {
      const updates = applyFieldRules(fieldName, value, prev)
      return { ...prev, ...updates }
    })
  }, [])
  
  const resetForm = useCallback(() => {
    const defaults = {}
    config.fields.forEach(field => {
      defaults[field.name] = field.default
    })
    setFormData(defaults)
  }, [config])
  
  return {
    formData,
    handleFieldChange,
    resetForm
  }
}
