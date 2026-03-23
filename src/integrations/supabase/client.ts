import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const FALLBACK_SUPABASE_URL = 'https://xrypgosuyfdkkqafftae.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeXBnb3N1eWZka2txYWZmdGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NDYzMTgsImV4cCI6MjA2OTIyMjMxOH0.b6unq8fliuiT7Y58kAQxaM5LaqC1DVWKO5cdEADX-i0';

const getValidSupabaseUrl = () => {
  const candidates = [import.meta.env.VITE_SUPABASE_URL, FALLBACK_SUPABASE_URL];

  for (const candidate of candidates) {
    if (!candidate || candidate === 'undefined' || candidate === 'null') continue;

    try {
      const url = new URL(candidate);
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        return candidate;
      }
    } catch {
      continue;
    }
  }

  return FALLBACK_SUPABASE_URL;
};

const getValidSupabaseAnonKey = () => {
  const candidates = [
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    FALLBACK_SUPABASE_ANON_KEY,
  ];

  return candidates.find((candidate) => candidate && candidate !== 'undefined' && candidate !== 'null') ?? FALLBACK_SUPABASE_ANON_KEY;
};

const SUPABASE_URL = getValidSupabaseUrl();
const SUPABASE_ANON_KEY = getValidSupabaseAnonKey();

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
