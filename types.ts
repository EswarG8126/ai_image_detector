
export interface AnalysisResult {
  is_ai_generated: boolean;
  confidence_score: number;
  reasoning: string;
  telltale_signs: string[];
}
