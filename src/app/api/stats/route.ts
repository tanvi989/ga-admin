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

    // Optimized aggregation for all analytics
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
          ],
          dailyStats: [
            {
              $addFields: {
                dateObj: { 
                  $toDate: { $ifNull: ["$created_at", { $ifNull: ["$created", new Date()] }] }
                }
              }
            },
            {
              $match: {
                dateObj: { $gte: new Date(new Date().setUTCHours(0, 0, 0, 0) - 30 * 24 * 60 * 60 * 1000) }
              }
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$dateObj", timezone: "UTC" } },
                revenue: { $sum: { $convert: { input: { $ifNull: ["$order_total", { $ifNull: ["$total", 0] }] }, to: "double", onError: 0, onNull: 0 } } },
                orders: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          monthlyStats: [
            {
              $addFields: {
                dateObj: { 
                  $toDate: { $ifNull: ["$created_at", { $ifNull: ["$created", new Date()] }] }
                }
              }
            },
            {
              $match: {
                dateObj: { $gte: new Date(new Date().setUTCFullYear(new Date().getUTCFullYear() - 1)) }
              }
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$dateObj", timezone: "UTC" } },
                revenue: { $sum: { $convert: { input: { $ifNull: ["$order_total", { $ifNull: ["$total", 0] }] }, to: "double", onError: 0, onNull: 0 } } },
                orders: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          topProducts: [
            { $unwind: "$items" },
            {
              $group: {
                _id: { $ifNull: ["$items.skuid", "$items.product_id"] },
                name: { $first: "$items.name" },
                totalSold: { $sum: { $ifNull: ["$items.quantity", 1] } },
                revenue: { 
                  $sum: { 
                    $multiply: [
                      { $ifNull: ["$items.quantity", 1] }, 
                      { $convert: { input: { $ifNull: ["$items.price", 0] }, to: "double", onError: 0, onNull: 0 } }
                    ] 
                  } 
                }
              }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 8 }
          ]
        }
      }
    ]).toArray();

    const result = aggregationResults[0];
    const totalRevenue = result?.revenue[0]?.total || 0;
    const ordersByStatus = result?.statusCounts.reduce((acc: any, curr: any) => {
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
        ordersByStatus,
        dailyStats: result?.dailyStats || [],
        monthlyStats: result?.monthlyStats || [],
        topProducts: result?.topProducts || []
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

