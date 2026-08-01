import { useState, useCallback, useRef } from 'react';

interface DragState {
  isDragging: boolean;
  appointmentId: string | null;
  appointmentData: any | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  snapMinutes: number;
}

interface UseDragDropOptions {
  onMove?: (appointmentId: string, newStartTime: Date, newEndTime: Date, dayDelta?: number) => void;
  hourHeight?: number;
  startHour?: number;
  snapInterval?: number;
}

interface UseDragDropReturn {
  dragState: DragState;
  onDragStart: (appointmentId: string, data: any, x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: () => void;
  ghostStyle: {
    left: number;
    top: number;
    width: number;
    height: number;
    opacity: number;
  } | null;
}

export default function useDragDrop({
  onMove,
  hourHeight = 80,
  startHour = 6,
  snapInterval = 15,
}: UseDragDropOptions = {}): UseDragDropReturn {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    appointmentId: null,
    appointmentData: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    snapMinutes: snapInterval,
  });

  const onDragStart = useCallback((appointmentId: string, data: any, x: number, y: number) => {
    setDragState({
      isDragging: true,
      appointmentId,
      appointmentData: data,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      snapMinutes: snapInterval,
    });
  }, [snapInterval]);

  const onDragMove = useCallback((x: number, y: number) => {
    setDragState(prev => ({
      ...prev,
      currentX: x,
      currentY: y,
    }));
  }, []);

  const onDragEnd = useCallback(() => {
    if (dragState.isDragging && dragState.appointmentId && dragState.appointmentData) {
      const deltaY = dragState.currentY - dragState.startY;
      const deltaX = dragState.currentX - dragState.startX;

      // Calculate time change from vertical movement
      const deltaMinutes = Math.round((deltaY / hourHeight) * 60 / snapInterval) * snapInterval;

      // Calculate day change from horizontal movement (column width ~ screen width / 7)
      const colWidth = 120; // Approximate column width
      const dayDelta = Math.round(deltaX / colWidth);

      if (deltaMinutes !== 0 || dayDelta !== 0) {
        const originalStart = new Date(dragState.appointmentData.start_time);
        const originalEnd = dragState.appointmentData.end_time
          ? new Date(dragState.appointmentData.end_time)
          : new Date(originalStart.getTime() + 45 * 60000);

        const newStart = new Date(originalStart.getTime() + deltaMinutes * 60000);
        newStart.setDate(newStart.getDate() + dayDelta);
        const newEnd = new Date(originalEnd.getTime() + deltaMinutes * 60000);
        newEnd.setDate(newEnd.getDate() + dayDelta);

        onMove?.(dragState.appointmentId, newStart, newEnd, dayDelta);
      }
    }

    setDragState({
      isDragging: false,
      appointmentId: null,
      appointmentData: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      snapMinutes: snapInterval,
    });
  }, [dragState, hourHeight, snapInterval, onMove]);

  const ghostStyle = dragState.isDragging ? {
    left: dragState.currentX - 10,
    top: dragState.currentY - 15,
    width: 200,
    height: 60,
    opacity: 0.85,
  } : null;

  return {
    dragState,
    onDragStart,
    onDragMove,
    onDragEnd,
    ghostStyle,
  };
}
