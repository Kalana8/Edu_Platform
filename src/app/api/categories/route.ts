import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, icon, code, status')
      .order('code', { ascending: true });

    if (error) {
      console.error('Category fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Unable to load categories.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ categories: data ?? [] }, { status: 200 });
  } catch (error) {
    console.error('Category fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { slug, label, code, icon, status } = await request.json();

    if (!slug || !label || !code) {
      return NextResponse.json(
        { error: 'Category slug, name and code are required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const nextSlug = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'new-category';

    const { data, error } = await supabase
      .from('categories')
      .update({
        slug: nextSlug,
        icon: icon?.trim() || '📚',
        code: code.trim().toUpperCase(),
        status: status || 'Active',
      })
      .eq('slug', slug)
      .select('id, slug, icon, code, status')
      .single();

    if (error) {
      console.error('Category update error:', error);
      return NextResponse.json(
        { error: error.message || 'Unable to update category.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        category: {
          ...data,
          label,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Category slug is required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('Category delete error:', error);
      return NextResponse.json(
        { error: error.message || 'Unable to delete category.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Category delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { label, code, icon, status, description } = await request.json();

    if (!label || !code) {
      return NextResponse.json(
        { error: 'Category name and code are required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const slug = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'new-category';

    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          slug,
          icon: icon?.trim() || '📚',
          code: code.trim().toUpperCase(),
          status: status || 'Active',
        },
      ])
      .select('id, slug, icon, code, status')
      .single();

    if (error) {
      console.error('Category insert error:', error);
      return NextResponse.json(
        { error: error.message || 'Unable to add category.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        category: {
          ...data,
          label,
          description,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
