import { useState } from 'react';
import { Recorder } from './components/Recorder';
import { asrService } from './services/asrService';

function App() {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [latency, setLatency] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const handleAudioRecorded = async (audio) => {
    setIsProcessing(true);
    setTranscript('');
    setError('');
    setLatency(null);

    try {
      const result = await asrService.transcribeAudio(audio.blob);

      if (result.success) {
        setTranscript(result.text);
        setLatency(result.latency);
        // Add to history
        setHistory(prev => [
          { text: result.text, latency: result.latency, time: new Date().toLocaleTimeString() },
          ...prev
        ].slice(0, 8));
      } else {
        setError(result.error || 'Transcription failed');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#1a237e', marginBottom: '4px' }}>🤟 ISL Avatar System</h1>
      <p style={{ color: '#666', marginBottom: '32px', fontSize: '16px' }}>
        Week 1 — Day 3: Speech → Text (Whisper ASR)
      </p>

      {/* Recorder */}
      <Recorder onAudioRecorded={handleAudioRecorded} />

      {/* Processing indicator */}
      {isProcessing && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#fff8e1',
          borderRadius: '10px',
          border: '1px solid #ffe082',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '20px' }}>⏳</span>
          <div>
            <strong>Whisper is transcribing...</strong>
            <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '13px' }}>
              First run loads the model (~3 seconds). After that it's faster!
            </p>
          </div>
        </div>
      )}

      {/* Transcript result */}
      {transcript && !isProcessing && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#e8f5e9',
          borderRadius: '10px',
          border: '1px solid #a5d6a7'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>✅ Transcription</h3>
          <p style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1b5e20',
            margin: '0 0 12px 0',
            padding: '10px',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid #c8e6c9'
          }}>
            "{transcript}"
          </p>
          {latency && (
            <span style={{
              fontSize: '13px',
              color: latency < 3000 ? '#388e3c' : '#f57c00',
              fontWeight: 'bold'
            }}>
              ⚡ Latency: {(latency / 1000).toFixed(1)}s
              {latency < 3000 ? ' ✓ Good' : ' (model warming up)'}
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#ffebee',
          borderRadius: '10px',
          border: '1px solid #ef9a9a',
          color: '#c62828'
        }}>
          ⚠️ Error: {error}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: '28px' }}>
          <h3 style={{ color: '#333', marginBottom: '12px' }}>📋 Transcript History</h3>
          {history.map((item, i) => (
            <div key={i} style={{
              padding: '10px 16px',
              marginBottom: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '15px' }}>"{item.text}"</span>
              <div style={{ display: 'flex', gap: '12px', color: '#888', fontSize: '12px' }}>
                <span>⚡ {(item.latency / 1000).toFixed(1)}s</span>
                <span>🕐 {item.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress */}
      <div style={{
        marginTop: '32px', padding: '16px',
        backgroundColor: '#f5f5f5', borderRadius: '8px'
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>📋 Week 1 Progress</h4>
        <ul style={{ margin: 0, lineHeight: '2', paddingLeft: '20px' }}>
          <li>✅ Day 1: Project setup</li>
          <li>✅ Day 2: Microphone recording</li>
          <li>✅ Day 3: Whisper ASR (speech → text)</li>
          <li>⬜ Day 4: Latency tuning + testing</li>
          <li>⬜ Day 5: Polish + commit</li>
        </ul>
      </div>
    </div>
  );
}

export default App;