/**
 * Initializes MSW (Mock Service Worker) in development only.
 * The worker starts with no active handlers — all requests go to the real server.
 *
 * Use these commands in the browser console to mock specific routes:
 *
 *   window.mockAnalyzeError(500)    — mock POST /api/analyze with a 500 error
 *   window.mockTestbenchError(503)  — mock POST /api/generate-testbench with 503
 *   window.resetMocks()             — clear all mocks, back to real server
 *
 * Available status codes: 400, 401, 403, 429, 500, 503, 504
 */

'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(process.env.NODE_ENV !== 'development');

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    import('./browser').then(({ worker }) => {
      import('./handlers').then(({ analyzeErrorHandler, testbenchErrorHandler }) => {
        worker.start({ onUnhandledRequest: 'bypass' }).then(() => {
          (window as any).mockAnalyzeError = (status: number) => {
            worker.use(analyzeErrorHandler(status));
            console.info(`[MSW] /api/analyze will return ${status}`);
          };

          (window as any).mockTestbenchError = (status: number) => {
            worker.use(testbenchErrorHandler(status));
            console.info(`[MSW] /api/generate-testbench will return ${status}`);
          };

          (window as any).resetMocks = () => {
            worker.resetHandlers();
            console.info('[MSW] All handlers reset — requests go to real server');
          };

          setReady(true);
        });
      });
    });
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
