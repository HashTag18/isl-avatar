export class AudioService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.startTime = null;
  }

  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          sampleRate: 16000
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      console.log('Recording started');
      return true;

    } catch (error) {
      console.error('Microphone error:', error);
      return false;
    }
  }

  stopRecording() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const duration = Date.now() - this.startTime;

        const audioBlob = new Blob(this.audioChunks, {
          type: 'audio/webm'
        });

        const url = URL.createObjectURL(audioBlob);

        // Stop all mic tracks
        this.stream.getTracks().forEach(track => track.stop());

        console.log('Recording stopped. Size:', audioBlob.size, 'Duration:', duration);

        resolve({
          blob: audioBlob,
          url: url,
          size: audioBlob.size,
          duration: duration
        });
      };

      this.mediaRecorder.stop();
    });
  }
}

export const audioService = new AudioService();