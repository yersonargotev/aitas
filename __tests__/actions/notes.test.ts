import { renderMarkdownPreviewAction } from '@/app/actions/notes';

// Mock the dependencies
jest.mock('@/lib/shiki', () => ({
  getAppHighlighter: jest.fn().mockResolvedValue({
    codeToHtml: jest.fn().mockImplementation((code, options) => {
      return `<pre><code>${code}</code></pre>`;
    }),
  }),
}));

// Mock AI SDK v5
jest.mock('ai', () => ({
  ai: {
    generateText: jest.fn().mockResolvedValue({
      text: 'Hello',
    }),
    generateObject: jest.fn().mockResolvedValue({
      object: {
        classifications: [
          { taskId: '1', classification: 'urgent' },
          { taskId: '2', classification: 'important' }
        ]
      }
    }),
  },
}));

describe('renderMarkdownPreviewAction', () => {
  it('should render basic markdown to HTML', async () => {
    const markdown = '# Hello World\n\nThis is a **test**.';

    const result = await renderMarkdownPreviewAction(markdown);

    expect('html' in result).toBe(true);
    if ('html' in result) {
      expect(result.html).toContain('Hello World');
      expect(result.html).toContain('test');
    }
  });

  it('should handle empty markdown content', async () => {
    const markdown = '';

    const result = await renderMarkdownPreviewAction(markdown);

    expect('html' in result).toBe(true);
  });

  it('should handle code blocks with syntax highlighting', async () => {
    const markdown = '```javascript\nconst x = 1;\n```';

    const result = await renderMarkdownPreviewAction(markdown);

    expect('html' in result).toBe(true);
    if ('html' in result) {
      expect(result.html).toContain('const x = 1');
    }
  });

  it('should handle markdown with GFM features', async () => {
    const markdown = '- [x] Task 1\n- [ ] Task 2';

    const result = await renderMarkdownPreviewAction(markdown);

    expect('html' in result).toBe(true);
    if ('html' in result) {
      expect(result.html).toContain('Task 1');
      expect(result.html).toContain('Task 2');
    }
  });

  it('should handle errors gracefully', async () => {
    // Mock a failure in the markdown processing
    const { getAppHighlighter } = require('@/lib/shiki');
    getAppHighlighter.mockRejectedValueOnce(new Error('Test error'));

    const markdown = '# Test';

    const result = await renderMarkdownPreviewAction(markdown);

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Failed to render preview.');
      expect(result.details).toBe('Test error');
    }
  });

  it('should handle invalid input types', async () => {
    const markdown = null as any;

    const result = await renderMarkdownPreviewAction(markdown);

    expect('error' in result).toBe(true);
  });
});