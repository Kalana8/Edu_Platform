import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const { contentId } = await params;
    const supabase = createAdminClient();

    const { data: pages, error: pagesError } = await supabase
      .from('content_pages')
      .select('id, page_number, title, content')
      .eq('content_id', contentId)
      .order('page_number', { ascending: true });

    if (pagesError) {
      console.error('Content pages fetch error:', pagesError);
      return NextResponse.json(
        { error: pagesError.message || 'Unable to load content pages.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ pages: pages ?? [] }, { status: 200 });
  } catch (error) {
    console.error('Content pages fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
