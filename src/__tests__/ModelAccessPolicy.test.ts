import { getModelKeyStrategy, ProviderKeySummary } from '@/services/ai/ModelAccessPolicy';
import type { AIModel } from '@/types';

const noKeys: ProviderKeySummary[] = [
  { providerId: 'google', hasKey: false, useForRequests: false },
  { providerId: 'anthropic', hasKey: false, useForRequests: false },
];

const googleKeyActive: ProviderKeySummary[] = [
  { providerId: 'google', hasKey: true, useForRequests: true },
  { providerId: 'anthropic', hasKey: false, useForRequests: false },
];

const anthropicKeyActive: ProviderKeySummary[] = [
  { providerId: 'google', hasKey: false, useForRequests: false },
  { providerId: 'anthropic', hasKey: true, useForRequests: true },
];

const anthropicKeyInactive: ProviderKeySummary[] = [
  { providerId: 'google', hasKey: false, useForRequests: false },
  { providerId: 'anthropic', hasKey: true, useForRequests: false },
];

describe('getModelKeyStrategy', () => {
  it('returns unavailable for unknown model id', () => {
    expect(
      getModelKeyStrategy('unknown-model' as AIModel, { isAuthenticated: false, providerKeySummary: noKeys })
    ).toBe('unavailable');
  });

  describe('unauthenticated (guest)', () => {
    it('returns app for guest-enabled model', () => {
      expect(getModelKeyStrategy('gemini-2.5-flash', { isAuthenticated: false, providerKeySummary: noKeys })).toBe(
        'app'
      );
    });

    it('returns unavailable for model requiring personal key', () => {
      expect(getModelKeyStrategy('claude-haiku-4-5', { isAuthenticated: false, providerKeySummary: noKeys })).toBe(
        'unavailable'
      );
    });
  });

  describe('authenticated', () => {
    it('returns user when the matching provider key is active', () => {
      expect(
        getModelKeyStrategy('gemini-2.5-flash', { isAuthenticated: true, providerKeySummary: googleKeyActive })
      ).toBe('user');
    });

    it('returns user when anthropic key is active and model is claude', () => {
      expect(
        getModelKeyStrategy('claude-haiku-4-5', { isAuthenticated: true, providerKeySummary: anthropicKeyActive })
      ).toBe('user');
    });

    it('returns app for guest-enabled model when no key is configured', () => {
      expect(getModelKeyStrategy('gemini-2.5-flash', { isAuthenticated: true, providerKeySummary: noKeys })).toBe(
        'app'
      );
    });

    it('returns unavailable for requiresPersonalKey model when no key is configured', () => {
      expect(getModelKeyStrategy('claude-haiku-4-5', { isAuthenticated: true, providerKeySummary: noKeys })).toBe(
        'unavailable'
      );
    });

    it('returns unavailable when key exists but useForRequests is false', () => {
      expect(
        getModelKeyStrategy('claude-haiku-4-5', { isAuthenticated: true, providerKeySummary: anthropicKeyInactive })
      ).toBe('unavailable');
    });
  });
});
