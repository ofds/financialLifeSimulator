import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { eventRegistry } from '../events/EventRegistry';
import { useHoverInfo } from '../hooks/useHoverInfo';

export default function BottomBar({ onSelectEventType }) {
  const { t } = useTranslation();
  const { getEventTypeHoverInfo, updateHover, clearHover } = useHoverInfo();

  const allEvents = useMemo(() => {
    return Array.from(eventRegistry.handlers.values()).map(h => h.config);
  }, []);

  return (
    <div className="bg-slate-800 border-t border-slate-700 px-6 py-4 flex items-center justify-center overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={10}
        slidesPerView={6}
        grabCursor={true}
        loop={true} // Enable infinite looping
        autoplay={{
          delay: 2500, // Time between transitions
          disableOnInteraction: false, // Continue autoplay after user interaction
        }}
        className="w-full"
      >
        {allEvents.map(config => (
          <SwiperSlide key={config.type} className="flex justify-center">
            <button
              onClick={() => onSelectEventType(config.type)}
              onMouseEnter={() => updateHover(getEventTypeHoverInfo(config.type))}
              onMouseLeave={clearHover}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-all duration-200 text-center w-32 h-32"
            >
              <span className="text-4xl">{config.icon}</span>
              <p className="font-semibold text-slate-100 text-sm">{t(config.label)}</p>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}