import { useState, useMemo } from 'react'
import { calculateProjection } from '../utils/calculations'

export function useSimulation() {
  const [events, setEvents] = useState([])
  const [currency, setCurrency] = useState('BRL')
  
  const [simulationParams, setSimulationParams] = useState({
    startAge: 15,
    endAge: 80,
    investmentReturn: 7
  });

  const updateSimulationParams = (newParams) => {
    setSimulationParams(prev => ({ ...prev, ...newParams }));
  };

  // Automatically recalculate whenever events change (useMemo is better than useEffect)
  const results = useMemo(() => {
    if (events.length === 0) return []
    return calculateProjection(events, simulationParams)
  }, [events, simulationParams])

  const addEvent = (event) => {
    const newEvent = {
      id: Date.now() + Math.random(), // Ensure unique ID
      ...event
    }
    
    setEvents(prev => [...prev, newEvent])
  }

  const updateEvent = (id, updates) => {
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        // Merge updates, including nested params
        return {
          ...e,
          ...updates,
          params: updates.params ? { ...e.params, ...updates.params } : e.params
        }
      }
      return e
    }))
  }

  const removeEvent = (id) => {
    console.log('Removing event:', id)
    setEvents(prev => {
      const newEvents = prev.filter(e => e.id !== id)
      console.log('Events after removal:', newEvents.length)
      return newEvents
    })
  }

  const resetSimulation = () => {
    setEvents([])
  }

  return {
    events,
    addEvent,
    updateEvent,
    removeEvent,
    resetSimulation,
    results,
    simulationParams,
    updateSimulationParams,
    currency,
    setCurrency
  }
}
