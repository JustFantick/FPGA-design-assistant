import { AIModel } from '@/types';
import { AIService } from './AIService';
import { ClaudeService } from './ClaudeService';
import { GeminiService } from './GeminiService';
import { getModelConfig } from '@/config/models';

export class AIServiceFactory {
  static createService(model: AIModel): AIService {
    const config = getModelConfig(model);

    if (!config) {
      throw new Error(`Unsupported AI model: ${model}`);
    }

    switch (config.provider) {
      case 'anthropic':
        return new ClaudeService(model);
      case 'google':
        return new GeminiService(model);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }
}

