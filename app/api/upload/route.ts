import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const originalName = file.name || 'uploaded_image.jpg';
    const cleanName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '_');
    
    // Add timestamp prefix to avoid overwriting existing files
    const filename = `${Date.now()}_${cleanName}`;
    const uploadDir = path.join(process.cwd(), 'public', 'products');

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Write file to public/products
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/products/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      message: 'Image uploaded successfully to /products folder!',
    });
  } catch (err: any) {
    console.error('Error uploading product image:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload image' }, { status: 500 });
  }
}
