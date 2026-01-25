import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    
    if (!process.env.MONGO_URI) {
      return NextResponse.json(
        { success: false, error: 'MONGO_URI is not set' },
        { status: 500 }
      );
    }

    const db = await getDatabase();

    // Try to find in products collection
    let product = null;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const collectionName = collectionNames.includes('products') ? 'products' : 
                           collectionNames.includes('product') ? 'product' : 
                           collectionNames.includes('product_inventory') ? 'product_inventory' : null;

    if (collectionName) {
      try {
        product = await db.collection(collectionName).findOne({ _id: new ObjectId(productId) });
      } catch {
        // Try by skuid if ObjectId fails
        product = await db.collection(collectionName).findOne({ skuid: productId });
      }
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    
    if (!process.env.MONGO_URI) {
      return NextResponse.json(
        { success: false, error: 'MONGO_URI is not set' },
        { status: 500 }
      );
    }

    const db = await getDatabase();
    const updateData = await request.json();

    // Remove _id from update data if present
    delete updateData._id;

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const collectionName = collectionNames.includes('products') ? 'products' : 
                           collectionNames.includes('product') ? 'product' : 
                           collectionNames.includes('product_inventory') ? 'product_inventory' : null;

    let result;
    if (collectionName) {
      try {
        result = await db.collection(collectionName).updateOne(
          { _id: new ObjectId(productId) },
          { $set: updateData }
        );
        if (result.matchedCount === 0) {
          // Try by skuid
          result = await db.collection(collectionName).updateOne(
            { skuid: productId },
            { $set: updateData }
          );
        }
      } catch {
        result = await db.collection(collectionName).updateOne(
          { skuid: productId },
          { $set: updateData }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Products collection not found' },
        { status: 404 }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const updatedProduct = await db.collection(collectionName).findOne(
      { _id: new ObjectId(productId) }
    ) || await db.collection(collectionName).findOne({ skuid: productId });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    
    if (!process.env.MONGO_URI) {
      return NextResponse.json(
        { success: false, error: 'MONGO_URI is not set' },
        { status: 500 }
      );
    }

    const db = await getDatabase();

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const collectionName = collectionNames.includes('products') ? 'products' : 
                           collectionNames.includes('product') ? 'product' : 
                           collectionNames.includes('product_inventory') ? 'product_inventory' : null;

    let result;
    if (collectionName) {
      try {
        result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(productId) });
        if (result.deletedCount === 0) {
          result = await db.collection(collectionName).deleteOne({ skuid: productId });
        }
      } catch {
        result = await db.collection(collectionName).deleteOne({ skuid: productId });
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Products collection not found' },
        { status: 404 }
      );
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}