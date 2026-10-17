import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '../route';
import { headers } from 'next/headers';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

describe('Maintenance Cron Job Endpoint (T08.03 / P-003)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('rejects unauthenticated requests with 401 when CRON_SECRET is missing', async () => {
    delete process.env.CRON_SECRET;
    (headers as any).mockResolvedValue(new Headers());

    const req = new Request('http://localhost:3000/api/cron/maintenance');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('UNAUTHORIZED_CRON');
  });

  it('rejects requests with invalid bearer token with 401', async () => {
    process.env.CRON_SECRET = 'super-secret-cron-token-123';
    const mockHeaders = new Headers({
      authorization: 'Bearer wrong-token',
    });
    (headers as any).mockResolvedValue(mockHeaders);

    const req = new Request('http://localhost:3000/api/cron/maintenance');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('UNAUTHORIZED_CRON');
  });

  it('executes purge and returns 200 with audit details on valid GET request', async () => {
    process.env.CRON_SECRET = 'valid-test-secret-cron';
    const mockHeaders = new Headers({
      authorization: 'Bearer valid-test-secret-cron',
    });
    (headers as any).mockResolvedValue(mockHeaders);

    const req = new Request('http://localhost:3000/api/cron/maintenance');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.action).toBe('purge_contact_messages');
    expect(body.retentionMonths).toBe(24);
    expect(typeof body.purgedMessages).toBe('number');
    expect(body.cutoffDate).toBeDefined();
  });

  it('supports POST trigger as well with valid authorization', async () => {
    process.env.CRON_SECRET = 'valid-test-secret-cron';
    const mockHeaders = new Headers({
      authorization: 'Bearer valid-test-secret-cron',
    });
    (headers as any).mockResolvedValue(mockHeaders);

    const req = new Request('http://localhost:3000/api/cron/maintenance', { method: 'POST' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.purgedMessages).toBeDefined();
  });
});
