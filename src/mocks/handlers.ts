/**
 * MSW request handlers for manual browser testing.
 *
 * By default this file exports an empty array — all requests bypass to the real server.
 * Handlers are activated at runtime from the browser console via window helpers:
 *
 *   window.mockAnalyzeError(500)      — simulate 500 on POST /api/analyze
 *   window.mockAnalyzeError(503)      — simulate 503 (service unavailable)
 *   window.mockAnalyzeError(429)      — simulate 429 (rate limit)
 *   window.mockAnalyzeError(401)      — simulate 401 (unauthorized)
 *
 *   window.mockTestbenchError(500)    — simulate 500 on POST /api/generate-testbench
 *   window.mockTestbenchError(503)
 *   window.mockTestbenchError(429)
 *   window.mockTestbenchError(401)
 *
 *   window.resetMocks()               — remove all active handlers, back to real server
 *
 * Changes take effect immediately without page reload or server restart.
 */

import { http, HttpResponse } from 'msw';
import { AnalyzeResponse, GenerateTestbenchResponse } from '@/types';

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request',
  401: 'Authentication required',
  403: 'Forbidden',
  429: 'Too many requests — rate limit exceeded',
  500: 'Internal server error',
  503: 'AI service temporarily unavailable',
  504: 'Request timed out',
};

export const analyzeErrorHandler = (status: number) =>
  http.post('/api/analyze', () =>
    HttpResponse.json<AnalyzeResponse>(
      { success: false, error: `[Mock ${status}] ${ERROR_MESSAGES[status] ?? 'Unknown error'}` },
      { status }
    )
  );

export const testbenchErrorHandler = (status: number) =>
  http.post('/api/generate-testbench', () =>
    HttpResponse.json<GenerateTestbenchResponse>(
      { success: false, error: `[Mock ${status}] ${ERROR_MESSAGES[status] ?? 'Unknown error'}` },
      { status }
    )
  );

export const handlers = [];
