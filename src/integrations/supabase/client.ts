// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vhpumxssrhitkezmrywp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocHVteHNzcmhpdGtlem1yeXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkyMDAsImV4cCI6MjA1MzIyNTIwMH0.AXnNrqigLFNBnaVfQk72ajA2GQrjhC7eG8v_b3wJJXQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);