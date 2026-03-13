import { AIProviderId } from '@/config/providers';

const STORAGE_KEY = 'fpga-ai-provider-keys-v1';

interface StoredProviderEntry {
  apiKey: string;
  useForRequests: boolean;
}

interface StoredKeyState {
  version: 1;
  providers: Record<AIProviderId, StoredProviderEntry | undefined>;
}

const DEFAULT_STATE: StoredKeyState = {
  version: 1,
  providers: {
    google: undefined,
    anthropic: undefined,
  },
};

function readState(): StoredKeyState {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_STATE;
  }

  try {
    const parsed = JSON.parse(raw) as StoredKeyState;
    if (parsed.version !== 1 || !parsed.providers) {
      return DEFAULT_STATE;
    }
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: StoredKeyState) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getProviderKey(providerId: AIProviderId): string | null {
  const state = readState();
  const entry = state.providers[providerId];
  return entry?.apiKey || null;
}

export function setProviderKey(providerId: AIProviderId, apiKey: string) {
  const state = readState();
  state.providers[providerId] = {
    apiKey,
    useForRequests: true,
  };
  writeState(state);
}

export function clearProviderKey(providerId: AIProviderId) {
  const state = readState();
  state.providers[providerId] = undefined;
  writeState(state);
}

export function setUseForRequests(providerId: AIProviderId, value: boolean) {
  const state = readState();
  const entry = state.providers[providerId];
  if (!entry) {
    return;
  }
  state.providers[providerId] = {
    ...entry,
    useForRequests: value,
  };
  writeState(state);
}

export function getSummary(): { providerId: AIProviderId; hasKey: boolean; useForRequests: boolean }[] {
  const state = readState();
  return (Object.keys(state.providers) as AIProviderId[]).map((providerId) => {
    const entry = state.providers[providerId];
    return {
      providerId,
      hasKey: Boolean(entry?.apiKey),
      useForRequests: Boolean(entry?.useForRequests && entry.apiKey),
    };
  });
}

