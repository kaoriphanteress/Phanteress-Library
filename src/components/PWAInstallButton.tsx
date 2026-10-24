import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone on home screen, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-md shadow-pink-950/40 cursor-pointer active:scale-95"
        title="Install app to your device home screen"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-400 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          title="Install app on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-white space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-pink-400" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                <p>
                  1. Tap the <strong className="text-pink-400">Share button</strong> (square with arrow) at the bottom of Safari.
                </p>
                <p>
                  2. Scroll down and tap <strong className="text-pink-400">"Add to Home Screen"</strong>.
                </p>
                <p>
                  3. Tap <strong className="text-white">Add</strong> in top right. Enjoy full-screen offline Marvel tracking!
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-pink-600 hover:bg-pink-500 font-bold text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback button for desktop browsers allowing installation or instructions
  return (
    <button
      onClick={() => {
        alert('To install this app on your device:\n• On Android/Chrome: Tap browser menu (⋮) -> "Install app" or "Add to Home screen"\n• On iPhone: Tap Share -> "Add to Home Screen"\n• On PC/Mac: Click the Install icon in the address bar');
      }}
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
      title="Install instructions"
    >
      <Download className="w-3.5 h-3.5 text-pink-400" />
      <span>Install</span>
    </button>
  );
};
