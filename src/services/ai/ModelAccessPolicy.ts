import { AIModel } from '@/types';
import { AI_MODELS, AIModelConfig } from '@/config/models';
import { AIProviderId } from '@/config/providers';

export type ProviderKeySummary = {
  providerId: AIProviderId;
  hasKey: boolean;
  useForRequests: boolean;
};

export type KeyStrategy = 'app' | 'user' | 'unavailable';

export interface ModelAvailability {
  config: AIModelConfig;
  strategy: KeyStrategy;
}

interface AccessContext {
  isAuthenticated: boolean;
  providerKeySummary: ProviderKeySummary[];
}

function getProviderSummary(
  providerId: AIProviderId,
  providerKeySummary: ProviderKeySummary[]
): ProviderKeySummary | undefined {
  return providerKeySummary.find((p) => p.providerId === providerId);
}

export function getModelKeyStrategy(
  modelId: AIModel,
  { isAuthenticated, providerKeySummary }: AccessContext
): KeyStrategy {
  const config = AI_MODELS.find((m) => m.id === modelId);

  if (!config) {
    return 'unavailable';
  }

  if (!isAuthenticated) {
    return config.enabledForGuests ? 'app' : 'unavailable';
  }

  const providerInfo = getProviderSummary(config.provider, providerKeySummary);

  if (providerInfo?.hasKey && providerInfo.useForRequests) {
    return 'user';
  }

  if (config.enabledForGuests) {
    return 'app';
  }

  if (config.requiresPersonalKey) {
    return 'unavailable';
  }

  return 'app';
}

export function getAvailableModels(context: AccessContext): ModelAvailability[] {
  return AI_MODELS.map((config) => ({
    config,
    strategy: getModelKeyStrategy(config.id as AIModel, context),
  }));
}
