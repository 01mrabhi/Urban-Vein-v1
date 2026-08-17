import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { supabase } from '../../../../lib/supabase';
import { CATEGORIES } from '../../../../lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Fetch all active categories
export async function GET() {
  try {
    let dbCategories: string[] = [];

    // Try supabaseAdmin first
    try {
      const { data } = await supabaseAdmin.from('products').select('category');
      if (data) {
        dbCategories = data.map((p) => p.category).filter(Boolean);
      }
    } catch (_) {
      try {
        const { data } = await supabase.from('products').select('category');
        if (data) {
          dbCategories = data.map((p) => p.category).filter(Boolean);
        }
      } catch (_) {}
    }

    const allCategories = Array.from(
      new Set([...CATEGORIES, ...dbCategories])
    );

    return NextResponse.json({ categories: allCategories });
  } catch (err: any) {
    return NextResponse.json({ categories: CATEGORIES, error: err.message });
  }
}

// PUT: Rename / Edit an existing category across all products
export async function PUT(request: Request) {
  try {
    const { oldCategory, newCategory } = await request.json();

    if (!oldCategory || !newCategory) {
      return NextResponse.json({ error: 'Both oldCategory and newCategory are required' }, { status: 400 });
    }

    const trimmedOld = oldCategory.trim();
    const trimmedNew = newCategory.trim();

    if (trimmedOld === trimmedNew) {
      return NextResponse.json({ success: true, message: 'Category name unchanged' });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ category: trimmedNew })
      .eq('category', trimmedOld)
      .select('*');

    if (error) {
      console.error('Error updating category in DB:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Category "${trimmedOld}" successfully renamed to "${trimmedNew}" across ${data ? data.length : 0} products`,
      count: data ? data.length : 0,
      oldCategory: trimmedOld,
      newCategory: trimmedNew,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a category by reassigning products under it to a fallback category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const fallbackCategory = searchParams.get('fallbackCategory') || 'Oversized Collection';

    if (!category) {
      return NextResponse.json({ error: 'Category name parameter is required' }, { status: 400 });
    }

    const trimmedCat = category.trim();
    const trimmedFallback = fallbackCategory.trim();

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ category: trimmedFallback })
      .eq('category', trimmedCat)
      .select('*');

    if (error) {
      console.error('Error deleting category from DB:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Category "${trimmedCat}" removed. Reassigned ${data ? data.length : 0} products to "${trimmedFallback}"`,
      count: data ? data.length : 0,
      deletedCategory: trimmedCat,
      reassignedTo: trimmedFallback,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
