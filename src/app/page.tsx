'use client';

import { Box, Container, Typography, Button, Paper, AppBar, Toolbar } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useAppStore } from '@/store/useAppStore';
import ModelSelector from '@/components/ModelSelector';
import CodeEditor from '@/components/CodeEditor';
import ResultsPanel from '@/components/ResultsPanel';
import { AnalyzeResponse } from '@/types';

export default function Home() {
  const { vhdlCode, selectedModel, setAnalysisResult, setIsAnalyzing, setError, isAnalyzing } = useAppStore();

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
          <Box sx={{ width: 300 }}>
            <ModelSelector />
          </Box>
          <Button variant="contained" size="large" onClick={handleAnalyze} disabled={isAnalyzing || !vhdlCode.trim()}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">VHDL Code</Typography>
              </Box>
              <Box sx={{ flexGrow: 1, p: 2 }}>
                <CodeEditor />
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Analysis Results</Typography>
              </Box>
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <ResultsPanel />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
