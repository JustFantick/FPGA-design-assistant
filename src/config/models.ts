export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'anthropic' | 'google';
  isDefault?: boolean;
  useDefaultTemperature?: boolean;
}

export const AI_MODELS: AIModelConfig[] = [
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    isDefault: true,
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
  },
  {
    id: 'claude-opus-4-1',
    name: 'Claude Opus 4.1',
    provider: 'anthropic',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    provider: 'google',
    useDefaultTemperature: true,
  },
];

export const DEFAULT_MODEL = AI_MODELS.find((m) => m.isDefault)?.id || AI_MODELS[0].id;

export function getModelConfig(id: string): AIModelConfig | undefined {
  return AI_MODELS.find((m) => m.id === id);
}
