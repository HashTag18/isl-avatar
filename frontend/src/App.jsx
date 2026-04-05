import { useState } from 'react';

function App() {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#1a237e' }}>🤟 ISL Avatar System</h1>
      <p style={{ color: '#555', fontSize: '18px' }}>
        Live Indian Sign Language translation for classrooms
      </p>

      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#e8f5e9',
        borderRadius: '8px',
        border: '1px solid #a5d6a7'
      }}>
        <h3 style={{ color: '#2e7d32' }}>✅ Setup Complete!</h3>
        <p>Electron + React + Vite is running successfully.</p>
        <p>Next step: Add microphone recording (Tuesday)</p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>📋 Week 1 Progress</h3>
        <ul style={{ lineHeight: '2' }}>
          <li>✅ Day 1: Project setup</li>
          <li>⬜ Day 2: Microphone recording</li>
          <li>⬜ Day 3-4: Whisper ASR (speech-to-text)</li>
          <li>⬜ Day 5: Testing + polish</li>
        </ul>
      </div>
    </div>
  );
}

export default App;