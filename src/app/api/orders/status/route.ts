import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection('orders');

    // Try updating by _id first, then by order_id
    let result;
    try {
      result = await collection.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { order_status: status, updated_at: new Date() } }
      );
    } catch (e) {
      // If ObjectId conversion fails, try update by order_id string
      result = await collection.updateOne(
        { order_id: orderId },
        { $set: { order_status: status, updated_at: new Date() } }
      );
    }

    if (result.matchedCount === 0) {
      // Final attempt: search by order_id if it wasn't an ObjectId
      result = await collection.updateOne(
        { order_id: orderId },
        { $set: { order_status: status, updated_at: new Date() } }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Order status updated to ${status}` 
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update status' },
      { status: 500 }
    );
  }
}
