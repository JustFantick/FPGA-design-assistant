import { GoogleGenAI } from '@google/genai';
import { AIService } from './AIService';
import { AnalysisResult, Issue, TestbenchScenario } from '@/types';
import { createVHDLAnalysisPrompt, createTestbenchGenerationPrompt } from './prompts';
import { validateAIResponse } from './validation';
import { randomUUID } from 'crypto';
import { getModelConfig } from '@/config/models';

export class GeminiService implements AIService {
  private client: GoogleGenAI;
  private modelId: string;

  constructor(modelId: string) {
    this.client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });
    this.modelId = modelId;
  }

  async analyzeVHDL(code: string): Promise<AnalysisResult> {
    const prompt = createVHDLAnalysisPrompt(code);

    const config = getModelConfig(this.modelId);
    const temperature = config?.useDefaultTemperature ? undefined : 0;

    const result = await this.client.models.generateContent({
      model: this.modelId,
      contents: prompt,
      config: {
        temperature,
      },
    });

    return this.parseResponse(result.text ?? '');
  }

  private parseResponse(response: string): AnalysisResult {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const validated = validateAIResponse(parsed);

        if (validated) {
          const issues: Issue[] = validated.issuesFound.map((issue) => ({
            id: randomUUID(),
            description: issue.description,
            lines: issue.lines,
            category: issue.category,
            severity: issue.severity,
            suggestions: issue.suggestions,
          }));

          return {
            issues,
            reasoning: validated.reasoning,
            timestamp: new Date().toISOString(),
          };
        }
      }
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
    }

    return {
      issues: [],
      reasoning: 'Failed to parse AI response. Raw output: ' + response.substring(0, 500),
      timestamp: new Date().toISOString(),
    };
  }

  async generateTestbench(code: string, scenario: TestbenchScenario): Promise<string> {
    const prompt = createTestbenchGenerationPrompt(
      code,
      scenario.description,
      scenario.clockPeriod,
      scenario.simulationTime
    );

    const config = getModelConfig(this.modelId);
    const temperature = config?.useDefaultTemperature ? undefined : 0;

    const result = await this.client.models.generateContent({
      model: this.modelId,
      contents: prompt,
      config: {
        temperature,
      },
    });

    let response = result.text ?? '';

    response = response.trim();
    response = response.replace(/^```vhdl\n?/i, '');
    response = response.replace(/\n?```$/, '');

    return response.trim();
  }

  getModelName(): string {
    return this.modelId;
  }
}
