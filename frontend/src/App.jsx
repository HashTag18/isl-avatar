import { useState, useEffect } from 'react';
import { Recorder } from './components/Recorder';
import { asrService } from './services/asrService';
import { islService } from './services/islService';
import { dictionaryService } from './services/dictionaryService';

function App() {
  const [transcript, setTranscript]     = useState('');
  const [islGloss, setIslGloss]         = useState(null);
  const [signSequence, setSignSequence] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage]               = useState('');
  const [dictStats, setDictStats]       = useState(null);
  const [history, setHistory]           = useState([]);

  // Load dictionary on startup
  useEffect(() => {
    dictionaryService.loadDictionary().then(dict => {
      setDictStats({
        total: Object.keys(dict).length,
        categories: [...new Set(Object.values(dict).map(s => s.category))]
      });
    });
  }, []);

  const handleAudioRecorded = async (audio) => {
    setIsProcessing(true);
    setTranscript('');
    setIslGloss(null);
    setSignSequence(null);

    try {
      // Stage 1: Speech → Text
      setStage('🎤 Transcribing speech...');
      const asr = await asrService.transcribeAudio(audio.blob);
      if (!asr.success) { setStage(`❌ ASR Error: ${asr.error}`); return; }
      setTranscript(asr.text);

      // Stage 2: Text → ISL Gloss
      setStage('🧠 Converting to ISL grammar...');
      const isl = await islService.convertToISL(asr.text);
      if (!isl.success) { setStage(`❌ ISL Error: ${isl.error}`); return; }
      setIslGloss(isl);

      // Stage 3: Gloss → Dictionary lookup
      setStage('📖 Looking up signs in dictionary...');
      const lookup = await dictionaryService.lookupSequence(isl.isl_gloss);
      setSignSequence(lookup);
      setStage(`✅ Done! Dictionary coverage: ${lookup.coverage}%`);

      // Add to history
      setHistory(prev => [{
        english: asr.text,
        isl: isl.isl_string,
        coverage: lookup.coverage,
        notFound: lookup.notFound,
        time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 5));

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
      <p style={{ color: '#666', marginBottom: '8px', fontSize: '16px' }}>
        Week 2 — Day 8: ISL Sign Dictionary
      </p>

      {/* Dictionary stats */}
      {dictStats && (
        <div style={{
          marginBottom: '24px', padding: '10px 16px',
          backgroundColor: '#ede7f6', borderRadius: '8px',
          display: 'flex', gap: '20px', fontSize: '13px', color: '#4527a0'
        }}>
          <span>📖 <strong>{dictStats.total}</strong> signs loaded</span>
          <span>🗂 <strong>{dictStats.categories.length}</strong> categories:
            {' '}{dictStats.categories.join(', ')}
          </span>
        </div>
      )}

      <Recorder onAudioRecorded={handleAudioRecorded} />

      {/* Stage indicator */}
      {stage && (
        <div style={{
          marginTop: '16px', padding: '12px 16px',
          backgroundColor: '#f3f4f6', borderRadius: '8px', fontSize: '15px'
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
          <h3 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>🎤 English</h3>
          <p style={{
            fontSize: '20px', fontWeight: 'bold', color: '#0d47a1',
            margin: 0, padding: '10px', backgroundColor: 'white', borderRadius: '6px'
          }}>
            "{transcript}"
          </p>
        </div>
      )}

      {/* ISL Gloss */}
      {islGloss && (
        <div style={{
          marginTop: '12px', padding: '20px',
          backgroundColor: '#e8f5e9', borderRadius: '10px',
          border: '1px solid #a5d6a7'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#2e7d32' }}>🤟 ISL Gloss</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {islGloss.isl_gloss.map((token, i) => (
              <span key={i} style={{
                padding: '8px 16px',
                backgroundColor: token === 'NOT'  ? '#ffebee' :
                                 token === '?'    ? '#fff8e1' :
                                 ['PAST','FUTURE','NOW'].includes(token) ? '#f3e5f5' : '#1b5e20',
                color: token === 'NOT'  ? '#c62828' :
                       token === '?'    ? '#f57f17' :
                       ['PAST','FUTURE','NOW'].includes(token) ? '#6a1b9a' : 'white',
                borderRadius: '20px', fontWeight: 'bold', fontSize: '14px'
              }}>
                {token}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dictionary lookup results */}
      {signSequence && (
        <div style={{
          marginTop: '12px', padding: '20px',
          backgroundColor: '#fff8e1', borderRadius: '10px',
          border: '1px solid #ffe082'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '16px'
          }}>
            <h3 style={{ margin: 0, color: '#f57f17' }}>📖 Sign Dictionary Lookup</h3>
            <span style={{
              padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold',
              backgroundColor: signSequence.coverage === 100 ? '#c8e6c9' : '#ffe082',
              color: signSequence.coverage === 100 ? '#1b5e20' : '#e65100'
            }}>
              {signSequence.coverage}% coverage
            </span>
          </div>

          {/* Sign cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {signSequence.sequence.map((result, i) => (
              <div key={i} style={{
                padding: '12px',
                backgroundColor: result.found ? 'white' : '#ffebee',
                borderRadius: '8px',
                border: `2px solid ${result.found ? '#a5d6a7' : '#ef9a9a'}`,
                minWidth: '130px'
              }}>
                <div style={{
                  fontWeight: 'bold', fontSize: '14px',
                  color: result.found ? '#1b5e20' : '#c62828',
                  marginBottom: '6px'
                }}>
                  {result.found ? '✅' : '❌'} {result.found ? result.sign.gloss : result.gloss}
                </div>
                {result.found && (
                  <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.6' }}>
                    <div>✋ {result.sign.hand_shape}</div>
                    <div>📍 {result.sign.position}</div>
                    <div>🔄 {result.sign.motion}</div>
                    <div>⏱ {result.sign.duration_ms}ms</div>
                  </div>
                )}
                {!result.found && (
                  <div style={{ fontSize: '11px', color: '#c62828' }}>
                    Not in dictionary yet
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Missing words */}
          {signSequence.notFound.length > 0 && (
            <div style={{
              marginTop: '12px', padding: '10px',
              backgroundColor: '#ffebee', borderRadius: '6px',
              fontSize: '13px', color: '#c62828'
            }}>
              ⚠️ Words to add to dictionary: <strong>{signSequence.notFound.join(', ')}</strong>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: '28px' }}>
          <h3 style={{ color: '#333', marginBottom: '12px' }}>📋 History</h3>
          {history.map((item, i) => (
            <div key={i} style={{
              padding: '12px 16px', marginBottom: '8px',
              backgroundColor: '#f9f9f9', borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ color: '#555', fontSize: '13px' }}>🎤 "{item.english}"</div>
              <div style={{ color: '#1b5e20', fontWeight: 'bold', fontSize: '14px', margin: '4px 0' }}>
                🤟 {item.isl}
              </div>
              <div style={{ color: '#888', fontSize: '12px' }}>
                📖 {item.coverage}% dictionary coverage
                {item.notFound.length > 0 && ` • Missing: ${item.notFound.join(', ')}`}
                {' • '}{item.time}
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
          <li>✅ Day 6: spaCy + ISL grammar engine</li>
          <li>✅ Day 7: Full pipeline connected</li>
          <li>✅ Day 8: ISL sign dictionary (50 signs)</li>
          <li>⬜ Day 9: 3D Avatar setup</li>
          <li>⬜ Day 10: Testing + polish</li>
        </ul>
      </div>
    </div>
  );
}

export default App;