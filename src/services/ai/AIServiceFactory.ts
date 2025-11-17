import { AIModel } from '@/types';
import { AIService } from './AIService';
import { ClaudeService } from './ClaudeService';
import { GeminiService } from './GeminiService';

export class AIServiceFactory {
  static createService(model: AIModel): AIService {
    switch (model) {
      case 'claude-sonnet-4.5':
        return new ClaudeService();
      case 'gemini-2.5-pro':
        return new GeminiService();
      default:
        throw new Error(`Unsupported AI model: ${model}`);
    }
  }
}

