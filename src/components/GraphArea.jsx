import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { formatCurrency } from '../utils/formatters';
import { eventRegistry } from '../events/EventRegistry';
import { useHover } from '../contexts/HoverContext';
import { useGraphTooltip } from '../hooks/useGraphTooltip';

const MemoizedCustomLabel = React.memo(CustomLabel);

export default function GraphArea({ events, results, addEvent, removeEvent, updateEvent, onEditEvent }) {
  const [dragOverAge, setDragOverAge] = useState(null);
  const [draggingEvent, setDraggingEvent] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [zoom, setZoom] = useState({ start: 15, end: 80 });
  const { updateHover, clearHover: clearEventHover } = useHover();
  const previousEventsRef = useRef(events);

  const fullChartData = useMemo(() => {
    return results.length > 0 ? results : generatePlaceholderData();
  }, [results]);

  const zoomedChartData = useMemo(() => {
    return fullChartData.filter(d => d.age >= zoom.start && d.age <= zoom.end);
  }, [fullChartData, zoom]);

  const { handleMouseMove, clearHover: clearGraphHover } = useGraphTooltip(zoomedChartData, events);

  useEffect(() => {
    const eventsChanged = previousEventsRef.current.length !== events.length ||
      previousEventsRef.current.some((prevEvent, idx) => {
        const currentEvent = events[idx];
        if (!currentEvent) return true;
        return prevEvent.id !== currentEvent.id || 
               prevEvent.age !== currentEvent.age ||
               JSON.stringify(prevEvent.params) !== JSON.stringify(currentEvent.params);
      });

    if (eventsChanged) {
      setAnimationKey(prev => prev + 1);
    }
    previousEventsRef.current = events;
  }, [events]);

  const getAgeFromPosition = useCallback((e) => {
    const rect = e.currentTarget.querySelector('.recharts-wrapper')?.getBoundingClientRect();
    if (!rect) return null;
  
    const x = e.clientX - rect.left;
    const effectiveX = x - 60; // paddingLeft
    const effectiveWidth = rect.width - 60 - 30; // paddingLeft - paddingRight
  
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
    if (age) {
      setDragOverAge(age);
    }
  }, [getAgeFromPosition]);

  const handleDragLeave = useCallback(() => {
    setDragOverAge(null);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    if (dragOverAge) {
      addEvent({
        type: data.type,
        age: dragOverAge,
        params: data.params
      });
    }
    setDragOverAge(null);
  }, [dragOverAge, addEvent]);

  const handleEventDragStart = useCallback((event, e) => {
    e.stopPropagation();
    setDraggingEvent(event);
  }, []);

  const handleEventDrag = useCallback((e) => {
    if (!draggingEvent) return;
    const newAge = getAgeFromPosition(e);
    if (newAge && newAge !== draggingEvent.age) {
      updateEvent(draggingEvent.id, { age: newAge });
    }
  }, [draggingEvent, updateEvent, getAgeFromPosition]);

  const handleEventDragEnd = useCallback(() => {
    setDraggingEvent(null);
  }, []);

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
              onHover={updateHover}
              onHoverEnd={clearEventHover}
            />
          )}
        />
      );
    });
  }, [events, draggingEvent, handleEventDragStart, onEditEvent, removeEvent, updateHover, clearEventHover, zoom]);

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
      <ZoomControls zoom={zoom} setZoom={setZoom} />
      <div className="flex-1 relative">
        {dragOverAge && !draggingEvent && <DragIndicator age={dragOverAge} zoom={zoom} />}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={zoomedChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={clearGraphHover}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="age"
              stroke="#94a3b8"
              domain={[zoom.start, zoom.end]}
              allowDataOverflow
              type="number"
              label={{ value: 'Age', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
            />
            <YAxis stroke="#94a3b8" tickFormatter={(value) => formatCurrency(value, 'BRL', true)}>
              <Label value="Net Worth" angle={-90} position="insideLeft" style={{ fill: '#94a3b8', textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip cursor={{ stroke: '#3b82f6', strokeWidth: 1 }} content={() => null} />
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />

            <Line
              key={animationKey}
              type="monotone"
              dataKey="netWorth"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              animationDuration={300}
              animationEasing="ease-out"
            />

            {eventMarkers}
          </LineChart>
        </ResponsiveContainer>

        {events.length === 0 && <EmptyState />}
      </div>
    </div>
  );
}

function CustomLabel({ viewBox, value, fill, eventId, eventData, isDragging, onDragStart, onEdit, onRemove, onHover, onHoverEnd }) {
  const { x, y } = viewBox;
  const config = eventRegistry.getConfig(eventData.type);

  const handleMouseEnter = () => {
    const handler = eventRegistry.getHandler(eventData.type);
    onHover({
      title: config.label,
      type: `Event at Age ${eventData.age}`,
      icon: config.icon,
      stats: handler ? handler.getHoverStats(eventData, eventData.age) : {},
      description: `Placed at age ${eventData.age}`,
      hints: [
        '💡 Click to edit this event',
        '💡 Click and drag to move this event',
        '💡 Middle-click to delete this event'
      ]
    });
  };

  return (
    <g transform={`translate(${x}, ${y})`}>
        <circle r="16" fill={fill} fillOpacity="0.2" />
        <circle r="12" fill={fill} fillOpacity="0.3" />
      <text
        x={0}
        y={-10}
        fill={fill}
        fontSize={isDragging ? 24 : 20}
        textAnchor="middle"
        dominantBaseline="central"
        aria-label={`Event: ${config.label} at age ${eventData.age}`}
        style={{
          cursor: 'grab',
          transition: 'font-size 0.2s, filter 0.2s',
          filter: isDragging ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.9))' : 'none'
        }}
        onClick={(e) => {
          if (!isDragging) {
            e.stopPropagation();
            onEdit(eventData);
          }
        }}
        onMouseDown={(e) => {
          if (e.button === 0) onDragStart(eventData, e);
          else if (e.button === 1) {
            e.preventDefault();
            onRemove(eventId);
          }
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onHoverEnd}
      >
        {value}
      </text>
    </g>
  );
}

const DragIndicator = ({ age, zoom }) => {
  const leftPercent = ((age - zoom.start) / (zoom.end - zoom.start)) * 100;
  return (
    <div
      className="absolute top-20 bottom-20 w-0.5 bg-blue-500 z-10 pointer-events-none"
      style={{
        left: `calc(${leftPercent}% * 0.85 + 60px)`,
        boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
      }}
    >
      <div className="absolute top-1/2 -translate-y-1/2 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        Age {age}
      </div>
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

const ZoomControls = ({ zoom, setZoom }) => {
  const handleZoomIn = () => {
    const newStart = Math.max(15, zoom.start + 5);
    const newEnd = Math.min(80, zoom.end - 5);
    if (newStart < newEnd) {
      setZoom({ start: newStart, end: newEnd });
    }
  };

  const handleZoomOut = () => {
    const newStart = Math.max(15, zoom.start - 5);
    const newEnd = Math.min(80, zoom.end + 5);
    setZoom({ start: newStart, end: newEnd });
  };

  const handleReset = () => {
    setZoom({ start: 15, end: 80 });
  };

  return (
    <div className="absolute top-4 right-10 z-20 flex items-center space-x-2">
      <button onClick={handleZoomIn} className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600">-</button>
      <button onClick={handleZoomOut} className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+</button>
      <button onClick={handleReset} className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600">Reset</button>
    </div>
  );
};

function generatePlaceholderData() {
  return Array.from({ length: 66 }, (_, i) => ({ age: i + 15, netWorth: 0 }));
}
