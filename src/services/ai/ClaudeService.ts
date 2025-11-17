import Anthropic from '@anthropic-ai/sdk';
import { AIService } from './AIService';
import { AnalysisResult, Issue } from '@/types';

export class ClaudeService implements AIService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyzeVHDL(code: string): Promise<AnalysisResult> {
    const prompt = `Analyze the following VHDL code and provide feedback on:
1. Syntax errors
2. Logic issues
3. Style and best practices
4. Potential improvements

Format your response as JSON with this structure:
{
  "issues": [
    {
      "id": "unique-id",
      "severity": "critical|moderate|low",
      "message": "description",
      "line": line_number,
      "suggestion": "how to fix"
    }
  ],
  "summary": "overall analysis summary"
}

VHDL Code:
\`\`\`vhdl
${code}
\`\`\``;

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    return this.parseResponse(responseText);
  }

  private parseResponse(response: string): AnalysisResult {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          issues: parsed.issues || [],
          summary: parsed.summary || 'Analysis completed',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
    }

    return {
      issues: [],
      summary: response,
      timestamp: new Date().toISOString(),
    };
  }

  getModelName(): string {
    return 'Claude Sonnet 4.5';
  }
}

