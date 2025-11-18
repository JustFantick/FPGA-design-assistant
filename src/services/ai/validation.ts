import { AIAnalysisResponse, AIIssueResponse, IssueCategory, IssueSeverity } from '@/types';

const validCategories: IssueCategory[] = ['syntax', 'logic', 'style', 'efficiency'];
const validSeverities: IssueSeverity[] = ['critical', 'high', 'medium', 'low'];

export function validateAIResponse(data: any): AIAnalysisResponse | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  if (!Array.isArray(data.issuesFound)) {
    return null;
  }

  const validatedIssues: AIIssueResponse[] = [];

  for (const issue of data.issuesFound) {
    const validatedIssue = validateIssue(issue);
    if (validatedIssue) {
      validatedIssues.push(validatedIssue);
    }
  }

  return {
    issuesFound: validatedIssues,
    reasoning: typeof data.reasoning === 'string' ? data.reasoning : 'Analysis completed',
  };
}

function validateIssue(issue: any): AIIssueResponse | null {
  if (!issue || typeof issue !== 'object') {
    return null;
  }

  if (typeof issue.description !== 'string' || !issue.description.trim()) {
    return null;
  }

  if (!Array.isArray(issue.lines) || issue.lines.length === 0) {
    return null;
  }

  const validatedLines = issue.lines
    .map((line: any) => {
      if (!line || typeof line !== 'object') {
        return null;
      }
      if (typeof line.start !== 'number' || typeof line.end !== 'number') {
        return null;
      }
      if (line.start < 1 || line.end < line.start) {
        return null;
      }
      return { start: line.start, end: line.end };
    })
    .filter((line: any) => line !== null);

  if (validatedLines.length === 0) {
    return null;
  }

  if (!validCategories.includes(issue.category)) {
    return null;
  }

  if (!validSeverities.includes(issue.severity)) {
    return null;
  }

  if (!Array.isArray(issue.suggestions)) {
    return null;
  }

  const validatedSuggestions = issue.suggestions
    .filter((s: any) => typeof s === 'string' && s.trim())
    .map((s: string) => s.trim());

  return {
    description: issue.description.trim(),
    lines: validatedLines,
    category: issue.category as IssueCategory,
    severity: issue.severity as IssueSeverity,
    suggestions: validatedSuggestions,
  };
}
