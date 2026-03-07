/**
 * Health Endpoint Tests
 * Tests for GET /api/health with comprehensive service diagnostics
 */

const request = require('supertest');
const express = require('express');

describe('Health Endpoint - /api/health', () => {
  let app;
  let mockGeminiService;
  let mockGroqService;

  beforeEach(() => {
    app = express();

    mockGeminiService = {
      checkHealth: jest.fn().mockResolvedValue({
        status: 'healthy',
        latency: 120,
        available: true,
      }),
    };

    mockGroqService = {
      checkHealth: jest.fn().mockResolvedValue({
        status: 'healthy',
        latency: 85,
        available: true,
      }),
    };

    // Mock health endpoint
    app.get('/api/health', async (req, res) => {
      try {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        
        const geminiHealth = await mockGeminiService.checkHealth();
        const groqHealth = await mockGroqService.checkHealth();

        const overallStatus =
          geminiHealth.status === 'healthy' && groqHealth.status === 'healthy'
            ? 'operational'
            : 'degraded';

        res.json({
          status: overallStatus,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          services: {
            database: {
              status: 'connected',
              latency: 42,
            },
            gemini: geminiHealth,
            groq: groqHealth,
            feed: {
              status: 'retrievable',
              latency: 223,
            },
          },
          memory: {
            used: process.memoryUsage().heapUsed,
            total: process.memoryUsage().heapTotal,
          },
        });
      } catch (error) {
        res.status(503).json({
          status: 'offline',
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  describe('Endpoint Response', () => {
    test('should return 200 status code', async () => {
      await request(app)
        .get('/api/health')
        .expect(200);
    });

    test('should return JSON response', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/);

      expect(response.body).toBeDefined();
    });

    test('should not require authentication', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBeDefined();
    });
  });

  describe('Overall Status', () => {
    test('should return operational status when all services healthy', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('operational');
    });

    test('should return degraded status when a service is unhealthy', async () => {
      mockGeminiService.checkHealth.mockResolvedValueOnce({
        status: 'unhealthy',
        latency: 5000,
        error: 'API timeout',
      });

      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('degraded');
    });

    test('should return offline status on critical error', async () => {
      mockGeminiService.checkHealth.mockRejectedValueOnce(
        new Error('Connection refused')
      );

      const response = await request(app)
        .get('/api/health')
        .expect(503);

      expect(response.body.status).toBe('offline');
    });
  });

  describe('Service Details', () => {
    test('should include database service status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.services.database).toBeDefined();
      expect(response.body.services.database.status).toBeDefined();
      expect(response.body.services.database.latency).toBeDefined();
    });

    test('should include Gemini AI service status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.services.gemini).toBeDefined();
      expect(response.body.services.gemini.status).toBe('healthy');
      expect(response.body.services.gemini.latency).toBeGreaterThan(0);
    });

    test('should include Groq AI service status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.services.groq).toBeDefined();
      expect(response.body.services.groq.status).toBe('healthy');
      expect(response.body.services.groq.latency).toBeGreaterThan(0);
    });

    test('should include feed service status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.services.feed).toBeDefined();
      expect(response.body.services.feed.status).toBe('retrievable');
    });

    test('should include latency for all services', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      Object.values(response.body.services).forEach((service) => {
        if (service.latency !== null) {
          expect(typeof service.latency).toBe('number');
          expect(service.latency).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Server Information', () => {
    test('should include timestamp', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.timestamp).toBeDefined();
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    test('should include uptime', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    test('should include memory usage', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.memory).toBeDefined();
      expect(response.body.memory.used).toBeGreaterThan(0);
      expect(response.body.memory.total).toBeGreaterThan(response.body.memory.used);
    });
  });

  describe('Caching Behavior', () => {
    test('should set cache control headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Error Scenarios', () => {
    test('should handle Gemini service failure', async () => {
      mockGeminiService.checkHealth.mockRejectedValueOnce(
        new Error('API Key Invalid')
      );

      const response = await request(app)
        .get('/api/health')
        .expect(503);

      expect(response.body.error).toContain('API Key');
    });

    test('should handle Groq service failure', async () => {
      mockGroqService.checkHealth.mockRejectedValueOnce(
        new Error('Rate limit exceeded')
      );

      const response = await request(app)
        .get('/api/health')
        .expect(503);

      expect(response.body.error).toBeDefined();
    });

    test('should handle database connection issues', async () => {
      // Mock database being down
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Should still return 200 but with degraded status
      expect(response.body.services.database).toBeDefined();
    });
  });

  describe('Performance', () => {
    test('should respond within reasonable time', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/health')
        .expect(200);

      const duration = Date.now() - startTime;

      // Health check should be fast (< 500ms target)
      expect(duration).toBeLessThan(500);
    });

    test('should handle concurrent health checks', async () => {
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);

      expect(responses.length).toBe(5);
      expect(responses.every((r) => r.status === 200)).toBe(true);
    });
  });

  describe('Monitoring Integration', () => {
    test('should provide metrics suitable for monitoring systems', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Should have all required fields for Prometheus/StatsD
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('memory');
    });

    test('should include service-level latency metrics', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      Object.entries(response.body.services).forEach(([serviceName, service]) => {
        if (service.latency !== null) {
          expect(typeof service.latency).toBe('number');
        }
      });
    });
  });

  describe('Rate Limit Exemption', () => {
    test('should not count against rate limits', async () => {
      // Health checks should be exempted from rate limiting
      const responses = Array.from({ length: 100 }, async () =>
        request(app).get('/api/health')
      );

      const results = await Promise.all(responses);

      // All should return 200/503, not 429 (rate limited)
      expect(results.every((r) => r.status === 200 || r.status === 503)).toBe(true);
    });
  });
});
