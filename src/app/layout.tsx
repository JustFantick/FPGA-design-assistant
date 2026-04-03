'use client';

import { SessionProvider } from 'next-auth/react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';
import AppHeader from '@/components/AppHeader';
import GlobalErrorSnackbar from '@/components/GlobalErrorSnackbar';
import { MSWProvider } from '@/mocks/MSWProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MSWProvider>
          <SessionProvider>
            <AppRouterCacheProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <AppHeader />
                {children}
                <GlobalErrorSnackbar />
              </ThemeProvider>
            </AppRouterCacheProvider>
          </SessionProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
