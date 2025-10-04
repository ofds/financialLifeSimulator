import { createContext, useContext, useState, useCallback } from 'react'

const HoverContext = createContext()

export function HoverProvider({ children }) {
  const [hoverInfo, setHoverInfo] = useState(null)
  
  const updateHover = useCallback((info) => {
    setHoverInfo(info)
  }, [])
  
  const clearHover = useCallback(() => {
    setHoverInfo(null)
  }, [])
  
  return (
    <HoverContext.Provider value={{ hoverInfo, updateHover, clearHover }}>
      {children}
    </HoverContext.Provider>
  )
}

export function useHover() {
  const context = useContext(HoverContext)
  if (!context) {
    throw new Error('useHover must be used within HoverProvider')
  }
  return context
}
