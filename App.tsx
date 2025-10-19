
import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResultDisplay } from './components/AnalysisResultDisplay';
import { Loader } from './components/Loader';
import { analyzeImageForAI } from './services/geminiService';
import type { AnalysisResult } from './types';
import { fileToBase64 } from './utils/fileUtils';
import { GithubIcon } from './components/icons/GithubIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const { base64Data, mimeType } = await fileToBase64(selectedFile);
      const result = await analyzeImageForAI(base64Data, mimeType);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const imageItem = Array.from(items).find(item => item.type.startsWith('image/'));
      
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) {
          event.preventDefault();
          handleFileSelect(file);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handleFileSelect]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8">
       <main className="w-full max-w-4xl mx-auto flex flex-col items-center flex-grow">
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center justify-center gap-3">
                <SparklesIcon />
                AI Image Detector
            </h1>
            <p className="mt-3 text-lg text-gray-400 max-w-2xl">
                Is it real or is it AI? Upload an image to find out.
            </p>
        </header>

        <div className="w-full bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <ImageUploader
              previewUrl={previewUrl}
              onFileSelect={handleFileSelect}
              onClear={handleClear}
              isLoading={isLoading}
              onAnalyze={handleAnalyze}
              hasFile={!!selectedFile}
            />

            <div className="h-full flex flex-col">
                {isLoading && (
                    <div className="flex-grow flex flex-col items-center justify-center bg-gray-800 rounded-lg p-8 h-[400px]">
                        <Loader />
                        <p className="mt-4 text-gray-400 animate-pulse">Analyzing image for AI artifacts...</p>
                    </div>
                )}
                {error && (
                    <div className="flex-grow flex flex-col items-center justify-center bg-red-900/20 border border-red-500/50 rounded-lg p-8 h-[400px] text-center">
                        <h3 className="text-xl font-semibold text-red-400">Analysis Failed</h3>
                        <p className="mt-2 text-red-300">{error}</p>
                    </div>
                )}
                {!isLoading && !error && (
                    <AnalysisResultDisplay result={analysisResult} />
                )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="text-center mt-12 text-gray-500">
        <a href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/get-started/web" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-cyan-400 transition-colors">
            <GithubIcon />
            Powered by the Gemini API
        </a>
      </footer>
    </div>
  );
};

export default App;
