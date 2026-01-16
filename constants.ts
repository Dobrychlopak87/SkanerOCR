
import { ScannerConfig } from './types';

export const ANCHOR_ZIP = "66-600";

export const DEFAULT_CONFIG: ScannerConfig = {
  geometry: {
    streetOffsetY: 1.1, // Zmniejszone z 1.3 dla lepszego trafienia w linię nad kodem
    streetOffsetX: -20, // Zwiększony margines w lewo dla dłuższych nazw ulic
    streetWidthExtra: 400, // Zwiększona szerokość pola ulicy
    cityOffsetX: 15, // Odstęp od kodu pocztowego do nazwy miasta
    cityOffsetY: -0.1, // Korekta wysokości linii miasta
    cityWidth: 450 // Zwiększona szerokość pola miasta dla nazw wieloczłonowych
  },
  anchorROI: {
    x: 0.25, // Poszerzony obszar poszukiwań poziomo
    y: 0.45, // Przesunięty nieco wyżej
    w: 0.50, // Szerokość 50% kadru
    h: 0.15  // Wysokość 15% kadru
  },
  stability: {
    requiredFrames: 2,
    maxDelta: 8 // Zwiększona tolerancja na drobne drgania ręki
  },
  performance: {
    ocrInterval: 250,
    lockDuration: 2000, // Wydłużona blokada do 2s, aby użytkownik zdążył skopiować wynik
    anchorTimeout: 1500,
    addressTimeout: 2000
  },
  validation: {
    minStreetLength: 5,
    minCityLength: 3
  }
};

export const POLISH_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .-ąćęłńóśżźĄĆĘŁŃÓŚŻŹ";
