import { NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { Storage } from '@google-cloud/storage';

// Initialize GCS client
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});
const BUCKET_NAME = process.env.GCP_BUCKET_NAME || 'myapp-image-bucket-001';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'general';
    
    // Try GCS listing first
    try {
      if (!process.env.GCP_CLIENT_EMAIL) {
        throw new Error('GCS credentials not configured');
      }
      const [files] = await storage.bucket(BUCKET_NAME).getFiles({
        prefix: folder === 'general' ? '' : folder.endsWith('/') ? folder : `${folder}/`,
        delimiter: '/'
      });

      if (files && files.length > 0) {
        const gcsFiles = files.map(file => ({
          name: file.name.split('/').filter(Boolean).pop(),
          isDirectory: file.name.endsWith('/'),
          size: parseInt(String(file.metadata.size || '0')),
          updatedAt: file.metadata.updated || new Date().toISOString(),
          url: `https://storage.googleapis.com/${BUCKET_NAME}/${file.name}`
        })).filter(f => f.name); // Remove empty names (the folder itself)

        return NextResponse.json({ success: true, files: gcsFiles, source: 'gcs' });
      }
    } catch (gcsError: any) {
      console.warn('GCS listing failed, falling back to local:', gcsError.message);
    }

    // Fallback to local filesystem
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);

    if (!existsSync(uploadDir)) {
      return NextResponse.json({ success: true, files: [], source: 'local' });
    }

    const entries = await readdir(uploadDir, { withFileTypes: true });
    
    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = join(uploadDir, entry.name);
        const stats = await stat(fullPath);
        return {
          name: entry.name,
          isDirectory: entry.isDirectory(),
          size: stats.size,
          updatedAt: stats.mtime,
          url: entry.isDirectory() ? null : `/uploads/${folder}/${entry.name}`
        };
      })
    );

    return NextResponse.json({ success: true, files, source: 'local' });
  } catch (error: any) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list files' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try GCS upload first
    try {
      if (!process.env.GCP_CLIENT_EMAIL) {
        throw new Error('GCS credentials not configured');
      }
      const gcsFile = storage.bucket(BUCKET_NAME).file(`${folder}/${file.name}`);
      await gcsFile.save(buffer, {
        contentType: file.type,
        public: true, // Make it publicly accessible
      });

      return NextResponse.json({ 
        success: true, 
        message: 'File uploaded successfully to GCS',
        url: `https://storage.googleapis.com/${BUCKET_NAME}/${folder}/${file.name}`,
        source: 'gcs'
      });
    } catch (gcsError: any) {
      console.warn('GCS upload failed, falling back to local:', gcsError.message);
    }

    // Fallback to local upload
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    
    // Ensure the directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const path = join(uploadDir, file.name);
    await writeFile(path, buffer);
    
    console.log(`File uploaded to ${path}`);

    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully',
      url: `/uploads/${folder}/${file.name}`
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
