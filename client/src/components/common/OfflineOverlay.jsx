import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';

export function OfflineOverlay() {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });

  const toast = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Connection restored. You are back online!');
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning('You are offline. Please check your internet connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOffline(false);
      toast.success('Connection restored. You are back online!');
    } else {
      toast.error('Still offline. Please check your internet connection and try again.');
    }
  };

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0b0c0e] px-4 font-sans text-center transition-all duration-300">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Stylized (x) Icon in circular dark orange-brown background */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[rgba(180,106,36,0.15)] mb-8 transition-transform hover:scale-105 duration-300">
          <span className="text-[#c27a30] font-semibold text-2xl tracking-tighter select-none font-mono">
            (x)
          </span>
        </div>

        {/* Status Message */}
        <h1 className="text-white text-2xl font-bold tracking-tight mb-3">
          You're Offline
        </h1>
        <p className="text-[#8e9096] text-[15px] leading-relaxed max-w-sm mb-8">
          It seems you've lost your internet connection. Please check your connection and try again.
        </p>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          className="bg-[#b46a24] hover:bg-[#99551a] text-white font-medium text-[15px] py-3 px-8 rounded-lg shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#b46a24] focus:ring-offset-2 focus:ring-offset-[#0b0c0e]"
        >
          Try Again
        </button>

        {/* Bottom Hospital/Healthcare Quote Container */}
        <div className="mt-16 w-full max-w-md bg-[#16171a] border-l-4 border-[#b46a24] rounded-r-lg p-5 text-left shadow-lg">
          <p className="text-[#a1a3a9] italic text-sm leading-relaxed mb-2 font-light">
            "The good physician treats the disease; the great physician treats the patient who has the disease."
          </p>
          <p className="text-[#b46a24] text-xs font-medium tracking-wide">
            — Sir William Osler
          </p>
        </div>
      </div>
    </div>
  );
}
