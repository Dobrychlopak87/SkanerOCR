
import React, { useState } from 'react';
import { AddressResult } from '../types';

interface Props {
  result: AddressResult | null;
  history: AddressResult[];
}

export function AddressDisplay({ result, history }: Props) {
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const activeResult = result || (history.length > 0 ? history[0] : null);

  const copyToClipboard = () => {
    if (!activeResult) return;
    const text = `${activeResult.street}, ${activeResult.zip} ${activeResult.city}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeResult && history.length === 0) {
    return (
      <div className="bg-black/60 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/20 text-white/40 flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
        <p className="font-bold tracking-tight uppercase text-xs">Awaiting label...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-3">
      {/* Active Result Card */}
      {activeResult && (
        <div className="bg-yellow-400 text-black p-6 rounded-3xl shadow-2xl relative overflow-hidden transform transition-all animate-in fade-in slide-in-from-bottom-4">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -mr-16 -mt-16"></div>
          
          <div className="relative flex justify-between items-start mb-4">
            <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">Najnowszy odczyt</span>
            <span className="text-[10px] font-mono opacity-60">
              {new Date(activeResult.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 block">Ulica i numer</label>
              <div className="text-xl font-black leading-tight truncate">{activeResult.street}</div>
            </div>
            
            <div className="flex gap-8">
              <div>
                <label className="text-[10px] font-black uppercase opacity-40 block">Kod pocztowy</label>
                <div className="text-xl font-black">{activeResult.zip}</div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase opacity-40 block">Miejscowość</label>
                <div className="text-xl font-black">{activeResult.city}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button 
              onClick={copyToClipboard}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all ${copied ? 'bg-black text-yellow-400' : 'bg-black text-white hover:bg-black/80'}`}
            >
              {copied ? 'SKOPIOWANO!' : 'KOPIUJ ADRES'}
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="bg-black/10 hover:bg-black/20 p-3 rounded-2xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {showHistory && history.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl max-h-60 overflow-y-auto space-y-2">
          {history.map((h, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-xs">
                <div className="font-bold text-white">{h.street}</div>
                <div className="text-white/60">{h.zip} {h.city}</div>
              </div>
              <span className="text-[9px] font-mono text-white/40">{new Date(h.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
