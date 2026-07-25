import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Typography } from '../../constants/tokens';

interface CurrentTimeLineProps {
  hourHeight: number;
  startHour: number;
  nextAppointmentTime?: string;
}

export default function CurrentTimeLine({ hourHeight, startHour, nextAppointmentTime }: CurrentTimeLineProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = startHour * 60;

  if (totalMinutes < startMinutes || totalMinutes > 19 * 60) return null;

  const offset = ((totalMinutes - startMinutes) / 60) * hourHeight;
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  let nextInMinutes: number | null = null;
  if (nextAppointmentTime) {
    const next = new Date(nextAppointmentTime);
    const nextMin = next.getHours() * 60 + next.getMinutes();
    nextInMinutes = nextMin - totalMinutes;
    if (nextInMinutes < 0) nextInMinutes = null;
  }

  return (
    <View style={[styles.container, { top: offset }]}>
      <View style={styles.label}>
        <Text style={styles.labelText}>{timeStr}</Text>
      </View>
      <View style={styles.line} />
      {nextInMinutes !== null && nextInMinutes <= 60 && (
        <View style={styles.nextBadge}>
          <Text style={styles.nextText}>
            Próxima en {nextInMinutes}min
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  label: {
    position: 'absolute',
    left: -4,
    top: -8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  labelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  line: {
    height: 2,
    backgroundColor: '#EF4444',
  },
  nextBadge: {
    position: 'absolute',
    left: 48,
    top: -10,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  nextText: {
    color: '#92400E',
    fontSize: 9,
    fontWeight: '600',
  },
});
