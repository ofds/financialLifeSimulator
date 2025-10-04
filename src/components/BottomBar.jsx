import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { eventRegistry } from '../events/EventRegistry';
import { useHoverInfo } from '../hooks/useHoverInfo';

export default function BottomBar({ selectedInputType, setSelectedInputType }) {
  const { t } = useTranslation();
  const eventTypes = Array.from(eventRegistry.handlers.keys());
  const { getEventTypeHoverInfo, updateHover, clearHover } = useHoverInfo();
  const scrollContainerRef = useRef(null);

  const [isScrolling, setIsScrolling] = useState(false);

  // Duplicate event types to create an infinite scroll effect
  const displayEventTypes = [...eventTypes, ...eventTypes, ...eventTypes];

  const getItemWidth = useCallback(() => {
    const item = scrollContainerRef.current?.querySelector('.event-button');
    return item ? item.offsetWidth + 8 : 0; // 8 for gap-2 (tailwind)
  }, []);

  const scrollToSelected = useCallback((behavior = 'smooth') => {
    const originalIndex = eventTypes.indexOf(selectedInputType);
    if (originalIndex === -1) return;

    const middleSectionStartIndex = eventTypes.length;
    const targetIndexInDisplay = middleSectionStartIndex + originalIndex;

    const itemWidth = getItemWidth();
    if (itemWidth === 0) return; // Item width not yet calculated

    const scrollLeft = targetIndexInDisplay * itemWidth;

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollLeft,
        behavior: behavior,
      });
    }
  }, [selectedInputType, eventTypes, getItemWidth]);

  // Initialize scroll position to the middle section
  useEffect(() => {
    if (eventTypes.length > 0) {
      scrollToSelected('auto');
    }
  }, [eventTypes.length, scrollToSelected]);

  // Scroll to selected item when selectedInputType changes
  useEffect(() => {
    if (!isScrolling) {
      scrollToSelected();
    }
  }, [selectedInputType, scrollToSelected, isScrolling]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isScrolling) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const singleSectionWidth = eventTypes.length * getItemWidth();

    if (scrollLeft < singleSectionWidth) {
      // Scrolled into the first duplicated section, jump to middle
      setIsScrolling(true);
      container.scrollTo({
        left: scrollLeft + singleSectionWidth,
        behavior: 'auto',
      });
    } else if (scrollLeft > singleSectionWidth * 2) {
      // Scrolled into the last duplicated section, jump to middle
      setIsScrolling(true);
      container.scrollTo({
        left: scrollLeft - singleSectionWidth,
        behavior: 'auto',
      });
    }
    // After a brief moment, allow scrolling again
    const timeout = setTimeout(() => setIsScrolling(false), 50);
    return () => clearTimeout(timeout);
  }, [eventTypes.length, getItemWidth, isScrolling]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  const scroll = useCallback((scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="bg-slate-800 border-t border-slate-700 px-6 py-4 flex items-center justify-center relative">
      <button 
        onClick={() => scroll(-getItemWidth() * 2)} 
        className="absolute left-2 p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white z-10"
      >
        &lt;
      </button>

      <div 
        ref={scrollContainerRef} 
        className="flex items-center gap-2 overflow-x-auto hide-scrollbar px-8"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {displayEventTypes.map((type, index) => {
          const config = eventRegistry.getConfig(type);
          if (!config) return null;
          
          // Determine if this is the currently selected original event
          const originalIndex = index % eventTypes.length;
          const isOriginalSelected = eventTypes[originalIndex] === selectedInputType;

          const hoverInfo = getEventTypeHoverInfo(type);
          
          return (
            <button
              key={`${type}-${index}`} // Use a unique key for duplicated items
              onClick={() => setSelectedInputType(type)}
              onMouseEnter={() => updateHover(hoverInfo)}
              onMouseLeave={clearHover}
              className={`
                event-button flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isOriginalSelected 
                  ? 'bg-blue-600 text-white shadow-lg scale-105' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
              style={{ scrollSnapAlign: 'center' }}
            >
              <span className="text-lg">{config.icon}</span>
              <span>{t(config.label)}</span>
            </button>
          );
        })}
      </div>

      <button 
        onClick={() => scroll(getItemWidth() * 2)} 
        className="absolute right-2 p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white z-10"
      >
        &gt;
      </button>
    </div>
  );
}

// Add a basic hide-scrollbar utility class (can be moved to index.css if preferred)
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;
document.head.appendChild(styleSheet);
