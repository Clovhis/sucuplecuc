import { createClient } from '@supabase/supabase-js';

// Fallbacks keep rating working even if GitHub Actions PUBLIC_* env vars are missing.
// The anon key is publishable by design and intended for frontend use.
const supabaseUrl =
	import.meta.env.PUBLIC_SUPABASE_URL || 'https://bftcrexcwktyiqsermni.supabase.co';
const supabaseAnonKey =
	import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_hNR05jnfp5EF3Vbduk9jnA_cywpdIOM';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
	? createClient(supabaseUrl, supabaseAnonKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
				detectSessionInUrl: false,
			},
		})
	: null;
