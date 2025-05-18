import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Convert our frontend login format to the FastAPI OAuth2 format
    const formData = new URLSearchParams();
    formData.append('username', body.email);
    formData.append('password', body.password);
    
    // Forward the login request to our FastAPI backend
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to login' }));
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    
    // Set JWT token in cookies or return it to be stored in client-side
    const responseObj = NextResponse.json({
      success: true,
      user: data.user || null,
      token: data.access_token
    });
    
    // Set a secure cookie with the token (for production use)
    // responseObj.cookies.set('auth_token', data.access_token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 60 * 60 * 24, // 24 hours
    //   path: '/'
    // });
    
    return responseObj;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 