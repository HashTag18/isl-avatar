import { useState } from 'react';
import { Recorder } from './components/Recorder';
import { asrService } from './services/asrService';
import { islService } from './services/islService';

function App() {
  const [transcript, setTranscript]   = useState('');
  const [islGloss, setIslGloss]       = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage]             = useState('');
  const [history, setHistory]         = useState([]);

  const handleAudioRecorded = async (audio) => {
    setIsProcessing(true);
    setTranscript('');
    setIslGloss(null);

    try {
      // Stage 1: Speech → Text
      setStage('🎤 Transcribing speech...');
      const asr = await asrService.transcribeAudio(audio.blob);

      if (!asr.success) {
        setStage(`❌ ASR Error: ${asr.error}`);
        return;
      }

      setTranscript(asr.text);
      setStage('🧠 Converting to ISL grammar...');

      // Stage 2: Text → ISL
      const isl = await islService.convertToISL(asr.text);

      if (!isl.success) {
        setStage(`❌ ISL Error: ${isl.error}`);
        return;
      }

      setIslGloss(isl);
      setStage('✅ Done!');

      // Add to history
      setHistory(prev => [{
        english: asr.text,
        isl: isl.isl_string,
        tokens: isl.isl_gloss,
        tense: isl.tense,
        question: isl.is_question,
        negation: isl.is_negation,
        time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 6));

    } catch (err) {
      setStage(`❌ Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      maxWidth: '860px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#1a237e', marginBottom: '4px' }}>🤟 ISL Avatar System</h1>
      <p style={{ color: '#666', marginBottom: '32px', fontSize: '16px' }}>
        Week 2 — Day 6: English → ISL Grammar Engine
      </p>

      <Recorder onAudioRecorded={handleAudioRecorded} />

      {/* Stage indicator */}
      {stage && (
        <div style={{
          marginTop: '16px', padding: '12px 16px',
          backgroundColor: '#f3f4f6', borderRadius: '8px',
          fontSize: '15px', color: '#374151'
        }}>
          {stage}
        </div>
      )}

      {/* English transcript */}
      {transcript && (
        <div style={{
          marginTop: '20px', padding: '20px',
          backgroundColor: '#e3f2fd', borderRadius: '10px',
          border: '1px solid #90caf9'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>
            🎤 English (SVO)
          </h3>
          <p style={{
            fontSize: '20px', fontWeight: 'bold',
            color: '#0d47a1', margin: 0,
            padding: '10px', backgroundColor: 'white',
            borderRadius: '6px'
          }}>
            "{transcript}"
          </p>
        </div>
      )}

      {/* Arrow */}
      {transcript && islGloss && (
        <div style={{ textAlign: 'center', fontSize: '28px', margin: '8px 0' }}>
          ↓
        </div>
      )}

      {/* ISL gloss output */}
      {islGloss && (
        <div style={{
          padding: '20px', backgroundColor: '#e8f5e9',
          borderRadius: '10px', border: '1px solid #a5d6a7'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#2e7d32' }}>
            🤟 ISL Gloss (SOV)
          </h3>

          {/* Token bubbles */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {islGloss.isl_gloss.map((token, i) => (
              <span key={i} style={{
                padding: '8px 16px',
                backgroundColor: token === 'NOT' ? '#ffebee' :
                                 token === '?'   ? '#fff8e1' :
                                 token === 'PAST' || token === 'FUTURE' || token === 'NOW'
                                                 ? '#f3e5f5' : '#1b5e20',
                color: token === 'NOT' ? '#c62828' :
                       token === '?'   ? '#f57f17' :
                       token === 'PAST' || token === 'FUTURE' || token === 'NOW'
                                       ? '#6a1b9a' : 'white',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '15px',
                border: '2px solid rgba(0,0,0,0.1)'
              }}>
                {token}
              </span>
            ))}
          </div>

          {/* Metadata */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '4px 10px', borderRadius: '12px',
              backgroundColor: '#c8e6c9', fontSize: '13px', color: '#1b5e20'
            }}>
              Tense: {islGloss.tense}
            </span>
            {islGloss.is_question && (
              <span style={{
                padding: '4px 10px', borderRadius: '12px',
                backgroundColor: '#fff9c4', fontSize: '13px', color: '#f57f17'
              }}>
                ❓ Question
              </span>
            )}
            {islGloss.is_negation && (
              <span style={{
                padding: '4px 10px', borderRadius: '12px',
                backgroundColor: '#ffcdd2', fontSize: '13px', color: '#c62828'
              }}>
                ❌ Negation
              </span>
            )}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ color: '#333', marginBottom: '12px' }}>📋 History</h3>
          {history.map((item, i) => (
            <div key={i} style={{
              padding: '12px 16px', marginBottom: '8px',
              backgroundColor: '#f9f9f9', borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ color: '#555', fontSize: '13px', marginBottom: '4px' }}>
                🎤 "{item.english}"
              </div>
              <div style={{ color: '#1b5e20', fontWeight: 'bold', fontSize: '14px' }}>
                🤟 {item.isl}
              </div>
              <div style={{ color: '#aaa', fontSize: '11px', marginTop: '4px' }}>
                {item.tense} • {item.question ? 'question' : 'statement'} • {item.time}
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
        <h4 style={{ margin: '0 0 8px 0' }}>📋 Week 2 Progress</h4>
        <ul style={{ margin: 0, lineHeight: '2', paddingLeft: '20px' }}>
          <li>✅ Day 6: spaCy NLP + ISL grammar engine</li>
          <li>⬜ Day 7: Handle complex sentences</li>
          <li>⬜ Day 8: Connect full pipeline</li>
          <li>⬜ Day 9-10: Testing + polish</li>
        </ul>
      </div>
    </div>
  );
}

export default App;