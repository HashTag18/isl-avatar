const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'ISL Avatar System'
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, 'dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// ─────────────────────────────────────────
// HANDLER 1: Speech → Text (Whisper)
// ─────────────────────────────────────────
ipcMain.handle('transcribe-audio', async (event, base64Audio) => {
  return new Promise((resolve) => {
    try {
      const tempFile = path.join(os.tmpdir(), `isl_audio_${Date.now()}.webm`);
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      fs.writeFileSync(tempFile, audioBuffer);

      console.log('[Main] Temp audio file created:', tempFile);

      const scriptPath = path.join(__dirname, 'whisper_service.py');
      const python = spawn('py', [scriptPath, tempFile]);

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.log('[Whisper]', data.toString().trim());
      });

      python.on('close', (code) => {
        try { fs.unlinkSync(tempFile); } catch (e) {}

        if (code === 0 && output.trim()) {
          try {
            resolve(JSON.parse(output.trim()));
          } catch (e) {
            resolve({ success: false, error: 'Parse error: ' + output, text: '' });
          }
        } else {
          resolve({ success: false, error: errorOutput || 'Whisper failed', text: '' });
        }
      });

    } catch (error) {
      resolve({ success: false, error: error.message, text: '' });
    }
  });
});

// ─────────────────────────────────────────
// HANDLER 2: Text → ISL Grammar (spaCy)
// ─────────────────────────────────────────
ipcMain.handle('convert-to-isl', async (event, text) => {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, 'isl_grammar.py');
    const python = spawn('py', [scriptPath, text]);

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log('[ISL Grammar]', data.toString().trim());
    });

    python.on('close', (code) => {
      if (code === 0 && output.trim()) {
        try {
          resolve(JSON.parse(output.trim()));
        } catch (e) {
          resolve({ success: false, error: 'Parse error', isl_string: '' });
        }
      } else {
        resolve({ success: false, error: errorOutput, isl_string: '' });
      }
    });
  });
});

// ─────────────────────────────────────────
// APP EVENTS
// ─────────────────────────────────────────
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});