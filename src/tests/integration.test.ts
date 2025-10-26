import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';

describe('Integration Tests', () => {
  it('Health check works', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('API endpoint works', async () => {
    const response = await request(app).get('/api/v1');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('Session store works', async () => {
    const { sessionStore } = await import('../config/session.js');
    await sessionStore.set('test-key', 'test-value');
    const value = await sessionStore.get('test-key');
    expect(value).toBe('test-value');
  });

  it('Repository factory works', async () => {
    const { repositories } = await import('../config/repository.factory.js');
    expect(repositories.user).toBeDefined();
    expect(typeof repositories.user.findById).toBe('function');
  });

  it('Module loader works', async () => {
    const { ModuleLoader } = await import('../utils/module-loader.js');
    const userService = await ModuleLoader.getService('user');
    expect(userService).toBeDefined();
    expect(typeof userService.verifyToken).toBe('function');
  });
});