
import React, { useEffect, useRef } from 'react';
import { ROI, BoundingBox, ProcessingStatus } from '../types';

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  debugData: {
    anchorROI: ROI;
    anchorBbox: BoundingBox | null;
    streetROI: ROI | null;
    cityROI: ROI | null;
  } | null;
  status: ProcessingStatus;
}

export function ROIOverlay({ canvasRef, debugData, status }: Props) {
  const overlayRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const source = canvasRef.current;
      if (!source) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const scaleX = canvas.width / source.width;
      const scaleY = canvas.height / source.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!debugData) return;

      const { anchorROI, anchorBbox, streetROI, cityROI } = debugData;

      // 1. Obszar szukania kodu (żółty przerywany)
      ctx.strokeStyle = status === 'searching' ? 'rgba(255, 235, 59, 0.4)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(anchorROI.x * scaleX, anchorROI.y * scaleY, anchorROI.w * scaleX, anchorROI.h * scaleY);
      ctx.setLineDash([]);

      // 2. Wykryty kod 66-600 (zielona ramka)
      if (anchorBbox) {
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 4;
        ctx.strokeRect(anchorBbox.x * scaleX, anchorBbox.y * scaleY, anchorBbox.w * scaleX, anchorBbox.h * scaleY);
        
        // Etykieta przy kodzie
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('66-600 OK', anchorBbox.x * scaleX, (anchorBbox.y * scaleY) - 5);
      }

      // 3. Obszar ulicy i miasta (niebieski i fioletowy)
      if (status === 'extracting' || status === 'locked') {
        if (streetROI) {
          ctx.strokeStyle = 'rgba(33, 150, 243, 0.8)';
          ctx.lineWidth = 2;
          ctx.strokeRect(streetROI.x * scaleX, streetROI.y * scaleY, streetROI.w * scaleX, streetROI.h * scaleY);
        }
        
        if (cityROI) {
          ctx.strokeStyle = 'rgba(156, 39, 176, 0.8)';
          ctx.lineWidth = 2;
          ctx.strokeRect(cityROI.x * scaleX, cityROI.y * scaleY, cityROI.w * scaleX, cityROI.h * scaleY);
        }
      }
    };

    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [debugData, status, canvasRef]);

  return <canvas ref={overlayRef} className="absolute inset-0 z-10 pointer-events-none" />;
}
