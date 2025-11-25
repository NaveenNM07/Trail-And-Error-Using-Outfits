import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  label: string;
  image: ImageFile | null;
  onImageUpload: (image: ImageFile) => void;
  onRemove: () => void;
  description: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  image,
  onImageUpload,
  onRemove,
  description
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUpload({
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl: result, // For display
        base64: result // Keep full data URL for easy usage
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [onImageUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  if (image) {
    return (
      <div className="relative group w-full h-[400px] rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-white">
        <img
          src={image.previewUrl}
          alt={label}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
                onClick={onRemove}
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 rounded-full transition-all transform hover:scale-105"
            >
                <X className="w-6 h-6" />
            </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
            <p className="font-medium text-sm tracking-wide uppercase opacity-90">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full h-[400px] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 text-center cursor-pointer relative overflow-hidden
        ${isDragging 
          ? 'border-rose-400 bg-rose-50' 
          : 'border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100'
        }
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        <Upload className={`w-8 h-8 ${isDragging ? 'text-rose-500' : 'text-stone-400'}`} />
      </div>
      <h3 className="text-lg font-serif font-semibold text-stone-800 mb-2">{label}</h3>
      <p className="text-sm text-stone-500 max-w-[200px] leading-relaxed">{description}</p>
    </div>
  );
};

export default ImageUploader;