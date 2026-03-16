export type AIProviderId = 'anthropic' | 'google';

export interface AIProviderConfig {
  id: AIProviderId;
  label: string;
  docUrl: string;
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'google',
    label: 'Google (Gemini)',
    docUrl: 'https://ai.google.dev/gemini-api/docs/api-key',
  },
  {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    docUrl: 'https://docs.anthropic.com/en/api/getting-started',
  },
];

export function getProviderConfig(id: AIProviderId): AIProviderConfig | undefined {
  return AI_PROVIDERS.find((provider) => provider.id === id);
}
