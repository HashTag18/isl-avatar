const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron,

  // Speech to text
  transcribeAudio: (base64Audio) => {
    return ipcRenderer.invoke('transcribe-audio', base64Audio);
  },

  // English to ISL grammar
  convertToISL: (text) => {
    return ipcRenderer.invoke('convert-to-isl', text);
  }
});