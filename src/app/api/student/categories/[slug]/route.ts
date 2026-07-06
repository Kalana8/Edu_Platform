import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, slug, icon, code, status')
      .eq('slug', slug)
      .maybeSingle();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Category not found.' },
        { status: 404 }
      );
    }

    const { data: levels, error: levelsError } = await supabase
      .from('content')
      .select('level, page_count')
      .eq('category_id', category.id)
      .eq('is_published', true);

    if (levelsError) {
      console.error('Category levels fetch error:', levelsError);
      return NextResponse.json(
        { error: levelsError.message || 'Unable to load category levels.' },
        { status: 500 }
      );
    }

    const levelMap = new Map<string, { count: number; totalPages: number }>();
    for (const item of levels ?? []) {
      const existing = levelMap.get(item.level) ?? { count: 0, totalPages: 0 };
      existing.count += 1;
      existing.totalPages += item.page_count ?? 0;
      levelMap.set(item.level, existing);
    }

    const essential = levelMap.get('Essential');
    const intermediate = levelMap.get('Intermediate');
    const advanced = levelMap.get('Advanced');

    const mappedLevels = [
      {
        title: 'Essential',
        subtitle: 'Foundation Level',
        pages: essential?.totalPages ?? 0,
        count: essential?.count ?? 0,
        color: 'bg-emerald-100 text-emerald-700',
        icon: '📗',
      },
      {
        title: 'Intermediate',
        subtitle: 'Building Level',
        pages: intermediate?.totalPages ?? 0,
        count: intermediate?.count ?? 0,
        color: 'bg-sky-100 text-sky-700',
        icon: '🎓',
      },
      {
        title: 'Advanced',
        subtitle: 'Mastery Level',
        pages: advanced?.totalPages ?? 0,
        count: advanced?.count ?? 0,
        color: 'bg-fuchsia-100 text-fuchsia-700',
        icon: '🏆',
      },
    ];

    return NextResponse.json(
      {
        category: {
          ...category,
          label: category.slug
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          levels: mappedLevels,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Category fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
