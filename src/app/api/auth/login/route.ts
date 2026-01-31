import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SECRET_KEY || 'default_admin_secret_key_123'
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const db = await getDatabase();

    // Ensure at least one admin exists
    const adminExists = await db.collection('admin_users').findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      await db.collection('admin_users').insertOne({
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin',
        name: 'Super Admin',
        createdAt: new Date(),
      });
    }

    // Check admin_users collection
    const user = await db.collection('admin_users').findOne({ email, password });

    if (user) {
      const token = await new SignJWT({ 
        email: user.email, 
        role: user.role,
        name: user.name
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(SECRET_KEY);

      const cookieStore = await cookies();
      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return NextResponse.json({ 
        success: true, 
        user: { email, role: 'admin', name: 'Super Admin' } 
      });
    }

    // Here you could check against MongoDB for other roles
    // const db = await getDatabase();
    // const user = await db.collection('admin_users').findOne({ email, password });
    // if (user) { ... }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
