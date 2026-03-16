'use client';

import {
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  Alert,
  Button,
  LinearProgress,
} from '@mui/material';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import { useAppStore } from '@/store/useAppStore';
import { Issue } from '@/types';
import { useState, useEffect, useRef } from 'react';

const severityColors = {
  critical: 'error' as const,
  high: 'error' as const,
  medium: 'warning' as const,
  low: 'info' as const,
};

const categoryColors = {
  syntax: 'error' as const,
  logic: 'warning' as const,
  style: 'info' as const,
  efficiency: 'success' as const,
};

interface ResultsPanelProps {
  showTestbench?: boolean;
}

function ElapsedTimer({ active }: { active: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!active) return;
    startRef.current = Date.now();
    setElapsed(0);
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 100);
    return () => clearInterval(id);
  }, [active]);

  const seconds = Math.floor(elapsed / 1000);
  const tenths = Math.floor((elapsed % 1000) / 100);

  return (
    <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
      {seconds}.{tenths}s
    </Typography>
  );
}

function LoadingIndicator({
  label,
  onCancel,
}: {
  label: string;
  onCancel: (() => void) | null;
}) {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="body1" fontWeight={500}>
          {label}
        </Typography>
        <ElapsedTimer active />
      </Box>
      <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
      {onCancel && (
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<StopCircleOutlinedIcon />}
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
    </Box>
  );
}

export default function ResultsPanel({ showTestbench = false }: ResultsPanelProps) {
  const {
    analysisResult,
    isAnalyzing,
    error,
    testbenchResult,
    isGeneratingTestbench,
    abortAnalysis,
    abortTestbench,
  } = useAppStore();
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    if (testbenchResult) {
      await navigator.clipboard.writeText(testbenchResult.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (testbenchResult) {
      const blob = new Blob([testbenchResult.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'testbench.vhd';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (showTestbench) {
    if (isGeneratingTestbench) {
      return <LoadingIndicator label="Generating testbench..." onCancel={abortTestbench} />;
    }

    if (!testbenchResult) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No testbench generated yet
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Generated Testbench</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" startIcon={<ContentCopyIcon />} onClick={handleCopyToClipboard}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleDownload}>
              Download
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light' }}>
          <Typography variant="body2">
            <strong>Scenario:</strong> {testbenchResult.scenario.description}
          </Typography>
          {testbenchResult.scenario.clockPeriod && (
            <Typography variant="body2">
              <strong>Clock Period:</strong> {testbenchResult.scenario.clockPeriod}
            </Typography>
          )}
          {testbenchResult.scenario.simulationTime && (
            <Typography variant="body2">
              <strong>Simulation Time:</strong> {testbenchResult.scenario.simulationTime}
            </Typography>
          )}
        </Paper>

        <Paper
          sx={{
            p: 2,
            flexGrow: 1,
            overflow: 'auto',
            bgcolor: 'grey.50',
            fontFamily: 'monospace',
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{testbenchResult.code}</pre>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (isAnalyzing) {
    return <LoadingIndicator label="Analyzing code..." onCancel={abortAnalysis} />;
  }

  if (!analysisResult) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Run analysis to see results
        </Typography>
      </Box>
    );
  }

  const groupedIssues = {
    critical: analysisResult.issues.filter((i) => i.severity === 'critical'),
    high: analysisResult.issues.filter((i) => i.severity === 'high'),
    medium: analysisResult.issues.filter((i) => i.severity === 'medium'),
    low: analysisResult.issues.filter((i) => i.severity === 'low'),
  };

  const formatLineRanges = (lines: Array<{ start: number; end: number }>) => {
    return lines
      .map((range) => (range.start === range.end ? `Line ${range.start}` : `Lines ${range.start}-${range.end}`))
      .join(', ');
  };

  const renderIssueGroup = (title: string, issues: Issue[], severity: keyof typeof severityColors) => {
    if (issues.length === 0) return null;

    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Chip label={title} color={severityColors[severity]} sx={{ mr: 1 }} />
          <Typography variant="body2">({issues.length})</Typography>
        </Box>
        <List dense>
          {issues.map((issue) => (
            <ListItem key={issue.id} sx={{ px: 0, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'center' }}>
                  <Chip label={issue.category} color={categoryColors[issue.category]} size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {formatLineRanges(issue.lines)}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {issue.description}
                </Typography>
                {issue.suggestions.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" component="div">
                      <strong>Suggestions:</strong>
                    </Typography>
                    <Box component="ul" sx={{ mt: 0.5, pl: 2, mb: 0 }}>
                      {issue.suggestions.map((suggestion, idx) => (
                        <li key={idx}>
                          <Typography variant="body2">{suggestion}</Typography>
                        </li>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Analysis Results
      </Typography>

      <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light' }}>
        <Typography variant="body2">{analysisResult.reasoning}</Typography>
      </Paper>

      {renderIssueGroup('Critical Issues', groupedIssues.critical, 'critical')}
      {renderIssueGroup('High Priority Issues', groupedIssues.high, 'high')}
      {renderIssueGroup('Medium Priority Issues', groupedIssues.medium, 'medium')}
      {renderIssueGroup('Low Priority Issues', groupedIssues.low, 'low')}

      {analysisResult.issues.length === 0 && <Alert severity="success">No issues found!</Alert>}
    </Box>
  );
}
