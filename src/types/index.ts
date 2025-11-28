export type AIModel =
  | 'claude-haiku-4-5'
  | 'claude-sonnet-4-5'
  | 'claude-opus-4-1'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'gemini-3-pro-preview';

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

export interface TestbenchScenario {
  description: string;
  clockPeriod?: string;
  simulationTime?: string;
}

export interface TestbenchResult {
  code: string;
  scenario: TestbenchScenario;
  timestamp: string;
}

export interface GenerateTestbenchRequest {
  code: string;
  scenario: TestbenchScenario;
  model: AIModel;
}

export interface GenerateTestbenchResponse {
  success: boolean;
  result?: TestbenchResult;
  error?: string;
}
