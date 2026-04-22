/**
 * OCR Provider — Abstracts OCR engines behind a single interface.
 * Currently uses Tesseract.js (free, client-side).
 * Can be swapped to Google Vision, OCR.space, etc. by adding providers.
 */

import { createWorker } from 'tesseract.js';
import { getApiConfig } from './apiConfig';

/**
 * Extract text from an image file using the active OCR provider.
 * @param {File} imageFile - The image file to process
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<{text: string, confidence: number}>}
 */
export async function extractText(imageFile, onProgress = () => {}) {
  const config = getApiConfig();
  const provider = config.ocr.activeProvider;

  switch (provider) {
    case 'tesseract':
      return extractWithTesseract(imageFile, onProgress);
    // Future providers:
    // case 'google-vision':
    //   return extractWithGoogleVision(imageFile, onProgress);
    // case 'ocr-space':
    //   return extractWithOcrSpace(imageFile, onProgress);
    default:
      return extractWithTesseract(imageFile, onProgress);
  }
}

/**
 * Tesseract.js OCR implementation
 */
async function extractWithTesseract(imageFile, onProgress) {
  let worker = null;

  try {
    // Create worker with progress tracking
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          onProgress(Math.round((m.progress || 0) * 100));
        }
      },
    });

    // Convert file to URL for Tesseract
    const imageUrl = URL.createObjectURL(imageFile);

    try {
      const { data } = await worker.recognize(imageUrl);

      return {
        text: data.text || '',
        confidence: data.confidence || 0,
      };
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  } catch (error) {
    console.error('Tesseract OCR failed:', error);
    throw new Error(`OCR failed: ${error.message}`);
  } finally {
    // Always terminate worker to free memory
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
        // Ignore termination errors
      }
    }
  }
}

/**
 * Check if a file is a supported image format for OCR
 */
export function isOcrSupported(file) {
  if (!file) return false;
  const supported = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/tiff'];
  return supported.includes(file.type);
}
