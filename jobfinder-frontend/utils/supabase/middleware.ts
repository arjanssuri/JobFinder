import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

// Default values for development (use placeholders)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const createClient = (request: NextRequest) => {
    // Create an unmodified response
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Create Supabase client
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    
    // Set any auth cookies in the response if needed
    const authCookie = request.cookies.get('sb-auth')?.value;
    if (authCookie) {
        response.cookies.set('sb-auth', authCookie, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });
    }

    return { response, supabase };
};

