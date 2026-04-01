export type AIModelFamily = 'claude' | 'gemini';
export type AIModel = `${AIModelFamily}-${string}`;

export type KeyType = 'app' | 'user';

export interface ProviderUserKey {
  provider: 'anthropic' | 'google';
  apiKey: string;
}

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
  keyType?: KeyType;
  userKey?: ProviderUserKey;
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
  keyType?: KeyType;
  userKey?: ProviderUserKey;
}

export interface GenerateTestbenchResponse {
  success: boolean;
  result?: TestbenchResult;
  error?: string;
}

export interface HistoryEntry {
  id: string;
  type: 'analyze' | 'testbench';
  model: string;
  input: string;
  result: string;
  scenario?: string;
  clockPeriod?: string;
  simulationTime?: string;
  createdAt: string;
}

export interface HistoryListResponse {
  items: HistoryEntry[];
  total: number;
  page: number;
  totalPages: number;
}
