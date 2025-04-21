
// Define custom database types to match our Supabase schema
export interface Post {
  id: string;
  encrypted_title: string;
  encrypted_content: string;
  created_at: string;
  user_id?: string;
}

export interface Profile {
  id: string;
  encrypted_full_name?: string;
  encrypted_email?: string;
  encrypted_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user' | 'analyst';
  created_at: string;
}
