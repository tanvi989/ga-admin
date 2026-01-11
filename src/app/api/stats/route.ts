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
    
    // Get collections to check what exists
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Count products - try different collection names
    let productsCount = 0;
    if (collectionNames.includes('products')) {
      productsCount = await db.collection('products').countDocuments({});
    } else if (collectionNames.includes('product')) {
      productsCount = await db.collection('product').countDocuments({});
    } else {
      // Count unique products from orders
      const orders = await db.collection('orders').find({}).toArray();
      const productSet = new Set();
      orders.forEach((order: any) => {
        if (order.cart && Array.isArray(order.cart)) {
          order.cart.forEach((item: any) => {
            if (item.product) {
              const product = item.product.products || item.product;
              if (product && product._id) {
                productSet.add(product._id);
              }
            }
          });
        }
      });
      productsCount = productSet.size;
    }
    
    const [ordersCount, usersCount, paymentsCount] = await Promise.all([
      db.collection('orders').countDocuments({}),
      db.collection('accounts_login').countDocuments({}),
      db.collection('payments').countDocuments({})
    ]);

    // Optimized aggregation for total revenue and status counts
    const aggregationResults = await db.collection('orders').aggregate([
      {
        $facet: {
          revenue: [
            {
              $group: {
                _id: null,
                total: { 
                  $sum: { 
                    $convert: { 
                      input: { $ifNull: ["$order_total", { $ifNull: ["$total", 0] }] }, 
                      to: "double",
                      onError: 0.0,
                      onNull: 0.0
                    } 
                  } 
                }
              }
            }
          ],
          statusCounts: [
            {
              $group: {
                _id: { $ifNull: ["$payment_status", { $ifNull: ["$order_status", "unknown"] }] },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]).toArray();

    const totalRevenue = aggregationResults[0]?.revenue[0]?.total || 0;
    const ordersByStatus = aggregationResults[0]?.statusCounts.reduce((acc: any, curr: any) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return NextResponse.json({ 
      success: true, 
      data: {
        productsCount,
        ordersCount,
        usersCount,
        paymentsCount,
        totalRevenue: totalRevenue.toFixed(2),
        ordersByStatus
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

