
import React, { useRef, useState, useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';
import { useAddressExtraction } from '../hooks/useAddressExtraction';
import { VideoPreview } from './VideoPreview';
import { ROIOverlay } from './ROIOverlay';
import { AddressDisplay } from './AddressDisplay';
import { CalibrationPanel } from './CalibrationPanel';
import { DEFAULT_CONFIG } from '../constants';
import { ScannerConfig } from '../types';

const STORAGE_KEY = 'inpost_ocr_config';

export function AddressScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load initial config from storage if available
  const [config, setConfig] = useState<ScannerConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });
  
  const [showCalibration, setShowCalibration] = useState(false);

  // Persistence effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const { stream, error: cameraError } = useCamera();
  const { result, history, status, debugData } = useAddressExtraction(videoRef, canvasRef, config);

  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-red-950 text-white p-8 text-center">
        <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black mb-2 uppercase italic tracking-tighter">Błąd Kamery</h2>
        <p className="mb-8 opacity-60 text-sm max-w-xs">{cameraError.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white text-black px-10 py-4 rounded-full font-black shadow-2xl hover:bg-yellow-400 transition-colors"
        >
          PONÓW PRÓBĘ
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-black font-sans selection:bg-yellow-400 selection:text-black">
      {/* Top Bar */}
      <div className="z-20 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-xl border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-yellow-400/20">In</div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white leading-tight uppercase italic">InPost LIVE OCR</h1>
            <p className="text-[10px] text-yellow-400/80 uppercase tracking-[0.2em] font-black">KARGOWA v1.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end">
             <span className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-0.5">Stan Systemu</span>
             <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                 status === 'error' ? 'bg-red-500' : 'bg-green-500'
               }`} />
               <span className={`text-[11px] font-black uppercase tracking-widest ${
                 status === 'extracting' ? 'text-green-400' : 
                 status === 'locked' ? 'text-blue-400' : 
                 status === 'searching' ? 'text-yellow-400' : 'text-white/40'
               }`}>
                 {status}
               </span>
             </div>
          </div>
          <button 
            onClick={() => setShowCalibration(!showCalibration)}
            className={`p-2.5 rounded-xl transition-all ${showCalibration ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
            title="Kalibracja"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="relative flex-1 bg-[#050505]">
        <VideoPreview videoRef={videoRef} stream={stream} />
        <ROIOverlay canvasRef={canvasRef} debugData={debugData} status={status} />
        
        {/* Visual Guide Overlay (Optional decoration) */}
        <div className="absolute inset-0 pointer-events-none border-[60px] border-black/20 opacity-40"></div>

        {/* Results Toast Overlay */}
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center px-4">
          <AddressDisplay result={result} history={history} />
        </div>
      </div>

      {/* Calibration Panel Drawer */}
      {showCalibration && (
        <CalibrationPanel 
          config={config} 
          setConfig={setConfig} 
          onClose={() => setShowCalibration(false)} 
        />
      )}
    </div>
  );
}
