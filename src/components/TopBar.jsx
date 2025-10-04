import React from 'react';
import { useTranslation } from 'react-i18next';
import Hoverable from './Hoverable';

export default function TopBar({ darkMode, setDarkMode, simulationParams, updateSimulationParams, resetSimulation }) {
  const { t, i18n } = useTranslation();
  const { startAge, endAge } = simulationParams;

  const handleAgeChange = (param, value) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
      updateSimulationParams({ [param]: numericValue });
    }
  };

  const handleNewScenario = () => {
    if (confirm(t('newScenarioConfirmation'))) {
      resetSimulation();
    }
  };

  const changeLanguage = () => {
    const newLang = i18n.language === 'en-US' ? 'pt-BR' : 'en-US';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <Hoverable
        hoverInfo={{
          title: t('appTitle'),
          type: 'Application',
          icon: '📊',
          stats: { 'Version': 'MVP v0.3' },
          description: 'Simulate your financial journey through life'
        }}
      >
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-2xl">📊</div>
          <h1 className="text-xl font-bold text-slate-100">{t('appTitle')}</h1>
        </div>
      </Hoverable>
      
      <div className="flex items-center gap-4 text-sm text-slate-300">
        <label htmlFor="startAge" className="text-sm">{t('age')}</label>
        <input 
          id="startAge"
          type="number" 
          value={startAge}
          onChange={(e) => handleAgeChange('startAge', e.target.value)}
          className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center"
        />
        <span>→</span>
        <input 
          type="number" 
          value={endAge}
          onChange={(e) => handleAgeChange('endAge', e.target.value)}
          className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={handleNewScenario}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {t('newScenario')}
        </button>

        <button 
          onClick={changeLanguage}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
        >
          {i18n.language === 'en-US' ? '🇧🇷' : '🇺🇸'}
        </button>
        
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}