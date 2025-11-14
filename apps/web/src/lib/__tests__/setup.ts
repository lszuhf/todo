import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '../../mocks/server';
import '@testing-library/jest-dom';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
