// lib/auth-helpers.ts
import { supabase } from './supabaseClient';
import { NextRequest } from 'next/server';

export async function getUserFromRequest(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'No authorization header' };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Error verifying token:', error);
      return { user: null, error: 'Invalid token' };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Error in getUserFromRequest:', error);
    return { user: null, error: 'Authentication error' };
  }
}

export async function getUserFromHeaders(headers: Headers) {
  try {
    // Get the authorization header
    const authHeader = headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'No authorization header' };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Error verifying token:', error);
      return { user: null, error: 'Invalid token' };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Error in getUserFromHeaders:', error);
    return { user: null, error: 'Authentication error' };
  }
}
