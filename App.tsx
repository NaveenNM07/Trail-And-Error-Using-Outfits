import React, { useState } from 'react';
import { Sparkles, ArrowRight, RefreshCw, Download, Info } from 'lucide-react';
import { ImageFile, ProcessingStatus, TryOnRequest } from './types';
import { generateTryOnLook } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import LoadingOverlay from './components/LoadingOverlay';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<ImageFile | null>(null);
  const [outfitImage, setOutfitImage] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!personImage || !outfitImage) return;

    setStatus(ProcessingStatus.GENERATING);
    setError(null);

    const request: TryOnRequest = {
      personImage,
      outfitImage
    };

    try {
      const resultBase64 = await generateTryOnLook(request);
      setGeneratedImage(resultBase64);
      setStatus(ProcessingStatus.SUCCESS);
    } catch (err: any) {
      console.error("Generation failed", err);
      setError(err.message || "Something went wrong while generating the look.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleReset = () => {
    setPersonImage(null);
    setOutfitImage(null);
    setGeneratedImage(null);
    setStatus(ProcessingStatus.IDLE);
    setError(null);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `vogue-ai-tryon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 pb-20">
      <LoadingOverlay isVisible={status === ProcessingStatus.GENERATING} />

      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-tr-xl rounded-bl-xl flex items-center justify-center">
                <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight text-stone-900">Vogue<span className="text-rose-500">AI</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-stone-500">
            <span className="hover:text-stone-900 cursor-pointer">How it works</span>
            <span className="hover:text-stone-900 cursor-pointer">Gallery</span>
            <span className="px-4 py-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors cursor-pointer">
              Go Pro
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro */}
        {!generatedImage && (
            <div className="text-center mb-12 max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-stone-900 mb-4 leading-tight">
                    Experience Virtual <br/> <span className="text-rose-500 italic">Haute Couture</span>
                </h1>
                <p className="text-stone-500 text-lg">
                    Upload a photo of yourself and an outfit you love. Our AI will seamlessly blend them for a realistic virtual try-on experience.
                </p>
            </div>
        )}

        {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 max-w-3xl mx-auto">
                <Info className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="text-red-800 font-medium">Generation Failed</h3>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
            </div>
        )}

        {/* Main Interface */}
        <div className={`grid gap-8 transition-all duration-500 ${generatedImage ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 lg:grid-cols-2 max-w-5xl mx-auto'}`}>
          
          {/* Input Section - Left Side when No Result, or Sidebar when Result exists */}
          <div className={`${generatedImage ? 'lg:col-span-4 order-2 lg:order-1' : 'lg:col-span-2 space-y-8'}`}>
            <div className={`grid gap-6 ${generatedImage ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {/* Person Upload */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-200 text-stone-600 text-xs font-bold">1</span>
                        <span className="text-sm font-semibold uppercase tracking-wider text-stone-500">The Model</span>
                    </div>
                    <ImageUploader 
                        label="Person Image" 
                        description="Upload a full-body or half-body photo of the person."
                        image={personImage} 
                        onImageUpload={setPersonImage} 
                        onRemove={() => setPersonImage(null)} 
                    />
                </div>

                {/* Outfit Upload */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-200 text-stone-600 text-xs font-bold">2</span>
                        <span className="text-sm font-semibold uppercase tracking-wider text-stone-500">The Outfit</span>
                    </div>
                    <ImageUploader 
                        label="Outfit Image" 
                        description="Upload an image of the clothing item(s) you want to try on."
                        image={outfitImage} 
                        onImageUpload={setOutfitImage} 
                        onRemove={() => setOutfitImage(null)} 
                    />
                </div>
            </div>

            {/* Action Bar (Only visible if no result yet, or if user wants to change inputs) */}
            {!generatedImage && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleGenerate}
                        disabled={!personImage || !outfitImage || status === ProcessingStatus.GENERATING}
                        className={`
                            group relative px-8 py-4 rounded-full text-lg font-medium tracking-wide transition-all duration-300 w-full sm:w-auto min-w-[240px] shadow-xl shadow-rose-200
                            ${(!personImage || !outfitImage) 
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                                : 'bg-rose-500 text-white hover:bg-rose-600 hover:shadow-2xl hover:shadow-rose-300 hover:-translate-y-1'
                            }
                        `}
                    >
                        <span className="flex items-center justify-center gap-2">
                            {status === ProcessingStatus.GENERATING ? 'Generating...' : 'Generate Look'}
                            {!status && <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                        </span>
                    </button>
                </div>
            )}
            
            {generatedImage && (
                <div className="mt-8 pt-8 border-t border-stone-200">
                     <button
                        onClick={handleGenerate}
                        className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Regenerate
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full mt-3 py-3 bg-white border border-stone-300 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-colors"
                    >
                        Start Over
                    </button>
                </div>
            )}
          </div>

          {/* Result Section */}
          {generatedImage && (
            <div className="lg:col-span-8 order-1 lg:order-2">
                <div className="bg-white rounded-3xl p-4 shadow-2xl shadow-stone-200/50 border border-stone-100">
                    <div className="relative aspect-[3/4] w-full bg-stone-100 rounded-2xl overflow-hidden group">
                        <img 
                            src={generatedImage} 
                            alt="Generated Virtual Try-On" 
                            className="w-full h-full object-cover"
                        />
                         <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between">
                            <div>
                                <p className="text-white/80 text-sm font-medium uppercase tracking-widest">VogueAI Collection</p>
                                <p className="text-white text-xl font-serif">Your Curated Look</p>
                            </div>
                            <button 
                                onClick={handleDownload}
                                className="bg-white text-stone-900 p-3 rounded-full hover:bg-rose-50 transition-colors shadow-lg"
                                title="Download Image"
                            >
                                <Download className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;