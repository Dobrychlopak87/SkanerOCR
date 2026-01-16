
import { ValidationResult, ScannerConfig } from '../types';
import { ANCHOR_ZIP } from '../constants';

export function normalizeZipCode(text: string): string {
  return text
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, '')
    .replace(/O/g, '0')
    .replace(/I/g, '1')
    .trim();
}

export function normalizeAddress(text: string): string {
  return text
    .trim()
    .replace(/\s{2,}/g, ' ')
    .replace(/^[.\-\s]+/, '')
    .replace(/[.\-\s]+$/, '');
}

export function validateAddress(street: string, city: string, config: ScannerConfig): ValidationResult {
  const errors: string[] = [];
  
  if (street.length < config.validation.minStreetLength) {
    errors.push(`Street too short: "${street}"`);
  }
  
  if (city.length < config.validation.minCityLength) {
    errors.push(`City too short: "${city}"`);
  }
  
  if (!/[a-zA-ZąćęłńóśżźĄĆĘŁŃÓŚŻŹ]/.test(street)) {
    errors.push('Street has no letters');
  }
  
  if (!/^[a-zA-ZąćęłńóśżźĄĆĘŁŃÓŚŻŹ\s-]+$/.test(city)) {
    errors.push(`City has invalid chars: "${city}"`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function isAnchorMatch(ocrText: string): boolean {
  return normalizeZipCode(ocrText) === ANCHOR_ZIP;
}
