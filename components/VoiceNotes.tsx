import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Mic, MicOff, Play, Pause, Square, Wand2, X } from 'lucide-react-native';
import { parseToSoap } from '../utils/soapParser';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, RADIUS } from '../constants/tokens';

interface VoiceNotesProps {
  onTranscription: (text: string) => void;
  onSoapParsed?: (soap: { subjective: string; objective: string; assessment: string; plan: string }) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event & { error: string }) => void;
  onend: () => void;
  onspeechstart: () => void;
  onspeechend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export default function VoiceNotes({ onTranscription, onSoapParsed }: VoiceNotesProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [showSoap, setShowSoap] = useState(false);
  const [soap, setSoap] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setIsSupported(false); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-CL';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) { final += result[0].transcript; } else { interim += result[0].transcript; }
      }
      if (final) { setTranscript(prev => prev ? prev + ' ' + final : final); }
      setInterimTranscript(interim);
    };

    recognition.onerror = () => { setIsRecording(false); if (timerRef.current) clearInterval(timerRef.current); };
    recognition.onend = () => { setIsRecording(false); setIsPaused(false); if (timerRef.current) clearInterval(timerRef.current); };

    recognitionRef.current = recognition;
    return () => { recognition.abort(); if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => { onTranscription(transcript); }, [transcript]);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setTranscript(''); setInterimTranscript(''); setDuration(0); setIsRecording(true); setIsPaused(false);
    recognitionRef.current.start();
    timerRef.current = setInterval(() => setDuration(prev => prev + 1), 1000);
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop(); setIsRecording(false); setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const pauseRecording = () => {
    if (!recognitionRef.current) return;
    if (isPaused) {
      recognitionRef.current.start(); setIsPaused(false);
      timerRef.current = setInterval(() => setDuration(prev => prev + 1), 1000);
    } else {
      recognitionRef.current.stop(); setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleParseSoap = () => {
    const parsed = parseToSoap(transcript);
    setSoap(parsed); setShowSoap(true); onSoapParsed?.(parsed);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
        <MicOff size={20} color={colors.textLight} />
        <Text style={[styles.unsupportedText, { color: colors.textLight }]}>Grabación de voz no soportada en este navegador</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer }]}>
      <View style={styles.controls}>
        {!isRecording ? (
          <Button mode="contained" onPress={startRecording} icon="microphone" style={[styles.recordButton, { backgroundColor: colors.primary }]}>
            Grabar
          </Button>
        ) : (
          <View style={styles.activeControls}>
            <View style={styles.recordingIndicator}>
              <View style={[styles.recordingDot, { backgroundColor: colors.error }]} />
              <Text style={[styles.recordingText, { color: colors.error }]}>{formatDuration(duration)}</Text>
            </View>
            <Button mode="outlined" onPress={pauseRecording} compact style={{ borderColor: colors.border }}>
              {isPaused ? 'Reanudar' : 'Pausar'}
            </Button>
            <Button mode="contained" onPress={stopRecording} compact style={{ backgroundColor: colors.error }}>
              Detener
            </Button>
          </View>
        )}
      </View>

      {(transcript || interimTranscript) && (
        <View style={styles.transcriptContainer}>
          <View style={styles.transcriptHeader}>
            <Text style={[styles.transcriptLabel, { color: colors.textSecondary }]}>Transcripción:</Text>
            {transcript && (
              <Button mode="text" onPress={handleParseSoap} compact icon="creation" labelStyle={{ fontSize: 12 }}>SOAP</Button>
            )}
          </View>
          <View style={[styles.transcriptBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {transcript && <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text }}>{transcript}</Text>}
            {interimTranscript && <Text style={{ fontSize: 14, lineHeight: 20, color: colors.textLight, fontStyle: 'italic' }}>{interimTranscript}</Text>}
          </View>
        </View>
      )}

      {showSoap && (
        <View style={[styles.soapContainer, { backgroundColor: colors.surface, borderColor: colors.primaryContainer }]}>
          <Text style={[styles.soapTitle, { color: colors.primary }]}>Formato SOAP</Text>
          {(['subjective', 'objective', 'assessment', 'plan'] as const).map((key) => (
            <View key={key} style={styles.soapField}>
              <Text style={[styles.soapFieldLabel, { color: colors.textSecondary }]}>
                {key === 'subjective' ? 'S (Subjetivo)' : key === 'objective' ? 'O (Objetivo)' : key === 'assessment' ? 'A (Evaluación)' : 'P (Plan)'}
              </Text>
              <Text style={[styles.soapFieldValue, { color: colors.text }]}>{soap[key] || '(no detectado)'}</Text>
            </View>
          ))}
          <Button mode="text" onPress={() => setShowSoap(false)} compact style={{ alignSelf: 'flex-end' }}>Cerrar</Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1 },
  unsupported: { alignItems: 'center', padding: SPACING.lg },
  unsupportedText: { marginTop: SPACING.sm, fontSize: 13, textAlign: 'center' },
  controls: { alignItems: 'center' },
  recordButton: { borderRadius: 24, paddingHorizontal: 24 },
  activeControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  recordingDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  recordingText: { fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  transcriptContainer: { marginTop: SPACING.md },
  transcriptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  transcriptLabel: { fontSize: 13, fontWeight: '600' },
  transcriptBox: { borderRadius: RADIUS.md, padding: SPACING.sm, borderWidth: 1, maxHeight: 150 },
  soapContainer: { marginTop: SPACING.md, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1 },
  soapTitle: { fontSize: 14, fontWeight: '700', marginBottom: SPACING.sm },
  soapField: { marginBottom: SPACING.sm },
  soapFieldLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  soapFieldValue: { fontSize: 13, lineHeight: 18 },
});
