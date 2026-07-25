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
  onMove?: (appointmentId: string, newStartTime: Date, newEndTime: Date, newVet?: string) => void;
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
  hourHeight = 60,
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
      const deltaMinutes = Math.round((deltaY / hourHeight) * 60 / snapInterval) * snapInterval;

      if (deltaMinutes !== 0 && onMove) {
        const originalStart = new Date(dragState.appointmentData.start_time);
        const originalEnd = dragState.appointmentData.end_time
          ? new Date(dragState.appointmentData.end_time)
          : new Date(originalStart.getTime() + 45 * 60000);

        const newStart = new Date(originalStart.getTime() + deltaMinutes * 60000);
        const newEnd = new Date(originalEnd.getTime() + deltaMinutes * 60000);

        onMove(dragState.appointmentId, newStart, newEnd);
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
