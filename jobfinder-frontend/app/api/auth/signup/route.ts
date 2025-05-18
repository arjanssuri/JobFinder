import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the signup request to our FastAPI backend
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        first_name: body.firstName || "",
        last_name: body.lastName || ""
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to create account' }));
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    
    // Return the user data and token
    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name
      },
      token: data.access_token
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
} 