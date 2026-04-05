import { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';

export function Recorder({ onAudioRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [permissionError, setPermissionError] = useState(false);

  // Timer while recording
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStart = async () => {
    setPermissionError(false);
    const success = await audioService.startRecording();
    if (success) {
      setIsRecording(true);
    } else {
      setPermissionError(true);
    }
  };

  const handleStop = async () => {
    const audio = await audioService.stopRecording();
    setIsRecording(false);
    onAudioRecorded(audio);
  };

  return (
    <div style={{
      padding: '24px',
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      backgroundColor: '#fafafa'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>🎤 Microphone</h3>

      {/* Recording indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        minHeight: '28px'
      }}>
        {isRecording ? (
          <>
            <span style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'red',
              animation: 'pulse 1s infinite'
            }} />
            <span style={{ color: 'red', fontWeight: 'bold' }}>
              Recording... {seconds}s
            </span>
          </>
        ) : (
          <span style={{ color: '#888' }}>Ready to record</span>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleStart}
          disabled={isRecording}
          style={{
            padding: '12px 24px',
            fontSize: '15px',
            backgroundColor: isRecording ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isRecording ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          ▶ Start Recording
        </button>

        <button
          onClick={handleStop}
          disabled={!isRecording}
          style={{
            padding: '12px 24px',
            fontSize: '15px',
            backgroundColor: !isRecording ? '#ccc' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: !isRecording ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          ⏹ Stop Recording
        </button>
      </div>

      {/* Error message */}
      {permissionError && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#ffebee',
          border: '1px solid #ef9a9a',
          borderRadius: '6px',
          color: '#c62828'
        }}>
          ⚠️ Microphone access denied. Please allow mic permissions and try again.
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}