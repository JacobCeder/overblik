import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DatabaseOverview {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseArticle {
  id: string;
  overview_id: string;
  heading: string;
  subheading: string;
  media_name: string | null;
  media_url: string | null;
  author: string;
  body: string;
  date: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}