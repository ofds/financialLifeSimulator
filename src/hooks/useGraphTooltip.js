import { useCallback } from 'react';
import { useHover } from '../contexts/HoverContext';
import { formatCurrency } from '../utils/formatters';

export function useGraphTooltip(chartData, events) {
  const { updateHover, clearHover } = useHover();

  const handleMouseMove = useCallback((state) => {
    if (!state || !state.isTooltipActive) {
      clearHover();
      return;
    }

    let dataPoint;
    if (state.activePayload && state.activePayload.length > 0) {
      dataPoint = state.activePayload[0].payload;
    } else if (state.activeTooltipIndex !== null && chartData[state.activeTooltipIndex]) {
      dataPoint = chartData[state.activeTooltipIndex];
    } else {
      clearHover();
      return;
    }

    const { age, netWorth } = dataPoint;

    const stats = buildFinancialStats(age, netWorth, chartData);
    const { eventsAtThisAge, activePhase } = getActiveEvents(age, events);
    
    if (activePhase) {
      stats['Annual Income'] = activePhase.params.annualIncome || 0;
      stats['Savings Rate'] = `${activePhase.params.savingsRate || 0}%`;
      stats['Investment Return'] = `${activePhase.params.investmentReturn || 0}%`;
    }

    const description = buildDescription(age, stats['Yearly Change']);
    const hints = buildHints(eventsAtThisAge, activePhase, netWorth);

    updateHover({
      title: `Age ${age} Analysis`,
      type: 'Graph Point',
      icon: '📍',
      stats,
      // Deep clone events to prevent accidental mutation by consumer components.
      events: JSON.parse(JSON.stringify(eventsAtThisAge)),
      description,
      hints,
    });

  }, [chartData, events, updateHover, clearHover]);

  return { handleMouseMove, clearHover };
}

function buildFinancialStats(age, netWorth, chartData) {
  const previousData = chartData.find(d => d.age === age - 1);
  const yearlyChange = previousData ? netWorth - previousData.netWorth : 0;
  const yearlyChangePercent = previousData && previousData.netWorth !== 0
    ? ((netWorth - previousData.netWorth) / Math.abs(previousData.netWorth)) * 100
    : 0;

  return {
    'Age': age,
    'Net Worth': netWorth,
    'Yearly Change': yearlyChange,
    'Growth Rate': `${yearlyChangePercent.toFixed(2)}%`,
  };
}

function getActiveEvents(age, events) {
  const activeEvents = events.filter(e => e.age <= age);
  const eventsAtThisAge = events.filter(e => e.age === age);

  const activePhase = activeEvents
    .filter(e => e.type === 'financial-phase')
    .sort((a, b) => b.age - a.age)[0];

  return { eventsAtThisAge, activePhase };
}

function buildDescription(age, yearlyChange) {
  let description = `Financial snapshot at age ${age}`;
  if (yearlyChange > 0) {
    description += ` • Growing ${formatCurrency(yearlyChange, 'BRL', true)}/year`;
  } else if (yearlyChange < 0) {
    description += ` • Declining ${formatCurrency(Math.abs(yearlyChange), 'BRL', true)}/year`;
  }
  return description;
}

function buildHints(eventsAtThisAge, activePhase, netWorth) {
  const hints = [];
  if (eventsAtThisAge.length > 0) {
    hints.push(`🎯 ${eventsAtThisAge.length} event(s) occur at this age`);
  }
  if (activePhase) {
    hints.push(`📊 Active phase: ${activePhase.params.annualIncome > 0 ? 'Earning' : 'Spending'} phase`);
  }
  if (netWorth < 0) {
    hints.push('⚠️ Negative net worth - consider reducing expenses');
  }
  return hints;
}
