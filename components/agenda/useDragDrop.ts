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
  onDragStart: (appointmentId: string, data: any, absoluteX: number, absoluteY: number) => void;
  onDragMove: (translationX: number, translationY: number) => void;
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
  const startDayIndex = useRef(0);
  const draggingId = useRef<string | null>(null);
  const draggingData = useRef<any>(null);

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

  // onDragStart receives absoluteX/absoluteY (page-relative) to determine which column the finger is in
  const onDragStart = useCallback((appointmentId: string, data: any, absoluteX: number, _absoluteY: number) => {
    draggingId.current = appointmentId;
    draggingData.current = data;
    wasDragGesture.current = false;

    // Determine which day column the drag started in
    const relativeX = absoluteX - TIME_LABEL_WIDTH;
    startDayIndex.current = Math.max(0, Math.min(6, Math.floor(relativeX / resolvedColWidth)));

    setDragState({
      isDragging: true,
      appointmentId,
      appointmentData: data,
      currentTargetDay: startDayIndex.current,
      currentSnapY: 0,
    });
  }, [resolvedColWidth]);

  // onDragMove receives translationX/translationY (relative to touch start)
  const onDragMove = useCallback((translationX: number, translationY: number) => {
    // Calculate target day from horizontal translation
    const targetDay = Math.max(0, Math.min(6, startDayIndex.current + Math.round(translationX / resolvedColWidth)));

    // Calculate snap Y for time indicator
    const snapY = Math.round(translationY / snapInterval) * snapInterval;

    setDragState(prev => ({
      ...prev,
      currentTargetDay: targetDay,
      currentSnapY: snapY,
    }));
  }, [resolvedColWidth, snapInterval]);

  // onDragEnd receives translationX/translationY for final calculation
  const onDragEnd = useCallback(() => {
    const id = draggingId.current;
    const data = draggingData.current;

    if (id && data) {
      // Day change from horizontal translation
      const dayDelta = Math.round(dragState.currentTargetDay - startDayIndex.current);

      // Time change from vertical translation (approximate from last snapY)
      const deltaMinutes = Math.round((dragState.currentSnapY / hourHeight) * 60 / snapInterval) * snapInterval;

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
  }, [dragState.currentTargetDay, dragState.currentSnapY, hourHeight, snapInterval, onMove]);

  return {
    dragState,
    onDragStart,
    onDragMove,
    onDragEnd,
    wasDragGesture,
  };
}
