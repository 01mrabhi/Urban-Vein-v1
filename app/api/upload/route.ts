import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
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
    const filename = `${Date.now()}_${cleanName}`;
    const mimeType = file.type || 'image/jpeg';

    // 1. Try uploading to Supabase Storage ('products' bucket)
    try {
      if (supabaseAdmin && supabaseAdmin.storage) {
        // Attempt to create bucket if it doesn't exist
        try {
          await supabaseAdmin.storage.createBucket('products', { public: true });
        } catch (_) {
          // Ignore if bucket already exists
        }

        const { data, error } = await supabaseAdmin.storage
          .from('products')
          .upload(filename, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from('products')
            .getPublicUrl(filename);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: publicUrlData.publicUrl,
              filename,
              storage: 'supabase',
              message: 'Image uploaded successfully to Supabase Cloud Storage!',
            });
          }
        } else {
          console.warn('Supabase storage upload returned error:', error?.message);
        }
      }
    } catch (supaErr: any) {
      console.warn('Supabase storage exception:', supaErr?.message);
    }

    // 2. Try Local File System (only if local development environment)
    if (process.env.NODE_ENV === 'development') {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'products');
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        return NextResponse.json({
          success: true,
          url: `/products/${filename}`,
          filename,
          storage: 'local_disk',
          message: 'Image saved to local /public/products folder!',
        });
      } catch (localErr: any) {
        console.warn('Local FS upload failed:', localErr?.message);
      }
    }

    // 3. Ultimate Serverless Fallback: Return Base64 Data URL
    // Works 100% on Vercel read-only filesystem without external storage setup
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename,
      storage: 'base64_data_url',
      message: 'Image processed successfully!',
    });
  } catch (err: any) {
    console.error('Error in upload route:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload image' }, { status: 500 });
  }
}
