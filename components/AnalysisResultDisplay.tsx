
import React from 'react';
import type { AnalysisResult } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { BulbIcon } from './icons/BulbIcon';
import { SignsIcon } from './icons/SignsIcon';

interface AnalysisResultDisplayProps {
  result: AnalysisResult | null;
}

const ConfidenceMeter: React.FC<{ score: number, isAi: boolean }> = ({ score, isAi }) => {
    const colorClass = isAi ? 'from-red-500 to-orange-400' : 'from-green-500 to-emerald-400';
    const rotation = (score / 100) * 180;
    
    return (
        <div className="relative w-48 h-24 overflow-hidden mx-auto">
            <div className={`absolute top-0 left-0 w-full h-full rounded-t-full bg-gradient-to-t ${colorClass} opacity-20`}></div>
            <div 
              className={`absolute top-full left-1/2 w-1 h-24 origin-top bg-gradient-to-t ${colorClass}`} 
              style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            ></div>
            <div className="absolute inset-0 flex items-end justify-center">
                <span className="text-4xl font-bold">{score}%</span>
            </div>
             <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gray-800"></div>
        </div>
    );
};

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-gray-800 rounded-lg p-8 text-center h-[400px]">
        <h3 className="text-xl font-semibold text-gray-400">Analysis Results</h3>
        <p className="mt-2 text-gray-500">Upload an image and click "Analyze" to see the results here.</p>
      </div>
    );
  }

  const isAiGenerated = result.is_ai_generated;

  return (
    <div className={`flex-grow w-full p-6 bg-gray-800 rounded-lg border ${isAiGenerated ? 'border-red-500/30' : 'border-green-500/30'}`}>
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 text-2xl font-bold ${isAiGenerated ? 'text-red-400' : 'text-green-400'}`}>
          {isAiGenerated ? <XCircleIcon /> : <CheckCircleIcon />}
          <span>Likely {isAiGenerated ? 'AI-Generated' : 'Human-Made'}</span>
        </div>
      </div>
      
      <div className="my-4 text-center">
         <p className="text-sm text-gray-400 mb-1">Confidence</p>
         <ConfidenceMeter score={result.confidence_score} isAi={isAiGenerated} />
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <h4 className="font-semibold text-gray-300 flex items-center gap-2"><BulbIcon />Reasoning</h4>
          <p className="text-gray-400 mt-1 pl-6">{result.reasoning}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-300 flex items-center gap-2"><SignsIcon />Telltale Signs</h4>
          <ul className="list-disc list-inside space-y-1 mt-1 pl-6 text-gray-400">
            {result.telltale_signs.map((sign, index) => (
              <li key={index}>{sign}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
