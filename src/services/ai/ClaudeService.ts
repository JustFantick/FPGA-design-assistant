import Anthropic from '@anthropic-ai/sdk';
import { AIService } from './AIService';
import { AnalysisResult, Issue } from '@/types';
import { createVHDLAnalysisPrompt } from './prompts';
import { validateAIResponse } from './validation';
import { randomUUID } from 'crypto';

export class ClaudeService implements AIService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyzeVHDL(code: string): Promise<AnalysisResult> {
    const prompt = createVHDLAnalysisPrompt(code);

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8192,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    return this.parseResponse(responseText);
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
      console.error('Failed to parse Claude response:', error);
    }

    return {
      issues: [],
      reasoning: 'Failed to parse AI response. Raw output: ' + response.substring(0, 500),
      timestamp: new Date().toISOString(),
    };
  }

  getModelName(): string {
    return 'Claude Sonnet 4.5';
  }
}
