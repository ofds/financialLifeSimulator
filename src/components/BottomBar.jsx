import { useTranslation } from 'react-i18next';

export default function BottomBar({ onAddEventClick }) {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-800 border-t border-slate-700 px-6 py-4 flex items-center justify-center">
      <button
        onClick={onAddEventClick}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-lg"
      >
        + Add New Event
      </button>
    </div>
  );
}
