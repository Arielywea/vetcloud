import { useCallback, useRef, useState } from 'react';
import { Dimensions } from 'react-native';

interface DragSnapshot {
  isDragging: boolean;
  appointmentId: string | null;
  appointmentData: any | null;
  currentTargetDay: number;
  currentSnapY: number;
}

interface UseDragDropOptions {
  onMove?: (appointmentId: string, newStartTime: Date, newEndTime: Date, dayDelta?: number) => void;
  hourHeight?: number;
  startHour?: number;
  snapInterval?: number;
  colWidth?: number;
}

interface UseDragDropReturn {
  dragState: DragSnapshot;
  onDragStart: (appointmentId: string, data: any, x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: () => void;
  wasDragGesture: React.MutableRefObject<boolean>;
}

const SNAP_INTERVAL = 15;
const START_HOUR = 6;
const TIME_LABEL_WIDTH = 52;

export default function useDragDrop({
  onMove,
  hourHeight = 80,
  startHour = START_HOUR,
  snapInterval = SNAP_INTERVAL,
  colWidth,
}: UseDragDropOptions = {}): UseDragDropReturn {
  const resolvedColWidth = colWidth ?? Math.floor((Dimensions.get('window').width - TIME_LABEL_WIDTH) / 7);

  // Mutable refs — gesture callbacks always read latest values, no stale closure
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const draggingId = useRef<string | null>(null);
  const draggingData = useRef<any>(null);
  const startDayIndex = useRef(0);

  // wasDragGesture: set true in Pan.onEnd, checked by Tap to suppress onPress
  const wasDragGesture = useRef(false);

  // React state only for triggering re-renders of visual indicators
  const [dragState, setDragState] = useState<DragSnapshot>({
    isDragging: false,
    appointmentId: null,
    appointmentData: null,
    currentTargetDay: 0,
    currentSnapY: 0,
  });

  const onDragStart = useCallback((appointmentId: string, data: any, x: number, y: number) => {
    startX.current = x;
    startY.current = y;
    currentX.current = x;
    currentY.current = y;
    draggingId.current = appointmentId;
    draggingData.current = data;
    wasDragGesture.current = false;

    // Determine which day column the drag started in (for WeekView)
    const screenW = Dimensions.get('window').width;
    const availW = screenW - TIME_LABEL_WIDTH;
    const col = colWidth ?? Math.floor(availW / 7);
    const relativeX = x - TIME_LABEL_WIDTH;
    startDayIndex.current = Math.max(0, Math.min(6, Math.floor(relativeX / col)));

    // Snap Y for time indicator
    const snapY = Math.round(y / snapInterval) * snapInterval;

    setDragState({
      isDragging: true,
      appointmentId,
      appointmentData: data,
      currentTargetDay: startDayIndex.current,
      currentSnapY: snapY,
    });
  }, [colWidth, snapInterval]);

  const onDragMove = useCallback((x: number, y: number) => {
    currentX.current = x;
    currentY.current = y;

    // Calculate target day from horizontal position
    const screenW = Dimensions.get('window').width;
    const availW = screenW - TIME_LABEL_WIDTH;
    const col = colWidth ?? Math.floor(availW / 7);
    const relativeX = x - TIME_LABEL_WIDTH;
    const targetDay = Math.max(0, Math.min(6, Math.floor(relativeX / col)));

    // Calculate snap Y for time indicator
    const snapY = Math.round(y / snapInterval) * snapInterval;

    setDragState(prev => ({
      ...prev,
      currentTargetDay: targetDay,
      currentSnapY: snapY,
    }));
  }, [colWidth, snapInterval]);

  const onDragEnd = useCallback(() => {
    const id = draggingId.current;
    const data = draggingData.current;

    if (id && data) {
      const deltaX = currentX.current - startX.current;
      const deltaY = currentY.current - startY.current;

      // Day change from horizontal movement — uses ACTUAL colWidth
      const dayDelta = Math.round(deltaX / resolvedColWidth);

      // Time change from vertical movement
      const deltaMinutes = Math.round((deltaY / hourHeight) * 60 / snapInterval) * snapInterval;

      if (deltaMinutes !== 0 || dayDelta !== 0) {
        const originalStart = new Date(data.start_time);
        const originalEnd = data.end_time
          ? new Date(data.end_time)
          : new Date(originalStart.getTime() + 45 * 60000);

        // Apply dayDelta to ORIGINAL date first, then add time — prevents vertical-shift bug
        const newStart = new Date(originalStart);
        newStart.setDate(newStart.getDate() + dayDelta);
        newStart.setMinutes(newStart.getMinutes() + deltaMinutes);

        const newEnd = new Date(originalEnd);
        newEnd.setDate(newEnd.getDate() + dayDelta);
        newEnd.setMinutes(newEnd.getMinutes() + deltaMinutes);

        onMove?.(id, newStart, newEnd, dayDelta);
      }

      // Mark this as a drag gesture so Tap handler skips onPress
      wasDragGesture.current = true;
      setTimeout(() => { wasDragGesture.current = false; }, 300);
    }

    // Reset refs
    draggingId.current = null;
    draggingData.current = null;

    // Reset React state
    setDragState({
      isDragging: false,
      appointmentId: null,
      appointmentData: null,
      currentTargetDay: 0,
      currentSnapY: 0,
    });
  }, [resolvedColWidth, hourHeight, snapInterval, onMove]);

  return {
    dragState,
    onDragStart,
    onDragMove,
    onDragEnd,
    wasDragGesture,
  };
}
