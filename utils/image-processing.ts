
import { ROI } from '../types';

/**
 * Preprocess an image region to improve OCR accuracy.
 * Applies grayscale conversion and contrast enhancement.
 */
export function preprocessROI(
  ctx: CanvasRenderingContext2D,
  roi: ROI
): ImageData {
  const imageData = ctx.getImageData(roi.x, roi.y, roi.w, roi.h);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Grayscale conversion using luminance weights
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    
    // Contrast enhancement: push values away from middle gray (128)
    // Scale factor of 1.5 - 1.8 works well for black-on-white text
    const contrasted = ((gray - 128) * 1.6) + 128;
    
    // Clamp to 0-255
    const clamped = Math.max(0, Math.min(255, contrasted));
    
    data[i] = clamped;     // R
    data[i + 1] = clamped; // G
    data[i + 2] = clamped; // B
    // Alpha channel (data[i+3]) remains unchanged
  }

  return imageData;
}
