import { AnalysisResult, TestbenchScenario } from '@/types';

export interface AIService {
  analyzeVHDL(code: string): Promise<AnalysisResult>;
  generateTestbench(code: string, scenario: TestbenchScenario): Promise<string>;
  getModelName(): string;
}

