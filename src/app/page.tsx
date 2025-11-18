'use client';

import { useState } from 'react';
import { Box, Container, Typography, Button, Paper, AppBar, Toolbar, Tabs, Tab } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useAppStore } from '@/store/useAppStore';
import ModelSelector from '@/components/ModelSelector';
import CodeEditor from '@/components/CodeEditor';
import ResultsPanel from '@/components/ResultsPanel';
import { AnalyzeResponse } from '@/types';

export default function Home() {
  const { vhdlCode, selectedModel, setAnalysisResult, setIsAnalyzing, setError, isAnalyzing } = useAppStore();
  const [activeTab, setActiveTab] = useState(0);

  const handleAnalyze = async () => {
    if (!vhdlCode.trim()) {
      setError('Please enter VHDL code to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: vhdlCode,
          model: selectedModel,
        }),
      });

      const data: AnalyzeResponse = await response.json();

      if (data.success && data.result) {
        setAnalysisResult(data.result);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FPGA Design Assistant
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ mt: 3, mb: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ minWidth: 200 }}>
            <ModelSelector />
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  p: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">VHDL Code</Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !vhdlCode.trim()}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
                  </Button>
                </Box>
              </Box>
              <Box sx={{ flexGrow: 1, maxHeight: 'calc(100vh - 20px)' }}>
                <CodeEditor />
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                  <Tab label="Analysis Results" />
                  <Tab label="Errors" />
                </Tabs>
              </Box>
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {activeTab === 0 && <ResultsPanel />}
                {activeTab === 1 && (
                  <Box sx={{ p: 2 }}>
                    <Typography>No errors to display</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
