import { useCallback, useRef, useState } from 'react';
import { HOUR_HEIGHT } from './TimeGrid';

interface DragSnapshot {
  isDragging: boolean;
  appointmentId: string | null;
  appointmentData: any | null;
  currentTargetDay: number;
  /** Top (px, inside the day column) of the slot the card would land in */
  currentSnapY: number;
}

/** Where the dragged card sits, as its view knows it (no guessing from page coordinates) */
export interface DragOrigin {
  /** Column of the card's day in the visible week (0 = Monday); omitted in the day view */
  dayIndex?: number;
  /** Real width of a day column; omitted in the day view, where the day can't change */
  colWidth?: number;
  /** The card's top inside its column */
  top: number;
}

interface UseDragDropOptions {
  onMove?: (appointmentId: string, newStartTime: Date, newEndTime: Date, dayDelta?: number) => void;
  hourHeight?: number;
  snapInterval?: number;
}

interface UseDragDropReturn {
  dragState: DragSnapshot;
  onDragStart: (appointmentId: string, data: any, origin: DragOrigin) => void;
  onDragMove: (translationX: number, translationY: number) => void;
  onDragEnd: () => void;
}

const SNAP_MINUTES = 15;
const IDLE: DragSnapshot = { isDragging: false, appointmentId: null, appointmentData: null, currentTargetDay: 0, currentSnapY: 0 };

// The column and time used to come from page coordinates with a hard-coded 52px gutter and the
// window width / 7, which ignored the 240px sidebar: a Friday card highlighted Thursday. They also
// snapped to 15 *pixels* instead of 15 minutes (20px). Now the card reports its own day, column
// width and top, and the hook only adds the drag offset.
export default function useDragDrop({
  onMove,
  hourHeight = HOUR_HEIGHT,
  snapInterval = SNAP_MINUTES,
}: UseDragDropOptions = {}): UseDragDropReturn {
  const snapPx = (hourHeight * snapInterval) / 60;

  // Refs: gesture callbacks read the latest values without stale closures
  const draggingId = useRef<string | null>(null);
  const draggingData = useRef<any>(null);
  const origin = useRef<DragOrigin>({ top: 0 });
  const dayDelta = useRef(0);
  const minutesDelta = useRef(0);

  const [dragState, setDragState] = useState<DragSnapshot>(IDLE);

  const onDragStart = useCallback((appointmentId: string, data: any, from: DragOrigin) => {
    draggingId.current = appointmentId;
    draggingData.current = data;
    origin.current = from;
    dayDelta.current = 0;
    minutesDelta.current = 0;
    setDragState({
      isDragging: true,
      appointmentId,
      appointmentData: data,
      currentTargetDay: from.dayIndex ?? 0,
      currentSnapY: from.top,
    });
  }, []);

  const onDragMove = useCallback((translationX: number, translationY: number) => {
    const { dayIndex, colWidth, top } = origin.current;
    const startDay = dayIndex ?? 0;
    const targetDay = colWidth ? Math.max(0, Math.min(6, startDay + Math.round(translationX / colWidth))) : startDay;
    const snapped = Math.round(translationY / snapPx) * snapPx;
    dayDelta.current = targetDay - startDay;
    minutesDelta.current = Math.round((snapped / hourHeight) * 60);
    setDragState(prev => (prev.currentTargetDay === targetDay && prev.currentSnapY === top + snapped
      ? prev
      : { ...prev, currentTargetDay: targetDay, currentSnapY: top + snapped }));
  }, [snapPx, hourHeight]);

  const onDragEnd = useCallback(() => {
    const id = draggingId.current;
    const data = draggingData.current;
    if (id && data && (minutesDelta.current !== 0 || dayDelta.current !== 0)) {
      const originalStart = new Date(data.start_time);
      const originalEnd = data.end_time ? new Date(data.end_time) : new Date(originalStart.getTime() + 45 * 60000);
      // Day first, then minutes, on the original dates
      const shift = (d: Date) => {
        const out = new Date(d);
        out.setDate(out.getDate() + dayDelta.current);
        out.setMinutes(out.getMinutes() + minutesDelta.current);
        return out;
      };
      onMove?.(id, shift(originalStart), shift(originalEnd), dayDelta.current);
    }
    draggingId.current = null;
    draggingData.current = null;
    setDragState(IDLE);
  }, [onMove]);

  return { dragState, onDragStart, onDragMove, onDragEnd };
}
