
import React, { useState, useEffect, useRef } from 'react';
import { TesseractService } from '../services/TesseractService';
import { GeometryService } from '../services/GeometryService';
import { AddressResult, ProcessingStatus, ScannerConfig, ROI, BoundingBox } from '../types';
import { isAnchorMatch, normalizeAddress, validateAddress } from '../utils/validation';
import { DEFAULT_CONFIG } from '../constants';
import { preprocessROI } from '../utils/image-processing';

export function useAddressExtraction(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  config: ScannerConfig = DEFAULT_CONFIG
) {
  const [result, setResult] = useState<AddressResult | null>(null);
  const [history, setHistory] = useState<AddressResult[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('initializing');
  const [debugData, setDebugData] = useState<{
    anchorROI: ROI;
    anchorBbox: BoundingBox | null;
    streetROI: ROI | null;
    cityROI: ROI | null;
  } | null>(null);

  const tesseractRef = useRef<TesseractService>(new TesseractService());
  const geometryRef = useRef<GeometryService>(new GeometryService());
  const intervalRef = useRef<number | null>(null);
  const lockUntilRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        await tesseractRef.current.initialize();
        setStatus('idle');
      } catch (err) {
        console.error('OCR Init Error:', err);
        setStatus('error');
      }
    };
    init();
    return () => {
      tesseractRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    if (status === 'error' || status === 'initializing') return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    intervalRef.current = window.setInterval(async () => {
      const now = Date.now();
      
      // Guard: Skip if still locked by previous success or already processing
      if (now < lockUntilRef.current || isProcessingRef.current) return;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx || video.readyState < 2) return;

      isProcessingRef.current = true;

      try {
        // Ensure canvas matches video size for accurate ROI mapping
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
        if (canvas.width === 0 || canvas.height === 0) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Step 1: Anchor Search
        const anchorROI: ROI = {
          x: canvas.width * config.anchorROI.x,
          y: canvas.height * config.anchorROI.y,
          w: canvas.width * config.anchorROI.w,
          h: canvas.height * config.anchorROI.h
        };

        // Apply preprocessing for better zip code detection
        const anchorImageData = preprocessROI(ctx, anchorROI);
        const anchorOCR = await tesseractRef.current.recognizeAnchor(anchorImageData);

        if (anchorOCR && isAnchorMatch(anchorOCR.text)) {
          const absoluteBbox: BoundingBox = {
            x: anchorROI.x + anchorOCR.bbox.x,
            y: anchorROI.y + anchorOCR.bbox.y,
            w: anchorOCR.bbox.w,
            h: anchorOCR.bbox.h
          };

          // Step 2: Stabilization
          if (geometryRef.current.isStable(absoluteBbox, config)) {
            setStatus('extracting');
            
            // Step 3: Compute Geometry
            const streetROI = geometryRef.current.calculateStreetROI(absoluteBbox, config);
            const cityROI = geometryRef.current.calculateCityROI(absoluteBbox, config);

            // Safety check for ROI bounds (must be within canvas)
            const safeStreetROI = {
              x: Math.max(0, Math.min(canvas.width - 10, streetROI.x)),
              y: Math.max(0, Math.min(canvas.height - 10, streetROI.y)),
              w: Math.max(10, Math.min(canvas.width - streetROI.x, streetROI.w)),
              h: Math.max(10, Math.min(canvas.height - streetROI.y, streetROI.h))
            };
            const safeCityROI = {
              x: Math.max(0, Math.min(canvas.width - 10, cityROI.x)),
              y: Math.max(0, Math.min(canvas.height - 10, cityROI.y)),
              w: Math.max(10, Math.min(canvas.width - cityROI.x, cityROI.w)),
              h: Math.max(10, Math.min(canvas.height - cityROI.y, cityROI.h))
            };

            setDebugData({ anchorROI, anchorBbox: absoluteBbox, streetROI: safeStreetROI, cityROI: safeCityROI });

            // Step 4: Extract Data with Preprocessing
            const streetImageData = preprocessROI(ctx, safeStreetROI);
            const cityImageData = preprocessROI(ctx, safeCityROI);

            const [streetRaw, cityRaw] = await Promise.all([
              tesseractRef.current.recognizePolish(streetImageData),
              tesseractRef.current.recognizePolish(cityImageData)
            ]);

            const street = normalizeAddress(streetRaw);
            const city = normalizeAddress(cityRaw);

            // Step 5: Validation
            const validation = validateAddress(street, city, config);
            if (validation.valid) {
              const newResult: AddressResult = {
                street,
                zip: "66-600",
                city,
                timestamp: now
              };
              setResult(newResult);
              setHistory(prev => {
                const updated = [newResult, ...prev];
                return updated.slice(0, 10); // Keep last 10
              });
              
              // Step 6: Output & Lock
              lockUntilRef.current = now + config.performance.lockDuration;
              setStatus('locked');
              geometryRef.current.resetStability();
            } else {
              setStatus('searching');
            }
          } else {
            setStatus('searching');
            setDebugData({ anchorROI, anchorBbox: absoluteBbox, streetROI: null, cityROI: null });
          }
        } else {
          setStatus('searching');
          setDebugData({ anchorROI, anchorBbox: null, streetROI: null, cityROI: null });
          geometryRef.current.resetStability();
        }
      } catch (err) {
        console.error('OCR Cycle Error:', err);
      } finally {
        isProcessingRef.current = false;
      }
    }, config.performance.ocrInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, videoRef, canvasRef, config]);

  return { result, history, status, debugData };
}
