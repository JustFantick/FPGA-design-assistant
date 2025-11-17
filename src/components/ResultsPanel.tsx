'use client';

import {
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import { useAppStore } from '@/store/useAppStore';
import { Issue } from '@/types';

const severityColors = {
  critical: 'error' as const,
  moderate: 'warning' as const,
  low: 'info' as const,
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
    moderate: analysisResult.issues.filter((i) => i.severity === 'moderate'),
    low: analysisResult.issues.filter((i) => i.severity === 'low'),
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
            <ListItem key={issue.id} sx={{ px: 0 }}>
              <ListItemText
                primary={issue.message}
                secondary={
                  <>
                    {issue.line && `Line ${issue.line}`}
                    {issue.suggestion && (
                      <>
                        <br />
                        <strong>Suggestion:</strong> {issue.suggestion}
                      </>
                    )}
                  </>
                }
              />
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
        <Typography variant="body2">{analysisResult.summary}</Typography>
      </Paper>

      {renderIssueGroup('Critical Issues', groupedIssues.critical, 'critical')}
      {renderIssueGroup('Moderate Issues', groupedIssues.moderate, 'moderate')}
      {renderIssueGroup('Low Priority Issues', groupedIssues.low, 'low')}

      {analysisResult.issues.length === 0 && (
        <Alert severity="success">No issues found!</Alert>
      )}
    </Box>
  );
}

