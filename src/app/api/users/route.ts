import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    // Check environment variable first
    if (!process.env.MONGO_URI) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'MONGO_URI is not set in environment variables. Please check your .env.local file.' 
        },
        { status: 500 }
      );
    }

    const db = await getDatabase();
    const users = await db.collection('accounts_login')
      .find({})
      .sort({ _id: -1 })
      .limit(1000)
      .toArray();

    return NextResponse.json({ 
      success: true, 
      data: users,
      count: users.length 
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

