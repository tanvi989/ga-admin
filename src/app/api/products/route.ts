import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const gender = searchParams.get('gender') || '';
    const sort = searchParams.get('sort') || '';
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
        { category: { $regex: search, $options: 'i' } },
        { naming_system: { $regex: search, $options: 'i' } }
      ];
    }

    if (gender) {
      query.gender = gender;
    }

    if (collectionNames.includes('products') || collectionNames.includes('product') || collectionNames.includes('product_inventory')) {
      const collectionName = collectionNames.includes('products') ? 'products' : 
                             collectionNames.includes('product') ? 'product' : 'product_inventory';
      const collection = db.collection(collectionName);
      
      // Use aggregation to deduplicate by skuid
      let sortQuery: any = { _id: -1 };
      if (sort === 'price_asc') sortQuery = { price: 1, _id: -1 };
      if (sort === 'price_desc') sortQuery = { price: -1, _id: -1 };

      const pipeline = [
        { $match: query },
        {
          $addFields: {
            price: { $convert: { input: "$price", to: "double", onError: 0, onNull: 0 } }
          }
        },
        { $sort: sortQuery },
        {
          $group: {
            _id: "$skuid",
            doc: { $first: "$$ROOT" }
          }
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: sortQuery }
      ];

      // Get total count for pagination (deduplicated)
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await collection.aggregate(countPipeline).toArray();
      totalCount = countResult[0]?.total || 0;

      // Get paginated results
      products = await collection.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limit }
      ]).toArray();
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

