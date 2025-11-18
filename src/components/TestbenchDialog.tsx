'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { TestbenchScenario } from '@/types';

interface TestbenchDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (scenario: TestbenchScenario) => void;
  isGenerating: boolean;
}

export default function TestbenchDialog({
  open,
  onClose,
  onGenerate,
  isGenerating,
}: TestbenchDialogProps) {
  const [description, setDescription] = useState('');
  const [clockPeriod, setClockPeriod] = useState('');
  const [simulationTime, setSimulationTime] = useState('');

  const handleGenerate = () => {
    if (!description.trim()) return;

    const scenario: TestbenchScenario = {
      description: description.trim(),
      clockPeriod: clockPeriod.trim() || undefined,
      simulationTime: simulationTime.trim() || undefined,
    };

    onGenerate(scenario);
  };

  const handleClose = () => {
    if (!isGenerating) {
      setDescription('');
      setClockPeriod('');
      setSimulationTime('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Generate Testbench</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Test Scenario Description"
            multiline
            rows={6}
            fullWidth
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the test scenarios you want to implement (e.g., 'Test all input combinations', 'Verify counter increments on clock edge', etc.)"
            disabled={isGenerating}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Optional Parameters:
          </Typography>

          <TextField
            label="Clock Period"
            fullWidth
            value={clockPeriod}
            onChange={(e) => setClockPeriod(e.target.value)}
            placeholder="e.g., 10 ns"
            helperText="Leave empty for default (10 ns)"
            disabled={isGenerating}
          />

          <TextField
            label="Simulation Time"
            fullWidth
            value={simulationTime}
            onChange={(e) => setSimulationTime(e.target.value)}
            placeholder="e.g., 1000 ns"
            helperText="Leave empty for default (1000 ns)"
            disabled={isGenerating}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isGenerating}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={!description.trim() || isGenerating}
          startIcon={isGenerating ? <CircularProgress size={20} /> : null}
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

