'use client';

import { Box, Typography, Paper, Chip, List, ListItem, ListItemText, Alert } from '@mui/material';
import { useAppStore } from '@/store/useAppStore';
import { Issue } from '@/types';

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

export default function ResultsPanel() {
  const { analysisResult, isAnalyzing, error } = useAppStore();

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (isAnalyzing) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">Analyzing code...</Alert>
      </Box>
    );
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
                <Typography variant="body1" sx={{ mb: 1 }}>{issue.description}</Typography>
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
