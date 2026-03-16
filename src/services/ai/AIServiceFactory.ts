import { AIModel, ProviderUserKey } from '@/types';
import { AIService } from './AIService';
import { ClaudeService } from './ClaudeService';
import { GeminiService } from './GeminiService';
import { getModelConfig } from '@/config/models';

export class AIServiceFactory {
  static createService(
    model: AIModel,
    options?: {
      keyType?: 'app' | 'user';
      userKey?: ProviderUserKey | null;
    }
  ): AIService {
    const config = getModelConfig(model);

    if (!config) {
      throw new Error(`Unsupported AI model: ${model}`);
    }

    const useUserKey = options?.keyType === 'user' && options.userKey?.apiKey;
    const apiKey = useUserKey ? options?.userKey?.apiKey : undefined;

    if (useUserKey && options?.userKey?.provider !== config.provider) {
      throw new Error('User API key provider does not match selected model provider');
    }

    switch (config.provider) {
      case 'anthropic':
        return new ClaudeService(model, apiKey);
      case 'google':
        return new GeminiService(model, apiKey);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }
}
