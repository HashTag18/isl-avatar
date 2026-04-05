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

// Handle transcription requests from React
ipcMain.handle('transcribe-audio', async (event, base64Audio) => {
  return new Promise((resolve) => {
    try {
      // Save base64 audio to a temp WAV file
      const tempFile = path.join(os.tmpdir(), `isl_audio_${Date.now()}.webm`);
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      fs.writeFileSync(tempFile, audioBuffer);

      console.log('[Main] Temp audio file created:', tempFile);

      // Path to whisper_service.py
      const scriptPath = path.join(__dirname, 'whisper_service.py');

      // Spawn Python process
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
        // Clean up temp file
        try { fs.unlinkSync(tempFile); } catch (e) {}

        if (code === 0 && output.trim()) {
          try {
            const result = JSON.parse(output.trim());
            resolve(result);
          } catch (e) {
            resolve({ success: false, error: 'Parse error: ' + output, text: '' });
          }
        } else {
          resolve({
            success: false,
            error: errorOutput || 'Whisper process failed',
            text: ''
          });
        }
      });

    } catch (error) {
      resolve({ success: false, error: error.message, text: '' });
    }
  });
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});