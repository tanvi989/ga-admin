import { MongoClient, Db } from 'mongodb';

const dbName: string = process.env.DATABASE_NAME || 'gaMultilens';

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGO_URI;
  
  if (!uri) {
    throw new Error('Please add your MONGO_URI to .env.local');
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    if (!clientPromise) {
      client = new MongoClient(uri);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getDatabase(): Promise<Db> {
  try {
    const client = await getClientPromise();
    const db = client.db(dbName);
    
    // Performance Note: Ensure the following indexes are created in your MongoDB:
    // products: { name: "text", title: "text", sku: 1, skuid: 1 }
    // orders: { created: -1, order_status: 1, payment_status: 1 }
    // accounts_login: { email: 1, international_mobile: 1 }
    
    return db;
  } catch (error: any) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export default getClientPromise;

