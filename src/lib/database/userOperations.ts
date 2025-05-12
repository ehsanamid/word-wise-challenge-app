
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';

// User authentication
export const registerUser = async (username: string, email: string, password: string): Promise<number> => {
  try {
    // We no longer store passwords in the database
    const cleanPassword = ''; // Store empty password
    
    const { data, error } = await supabase
      .from('tbluser')
      .insert([{ username, email, password: cleanPassword }])
      .select('userid')
      .single();
    
    if (error) throw error;
    
    return data?.userid || -1;
  } catch (error) {
    console.error("Registration error:", error);
    return -1;
  }
};

export const loginUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // If we have a password, we're doing a legacy login
    // If no password, we're just fetching user info based on username or email
    const query = supabase
      .from('tbluser')
      .select('*');

    // Build the query based on whether username is an email or not
    if (username.includes('@')) {
      query.eq('email', username);
    } else {
      query.eq('username', username);
    }

    // Only check password if provided (legacy login)
    if (password) {
      query.eq('password', password);
    }

    const { data, error } = await query.single();
    
    if (error) {
      console.error("Login error:", error);
      return null;
    }
    
    return data as unknown as User;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};
