import React, { useState } from 'react';

interface ApiKeyInputProps {
    onSave: (apiKey: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave }) => {
    const [localApiKey, setLocalApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (localApiKey.trim()) {
            onSave(localApiKey.trim());
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                    Enter Your Gemini API Key
                </h2>
                <p className="text-gray-400 text-center mb-6 text-sm">
                    To use this application, please provide your Google Gemini API key. Your key is stored only in your browser's session storage and is not sent anywhere else.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="apiKey" className="sr-only">API Key</label>
                        <input
                            id="apiKey"
                            type="password"
                            value={localApiKey}
                            onChange={(e) => setLocalApiKey(e.target.value)}
                            placeholder="Enter your API key..."
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                            autoComplete="off"
                        />
                         <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline mt-2 inline-block">
                            Get your API key from Google AI Studio &raquo;
                        </a>
                    </div>
                    <button
                        type="submit"
                        disabled={!localApiKey.trim()}
                        className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        Save and Continue
                    </button>
                </form>
            </div>
        </div>
    );
};
