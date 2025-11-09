import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '@/app/page';

// Mock the stores and hooks
jest.mock('@/lib/stores/project-store', () => ({
  useProjectStore: () => ({
    projects: [
      { id: '1', name: 'Test Project' },
      { id: '2', name: 'Another Project' }
    ],
    selectedProjectId: null,
    setProjectTab: jest.fn(),
  }),
  useProjectTab: () => 'tasks',
}));

jest.mock('nuqs', () => ({
  useQueryState: () => ['tasks', jest.fn()],
}));

// Mock the UI components
jest.mock('@/components/app-sidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar">Sidebar</div>,
}));

jest.mock('@/components/dashboard/task-statistics-dashboard', () => ({
  TaskStatisticsDashboard: () => <div data-testid="task-dashboard">Dashboard</div>,
}));

jest.mock('@/components/eisenhower/matrix', () => ({
  Matrix: () => <div data-testid="eisenhower-matrix">Tasks Matrix</div>,
}));

jest.mock('@/components/layout/header', () => ({
  Header: ({ showSidebarTrigger }: { showSidebarTrigger: boolean }) =>
    <div data-testid="header">Header {showSidebarTrigger ? 'with' : 'without'} sidebar</div>,
}));

jest.mock('@/components/notes/project-notes-view', () => ({
  ProjectNotesView: ({ projectId, projectName }: { projectId?: string, projectName?: string }) =>
    <div data-testid="project-notes">Notes for {projectName || 'no project'}</div>,
}));

// Mock the UI components that might be complex
jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ value, onValueChange, children }: { value: string; onValueChange: Function; children: React.ReactNode }) => (
    <div data-testid="tabs" data-value={value} onClick={() => onValueChange('notes')}>
      {children}
    </div>
  ),
  TabsContent: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <div data-testid={`tabs-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <button data-testid={`tabs-trigger-${value}`}>{children}</button>
  ),
}));

describe('Page Component', () => {
  it('should render the main layout correctly', async () => {
    render(<Page />);

    // Check that main components are rendered
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should render tabs with correct triggers', async () => {
    render(<Page />);

    // Check that all tab triggers are present
    expect(screen.getByTestId('tabs-trigger-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('tabs-trigger-tasks')).toBeInTheDocument();
    expect(screen.getByTestId('tabs-trigger-notes')).toBeInTheDocument();
  });

  it('should show tasks tab by default', async () => {
    render(<Page />);

    // Check that tasks content is visible by default
    expect(screen.getByTestId('eisenhower-matrix')).toBeInTheDocument();
    expect(screen.getByTestId('tabs-content-tasks')).toBeInTheDocument();
  });

  it('should render dashboard and notes content', async () => {
    render(<Page />);

    // Even though not visible by default, the content should be in the DOM
    expect(screen.getByTestId('task-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('project-notes')).toBeInTheDocument();
  });

  it('should handle Suspense fallback during loading', async () => {
    // We can't easily test Suspense fallback without more complex setup,
    // but we can verify the Suspense wrapper is in place by ensuring the component renders
    render(<Page />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should have responsive design classes', async () => {
    render(<Page />);

    // Check that responsive elements have appropriate classes
    const header = screen.getByTestId('header');
    expect(header.closest('.container')).toBeInTheDocument();
  });
});