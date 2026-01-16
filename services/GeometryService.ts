
import { BoundingBox, ROI, ScannerConfig } from '../types';

export class GeometryService {
  private history: BoundingBox[] = [];

  isStable(current: BoundingBox, config: ScannerConfig): boolean {
    this.history.push(current);
    if (this.history.length > config.stability.requiredFrames) {
      this.history.shift();
    }
    if (this.history.length < config.stability.requiredFrames) {
      return false;
    }

    const prev = this.history[0];
    const delta = Math.sqrt(
      Math.pow(current.x - prev.x, 2) + Math.pow(current.y - prev.y, 2)
    );

    return delta <= config.stability.maxDelta;
  }

  resetStability(): void {
    this.history = [];
  }

  calculateStreetROI(anchor: BoundingBox, config: ScannerConfig): ROI {
    return {
      x: anchor.x + config.geometry.streetOffsetX,
      y: anchor.y - (config.geometry.streetOffsetY * anchor.h),
      w: anchor.w + config.geometry.streetWidthExtra,
      h: anchor.h * 1.2
    };
  }

  calculateCityROI(anchor: BoundingBox, config: ScannerConfig): ROI {
    return {
      x: anchor.x + anchor.w + config.geometry.cityOffsetX,
      y: anchor.y + (config.geometry.cityOffsetY * anchor.h),
      w: config.geometry.cityWidth,
      h: anchor.h * 1.4
    };
  }
}
