import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
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
    
    // Try to find products collection - could be 'products', 'product'
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    let products: any[] = [];
    let totalCount = 0;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { skuid: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (collectionNames.includes('products')) {
      const collection = db.collection('products');
      totalCount = await collection.countDocuments(query);
      products = await collection
        .find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    } else if (collectionNames.includes('product')) {
      const collection = db.collection('product');
      totalCount = await collection.countDocuments(query);
      products = await collection
        .find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    } else {
      // Extract products from orders (Fallback - slower)
      const orders = await db.collection('orders')
        .find({})
        .sort({ created: -1 })
        .limit(1000)
        .toArray();
      
      const productMap = new Map();
      orders.forEach((order: any) => {
        if (order.cart && Array.isArray(order.cart)) {
          order.cart.forEach((item: any) => {
            if (item.product) {
              const product = item.product.products || item.product;
              if (product && product._id) {
                if (!productMap.has(product._id)) {
                  productMap.set(product._id, {
                    ...product,
                    order_count: 0,
                    total_quantity: 0
                  });
                }
                const p = productMap.get(product._id);
                p.order_count += 1;
                p.total_quantity += (item.quantity || 1);
              }
            }
          });
        }
      });
      
      let allProducts = Array.from(productMap.values());
      
      // Apply search filter if needed
      if (search) {
        const searchLower = search.toLowerCase();
        allProducts = allProducts.filter(p => 
          (p.name && p.name.toLowerCase().includes(searchLower)) ||
          (p.title && p.title.toLowerCase().includes(searchLower)) ||
          (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
          (p.category && p.category.toLowerCase().includes(searchLower))
        );
      }
      
      totalCount = allProducts.length;
      products = allProducts.slice(skip, skip + limit);
    }

    return NextResponse.json({ 
      success: true, 
      data: products,
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
    console.error('Error fetching products:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.MONGO_URI) {
      return NextResponse.json(
        { success: false, error: 'MONGO_URI is not set' },
        { status: 500 }
      );
    }

    const db = await getDatabase();
    const productData = await request.json();

    // Remove _id if present (for new products)
    delete productData._id;

    // Validate required fields
    if (!productData.name && !productData.title) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      );
    }

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    let result;
    if (collectionNames.includes('products')) {
      result = await db.collection('products').insertOne({
        ...productData,
        created_at: new Date(),
        updated_at: new Date()
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Products collection not found' },
        { status: 404 }
      );
    }

    const newProduct = await db.collection('products').findOne({ _id: result.insertedId });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

