export class ISLService {
  async convertToISL(englishText) {
    try {
      const startTime = Date.now();
      const result = await window.electronAPI.convertToISL(englishText);
      const latency = Date.now() - startTime;

      return { ...result, latency };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        isl_gloss: [],
        isl_string: ''
      };
    }
  }
}

export const islService = new ISLService();