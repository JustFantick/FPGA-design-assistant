'use client';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';
import { AIModel } from '@/types';
import { AI_MODELS } from '@/config/models';
import { useProviderKeys } from '@/hooks/useProviderKeys';
import { getAvailableModels } from '@/services/ai/ModelAccessPolicy';

export default function ModelSelector() {
  const { selectedModel, setSelectedModel } = useAppStore();
  const { status } = useSession();
  const { summary } = useProviderKeys();

  const isAuthenticated = status === 'authenticated';
  const availableModels = getAvailableModels({
    isAuthenticated,
    providerKeySummary: isAuthenticated ? summary : [],
  });

  const handleChange = (event: SelectChangeEvent<AIModel>) => {
    setSelectedModel(event.target.value as AIModel);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="model-select-label">AI Model</InputLabel>
      <Select
        labelId="model-select-label"
        id="model-select"
        value={selectedModel}
        label="AI Model"
        onChange={handleChange}
      >
        {availableModels.map(({ config, strategy }) => {
          const disabled = strategy === 'unavailable';
          let labelSuffix = '';

          if (!disabled) {
            if (strategy === 'user') {
              labelSuffix = ' (Your key)';
            } else if (strategy === 'app' && !config.enabledForGuests) {
              labelSuffix = ' (App key)';
            }
          }

          return (
            <MenuItem key={config.id} value={config.id} disabled={disabled}>
              {config.name}
              {labelSuffix}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
