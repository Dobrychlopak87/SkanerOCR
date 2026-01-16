
export interface AddressResult {
  street: string;
  zip: "66-600";
  city: string;
  timestamp: number;
  confidence?: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ROI {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ROIPercentage {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ProcessingStatus = 
  | 'idle' 
  | 'initializing'
  | 'searching' 
  | 'extracting' 
  | 'locked'
  | 'error';

export interface ScannerConfig {
  geometry: {
    streetOffsetY: number;
    streetOffsetX: number;
    streetWidthExtra: number;
    cityOffsetX: number;
    cityOffsetY: number;
    cityWidth: number;
  };
  anchorROI: ROIPercentage;
  stability: {
    requiredFrames: number;
    maxDelta: number;
  };
  performance: {
    ocrInterval: number;
    lockDuration: number;
    anchorTimeout: number;
    addressTimeout: number;
  };
  validation: {
    minStreetLength: number;
    minCityLength: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
