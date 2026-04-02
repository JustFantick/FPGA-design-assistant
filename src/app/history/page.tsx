'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { HistoryEntry, HistoryListResponse, AnalysisResult, Issue } from '@/types';
import { AI_MODELS } from '@/config/models';

const severityColors = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'info',
} as const;

const categoryColors = {
  syntax: 'error',
  logic: 'warning',
  style: 'info',
  efficiency: 'success',
} as const;

function getModelName(modelId: string): string {
  return AI_MODELS.find((m) => m.id === modelId)?.name || modelId;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function truncateCode(code: string, max = 80): string {
  const line = code.split('\n')[0] || '';
  return line.length > max ? line.slice(0, max) + '...' : line;
}

function AnalyzeDetail({ entry }: { entry: HistoryEntry }) {
  let parsed: AnalysisResult | null = null;
  try {
    parsed = JSON.parse(entry.result);
  } catch {
    return <Typography color="error">Failed to parse analysis result</Typography>;
  }
  if (!parsed) return null;

  const groupedIssues = {
    critical: parsed.issues.filter((i) => i.severity === 'critical'),
    high: parsed.issues.filter((i) => i.severity === 'high'),
    medium: parsed.issues.filter((i) => i.severity === 'medium'),
    low: parsed.issues.filter((i) => i.severity === 'low'),
  };

  const formatLineRanges = (lines: Array<{ start: number; end: number }>) =>
    lines.map((r) => (r.start === r.end ? `Line ${r.start}` : `Lines ${r.start}-${r.end}`)).join(', ');

  const renderIssueGroup = (title: string, issues: Issue[], severity: keyof typeof severityColors) => {
    if (issues.length === 0) return null;
    return (
      <Paper sx={{ p: 2, mb: 2 }} key={severity}>
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
                      {issue.suggestions.map((s, idx) => (
                        <li key={idx}>
                          <Typography variant="body2">{s}</Typography>
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
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Analysis Results
      </Typography>
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light' }}>
        <Typography variant="body2">{parsed.reasoning}</Typography>
      </Paper>
      {renderIssueGroup('Critical Issues', groupedIssues.critical, 'critical')}
      {renderIssueGroup('High Priority Issues', groupedIssues.high, 'high')}
      {renderIssueGroup('Medium Priority Issues', groupedIssues.medium, 'medium')}
      {renderIssueGroup('Low Priority Issues', groupedIssues.low, 'low')}
      {parsed.issues.length === 0 && <Alert severity="success">No issues found!</Alert>}
    </Box>
  );
}

function TestbenchDetail({ entry }: { entry: HistoryEntry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(entry.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([entry.result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'testbench.vhd';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Testbench Result
      </Typography>
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light' }}>
        <Typography variant="body2">
          <strong>Scenario:</strong> {entry.scenario}
        </Typography>
        {entry.clockPeriod && (
          <Typography variant="body2">
            <strong>Clock Period:</strong> {entry.clockPeriod}
          </Typography>
        )}
        {entry.simulationTime && (
          <Typography variant="body2">
            <strong>Simulation Time:</strong> {entry.simulationTime}
          </Typography>
        )}
      </Paper>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Button variant="outlined" size="small" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleDownload}>
          Download
        </Button>
      </Box>
      <Paper sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{entry.result}</pre>
      </Paper>
    </Box>
  );
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');

  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [clearAllDialog, setClearAllDialog] = useState(false);
  const [copiedInputId, setCopiedInputId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (modelFilter !== 'all') params.set('model', modelFilter);

      const res = await fetch(`/api/history?${params}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data: HistoryListResponse = await res.json();
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, modelFilter]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory();
    }
  }, [status, fetchHistory]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, modelFilter]);

  const handleDelete = async (id: string) => {
    setDeleteDialogId(null);
    try {
      const res = await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      fetchHistory();
    } catch {
      setError('Failed to delete entry');
    }
  };

  const handleClearAll = async () => {
    setClearAllDialog(false);
    try {
      const res = await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) throw new Error();
      fetchHistory();
    } catch {
      setError('Failed to clear history');
    }
  };

  const handleCopyInput = async (entry: HistoryEntry) => {
    await navigator.clipboard.writeText(entry.input);
    setCopiedInputId(entry.id);
    setTimeout(() => setCopiedInputId(null), 2000);
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) return null;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => router.push('/')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Request History
        </Typography>
        {total > 0 && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteSweepIcon />}
            onClick={() => setClearAllDialog(true)}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="analyze">Analyze</MenuItem>
            <MenuItem value="testbench">Testbench</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Model</InputLabel>
          <Select value={modelFilter} label="Model" onChange={(e) => setModelFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {AI_MODELS.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No history entries found</Typography>
        </Paper>
      ) : (
        <>
          {items.map((entry) => (
            <Accordion key={entry.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', mr: 1 }}>
                  <Chip
                    label={entry.type === 'analyze' ? 'Analyze' : 'Testbench'}
                    color={entry.type === 'analyze' ? 'primary' : 'secondary'}
                    size="small"
                  />
                  <Chip label={getModelName(entry.model)} variant="outlined" size="small" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {truncateCode(entry.input)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {formatDate(entry.createdAt)}
                  </Typography>
                  <Tooltip title="Delete">
                    <IconButton
                      component="div"
                      size="small"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setDeleteDialogId(entry.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2">Input Code</Typography>
                    <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => handleCopyInput(entry)}>
                      {copiedInputId === entry.id ? 'Copied!' : 'Copy'}
                    </Button>
                  </Box>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace', maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{entry.input}</pre>
                  </Paper>
                </Box>
                {entry.type === 'analyze' ? <AnalyzeDetail entry={entry} /> : <TestbenchDetail entry={entry} />}
              </AccordionDetails>
            </Accordion>
          ))}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
            </Box>
          )}
        </>
      )}

      <Dialog open={!!deleteDialogId} onClose={() => setDeleteDialogId(null)}>
        <DialogTitle>Delete entry?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogId(null)}>Cancel</Button>
          <Button color="error" onClick={() => deleteDialogId && handleDelete(deleteDialogId)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={clearAllDialog} onClose={() => setClearAllDialog(false)}>
        <DialogTitle>Clear all history?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete all {total} entries. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearAllDialog(false)}>Cancel</Button>
          <Button color="error" onClick={handleClearAll}>
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
