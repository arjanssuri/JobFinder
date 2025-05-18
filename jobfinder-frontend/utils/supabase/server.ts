import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Default values for development (use placeholders)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const createClient = async (cookieStore: ReturnType<typeof cookies>) => {
    // Create the Supabase client
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    
    try {
        // Setup cookie handling (simplified for development)
        const cookieList = await cookieStore;
        const authCookie = cookieList.get('sb-auth');
        
        if (authCookie) {
            await supabase.auth.setSession({
                access_token: authCookie.value,
                refresh_token: authCookie.value,
            });
        }
    } catch (error) {
        console.error('Error setting Supabase session:', error);
    }
    
    return supabase;
};
