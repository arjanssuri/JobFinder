import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  
  // If there was an error, redirect to login with error message
  if (error || error_description) {
    const errorMsg = error_description || error || 'Unknown auth error'
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorMsg)}`, request.url)
    )
  }
  
  // Handle auth code exchange
  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = await createClient(cookieStore)
      
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(
        new URL('/auth/login?error=Failed+to+complete+authentication', request.url)
      )
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/search', request.url))
} 