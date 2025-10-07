import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { eventRegistry } from '../events/EventRegistry';
import { useHoverInfo } from '../hooks/useHoverInfo';

export default function AddEventModal({ isOpen, onClose, onSelectEventType }) {
  const { t } = useTranslation();
  const { getEventTypeHoverInfo, updateHover, clearHover } = useHoverInfo();

  const categorizedEvents = useMemo(() => {
    const allConfigs = Array.from(eventRegistry.handlers.values()).map(h => h.config);
    const categories = {};
    for (const config of allConfigs) {
      const category = config.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(config);
    }
    // Sort categories for consistent order
    return Object.entries(categories).sort(([a], [b]) => a.localeCompare(b));
  }, []);

  if (!isOpen) return null;

  const handleSelect = (eventType) => {
    onSelectEventType(eventType);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Add New Event</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {categorizedEvents.map(([category, events]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-slate-300 mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map(config => (
                    <button
                      key={config.type}
                      onClick={() => handleSelect(config.type)}
                      onMouseEnter={() => updateHover(getEventTypeHoverInfo(config.type))}
                      onMouseLeave={clearHover}
                      className="flex items-center gap-3 p-4 rounded-lg bg-slate-700 hover:bg-slate-600 hover:scale-105 transition-all duration-200 text-left"
                    >
                      <span className="text-3xl">{config.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-100">{t(config.label)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}