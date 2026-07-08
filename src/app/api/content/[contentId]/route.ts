import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const { contentId } = await params;
    const supabase = createAdminClient();

    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id, category_id, level, description, page_count, is_published, created_at, updated_at')
      .eq('id', contentId)
      .maybeSingle();

    if (contentError || !content) {
      return NextResponse.json(
        { error: 'Content not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
