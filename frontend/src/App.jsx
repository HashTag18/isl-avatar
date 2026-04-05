import { useState } from 'react';
import { Recorder } from './components/Recorder';

function App() {
  const [lastAudio, setLastAudio] = useState(null);
  const [audioHistory, setAudioHistory] = useState([]);

  const handleAudioRecorded = (audio) => {
    console.log('Audio recorded:', audio);
    setLastAudio(audio);
    setAudioHistory(prev => [audio, ...prev].slice(0, 5)); // Keep last 5
  };

  const playAudio = (url) => {
    const audio = new Audio(url);
    audio.play();
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
        Week 1 — Day 2: Microphone Recording
      </p>

      {/* Recorder component */}
      <Recorder onAudioRecorded={handleAudioRecorded} />

      {/* Latest recording result */}
      {lastAudio && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: '#e8f5e9',
          borderRadius: '12px',
          border: '1px solid #a5d6a7'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#2e7d32' }}>
            ✅ Recording Captured!
          </h3>
          <div style={{ display: 'flex', gap: '30px', marginBottom: '16px' }}>
            <div>
              <strong>Size:</strong> {(lastAudio.size / 1024).toFixed(1)} KB
            </div>
            <div>
              <strong>Duration:</strong> {(lastAudio.duration / 1000).toFixed(1)}s
            </div>
          </div>
          <button
            onClick={() => playAudio(lastAudio.url)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🔊 Play Back Recording
          </button>
        </div>
      )}

      {/* Recording history */}
      {audioHistory.length > 1 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ color: '#333' }}>📋 Recording History</h3>
          {audioHistory.map((audio, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '10px 16px',
              marginBottom: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px'
            }}>
              <span style={{ color: '#888', fontSize: '13px' }}>#{audioHistory.length - i}</span>
              <span>{(audio.duration / 1000).toFixed(1)}s</span>
              <span style={{ color: '#888' }}>{(audio.size / 1024).toFixed(1)} KB</span>
              <button
                onClick={() => playAudio(audio.url)}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                🔊 Play
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Progress tracker */}
      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>📋 Week 1 Progress</h4>
        <ul style={{ margin: 0, lineHeight: '2', paddingLeft: '20px' }}>
          <li>✅ Day 1: Project setup</li>
          <li>✅ Day 2: Microphone recording</li>
          <li>⬜ Day 3-4: Whisper ASR (speech-to-text)</li>
          <li>⬜ Day 5: Testing + polish</li>
        </ul>
      </div>
    </div>
  );
}

export default App;