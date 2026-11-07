// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// *.supabase.co is often unreachable from mainland China ("Load failed" on login).
// In the browser we go through our own origin instead: /sb/* is rewritten to Supabase in next.config.ts,
// so the user's network only ever talks to this site. Server-side code keeps using the direct URL.
const browserUrl = typeof window !== 'undefined' ? `${window.location.origin}/sb` : supabaseUrl;

// supabase-js names the session key after the URL's host; pin it to the original name
// so switching to the proxy doesn't log everyone out.
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

export const supabase = createClient(browserUrl, supabaseAnonKey, {
  auth: { storageKey: `sb-${projectRef}-auth-token` },
});
