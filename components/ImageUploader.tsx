
import React, { useRef } from 'react';
import { UploadCloudIcon } from './icons/UploadCloudIcon';
import { AnalyzeIcon } from './icons/AnalyzeIcon';
import { ClearIcon } from './icons/ClearIcon';

interface ImageUploaderProps {
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  isLoading: boolean;
  onAnalyze: () => void;
  hasFile: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  previewUrl,
  onFileSelect,
  onClear,
  isLoading,
  onAnalyze,
  hasFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-[400px] bg-gray-800 rounded-lg overflow-hidden group">
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={onClear}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 transition-transform transform hover:scale-110"
                aria-label="Remove image"
                disabled={isLoading}
              >
                <ClearIcon />
              </button>
            </div>
          </>
        ) : (
          <label 
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-600 hover:border-cyan-400 hover:bg-gray-700/50 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <UploadCloudIcon />
            <p className="mt-2 font-semibold text-gray-300">Click to upload, drag & drop, or paste</p>
            <p className="text-sm text-gray-500">PNG, JPG, WEBP</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
            />
          </label>
        )}
      </div>
       <button
        onClick={onAnalyze}
        disabled={!hasFile || isLoading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
      >
        <AnalyzeIcon />
        {isLoading ? 'Analyzing...' : 'Analyze Image'}
      </button>
    </div>
  );
};
