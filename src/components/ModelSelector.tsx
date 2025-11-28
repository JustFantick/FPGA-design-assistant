'use client';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useAppStore } from '@/store/useAppStore';
import { AIModel } from '@/types';
import { AI_MODELS } from '@/config/models';

export default function ModelSelector() {
  const { selectedModel, setSelectedModel } = useAppStore();

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
        {AI_MODELS.map((model) => (
          <MenuItem key={model.id} value={model.id}>
            {model.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

