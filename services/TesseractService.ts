
import { createWorker } from 'tesseract.js';
import { BoundingBox } from '../types';
import { POLISH_CHARACTERS, ANCHOR_ZIP } from '../constants';
import { normalizeZipCode } from '../utils/validation';

export class TesseractService {
  private anchorWorker: any = null;
  private polishWorker: any = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Worker 1: English for anchor (digits only)
    this.anchorWorker = await createWorker('eng');
    await this.anchorWorker.setParameters({
      tessedit_pageseg_mode: '7',
      tessedit_char_whitelist: '0123456789-'
    });

    // Worker 2: Polish for address fields
    this.polishWorker = await createWorker('pol');
    await this.polishWorker.setParameters({
      tessedit_pageseg_mode: '7',
      tessedit_char_whitelist: POLISH_CHARACTERS
    });

    this.initialized = true;
  }

  async recognizeAnchor(imageData: ImageData): Promise<{ text: string; bbox: BoundingBox } | null> {
    if (!this.anchorWorker) return null;
    const result = await this.anchorWorker.recognize(imageData);
    
    // Przeszukujemy wszystkie słowa w obszarze ROI, aby znaleźć to pasujące do kodu pocztowego
    if (result.data && result.data.words) {
      for (const word of result.data.words) {
        if (normalizeZipCode(word.text) === ANCHOR_ZIP) {
          return {
            text: word.text,
            bbox: {
              x: word.bbox.x0,
              y: word.bbox.y0,
              w: word.bbox.x1 - word.bbox.x0,
              h: word.bbox.y1 - word.bbox.y0
            }
          };
        }
      }
    }
    
    return null;
  }

  async recognizePolish(imageData: ImageData): Promise<string> {
    if (!this.polishWorker) return '';
    const result = await this.polishWorker.recognize(imageData);
    return result.data.text.trim();
  }

  async terminate(): Promise<void> {
    if (this.anchorWorker) await this.anchorWorker.terminate();
    if (this.polishWorker) await this.polishWorker.terminate();
    this.initialized = false;
  }
}
