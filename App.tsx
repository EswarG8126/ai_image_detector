import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResultDisplay } from './components/AnalysisResultDisplay';
import { Loader } from './components/Loader';
import { analyzeImageForAI } from './services/geminiService';
import type { AnalysisResult } from './types';
import { fileToBase64 } from './utils/fileUtils';
import { GithubIcon } from './components/icons/GithubIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ApiKeyInput } from './components/ApiKeyInput';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => sessionStorage.getItem('gemini-api-key') || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiKeySave = (key: string) => {
    sessionStorage.setItem('gemini-api-key', key);
    setApiKey(key);
  };

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
    if (!selectedFile || !apiKey) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const { base64Data, mimeType } = await fileToBase64(selectedFile);
      const result = await analyzeImageForAI(apiKey, base64Data, mimeType);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      
      if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
        setError('Your API key is invalid. Please enter a valid key.');
        sessionStorage.removeItem('gemini-api-key');
        setApiKey(''); // This will force user to re-enter key
      } else {
        setError('An error occurred during analysis: ' + errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, apiKey]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      // Don't handle paste if we are on the API key screen
      if (!apiKey) return;
      
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
  }, [handleFileSelect, apiKey]);

  if (!apiKey) {
    return <ApiKeyInput onSave={handleApiKeySave} />;
  }

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
      
      <footer className="w-full max-w-4xl mx-auto text-center mt-12 text-gray-500 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-2">
        <a href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/get-started/web" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-cyan-400 transition-colors">
            <GithubIcon />
            Powered by the Gemini API
        </a>
        <span className="hidden sm:inline">|</span>
        <button
            onClick={() => {
                sessionStorage.removeItem('gemini-api-key');
                setApiKey('');
            }}
            className="text-gray-500 hover:text-cyan-400 transition-colors underline-offset-4 hover:underline"
        >
            Change API Key
        </button>
      </footer>
    </div>
  );
};

export default App;
