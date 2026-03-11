import { AnalysisResult, TestbenchScenario } from '@/types';

export interface AIService {
  analyzeVHDL(code: string, signal?: AbortSignal): Promise<AnalysisResult>;
  generateTestbench(code: string, scenario: TestbenchScenario, signal?: AbortSignal): Promise<string>;
  getModelName(): string;
}
