'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  FormControlLabel,
  Link,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { AI_PROVIDERS } from '@/config/providers';
import { useProviderKeys } from '@/hooks/useProviderKeys';

export default function ApiKeysSettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const { summary, getKey, saveKey, removeKey, setUseForRequests } = useProviderKeys();
  const [localKeys, setLocalKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    const initial: Record<string, string> = {};
    AI_PROVIDERS.forEach((provider) => {
      initial[provider.id] = getKey(provider.id) || '';
    });
    setLocalKeys(initial);
  }, [status, getKey]);

  if (status === 'loading' || status === 'unauthenticated') {
    return null;
  }

  const handleChangeKey = (providerId: string, value: string) => {
    setLocalKeys((prev) => ({
      ...prev,
      [providerId]: value,
    }));
  };

  const handleSave = (providerId: string) => {
    const value = localKeys[providerId] || '';
    saveKey(providerId as any, value);
  };

  const handleRemove = (providerId: string) => {
    removeKey(providerId as any);
    setLocalKeys((prev) => ({
      ...prev,
      [providerId]: '',
    }));
  };

  const handleToggleUse = (providerId: string, checked: boolean) => {
    setUseForRequests(providerId as any, checked);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            API Keys
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your API keys are stored only in this browser using local storage. They are never saved on our servers and
            are only used to send your requests to the AI providers through our backend.
          </Typography>
        </Box>

        <Stack spacing={2}>
          {AI_PROVIDERS.map((provider) => {
            const providerSummary = summary.find((entry) => entry.providerId === provider.id);
            const value = localKeys[provider.id] ?? '';
            const hasKey = providerSummary?.hasKey ?? Boolean(value);
            const useForRequests = providerSummary?.useForRequests ?? false;

            return (
              <Paper key={provider.id} elevation={2} sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{provider.label}</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useForRequests && hasKey}
                          onChange={(event) => handleToggleUse(provider.id, event.target.checked)}
                          disabled={!hasKey}
                        />
                      }
                      label="Use this key for requests"
                    />
                  </Box>

                  <TextField
                    type="password"
                    label="API Key"
                    fullWidth
                    value={value}
                    onChange={(event) => handleChangeKey(provider.id, event.target.value)}
                    autoComplete="off"
                  />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" gap={1}>
                      <Button variant="contained" onClick={() => handleSave(provider.id)} disabled={!value.trim()}>
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleRemove(provider.id)}
                        disabled={!hasKey}
                      >
                        Remove from this device
                      </Button>
                    </Box>
                    <Link href={provider.docUrl} target="_blank" rel="noopener noreferrer" underline="hover">
                      How to get this API key
                    </Link>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Stack>
    </Container>
  );
}
