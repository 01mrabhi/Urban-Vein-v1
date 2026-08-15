import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { PRODUCTS } from '../../../../lib/data';

// GET: Fetch products list
export async function GET() {
  try {
    const { data: dbProducts, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !dbProducts || dbProducts.length === 0) {
      // Fallback to initial PRODUCTS list if table is empty or error occurs
      return NextResponse.json({ products: PRODUCTS, source: 'default' });
    }

    return NextResponse.json({ products: dbProducts, source: 'database' });
  } catch (err: any) {
    return NextResponse.json({ products: PRODUCTS, source: 'fallback_error', error: err.message });
  }
}

// POST: Create a new product / upcoming drop
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      price,
      description,
      image,
      image_back,
      category,
      badge,
      is_upcoming,
      launch_date,
      is_out_of_stock,
      stock_quantity
    } = body;

    if (!name || !price || !image) {
      return NextResponse.json({ error: 'Name, Price, and Front Image URL are required' }, { status: 400 });
    }

    // Format price if user enters raw number e.g. 599 -> ₹599.00
    let formattedPrice = price.toString().trim();
    if (!formattedPrice.startsWith('₹')) {
      const num = parseFloat(formattedPrice.replace(/[^\d.]/g, '')) || 0;
      formattedPrice = `₹${num.toFixed(2)}`;
    }

    let newProduct: any = {
      name,
      price: formattedPrice,
      description: description || '',
      image,
      image_back: image_back || null,
      category: category || 'Oversized Collection',
      badge: badge || (is_upcoming ? 'UPCOMING DROP' : is_out_of_stock ? 'OUT OF STOCK' : 'NEW'),
      is_upcoming: Boolean(is_upcoming),
      launch_date: launch_date || null,
      is_out_of_stock: Boolean(is_out_of_stock),
      stock_quantity: parseInt(stock_quantity || '50', 10),
    };

    let { data, error } = await supabaseAdmin
      .from('products')
      .insert(newProduct)
      .select('*')
      .single();

    if (error) {
      console.error('Error adding product to Supabase:', error);
      // Auto retry without missing optional column if column doesn't exist in Supabase DB yet
      if (error.message.includes("Could not find the '")) {
        const match = error.message.match(/Could not find the '([^']+)' column/);
        const missingCol = match ? match[1] : null;
        if (missingCol && missingCol in newProduct) {
          delete newProduct[missingCol];
          const retry = await supabaseAdmin
            .from('products')
            .insert(newProduct)
            .select('*')
            .single();

          if (!retry.error) {
            return NextResponse.json({
              success: true,
              message: `Product "${name}" added! (Run update_products.sql to enable ${missingCol})`,
              product: retry.data,
            });
          }
        }
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Product "${name}" added successfully`,
      product: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update an existing product (stock toggle, price update, upcoming launch date)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (updates.price) {
      let formattedPrice = updates.price.toString().trim();
      if (!formattedPrice.startsWith('₹')) {
        const num = parseFloat(formattedPrice.replace(/[^\d.]/g, '')) || 0;
        formattedPrice = `₹${num.toFixed(2)}`;
      }
      updates.price = formattedPrice;
    }

    let { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      // Auto retry without missing column if column doesn't exist in Supabase DB schema yet
      if (error.message.includes("Could not find the '")) {
        const match = error.message.match(/Could not find the '([^']+)' column/);
        const missingCol = match ? match[1] : null;
        if (missingCol && missingCol in updates) {
          delete updates[missingCol];
          const retry = await supabaseAdmin
            .from('products')
            .update(updates)
            .eq('id', id)
            .select('*')
            .single();

          if (!retry.error) {
            return NextResponse.json({
              success: true,
              message: `Product updated! (Run update_products.sql in Supabase to enable ${missingCol})`,
              product: retry.data,
            });
          }
        }
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Product updated successfully`,
      product: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove product from database
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted permanently',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
