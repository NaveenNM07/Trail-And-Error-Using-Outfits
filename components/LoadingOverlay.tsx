import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  const [tip, setTip] = useState(0);
  
  const tips = [
    "Analyzing pose and lighting...",
    "Extracting outfit textures...",
    "Draping fabric onto the model...",
    "Adjusting shadows and highlights...",
    "Rendering final photorealistic look..."
  ];

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setTip(prev => (prev + 1) % tips.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
      <div className="relative">
        <div className="absolute inset-0 bg-rose-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <Loader2 className="w-16 h-16 text-rose-600 animate-spin relative z-10" />
      </div>
      <h2 className="mt-8 text-2xl font-serif text-stone-900 font-medium">Creating Your Look</h2>
      <p className="mt-2 text-stone-500 animate-fade-in transition-all duration-500 h-6">
        {tips[tip]}
      </p>
    </div>
  );
};

export default LoadingOverlay;