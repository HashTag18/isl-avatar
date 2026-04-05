export class DictionaryService {
  constructor() {
    this.dictionary = null;
  }

  async loadDictionary() {
    if (this.dictionary) return this.dictionary;

    try {
      const response = await fetch('./data/isl_dictionary.json');
      const data = await response.json();
      this.dictionary = data.signs;
      console.log(`Dictionary loaded: ${Object.keys(this.dictionary).length} signs`);
      return this.dictionary;
    } catch (error) {
      console.error('Failed to load dictionary:', error);
      return {};
    }
  }

  async lookupSign(gloss) {
    const dict = await this.loadDictionary();
    const key = gloss.toUpperCase();

    if (dict[key]) {
      return { found: true, sign: dict[key] };
    }

    // Try question mark
    if (key === '?') {
      return { found: true, sign: dict['QUESTION_MARK'] };
    }

    return { found: false, sign: null, gloss: key };
  }

  async lookupSequence(glossArray) {
    const results = await Promise.all(
      glossArray.map(gloss => this.lookupSign(gloss))
    );

    const found    = results.filter(r => r.found).length;
    const notFound = results.filter(r => !r.found).map(r => r.gloss);

    return {
      sequence: results,
      coverage: Math.round((found / glossArray.length) * 100),
      notFound
    };
  }
}

export const dictionaryService = new DictionaryService();