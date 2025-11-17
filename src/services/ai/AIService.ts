import { AnalysisResult } from '@/types';

export interface AIService {
  analyzeVHDL(code: string): Promise<AnalysisResult>;
  getModelName(): string;
}

