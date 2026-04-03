import { validateAIResponse } from '@/services/ai/validation';

const validIssue = {
  description: 'Missing semicolon',
  lines: [{ start: 5, end: 5 }],
  category: 'syntax',
  severity: 'critical',
  suggestions: ['Add semicolon at end of line'],
};

describe('validateAIResponse', () => {
  it('returns null for null input', () => {
    expect(validateAIResponse(null)).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(validateAIResponse('string')).toBeNull();
    expect(validateAIResponse(42)).toBeNull();
  });

  it('returns null when issuesFound is not an array', () => {
    expect(validateAIResponse({ issuesFound: 'not-array' })).toBeNull();
    expect(validateAIResponse({ issuesFound: null })).toBeNull();
  });

  it('returns empty issuesFound when input has zero issues', () => {
    const result = validateAIResponse({ issuesFound: [] });
    expect(result).not.toBeNull();
    expect(result!.issuesFound).toHaveLength(0);
  });

  it('falls back to "Analysis completed" when reasoning is missing', () => {
    const result = validateAIResponse({ issuesFound: [] });
    expect(result!.reasoning).toBe('Analysis completed');
  });

  it('preserves reasoning when provided', () => {
    const result = validateAIResponse({ issuesFound: [], reasoning: 'No issues found.' });
    expect(result!.reasoning).toBe('No issues found.');
  });

  it('returns a valid issue unchanged', () => {
    const result = validateAIResponse({ issuesFound: [validIssue] });
    expect(result!.issuesFound).toHaveLength(1);
    expect(result!.issuesFound[0].category).toBe('syntax');
    expect(result!.issuesFound[0].severity).toBe('critical');
  });

  it('drops issue with invalid category', () => {
    const result = validateAIResponse({
      issuesFound: [{ ...validIssue, category: 'unknown' }],
    });
    expect(result!.issuesFound).toHaveLength(0);
  });

  it('drops issue with invalid severity', () => {
    const result = validateAIResponse({
      issuesFound: [{ ...validIssue, severity: 'urgent' }],
    });
    expect(result!.issuesFound).toHaveLength(0);
  });

  it('drops issue with empty description', () => {
    const result = validateAIResponse({
      issuesFound: [{ ...validIssue, description: '   ' }],
    });
    expect(result!.issuesFound).toHaveLength(0);
  });

  it('drops issue with empty lines array', () => {
    const result = validateAIResponse({
      issuesFound: [{ ...validIssue, lines: [] }],
    });
    expect(result!.issuesFound).toHaveLength(0);
  });

  it('drops issue where line.start < 1', () => {
    const result = validateAIResponse({
      issuesFound: [{ ...validIssue, lines: [{ start: 0, end: 1 }] }],
    });
    expect(result!.issuesFound).toHaveLength(0);
  });

  it('drops issue where line.end < line.start', () => {
    const result = validateAIResponse({
      issuesFound: [{ ...validIssue, lines: [{ start: 5, end: 3 }] }],
    });
    expect(result!.issuesFound).toHaveLength(0);
  });

  it('keeps valid issues and drops invalid ones from the same array', () => {
    const badIssue = { ...validIssue, category: 'invalid' };
    const result = validateAIResponse({ issuesFound: [validIssue, badIssue] });
    expect(result!.issuesFound).toHaveLength(1);
  });

  it('filters non-string values from suggestions and trims whitespace', () => {
    const result = validateAIResponse({
      issuesFound: [{ ...validIssue, suggestions: ['valid', 123, null, '  trimmed  '] }],
    });
    expect(result!.issuesFound[0].suggestions).toEqual(['valid', 'trimmed']);
  });
});
