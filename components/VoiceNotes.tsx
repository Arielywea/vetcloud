import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { parseToSoap } from '../utils/soapParser';

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

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-CL';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript(prev => prev ? prev + ' ' + final : final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    onTranscription(transcript);
  }, [transcript]);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setInterimTranscript('');
    setDuration(0);
    setIsRecording(true);
    setIsPaused(false);
    recognitionRef.current.start();

    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const pauseRecording = () => {
    if (!recognitionRef.current) return;
    if (isPaused) {
      recognitionRef.current.start();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      recognitionRef.current.stop();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleParseSoap = () => {
    const parsed = parseToSoap(transcript);
    setSoap(parsed);
    setShowSoap(true);
    onSoapParsed?.(parsed);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <View style={[styles.container, styles.unsupported]}>
        <MaterialCommunityIcons name="microphone-off" size={20} color="#999" />
        <Text style={styles.unsupportedText}>
          Grabación de voz no soportada en este navegador
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botones de grabación */}
      <View style={styles.controls}>
        {!isRecording ? (
          <Button
            mode="contained"
            onPress={startRecording}
            icon="microphone"
            style={styles.recordButton}
            labelStyle={styles.recordButtonLabel}
          >
            Grabar
          </Button>
        ) : (
          <View style={styles.activeControls}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>{formatDuration(duration)}</Text>
            </View>
            <Button
              mode="outlined"
              onPress={pauseRecording}
              icon={isPaused ? 'play' : 'pause'}
              compact
              style={styles.controlBtn}
            >
              {isPaused ? 'Reanudar' : 'Pausar'}
            </Button>
            <Button
              mode="contained"
              onPress={stopRecording}
              icon="stop"
              compact
              style={[styles.controlBtn, styles.stopBtn]}
            >
              Detener
            </Button>
          </View>
        )}
      </View>

      {/* Transcripción en tiempo real */}
      {(transcript || interimTranscript) && (
        <View style={styles.transcriptContainer}>
          <View style={styles.transcriptHeader}>
            <Text style={styles.transcriptLabel}>Transcripción:</Text>
            {transcript && (
              <Button
                mode="text"
                onPress={handleParseSoap}
                compact
                icon="creation"
                style={styles.soapButton}
                labelStyle={styles.soapButtonLabel}
              >
                SOAP
              </Button>
            )}
          </View>
          <View style={styles.transcriptBox}>
            {transcript && <Text style={styles.transcriptText}>{transcript}</Text>}
            {interimTranscript && (
              <Text style={styles.interimText}>{interimTranscript}</Text>
            )}
          </View>
        </View>
      )}

      {/* Vista SOAP */}
      {showSoap && (
        <View style={styles.soapContainer}>
          <Text style={styles.soapTitle}>Formato SOAP</Text>
          {(['subjective', 'objective', 'assessment', 'plan'] as const).map((key) => (
            <View key={key} style={styles.soapField}>
              <Text style={styles.soapFieldLabel}>
                {key === 'subjective' ? 'S (Subjetivo)' :
                 key === 'objective' ? 'O (Objetivo)' :
                 key === 'assessment' ? 'A (Evaluación)' : 'P (Plan)'}
              </Text>
              <Text style={styles.soapFieldValue}>
                {soap[key] || '(no detectado)'}
              </Text>
            </View>
          ))}
          <Button
            mode="text"
            onPress={() => setShowSoap(false)}
            compact
            style={styles.closeSoapButton}
          >
            Cerrar
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8f4ff',
    borderWidth: 1,
    borderColor: '#e0d4f5',
  },
  unsupported: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    alignItems: 'center',
    padding: 16,
  },
  unsupportedText: {
    marginTop: 8,
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
  },
  controls: {
    alignItems: 'center',
  },
  recordButton: {
    borderRadius: 24,
    paddingHorizontal: 24,
    backgroundColor: '#7C4DFF',
  },
  recordButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF1744',
    marginRight: 6,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    color: '#FF1744',
  },
  controlBtn: {
    borderRadius: 20,
  },
  stopBtn: {
    backgroundColor: '#FF1744',
  },
  transcriptContainer: {
    marginTop: 12,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  transcriptLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  soapButton: {
    margin: 0,
    padding: 0,
  },
  soapButtonLabel: {
    fontSize: 12,
  },
  transcriptBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 150,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  interimText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#999',
    fontStyle: 'italic',
  },
  soapContainer: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0d4f5',
  },
  soapTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C4DFF',
    marginBottom: 8,
  },
  soapField: {
    marginBottom: 8,
  },
  soapFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  soapFieldValue: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  closeSoapButton: {
    alignSelf: 'flex-end',
  },
});
