import { createClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://bftcrexcwktyiqsermni.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_hNR05jnfp5EF3Vbduk9jnA_cywpdIOM';

// Fallbacks keep rating working even if GitHub Actions PUBLIC_* env vars are missing.
// The anon key is publishable by design and intended for frontend use.
const supabaseUrl =
	import.meta.env.PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
	import.meta.env.PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function createSupabaseBrowserClient(url: string, anonKey: string) {
	return createClient(url, anonKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
			detectSessionInUrl: false,
		},
	});
}

export const supabase = isSupabaseConfigured
	? createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
	: null;

// Community sessions are anonymous to visitors but persist per browser so RLS
// can enforce ownership and publication limits. No display name or message is
// kept in browser storage.
export const communitySupabase = isSupabaseConfigured
	? createClient(supabaseUrl, supabaseAnonKey, {
			auth: {
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: false,
				storageKey: 'cineposta-community-anon-auth',
			},
		})
	: null;
