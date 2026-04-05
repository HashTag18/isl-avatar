export class ASRService {
  async transcribeAudio(audioBlob) {
    try {
      const startTime = Date.now();

      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);

      // Send to Electron main process via fetch (we'll use a local approach)
      const result = await this.callWhisperViaIPC(base64Audio);

      const latency = Date.now() - startTime;

      return {
        ...result,
        latency
      };

    } catch (error) {
      console.error('ASR error:', error);
      return {
        success: false,
        error: error.message,
        text: '',
        latency: 0
      };
    }
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove the data URL prefix (e.g. "data:audio/webm;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async callWhisperViaIPC(base64Audio) {
    try {
      // Call through Electron IPC
      const result = await window.electronAPI.transcribeAudio(base64Audio);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        text: ''
      };
    }
  }
}

export const asrService = new ASRService();