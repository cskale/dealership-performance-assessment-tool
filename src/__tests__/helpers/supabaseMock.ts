import { vi } from 'vitest';
import { TEST_USER_ID } from './testConstants';

// Chainable query builder mock
export function createQueryBuilder(data: any = [], error: any = null) {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: Array.isArray(data) ? data[0] : data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data: Array.isArray(data) ? data[0] ?? null : data, error }),
    then: vi.fn((resolve: any) => resolve({ data, error })),
  };
  // Make builder thenable so `await supabase.from(...).select(...)` works
  builder[Symbol.toStringTag] = 'Promise';
  builder.then = (onFulfilled: any) => Promise.resolve({ data, error }).then(onFulfilled);
  builder.catch = (onRejected: any) => Promise.resolve({ data, error }).catch(onRejected);
  return builder;
}

// Auth mock with sensible defaults (authenticated test user)
export function createAuthMock(overrides?: {
  userId?: string;
  session?: any;
  authenticated?: boolean;
}) {
  const userId = overrides?.userId ?? TEST_USER_ID;
  const authenticated = overrides?.authenticated ?? true;
  const session = overrides?.session ?? (authenticated ? { user: { id: userId } } : null);

  return {
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    getSession: vi.fn(() => Promise.resolve({ data: { session } })),
    getUser: vi.fn(() => Promise.resolve({ data: { user: session?.user ?? null } })),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };
}

// Full Supabase client mock
export function createSupabaseMock(options?: {
  fromHandler?: (table: string) => any;
  authOverrides?: Parameters<typeof createAuthMock>[0];
}) {
  const auth = createAuthMock(options?.authOverrides);
  const defaultFrom = (_table: string) => createQueryBuilder();
  const from = vi.fn(options?.fromHandler ?? defaultFrom);

  return {
    supabase: { auth, from },
    auth,
    from,
  };
}

// vi.mock factory — use with vi.hoisted()
// Example:
//   const { supabaseMock } = vi.hoisted(() => ({ supabaseMock: createSupabaseMock() }));
//   vi.mock('@/integrations/supabase/client', () => ({ supabase: supabaseMock.supabase }));
