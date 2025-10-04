import { useHover } from '../contexts/HoverContext'

export default function Hoverable({ children, hoverInfo, className = '' }) {
  const { updateHover, clearHover } = useHover()
  
  return (
    <div
      className={`${className} transition-all duration-200`}
      onMouseEnter={() => updateHover(hoverInfo)}
      onMouseLeave={clearHover}
    >
      {children}
    </div>
  )
}
