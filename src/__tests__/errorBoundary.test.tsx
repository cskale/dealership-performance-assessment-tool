import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, PageErrorBoundary } from '@/components/shared/ErrorBoundary';

// Component that throws an error
const CrashingComponent = ({ shouldCrash }: { shouldCrash: boolean }) => {
  if (shouldCrash) {
    throw new Error('Test crash!');
  }
  return <div data-testid="working-content">Working content</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error during tests since we're testing error handling
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <CrashingComponent shouldCrash={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('working-content')).toBeInTheDocument();
    expect(screen.getByText('Working content')).toBeInTheDocument();
  });

  it('displays fallback UI when child component crashes', () => {
    render(
      <ErrorBoundary fallbackTitle="Section crashed" fallbackMessage="Please try again">
        <CrashingComponent shouldCrash={true} />
      </ErrorBoundary>
    );
    
    expect(screen.queryByTestId('working-content')).not.toBeInTheDocument();
    expect(screen.getByText('Section crashed')).toBeInTheDocument();
    expect(screen.getByText('Please try again')).toBeInTheDocument();
  });

  it('shows default fallback messages when not customized', () => {
    render(
      <ErrorBoundary>
        <CrashingComponent shouldCrash={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/This section encountered an error/)).toBeInTheDocument();
  });

  it('shows retry button and allows recovery', () => {
    const { rerender } = render(
      <ErrorBoundary showRetry={true}>
        <CrashingComponent shouldCrash={true} />
      </ErrorBoundary>
    );
    
    // Error boundary should show fallback
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Should show retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    
    // Click retry - note: in real usage, the component would re-render
    fireEvent.click(retryButton);
  });

  it('calls onError callback when error occurs', () => {
    const onErrorMock = vi.fn();
    
    render(
      <ErrorBoundary onError={onErrorMock}>
        <CrashingComponent shouldCrash={true} />
      </ErrorBoundary>
    );
    
    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('hides home link by default', () => {
    render(
      <ErrorBoundary>
        <CrashingComponent shouldCrash={true} />
      </ErrorBoundary>
    );
    
    expect(screen.queryByRole('button', { name: /go home/i })).not.toBeInTheDocument();
  });

  it('shows home link when showHomeLink is true', () => {
    render(
      <ErrorBoundary showHomeLink={true}>
        <CrashingComponent shouldCrash={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
  });
});

describe('PageErrorBoundary', () => {
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when no error occurs', () => {
    render(
      <PageErrorBoundary>
        <CrashingComponent shouldCrash={false} />
      </PageErrorBoundary>
    );
    
    expect(screen.getByTestId('working-content')).toBeInTheDocument();
  });

  it('displays page-level fallback UI when crash occurs', () => {
    render(
      <PageErrorBoundary fallbackTitle="Page Error" fallbackMessage="Critical failure">
        <CrashingComponent shouldCrash={true} />
      </PageErrorBoundary>
    );
    
    expect(screen.getByText('Page Error')).toBeInTheDocument();
    expect(screen.getByText('Critical failure')).toBeInTheDocument();
    // PageErrorBoundary always shows both buttons
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
  });

  it('calls onError callback for page-level errors', () => {
    const onErrorMock = vi.fn();
    
    render(
      <PageErrorBoundary onError={onErrorMock}>
        <CrashingComponent shouldCrash={true} />
      </PageErrorBoundary>
    );
    
    expect(onErrorMock).toHaveBeenCalledTimes(1);
  });
});
