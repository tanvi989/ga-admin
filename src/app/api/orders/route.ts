import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || '';
    const dateRange = searchParams.get('dateRange') || '';
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

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
    
    const andFilters: any[] = [];
    
    if (status) {
      andFilters.push({
        $or: [
          { order_status: status },
          { payment_status: status }
        ]
      });
    }

    if (dateRange) {
      const now = new Date();
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      if (dateRange === 'today') {
        // Start of today in UTC
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
        // End of today in UTC
        endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      } else if (dateRange === '7days') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateRange === '30days') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else {
        // Specific date format YYYY-MM-DD
        const customDate = new Date(dateRange);
        if (!isNaN(customDate.getTime())) {
          startDate = new Date(Date.UTC(customDate.getUTCFullYear(), customDate.getUTCMonth(), customDate.getUTCDate(), 0, 0, 0, 0));
          endDate = new Date(Date.UTC(customDate.getUTCFullYear(), customDate.getUTCMonth(), customDate.getUTCDate(), 23, 59, 59, 999));
        }
      }

      if (startDate) {
        const dateQuery: any = { $gte: startDate.toISOString() };
        if (endDate) {
          dateQuery.$lte = endDate.toISOString();
        }

        andFilters.push({
          $or: [
            { created_at: dateQuery },
            { created: dateQuery },
            // Also try matching as Date objects just in case
            { created_at: { $gte: startDate, $lte: endDate || new Date() } },
            { created: { $gte: startDate, $lte: endDate || new Date() } }
          ]
        });
      }
    }

    if (search) {
      andFilters.push({
        $or: [
          { order_id: { $regex: search, $options: 'i' } },
          { user_id: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
          { customer_email: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const query = andFilters.length > 0 ? { $and: andFilters } : {};

    const collection = db.collection('orders');
    const totalCount = await collection.countDocuments(query);
    
    const orders = await collection
      .find(query)
      .sort({ created_at: -1, created: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({ 
      success: true, 
      data: orders,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

