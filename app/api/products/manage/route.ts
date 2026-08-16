import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { supabase } from '../../../../lib/supabase';
import { PRODUCTS } from '../../../../lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Fetch products list or single product by ID (DB prioritized)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch single product by ID (prioritize Supabase DB)
      const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      const isIdUuid = UUID_REGEX.test(id);

      let dbProduct = null;

      // Try supabaseAdmin first
      try {
        let query = supabaseAdmin.from('products').select('*');
        if (isIdUuid) query = query.eq('id', id);
        else query = query.or(`original_id.eq.${id},id.eq.${id},name.eq.${id}`);
        const { data } = await query.maybeSingle();
        if (data) dbProduct = data;
      } catch (_) {}

      // Try anon supabase client if admin client returned null
      if (!dbProduct) {
        try {
          let query = supabase.from('products').select('*');
          if (isIdUuid) query = query.eq('id', id);
          else query = query.or(`original_id.eq.${id},id.eq.${id},name.eq.${id}`);
          const { data } = await query.maybeSingle();
          if (data) dbProduct = data;
        } catch (_) {}
      }

      if (dbProduct) {
        return NextResponse.json({
          product: {
            ...dbProduct,
            id: dbProduct.id || dbProduct.original_id,
            actionType: dbProduct.action_type || 'quick-add',
          },
          source: 'database',
        });
      }

      // Fallback to static PRODUCTS list if not in Supabase DB
      const localProduct = PRODUCTS.find((p) => p.id === id || p.original_id === id);
      if (localProduct) {
        return NextResponse.json({ product: localProduct, source: 'default_static' });
      }

      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch all products (prioritize Supabase DB)
    let dbProducts = null;
    let dbError = null;

    const resAdmin = await supabaseAdmin.from('products').select('*');
    if (!resAdmin.error && resAdmin.data && resAdmin.data.length > 0) {
      dbProducts = resAdmin.data;
    } else {
      dbError = resAdmin.error;
      const resAnon = await supabase.from('products').select('*');
      if (!resAnon.error && resAnon.data && resAnon.data.length > 0) {
        dbProducts = resAnon.data;
        dbError = null;
      }
    }

    if (dbProducts && dbProducts.length > 0) {
      const existingIds = new Set(dbProducts.map((p) => p.original_id || p.id));
      const missingStaticProducts = PRODUCTS.filter((p) => !existingIds.has(p.id) && !existingIds.has(p.original_id));

      const mappedProducts = [
        ...dbProducts.map((p) => ({
          ...p,
          id: p.id || p.original_id,
          actionType: p.action_type || 'quick-add',
        })),
        ...missingStaticProducts,
      ];
      return NextResponse.json({ products: mappedProducts, source: 'database_merged' });
    }

    return NextResponse.json({
      products: PRODUCTS,
      source: 'default_fallback',
      dbError: dbError ? dbError.message : 'No products found in database',
      hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    });
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
      stock_quantity,
      original_id,
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

    const cleanLaunchDate = (launch_date && typeof launch_date === 'string' && launch_date.trim() !== '') ? launch_date : null;
    const cleanImageBack = (image_back && typeof image_back === 'string' && image_back.trim() !== '') ? image_back : null;
    const cleanOriginalId = original_id ? String(original_id) : Date.now().toString();

    let newProduct: any = {
      original_id: cleanOriginalId,
      name,
      price: formattedPrice,
      description: description || '',
      image,
      image_back: cleanImageBack,
      category: category || 'Oversized Collection',
      badge: badge || (is_upcoming ? 'UPCOMING DROP' : is_out_of_stock ? 'OUT OF STOCK' : 'NEW'),
      is_upcoming: Boolean(is_upcoming),
      launch_date: cleanLaunchDate,
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

    // Sanitize empty string launch_date to null to avoid TIMESTAMPTZ syntax errors
    if ('launch_date' in updates) {
      if (!updates.launch_date || typeof updates.launch_date !== 'string' || updates.launch_date.trim() === '') {
        updates.launch_date = null;
      }
    }

    if ('image_back' in updates) {
      if (!updates.image_back || typeof updates.image_back !== 'string' || updates.image_back.trim() === '') {
        updates.image_back = null;
      }
    }

    const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const isIdUuid = UUID_REGEX.test(id.toString());

    const performUpdate = async (updatePayload: any) => {
      if (isIdUuid) {
        return await supabaseAdmin
          .from('products')
          .update(updatePayload)
          .eq('id', id)
          .select('*');
      } else {
        const matchName = updates.name || id;
        return await supabaseAdmin
          .from('products')
          .update(updatePayload)
          .or(`original_id.eq.${id},name.eq.${matchName}`)
          .select('*');
      }
    };

    let { data, error } = await performUpdate(updates);

    // Auto retry without missing column if column doesn't exist in Supabase DB schema yet
    if (error && error.message.includes("Could not find the '")) {
      const match = error.message.match(/Could not find the '([^']+)' column/);
      const missingCol = match ? match[1] : null;
      if (missingCol && missingCol in updates) {
        delete updates[missingCol];
        const retry = await performUpdate(updates);
        data = retry.data;
        error = retry.error;
      }
    }

    // If update affected 0 rows (e.g. item not yet in DB), insert it as a new DB row!
    if (!error && (!data || data.length === 0) && updates.name && updates.image) {
      const newProduct = {
        original_id: id.toString(),
        name: updates.name,
        price: updates.price || '₹499.00',
        description: updates.description || '',
        image: updates.image,
        image_back: updates.image_back || null,
        category: updates.category || 'Oversized Collection',
        badge: updates.badge || 'NEW',
        is_upcoming: Boolean(updates.is_upcoming),
        is_out_of_stock: Boolean(updates.is_out_of_stock),
      };

      const insertRes = await supabaseAdmin
        .from('products')
        .insert(newProduct)
        .select('*')
        .single();

      if (!insertRes.error) {
        return NextResponse.json({
          success: true,
          message: `Product "${updates.name}" saved to database!`,
          product: insertRes.data,
        });
      }
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Product updated successfully`,
      product: data && data[0] ? data[0] : null,
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

    const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const isIdUuid = UUID_REGEX.test(id);

    let query = supabaseAdmin.from('products').delete();
    if (isIdUuid) {
      query = query.eq('id', id);
    } else {
      query = query.or(`original_id.eq.${id},name.eq.${id}`);
    }

    const { error } = await query;

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
