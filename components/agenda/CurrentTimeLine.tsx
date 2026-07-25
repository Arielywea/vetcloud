import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface CurrentTimeLineProps {
  hourHeight: number;
  startHour: number;
}

export default function CurrentTimeLine({ hourHeight, startHour }: CurrentTimeLineProps) {
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

  return (
    <View style={[styles.container, { top: offset }]}>
      <View style={styles.label}>
        <Text style={styles.labelText}>{timeStr}</Text>
      </View>
      <View style={styles.line} />
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
    marginLeft: 0,
  },
});
