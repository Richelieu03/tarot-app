// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log("👉 [自查日志] Supabase URL:", supabaseUrl);
console.log("👉 [自查日志] Supabase Key 是否读到:", supabaseAnonKey ? "读到了！ ✅" : "没读到 (undefined) ❌");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

