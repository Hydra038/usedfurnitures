import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

// Use auth-helpers client for proper cookie-based session management
export const supabase = createClientComponentClient<Database>();

// For backwards compatibility, export the same client
export const createClient = () => createClientComponentClient<Database>();
