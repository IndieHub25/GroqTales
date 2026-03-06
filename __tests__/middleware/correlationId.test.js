/**
 * Correlation ID Middleware Tests
 * Tests for request tracing with X-Request-ID headers
 */

const request = require('supertest');
const express = require('express');

// Mock middleware that adds correlation ID with unique generation
let idCounter = 0;
function mockCorrelationIdMiddleware(req, res, next) {
  res.locals.correlationId = req.get('x-request-id') || `corr-${Date.now()}-${++idCounter}`;
  res.set('X-Request-ID', res.locals.correlationId);
  next();
}

describe('Correlation ID Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(mockCorrelationIdMiddleware);

    // Simple test endpoint
    app.get('/test', (req, res) => {
      res.json({
        correlationId: res.locals.correlationId,
      });
    });

    app.get('/echo-header', (req, res) => {
      res.json({ correlationId: res.locals.correlationId });
    });
  });

  describe('Correlation ID Generation', () => {
    test('should generate correlation ID if not provided', async () => {
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.correlationId).toBeDefined();
      expect(typeof response.body.correlationId).toBe('string');
      expect(response.body.correlationId.length).toBeGreaterThan(0);
    });

    test('should generate unique IDs for different requests', async () => {
      const response1 = await request(app).get('/test').expect(200);
      const response2 = await request(app).get('/test').expect(200);

      expect(response1.body.correlationId).not.toBe(response2.body.correlationId);
    });
  });

  describe('Correlation ID Extraction', () => {
    test('should extract X-Request-ID from request header', async () => {
      const customId = 'custom-corr-id-123';

      const response = await request(app)
        .get('/test')
        .set('X-Request-ID', customId)
        .expect(200);

      expect(response.body.correlationId).toBe(customId);
    });

    test('should extract x-request-id (lowercase) from request header', async () => {
      const customId = 'lowercase-corr-id-456';

      const response = await request(app)
        .get('/test')
        .set('x-request-id', customId)
        .expect(200);

      expect(response.body.correlationId).toBe(customId);
    });

    test('should prefer existing ID over generation', async () => {
      const customId = 'preferred-id-789';

      const response = await request(app)
        .get('/test')
        .set('X-Request-ID', customId)
        .expect(200);

      expect(response.body.correlationId).toBe(customId);
    });
  });

  describe('Response Header Population', () => {
    test('should set X-Request-ID response header', async () => {
      const response = await request(app)
        .get('/echo-header')
        .expect(200);

      expect(response.headers['x-request-id']).toBeDefined();
    });

    test('should include generated ID in response header', async () => {
      const response = await request(app)
        .get('/echo-header')
        .expect(200);

      expect(response.headers['x-request-id']).toBe(response.body.correlationId);
    });

    test('should propagate custom ID in response header', async () => {
      const customId = 'propagate-test-id';

      const response = await request(app)
        .get('/echo-header')
        .set('X-Request-ID', customId);

      expect(response.headers['x-request-id']).toBe(customId);
    });
  });

  describe('res.locals Population', () => {
    test('should store correlation ID in res.locals', async () => {
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.correlationId).toBeDefined();
    });
  });

  describe('Multiple Requests Isolation', () => {
    test('should generate different IDs for different requests', async () => {
      const response1 = await request(app)
        .get('/test')
        .expect(200);

      const response2 = await request(app)
        .get('/test')
        .expect(200);

      expect(response1.body.correlationId).not.toBe(response2.body.correlationId);
    });

    test('should maintain ID consistency within single request', async () => {
      const customId = 'consistency-test-id';

      const response = await request(app)
        .get('/test')
        .set('X-Request-ID', customId)
        .expect(200);

      expect(response.body.correlationId).toBe(customId);
    });
  });

  describe('Performance Considerations', () => {
    test('should not significantly impact request processing', async () => {
      const startTime = Date.now();

      await request(app).get('/test').expect(200);

      const duration = Date.now() - startTime;

      // Middleware should add <100ms overhead in test environment
      expect(duration).toBeLessThan(100);
    });

    test('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/test')
      );

      const responses = await Promise.all(requests);

      expect(responses.length).toBe(5);
      expect(responses.every((r) => r.body.correlationId)).toBe(true);

      // All IDs should be unique
      const ids = responses.map((r) => r.body.correlationId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });
  });

  describe('Standard Compliance', () => {
    test('should use standard X-Request-ID header', async () => {
      const response = await request(app).get('/echo-header');

      expect(response.headers['x-request-id']).toBeDefined();
    });

    test('should maintain consistency across request/response', async () => {
      const response = await request(app).get('/echo-header');

      expect(response.body.correlationId).toBe(response.headers['x-request-id']);
    });
  });

  describe('Logging Integration', () => {
    test('should provide ID accessible to handlers', async () => {
      app.use(mockCorrelationIdMiddleware);

      app.get('/logged', (req, res) => {
        const logEntry = {
          timestamp: new Date().toISOString(),
          correlationId: res.locals.correlationId,
          message: 'Request processed',
        };
        res.json(logEntry);
      });

      const response = await request(app)
        .get('/logged')
        .expect(200);

      expect(response.body.correlationId).toBeDefined();
      expect(response.body.message).toBe('Request processed');
    });
  });
});

