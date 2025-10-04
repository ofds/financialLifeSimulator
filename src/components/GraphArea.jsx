import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Dot } from 'recharts';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { formatCurrency } from '../utils/formatters';
import { eventRegistry } from '../events/EventRegistry';
import { useGraphTooltip } from '../hooks/useGraphTooltip';
import { useHover } from '../contexts/HoverContext';

const MemoizedCustomLabel = React.memo(CustomLabel);

const CustomizedDot = ({ cx, cy, payload, inflectionAges }) => {
  if (inflectionAges.has(payload.age)) {
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={6}
        fill="#3b82f6"
        stroke="#fff"
        strokeWidth={2}
        style={{ filter: 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.7))' }}
      />
    );
  }
  return null;
};

// This checksum provides a stable dependency for the animation effect.
const getEventsChecksum = (events) => {
  if (!events || events.length === 0) return '0';

  const serializeParams = (params) => {
    if (!params) return '';
    // Sort keys to ensure stable stringify, preventing re-renders from object key order changes.
    const sortedKeys = Object.keys(params).sort();
    const sortedParams = {};
    for (const key of sortedKeys) {
      sortedParams[key] = params[key];
    }
    return JSON.stringify(sortedParams);
  };

  return events.map(e => `${e.id}|${e.age}|${serializeParams(e.params)}`).join(',');
};

export default function GraphArea({ events, results, addEvent, removeEvent, updateEvent, onEditEvent, simulationParams }) {
  const [dragOverAge, setDragOverAge] = useState(null);
  const [draggingEvent, setDraggingEvent] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [zoom, setZoom] = useState({ start: simulationParams.startAge, end: simulationParams.endAge });

  useEffect(() => {
    setZoom({ start: simulationParams.startAge, end: simulationParams.endAge });
  }, [simulationParams]);

  const fullChartData = useMemo(() => {
    return results.length > 0 ? results : generatePlaceholderData(simulationParams);
  }, [results, simulationParams]);

  const zoomedChartData = useMemo(() => {
    return fullChartData.filter(d => d.age >= zoom.start && d.age <= zoom.end);
  }, [fullChartData, zoom]);

  const eventsChecksum = useMemo(() => getEventsChecksum(events), [events]);

  useEffect(() => {
    setAnimationKey(p => p + 1);
  }, [eventsChecksum]);

  const getAgeFromPosition = useCallback((e) => {
    const rect = e.currentTarget.querySelector('.recharts-wrapper')?.getBoundingClientRect();
    if (!rect) return null;
    const x = e.clientX - rect.left;
    const effectiveX = x - 60;
    const effectiveWidth = rect.width - 60 - 30;
    if (effectiveX >= 0 && effectiveX <= effectiveWidth) {
      const ageRange = zoom.end - zoom.start;
      const age = Math.round(zoom.start + (effectiveX / effectiveWidth) * ageRange);
      return Math.max(zoom.start, Math.min(zoom.end, age));
    }
    return null;
  }, [zoom]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const age = getAgeFromPosition(e);
    if (age) setDragOverAge(age);
  }, [getAgeFromPosition]);

  const handleDragLeave = useCallback(() => setDragOverAge(null), []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    if (dragOverAge) addEvent({ type: data.type, age: dragOverAge, params: data.params });
    setDragOverAge(null);
  }, [dragOverAge, addEvent]);

  const handleEventDragStart = useCallback((event, e) => {
    e.stopPropagation();
    setDraggingEvent(event);
  }, []);

  const handleEventDrag = useCallback((e) => {
    if (!draggingEvent) return;
    const newAge = getAgeFromPosition(e);
    if (newAge && newAge !== draggingEvent.age) updateEvent(draggingEvent.id, { age: newAge });
  }, [draggingEvent, updateEvent, getAgeFromPosition]);

  const handleEventDragEnd = useCallback(() => setDraggingEvent(null), []);

  const eventMarkers = useMemo(() => {
    return events.filter(event => event.age >= zoom.start && event.age <= zoom.end).map(event => {
      const config = eventRegistry.getConfig(event.type);
      if (!config) return null;
      return (
        <ReferenceLine
          key={event.id}
          x={event.age}
          stroke={config.color}
          strokeWidth={draggingEvent?.id === event.id ? 3 : 2}
          label={(props) => (
            <MemoizedCustomLabel
              {...props}
              value={config.icon}
              fill={config.color}
              eventId={event.id}
              eventData={event}
              isDragging={draggingEvent?.id === event.id}
              onDragStart={handleEventDragStart}
              onEdit={onEditEvent}
              onRemove={removeEvent}
            />
          )}
        />
      );
    });
  }, [events, draggingEvent, handleEventDragStart, onEditEvent, removeEvent, zoom]);

  const inflectionAges = useMemo(() => new Set(events.filter(e => e.type === 'financial-phase').map(e => e.age)), [events]);

  return (
    <div
      className="flex-1 bg-slate-900 p-6 relative transition-opacity duration-300 flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseMove={draggingEvent ? handleEventDrag : undefined}
      onMouseUp={handleEventDragEnd}
      style={{ cursor: draggingEvent ? 'grabbing' : 'default', opacity: draggingEvent ? 0.85 : 1 }}
    >
      <ZoomControls zoom={zoom} setZoom={setZoom} simulationParams={simulationParams} />
      <div className="flex-1 relative">
        {dragOverAge && !draggingEvent && <DragIndicator age={dragOverAge} zoom={zoom} />}
        <ChartRenderer
          zoomedChartData={zoomedChartData}
          events={events}
          animationKey={animationKey}
          zoom={zoom}
          eventMarkers={eventMarkers}
          inflectionAges={inflectionAges}
        />
        {events.length === 0 && <EmptyState />}
      </div>
    </div>
  );
}

const ChartRenderer = React.memo(({ zoomedChartData, events, animationKey, zoom, eventMarkers, inflectionAges }) => {
  const { handleMouseMove, clearHover: clearGraphHover } = useGraphTooltip(zoomedChartData, events);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={zoomedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} onMouseMove={handleMouseMove} onMouseLeave={clearGraphHover}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="age" stroke="#94a3b8" domain={[zoom.start, zoom.end]} allowDataOverflow type="number" label={{ value: 'Age', position: 'insideBottom', offset: -10, fill: '#94a3b8' }} />
        <YAxis stroke="#94a3b8" tickFormatter={(value) => formatCurrency(value, 'BRL', true)}>
          <Label value="Net Worth" angle={-90} position="insideLeft" style={{ fill: '#94a3b8', textAnchor: 'middle' }} />
        </YAxis>
        <Tooltip cursor={{ stroke: '#3b82f6', strokeWidth: 1 }} content={() => null} />
        <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
        <Line type="cardinal" tension={0.8} dataKey="netWorth" stroke="#3b82f6" strokeWidth={3} dot={<CustomizedDot inflectionAges={inflectionAges} />} animationDuration={300} animationEasing="ease-out" />
        {eventMarkers}
      </LineChart>
    </ResponsiveContainer>
  );
});

function CustomLabel({ viewBox, value, fill, eventId, eventData, isDragging, onDragStart, onEdit, onRemove }) {
  const { x, y } = viewBox;
  const config = eventRegistry.getConfig(eventData.type);
  const { updateHover, clearHover } = useHover();

  const handleMouseEnter = () => {
    const handler = eventRegistry.getHandler(eventData.type);
    updateHover({ title: config.label, type: `Event at Age ${eventData.age}`, icon: config.icon, stats: handler ? handler.getHoverStats(eventData, eventData.age) : {}, description: `Placed at age ${eventData.age}`, hints: ['💡 Click to edit', '💡 Drag to move', '💡 Middle-click to delete'] });
  };

  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="16" fill={fill} fillOpacity="0.2" />
      <circle r="12" fill={fill} fillOpacity="0.3" />
      <text x={0} y={-10} fill={fill} fontSize={isDragging ? 24 : 20} textAnchor="middle" dominantBaseline="central" aria-label={`Event: ${config.label} at age ${eventData.age}`} style={{ cursor: 'grab', transition: 'font-size 0.2s, filter 0.2s', filter: isDragging ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.9))' : 'none' }} onClick={(e) => { if (!isDragging) { e.stopPropagation(); onEdit(eventData); } }} onMouseDown={(e) => { if (e.button === 0) onDragStart(eventData, e); else if (e.button === 1) { e.preventDefault(); onRemove(eventId); } }} onMouseEnter={handleMouseEnter} onMouseLeave={clearHover}>
        {value}
      </text>
    </g>
  );
}

const DragIndicator = ({ age, zoom }) => {
  const ageRange = zoom.end - zoom.start;
  const leftPercent = ageRange > 0 ? ((age - zoom.start) / ageRange) * 100 : 0;
  return (
    <div className="absolute top-20 bottom-20 w-0.5 bg-blue-500 z-10 pointer-events-none" style={{ left: `calc(${leftPercent}% * 0.85 + 60px)`, boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}>
      <div className="absolute top-1/2 -translate-y-1/2 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">Age {age}</div>
    </div>
  );
};

const EmptyState = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="text-center">
      <p className="text-4xl mb-4">📊</p>
      <p className="text-lg text-slate-300 font-medium mb-2">Start Your Financial Journey</p>
      <p className="text-slate-400">Drag a Financial Phase to the timeline to begin</p>
    </div>
  </div>
);

const ZoomControls = ({ zoom, setZoom, simulationParams }) => {
  const handleZoomIn = () => {
    const newStart = Math.max(simulationParams.startAge, zoom.start + 5);
    const newEnd = Math.min(simulationParams.endAge, zoom.end - 5);
    if (newStart < newEnd) setZoom({ start: newStart, end: newEnd });
  };
  const handleZoomOut = () => {
    const newStart = Math.max(simulationParams.startAge, zoom.start - 5);
    const newEnd = Math.min(simulationParams.endAge, zoom.end + 5);
    setZoom({ start: newStart, end: newEnd });
  };
  const handleReset = () => setZoom({ start: simulationParams.startAge, end: simulationParams.endAge });

  return (
    <div className="absolute top-4 right-10 z-20 flex items-center space-x-2">
      <button onClick={handleZoomIn} className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600">-</button>
      <button onClick={handleZoomOut} className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+</button>
      <button onClick={handleReset} className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600">Reset</button>
    </div>
  );
};

function generatePlaceholderData(simulationParams) {
  const data = [];
  for (let age = simulationParams.startAge; age <= simulationParams.endAge; age++) {
    data.push({ age, netWorth: 0 });
  }
  return data;
}
