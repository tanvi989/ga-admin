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
    const payments = await db.collection('payments')
      .find({})
      .sort({ _id: -1 })
      .limit(1000)
      .toArray();

    return NextResponse.json({ 
      success: true, 
      data: payments,
      count: payments.length 
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

