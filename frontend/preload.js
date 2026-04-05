const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron,

  // Expose transcription function to React
  transcribeAudio: (base64Audio) => {
    return ipcRenderer.invoke('transcribe-audio', base64Audio);
  }
});