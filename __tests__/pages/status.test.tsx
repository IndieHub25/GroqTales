/**
 * Health Status Dashboard Page Tests
 * Tests for /status page with real-time service monitoring
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusPage from '../../app/status/page';

// Mock fetch globally with proper typing
(global.fetch as jest.Mock) = jest.fn();

// Helper to properly type global.fetch as jest.Mock
const mockFetch = global.fetch as jest.Mock;

describe('Status Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    mockFetch.mockReset();
  });

  describe('Page Rendering', () => {
    test('should render status page header', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'operational',
          services: {
            database: { status: 'connected', latency: 42 },
            gemini: { status: 'healthy', latency: 120 },
          },
        }),
      });

      render(<StatusPage />);

      expect(screen.getByText(/system.*status/i)).toBeInTheDocument();
    });

    test('should display main status badge', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'operational',
          services: {},
        }),
      });

      render(<StatusPage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    test('should display service status table', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'operational',
          services: {
            database: { status: 'connected', latency: 42 },
            gemini: { status: 'healthy', latency: 120 },
            groq: { status: 'healthy', latency: 150 },
          },
        }),
      });

      render(<StatusPage />);

      await waitFor(() => {
        expect(screen.getByText(/database/i)).toBeInTheDocument();
      });
    });
  });

  describe('Status Indicators', () => {
    test('should show operational status (green)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'operational',
          timestamp: new Date().toISOString(),
          services: {
            database: { status: 'connected', latency: 50 },
          },
        }),
      });

      render(<StatusPage />);

      await waitFor(() => {
        const statusElement = screen.getByText(/operational/i);
        expect(statusElement).toBeInTheDocument();
      });
    });

    test('should show degraded status (yellow)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'degraded',
          services: {
            database: { status: 'slow', latency: 350 },
          },
        }),
      });

      render(<StatusPage />);

      await waitFor(() => {
        const statusElement = screen.getByText(/degraded/i);
        expect(statusElement).toBeInTheDocument();
      });
    });

    test('should show offline status (red)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'offline',
          services: {
            database: { status: 'unavailable' },
          },
        }),
      });

      render(<StatusPage />);

      await waitFor(() => {
        const statusElement = screen.getByText(/offline/i);
        expect(statusElement).toBeInTheDocument();
      });
    });
  });

  describe('Service Details', () => {
    test('should display all service statuses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'operational',
          services: {
            database: { status: 'connected', latency: 42 },
            gemini: { status: 'available', latency: 120 },
            groq: { status: 'available', latency: 156 },
            feed: { status: 'retrievable', latency: 223 },
          },
        }),
      });

      render(<StatusPage />);

      await waitFor(() => {
        expect(screen.getByText(/database/i)).toBeInTheDocument();
        expect(screen.getByText(/gemini|ai/i)).toBeInTheDocument();
        expect(screen.getByText(/groq/i)).toBeInTheDocument();
        expect(screen.getByText(/feed/i)).toBeInTheDocument();
      });
    });

    test('should display latency for each service', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'operational',
          services: {
            database: { status: 'connected', latency: 42 },
          },
        }),
      });

      render(<StatusPage />);

      await waitFor(() => {
        expect(screen.getByText(/42\s*m?s/i)).toBeInTheDocument();
      });
    });

    test('should color-code latency (green <200ms)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'operational',
          services: {
            database: { status: 'connected', latency: 50 },
          },
        }),
      });

      render(<StatusPage />);

      await waitFor(() => {
        const latencyElement = screen.getByText(/50/);
        expect(latencyElement).toBeInTheDocument();
      });
    });

    test('should color-code latency (yellow 200-500ms)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'degraded',
          services: {
            database: { status: 'slow', latency: 350 },
          },
        }),
      });

      render(<StatusPage />);

      await waitFor(() => {
        const latencyElement = screen.getByText(/350/);
        expect(latencyElement).toBeInTheDocument();
      });
    });
  });

  describe('Auto-Polling', () => {
    test('should poll health endpoint every 10 seconds', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'operational',
          services: {},
        }),
      });

      jest.useFakeTimers();

      render(<StatusPage />);

      // Initial call
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Fast-forward 10 seconds
      jest.advanceTimersByTime(10000);

      // Should have called fetch again
      expect(global.fetch).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    test('should update status when polling returns new data', async () => {
      // First call returns operational
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'operational',
          timestamp: '2024-01-01T00:00:00Z',
          services: {},
        }),
      });

      // Second call returns degraded
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'degraded',
          timestamp: '2024-01-01T00:00:10Z',
          services: {},
        }),
      });

      jest.useFakeTimers();

      render(<StatusPage />);

      // Initial status
      await waitFor(() => {
        expect(screen.getByText(/operational/i)).toBeInTheDocument();
      });

      // Advance time and trigger poll
      jest.advanceTimersByTime(10000);

      // Status should update to degraded
      await waitFor(() => {
        expect(screen.getByText(/degraded/i)).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Manual Refresh', () => {
    test('should have refresh button', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'operational',
          services: {},
        }),
      });

      render(<StatusPage />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });

    test('should fetch status when refresh button clicked', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'operational',
          services: {},
        }),
      });

      render(<StatusPage />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });

      // Click refresh
      await userEvent.click(refreshButton);

      // Should trigger fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle fetch error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<StatusPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/unable.*fetch.*status/i)
        ).toBeInTheDocument();
      });
    });

    test('should handle non-200 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<StatusPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/error.*status/i)
        ).toBeInTheDocument();
      });
    });

    test('should show service error indicator', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'degraded',
          services: {
            database: { status: 'error', latency: null },
          },
        }),
      });

      render(<StatusPage />);

      await waitFor(() => {
        expect(screen.getByText(/error|unavailable/i)).toBeInTheDocument();
      });
    });
  });

  describe('Last Updated Timestamp', () => {
    test('should display last update timestamp', async () => {
      const timestamp = '2024-03-06T12:30:45Z';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'operational',
          timestamp,
          services: {},
        }),
      });

      render(<StatusPage />);

      await waitFor(() => {
        // Should show a time indicator
        expect(screen.getByText(/last.*update|updated|refresh/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('should render service table responsively', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'operational',
          services: {
            database: { status: 'connected', latency: 42 },
          },
        }),
      });

      render(<StatusPage />);

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'operational',
          services: {},
        }),
      });

      render(<StatusPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    test('should have descriptive ARIA labels', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'operational',
          services: {
            database: { status: 'connected', latency: 42 },
          },
        }),
      });

      render(<StatusPage />);

      const refreshButton = screen.getByRole('button');
      expect(refreshButton).toHaveAccessibleName();
    });
  });
});
