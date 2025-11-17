'use client';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useAppStore } from '@/store/useAppStore';
import { AIModel } from '@/types';

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
        <MenuItem value="claude-sonnet-4.5">Claude Sonnet 4.5</MenuItem>
        <MenuItem value="gemini-2.5-pro">Gemini 2.5 Pro</MenuItem>
      </Select>
    </FormControl>
  );
}

