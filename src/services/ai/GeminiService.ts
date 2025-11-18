import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIService } from './AIService';
import { AnalysisResult, Issue, TestbenchScenario } from '@/types';
import { createVHDLAnalysisPrompt, createTestbenchGenerationPrompt } from './prompts';
import { validateAIResponse } from './validation';
import { randomUUID } from 'crypto';

export class GeminiService implements AIService {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  }

  async analyzeVHDL(code: string): Promise<AnalysisResult> {
    const model = this.client.getGenerativeModel({
      model: 'gemini-2.5-pro',
    });

    const prompt = createVHDLAnalysisPrompt(code);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0,
      },
    });
    const response = result.response.text();

    return this.parseResponse(response);
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
    const model = this.client.getGenerativeModel({
      model: 'gemini-2.5-pro',
    });

    const prompt = createTestbenchGenerationPrompt(
      code,
      scenario.description,
      scenario.clockPeriod,
      scenario.simulationTime
    );

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0,
      },
    });

    let response = result.response.text();
    
    response = response.trim();
    response = response.replace(/^```vhdl\n?/i, '');
    response = response.replace(/\n?```$/, '');
    
    return response.trim();
  }

  getModelName(): string {
    return 'Gemini 2.5 Pro';
  }
}
