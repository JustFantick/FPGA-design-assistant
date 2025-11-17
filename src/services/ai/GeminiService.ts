import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIService } from './AIService';
import { AnalysisResult } from '@/types';

export class GeminiService implements AIService {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  }

  async analyzeVHDL(code: string): Promise<AnalysisResult> {
    const model = this.client.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
    });

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

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return this.parseResponse(response);
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
      console.error('Failed to parse Gemini response:', error);
    }

    return {
      issues: [],
      summary: response,
      timestamp: new Date().toISOString(),
    };
  }

  getModelName(): string {
    return 'Gemini 2.5 Pro';
  }
}

