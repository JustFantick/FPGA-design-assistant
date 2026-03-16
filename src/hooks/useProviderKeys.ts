import { useCallback, useEffect, useState } from 'react';
import { AIProviderId } from '@/config/providers';
import {
  clearProviderKey,
  getProviderKey,
  getSummary,
  setProviderKey,
  setUseForRequests,
} from '@/services/keys/KeyManager';

export interface ProviderKeySummaryEntry {
  providerId: AIProviderId;
  hasKey: boolean;
  useForRequests: boolean;
}

export function useProviderKeys() {
  const [summary, setSummary] = useState<ProviderKeySummaryEntry[]>([]);

  useEffect(() => {
    setSummary(getSummary());
  }, []);

  const refresh = useCallback(() => {
    setSummary(getSummary());
  }, []);

  const saveKey = useCallback((providerId: AIProviderId, apiKey: string) => {
    setProviderKey(providerId, apiKey);
    refresh();
  }, [refresh]);

  const removeKey = useCallback((providerId: AIProviderId) => {
    clearProviderKey(providerId);
    refresh();
  }, [refresh]);

  const setUse = useCallback((providerId: AIProviderId, value: boolean) => {
    setUseForRequests(providerId, value);
    refresh();
  }, [refresh]);

  const getKey = useCallback((providerId: AIProviderId) => {
    return getProviderKey(providerId);
  }, []);

  return {
    summary,
    getKey,
    saveKey,
    removeKey,
    setUseForRequests: setUse,
  };
}

