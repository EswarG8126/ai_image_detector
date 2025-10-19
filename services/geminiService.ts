import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    is_ai_generated: {
      type: Type.BOOLEAN,
      description: "Whether the image is determined to be AI-generated."
    },
    confidence_score: {
      type: Type.INTEGER,
      description: "A confidence score from 0 to 100 on the determination."
    },
    reasoning: {
      type: Type.STRING,
      description: "A brief, one-sentence explanation for the determination."
    },
    telltale_signs: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        description: "A specific visual artifact or clue found in the image that supports the reasoning."
      },
      description: "A list of 3-5 specific visual clues or artifacts that support the determination."
    }
  },
  required: ["is_ai_generated", "confidence_score", "reasoning", "telltale_signs"]
};


export const analyzeImageForAI = async (apiKey: string, base64Data: string, mimeType: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide your Google Gemini API key.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `You are an expert in digital image forensics, specializing in the detection of AI-generated images. Your task is to meticulously analyze the provided image for any telltale signs of AI generation.

  Examine the image for common artifacts, including but not limited to:
  - Unnatural or inconsistent textures (e.g., skin that is too smooth, waxy, or plasticky).
  - Anatomical inaccuracies (e.g., incorrect number of fingers, distorted hands, strange limbs).
  - Errors in fine details (e.g., distorted text, nonsensical patterns, jewelry that blends with skin).
  - Inconsistent lighting and shadows that do not align with a single light source.
  - Logical inconsistencies within the scene (e.g., objects merging unnaturally, impossible structures).
  - Asymmetry or strange artifacts in eyes (e.g., mismatched pupils, reflections).

  Based on your analysis, determine if the image is AI-generated. Provide your findings in a structured JSON format. Your confidence score should reflect how certain you are of your conclusion. The 'telltale_signs' should be a list of concrete, observable points from the image.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Basic validation to ensure the result matches the expected structure
    if (typeof result.is_ai_generated !== 'boolean' || typeof result.confidence_score !== 'number') {
        throw new Error("API returned an invalid data structure.");
    }

    return result as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Re-throw the original error so the UI can handle it specifically (e.g., for invalid API keys)
    throw error;
  }
};
