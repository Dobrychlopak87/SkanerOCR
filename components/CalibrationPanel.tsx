
import React, { useState } from 'react';
import { ScannerConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';

interface Props {
  config: ScannerConfig;
  setConfig: React.Dispatch<React.SetStateAction<ScannerConfig>>;
  onClose: () => void;
}

export function CalibrationPanel({ config, setConfig, onClose }: Props) {
  const [localConfig, setLocalConfig] = useState<ScannerConfig>(config);

  const update = (section: keyof ScannerConfig, key: string, value: number) => {
    setLocalConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    setConfig(localConfig);
    onClose();
  };

  const handleReset = () => {
    if (confirm('Przywrócić ustawienia domyślne?')) {
      setLocalConfig(DEFAULT_CONFIG);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      <div className="relative w-80 h-full bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 p-6 pointer-events-auto flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-yellow-400 rounded-full"></div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Kalibracja</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-9 overflow-y-auto pr-2 custom-scrollbar">
          {/* Geometry */}
          <section>
            <h3 className="text-[10px] font-black uppercase text-yellow-400/60 mb-6 tracking-[0.2em] border-b border-white/5 pb-2">Geometria Pola</h3>
            
            <div className="space-y-7">
              <Slider 
                label="Ulica: Pionowe przesunięcie" 
                value={localConfig.geometry.streetOffsetY} 
                min={0.5} max={2.5} step={0.1}
                onChange={(v) => update('geometry', 'streetOffsetY', v)} 
              />
              <Slider 
                label="Miejscowość: Odstęp poziomy" 
                value={localConfig.geometry.cityOffsetX} 
                min={0} max={100} step={1}
                onChange={(v) => update('geometry', 'cityOffsetX', v)} 
              />
              <Slider 
                label="Miejscowość: Szerokość" 
                value={localConfig.geometry.cityWidth} 
                min={100} max={600} step={10}
                onChange={(v) => update('geometry', 'cityWidth', v)} 
              />
            </div>
          </section>

          {/* Performance */}
          <section>
            <h3 className="text-[10px] font-black uppercase text-yellow-400/60 mb-6 tracking-[0.2em] border-b border-white/5 pb-2">Wydajność</h3>
            <div className="space-y-7">
              <Slider 
                label="Częstotliwość OCR (ms)" 
                value={localConfig.performance.ocrInterval} 
                min={100} max={2000} step={100}
                onChange={(v) => update('performance', 'ocrInterval', v)} 
              />
              <Slider 
                label="Blokada po odczycie (ms)" 
                value={localConfig.performance.lockDuration} 
                min={0} max={5000} step={100}
                onChange={(v) => update('performance', 'lockDuration', v)} 
              />
            </div>
          </section>

           {/* Stability */}
           <section>
            <h3 className="text-[10px] font-black uppercase text-yellow-400/60 mb-6 tracking-[0.2em] border-b border-white/5 pb-2">Stabilizacja</h3>
            <div className="space-y-7">
              <Slider 
                label="Liczba klatek bazowych" 
                value={localConfig.stability.requiredFrames} 
                min={1} max={5} step={1}
                onChange={(v) => update('stability', 'requiredFrames', v)} 
              />
              <Slider 
                label="Tolerancja ruchu (px)" 
                value={localConfig.stability.maxDelta} 
                min={1} max={20} step={1}
                onChange={(v) => update('stability', 'maxDelta', v)} 
              />
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3 shrink-0">
          <button 
            onClick={handleSave}
            className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black text-xs hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/10"
          >
            ZAPISZ USTAWIENIA
          </button>
          <button 
            onClick={handleReset}
            className="w-full bg-white/5 text-white/40 py-3 rounded-2xl font-black text-[10px] hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest"
          >
            Resetuj do domyślnych
          </button>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between text-[9px] text-white/30 font-black uppercase tracking-widest">
        <span>{label}</span>
        <span className="text-yellow-400 font-mono text-[10px]">{value}</span>
      </div>
      <div className="relative flex items-center group">
        <input 
          type="range" min={min} max={max} step={step} value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full accent-yellow-400 h-1 bg-white/5 rounded-full appearance-none cursor-pointer hover:bg-white/10 transition-colors"
        />
      </div>
    </div>
  );
}
