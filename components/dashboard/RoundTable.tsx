import React, { useEffect, useMemo, useState } from 'react';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { alpha } from '../../constants/tokens';

export interface TableSeat {
  id: string;
  start_time: string;
  patient_name?: string | null;
  status?: string | null;
}

export type SeatState = 'done' | 'late' | 'here' | 'upcoming' | 'off';

/** The clinic day the table spans: 08:00 at the head of the table, round to 20:00 */
export const DAY_START = 8;
export const DAY_HOURS = 12;

export function seatState(seat: TableSeat, now = Date.now()): SeatState {
  const s = seat.status || 'programada';
  if (s === 'completada') return 'done';
  if (s === 'cancelada' || s === 'ausente') return 'off';
  if (s === 'en_espera' || s === 'en_consulta') return 'here';
  return new Date(seat.start_time).getTime() < now - 10 * 60 * 1000 ? 'late' : 'upcoming';
}

interface RoundTableProps {
  seats: TableSeat[];
  size?: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

const FONT = "'Cormorant Garamond', Georgia, serif";

// The Round Table as the shape of the clinic's day: each appointment takes a seat at its hour,
// marked with the patient's initial; the hand points at now. Drawn, not decorated: every mark
// is a real appointment or a real hour.
export default function RoundTable({ seats, size = 260, selectedId, onSelect }: RoundTableProps) {
  const { colors, isDark, onChromeText } = useTheme();
  const gold = isDark ? colors.primary : colors.accent;

  // The hand moves with the clock
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const c = size / 2;
  const R = c - 4; // table edge
  const ringR = R - 18; // where the seats sit
  const topR = R - 34; // table top

  const angleFor = (date: Date) => {
    const h = date.getHours() + date.getMinutes() / 60;
    const frac = Math.min(Math.max((h - DAY_START) / DAY_HOURS, 0), 0.999);
    return frac * Math.PI * 2 - Math.PI / 2;
  };
  const at = (angle: number, r: number) => ({ x: c + Math.cos(angle) * r, y: c + Math.sin(angle) * r });

  const placed = useMemo(() => {
    const sorted = [...seats].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    const out: { seat: TableSeat; angle: number; r: number; state: SeatState }[] = [];
    for (const seat of sorted) {
      const angle = angleFor(new Date(seat.start_time));
      // Two visits at the same hour: the second sits one step inward instead of on top
      const clash = out.filter((p) => Math.abs(p.angle - angle) < 0.16).length;
      out.push({ seat, angle, r: ringR - clash * 24, state: seatState(seat, now) });
    }
    return out;
    // angleFor/ringR depend only on size
  }, [seats, now, ringR]);

  const nowDate = new Date(now);
  const nowH = nowDate.getHours() + nowDate.getMinutes() / 60;
  const handVisible = nowH >= DAY_START && nowH < DAY_START + DAY_HOURS;
  // The hand starts outside the count at the centre, so it never crosses the number
  const handFrom = at(angleFor(nowDate), 40);
  const hand = at(angleFor(nowDate), topR - 6);

  const hourMarks = Array.from({ length: DAY_HOURS }, (_, i) => DAY_START + i);
  const labelled = new Set([8, 11, 14, 17]);

  const fillFor = (state: SeatState) => ({
    done: gold,
    late: colors.error,
    here: colors.onChrome,
    upcoming: colors.chrome,
    off: alpha(colors.onChrome, 0.18),
  }[state]);
  const inkFor = (state: SeatState) => (state === 'here' ? colors.chrome : state === 'upcoming' ? gold : onChromeText.default);

  const active = seats.filter((s) => seatState(s, now) !== 'off').length;
  const summary = `Mesa de hoy: ${active} ${active === 1 ? 'cita' : 'citas'} entre las ${DAY_START}:00 y las ${DAY_START + DAY_HOURS}:00`;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityRole="image" accessibilityLabel={summary}>
      {/* The table: navy edge where the knights sit, a lighter top */}
      <Circle cx={c} cy={c} r={R} fill={colors.chrome} />
      <Circle cx={c} cy={c} r={topR} fill={colors.chromeSoft} />

      {/* Hours of the clinic day */}
      {hourMarks.map((h) => {
        const a = ((h - DAY_START) / DAY_HOURS) * Math.PI * 2 - Math.PI / 2;
        const p = at(a, ringR);
        const lp = at(a, topR - 16);
        return (
          <G key={h}>
            <Circle cx={p.x} cy={p.y} r={2} fill={alpha(gold, 0.55)} />
            {labelled.has(h) ? (
              <SvgText x={lp.x} y={lp.y + 4} fontSize={12} fill={onChromeText.muted} textAnchor="middle" fontFamily={FONT}>
                {`${h}:00`}
              </SvgText>
            ) : null}
          </G>
        );
      })}

      {/* Now */}
      {handVisible ? (
        <G>
          <Line x1={handFrom.x} y1={handFrom.y} x2={hand.x} y2={hand.y} stroke={gold} strokeWidth={2} strokeLinecap="round" />
          <Circle cx={hand.x} cy={hand.y} r={3.5} fill={gold} />
        </G>
      ) : null}

      {/* Seats */}
      {placed.map(({ seat, angle, r, state }) => {
        const p = at(angle, r);
        const selected = seat.id === selectedId;
        const seatR = selected ? 15 : 12;
        const initial = (seat.patient_name || '?').trim().charAt(0).toUpperCase();
        return (
          <G key={seat.id} onPress={onSelect ? () => onSelect(seat.id) : undefined}>
            {selected ? <Circle cx={p.x} cy={p.y} r={seatR + 4} fill="none" stroke={gold} strokeWidth={2} /> : null}
            <Circle
              cx={p.x}
              cy={p.y}
              r={seatR}
              fill={fillFor(state)}
              stroke={state === 'upcoming' ? gold : 'none'}
              strokeWidth={state === 'upcoming' ? 2 : 0}
            />
            {state !== 'off' ? (
              <SvgText x={p.x} y={p.y + 5} fontSize={selected ? 16 : 14} fontWeight="700" fill={inkFor(state)} textAnchor="middle" fontFamily={FONT}>
                {initial}
              </SvgText>
            ) : null}
          </G>
        );
      })}

      {/* The head of the table: how many sit today */}
      <SvgText x={c} y={c - 2} fontSize={44} fontWeight="600" fill={onChromeText.default} textAnchor="middle" fontFamily={FONT}>
        {String(active)}
      </SvgText>
      <SvgText x={c} y={c + 22} fontSize={13} fill={onChromeText.muted} textAnchor="middle">
        {active === 1 ? 'cita hoy' : 'citas hoy'}
      </SvgText>
    </Svg>
  );
}
