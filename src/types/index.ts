export type AIModel = 'claude-sonnet-4.5' | 'gemini-2.5-pro';

export interface Issue {
  id: string;
  severity: 'critical' | 'moderate' | 'low';
  message: string;
  line?: number;
  suggestion?: string;
}

export interface AnalysisResult {
  issues: Issue[];
  summary: string;
  timestamp: string;
}

export interface AnalyzeRequest {
  code: string;
  model: AIModel;
}

export interface AnalyzeResponse {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
}

