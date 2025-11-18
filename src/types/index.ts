export type AIModel = 'claude-sonnet-4.5' | 'gemini-2.5-pro';

export type IssueCategory = 'syntax' | 'logic' | 'style' | 'efficiency';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface LineRange {
  start: number;
  end: number;
}

export interface Issue {
  id: string;
  description: string;
  lines: LineRange[];
  category: IssueCategory;
  severity: IssueSeverity;
  suggestions: string[];
}

export interface AIIssueResponse {
  description: string;
  lines: LineRange[];
  category: IssueCategory;
  severity: IssueSeverity;
  suggestions: string[];
}

export interface AIAnalysisResponse {
  issuesFound: AIIssueResponse[];
  reasoning: string;
}

export interface AnalysisResult {
  issues: Issue[];
  reasoning: string;
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
