import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    // Check environment variables
    const hasMongoUri = !!process.env.MONGO_URI;
    const hasDbName = !!process.env.DATABASE_NAME;
    
    if (!hasMongoUri) {
      return NextResponse.json({
        success: false,
        error: 'MONGO_URI is not set',
        env: {
          MONGO_URI: 'NOT SET',
          DATABASE_NAME: process.env.DATABASE_NAME || 'NOT SET',
          NODE_ENV: process.env.NODE_ENV
        }
      }, { status: 500 });
    }

    // Try to connect
    const db = await getDatabase();
    
    // Test connection by listing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      database: db.databaseName,
      collections: collectionNames,
      env: {
        MONGO_URI: process.env.MONGO_URI ? 'SET (hidden)' : 'NOT SET',
        DATABASE_NAME: process.env.DATABASE_NAME || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    console.error('Connection test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      env: {
        MONGO_URI: process.env.MONGO_URI ? 'SET (hidden)' : 'NOT SET',
        DATABASE_NAME: process.env.DATABASE_NAME || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}

