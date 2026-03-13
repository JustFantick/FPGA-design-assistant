import { AIProviderId } from './providers';

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProviderId;
  isDefault?: boolean;
  useDefaultTemperature?: boolean;
  enabledForGuests?: boolean;
  requiresPersonalKey?: boolean;
}

export const AI_MODELS: AIModelConfig[] = [
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    requiresPersonalKey: true,
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    requiresPersonalKey: true,
  },
  {
    id: 'claude-opus-4-1',
    name: 'Claude Opus 4.1',
    provider: 'anthropic',
    requiresPersonalKey: true,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    enabledForGuests: true,
    isDefault: true,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    enabledForGuests: true,
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'google',
    requiresPersonalKey: true,
    useDefaultTemperature: true,
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    provider: 'google',
    requiresPersonalKey: true,
    useDefaultTemperature: true,
  },
];

export const DEFAULT_MODEL = AI_MODELS.find((m) => m.isDefault)?.id || AI_MODELS[0].id;

export function getModelConfig(id: string): AIModelConfig | undefined {
  return AI_MODELS.find((m) => m.id === id);
}
