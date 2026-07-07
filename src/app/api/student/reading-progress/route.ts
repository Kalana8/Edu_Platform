import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionUserStr = cookieStore.get('session_user')?.value;
  if (!sessionUserStr) return null;
  try {
    return JSON.parse(sessionUserStr);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json({ error: 'contentId is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: progress, error: progressError } = await supabase
      .from('reading_progress')
      .select('id, user_id, content_id, pages_read, is_completed, started_at, completed_at')
      .eq('user_id', user.id)
      .eq('content_id', contentId)
      .maybeSingle();

    if (progressError) {
      console.error('Reading progress fetch error:', progressError);
      return NextResponse.json(
        { error: progressError.message || 'Unable to load reading progress.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ progress: progress ?? null }, { status: 200 });
  } catch (error) {
    console.error('Reading progress fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { contentId, pagesReadIncrement } = body;

    if (!contentId || pagesReadIncrement === undefined) {
      return NextResponse.json(
        { error: 'contentId and pagesReadIncrement are required.' },
        { status: 400 }
      );
    }

    const userId = user.id;

    const supabase = createAdminClient();

    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('page_count')
      .eq('id', contentId)
      .maybeSingle();

    if (contentError || !content) {
      return NextResponse.json(
        { error: 'Content not found.' },
        { status: 404 }
      );
    }

    const { count: pageCount, error: countError } = await supabase
      .from('content_pages')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', contentId);

    if (countError) {
      console.error('Page count fetch error:', countError);
      return NextResponse.json(
        { error: countError.message || 'Unable to load content pages.' },
        { status: 500 }
      );
    }

    const totalPages = Math.max(content.page_count ?? 0, pageCount ?? 0);

    const { data: existing, error: fetchError } = await supabase
      .from('reading_progress')
      .select('pages_read, is_completed')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .maybeSingle();

    if (fetchError) {
      console.error('Reading progress fetch error:', fetchError);
      return NextResponse.json(
        { error: fetchError.message || 'Unable to load reading progress.' },
        { status: 500 }
      );
    }

    const currentPagesRead = existing?.pages_read ?? 0;
    const isCompleted = existing?.is_completed ?? false;
    const newPagesRead = Math.min(currentPagesRead + pagesReadIncrement, totalPages);
    const newlyCompleted = !isCompleted && newPagesRead >= totalPages;

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('reading_progress')
        .update({
          pages_read: newPagesRead,
          is_completed: newlyCompleted,
          completed_at: newlyCompleted ? new Date().toISOString() : null,
        })
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .select('pages_read, is_completed')
        .single();

      if (error) {
        console.error('Reading progress update error:', error);
        return NextResponse.json(
          { error: error.message || 'Unable to update reading progress.' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      const { data, error } = await supabase
        .from('reading_progress')
        .insert({
          user_id: userId,
          content_id: contentId,
          pages_read: newPagesRead,
          is_completed: newlyCompleted,
          completed_at: newlyCompleted ? new Date().toISOString() : null,
        })
        .select('pages_read, is_completed')
        .single();

      if (error) {
        console.error('Reading progress insert error:', error);
        return NextResponse.json(
          { error: error.message || 'Unable to save reading progress.' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({
      pages_read: result.pages_read,
      is_completed: result.is_completed,
    }, { status: 200 });
  } catch (error) {
    console.error('Reading progress update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
