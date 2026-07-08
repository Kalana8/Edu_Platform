import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionUserStr = cookieStore.get('session_user')?.value;
  if (!sessionUserStr) return null;
  try {
    return JSON.parse(sessionUserStr);
  } catch {
    return null;
  }
}

async function submitApprovalRequest(
  userId: string,
  targetType: 'category' | 'school' | 'content',
  actionType: 'create' | 'update' | 'delete',
  targetId: string | null,
  changeData: any
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('approval_requests')
    .insert([
      {
        user_id: userId,
        target_type: targetType,
        action_type: actionType,
        target_id: targetId,
        change_data: changeData,
        status: 'pending',
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Submit approval error:', error);
    throw error;
  }
  return data;
}

function normalizePages(pages: any): Array<{ page_number: number; title: string; content: string }> {
  if (!Array.isArray(pages)) return [];
  return pages
    .map((page, index) => {
      if (typeof page === 'string') {
        return { page_number: index + 1, title: '', content: page };
      }
      return {
        page_number: Number(page.page_number) || index + 1,
        title: typeof page.title === 'string' ? page.title : '',
        content: typeof page.content === 'string' ? page.content : '',
      };
    })
    .filter((page) => page.content.trim() !== '');
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');

    let contentQuery = supabase
      .from('content')
      .select('id, category_id, level, description, page_count, is_published, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (categoryId) {
      contentQuery = contentQuery.eq('category_id', categoryId);
    }

    const { data: contents, error } = await contentQuery;

    if (error) {
      console.error('Content fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Unable to load content.' },
        { status: 500 }
      );
    }

    const result = await Promise.all(
      (contents ?? []).map(async (item: any) => {
        const { data: pages } = await supabase
          .from('content_pages')
          .select('page_number, title, content')
          .eq('content_id', item.id)
          .order('page_number', { ascending: true });

        return {
          ...item,
          pages: pages ?? [],
        };
      })
    );

    return NextResponse.json({ content: result }, { status: 200 });
  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { category_id, level, description, pages, is_published } = body;

    if (!category_id || !level || !pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json(
        { error: 'Category, level, and at least one page are required.' },
        { status: 400 }
      );
    }

    if (!['Essential', 'Intermediate', 'Advanced'].includes(level)) {
      return NextResponse.json(
        { error: 'Level must be Essential, Intermediate, or Advanced.' },
        { status: 400 }
      );
    }

    const normalizedPages = normalizePages(pages);

    if (sessionUser.role === 'moderator') {
      await submitApprovalRequest(
        sessionUser.id,
        'content',
        'create',
        null,
        { category_id, level, description, pages: normalizedPages, is_published }
      );
      return NextResponse.json(
        { pendingApproval: true, message: 'Your content creation request has been submitted to the admin for approval.' },
        { status: 202 }
      );
    }

    if (sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const supabase = createAdminClient();

    const { data: existingContent, error: existingError } = await supabase
      .from('content')
      .select('id, description, page_count')
      .eq('category_id', category_id)
      .eq('level', level)
      .maybeSingle();

    if (existingError) {
      console.error('Existing content fetch error:', existingError);
      return NextResponse.json(
        { error: existingError.message || 'Unable to check existing content.' },
        { status: 500 }
      );
    }

    let contentId = existingContent?.id;
    let startingPageNumber = 1;

    if (contentId) {
      const { data: maxPage, error: maxPageError } = await supabase
        .from('content_pages')
        .select('page_number')
        .eq('content_id', contentId)
        .order('page_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxPageError) {
        console.error('Max page fetch error:', maxPageError);
        return NextResponse.json(
          { error: maxPageError.message || 'Unable to check existing pages.' },
          { status: 500 }
        );
      }

      startingPageNumber = (maxPage?.page_number ?? 0) + 1;
    } else {
      const { data: newContent, error: contentError } = await supabase
        .from('content')
        .insert({
          category_id,
          level,
          description: (description || '').trim(),
          is_published: is_published ?? true,
        })
        .select('id, category_id, level, description, page_count, is_published, created_at, updated_at')
        .single();

      if (contentError || !newContent) {
        console.error('Content insert error:', contentError);
        return NextResponse.json(
          { error: contentError?.message || 'Unable to add content.' },
          { status: 500 }
        );
      }

      contentId = newContent.id;
    }

    const pageRows = normalizedPages.map((page, index) => ({
      content_id: contentId,
      page_number: startingPageNumber + index,
      title: page.title.trim(),
      content: page.content.trim(),
    }));

    const { error: pagesError } = await supabase
      .from('content_pages')
      .insert(pageRows);

    if (pagesError) {
      console.error('Content pages insert error:', pagesError);
      if (!existingContent) {
        await supabase.from('content').delete().eq('id', contentId);
      }
      return NextResponse.json(
        { error: pagesError.message || 'Unable to add content pages.' },
        { status: 500 }
      );
    }

    const { data: savedPages } = await supabase
      .from('content_pages')
      .select('page_number, title, content')
      .eq('content_id', contentId)
      .order('page_number', { ascending: true });

    const { error: pageCountUpdateError } = await supabase
      .from('content')
      .update({ page_count: savedPages?.length ?? 0 })
      .eq('id', contentId);

    if (pageCountUpdateError) {
      console.error('Page count update error:', pageCountUpdateError);
    }

    const { data: savedContent } = await supabase
      .from('content')
      .select('id, category_id, level, description, page_count, is_published, created_at, updated_at')
      .eq('id', contentId)
      .maybeSingle();

    return NextResponse.json(
      { content: { ...savedContent, pages: savedPages ?? [] } },
      { status: existingContent ? 200 : 201 }
    );
  } catch (error) {
    console.error('Content creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, category_id, level, description, pages, is_published } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required.' },
        { status: 400 }
      );
    }

    if (sessionUser.role === 'moderator') {
      await submitApprovalRequest(
        sessionUser.id,
        'content',
        'update',
        id,
        { category_id, level, description, pages, is_published }
      );
      return NextResponse.json(
        { pendingApproval: true, message: 'Your content update request has been submitted to the admin for approval.' },
        { status: 202 }
      );
    }

    if (sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const supabase = createAdminClient();

    const updateData: any = {};
    if (category_id !== undefined) updateData.category_id = category_id;
    if (level !== undefined) updateData.level = level;
    if (description !== undefined) updateData.description = description.trim();
    if (is_published !== undefined) updateData.is_published = is_published;

    const { data: content, error: contentError } = await supabase
      .from('content')
      .update(updateData)
      .eq('id', id)
      .select('id, category_id, level, description, page_count, is_published, created_at, updated_at')
      .single();

    if (contentError || !content) {
      console.error('Content update error:', contentError);
      return NextResponse.json(
        { error: contentError?.message || 'Unable to update content.' },
        { status: 500 }
      );
    }

    if (Array.isArray(pages)) {
      const normalizedPages = normalizePages(pages);

      const { error: deleteError } = await supabase
        .from('content_pages')
        .delete()
        .eq('content_id', id);

      if (deleteError) {
        console.error('Content pages delete error:', deleteError);
        return NextResponse.json(
          { error: deleteError.message || 'Unable to update content pages.' },
          { status: 500 }
        );
      }

      const pageRows = normalizedPages.map((page) => ({
        content_id: id,
        page_number: page.page_number,
        title: page.title.trim(),
        content: page.content.trim(),
      }));

      const { error: pagesError } = await supabase
        .from('content_pages')
        .insert(pageRows);

      if (pagesError) {
        console.error('Content pages insert error:', pagesError);
        return NextResponse.json(
          { error: pagesError.message || 'Unable to update content pages.' },
          { status: 500 }
        );
      }
    }

    const { data: savedPages } = await supabase
      .from('content_pages')
      .select('page_number, title, content')
      .eq('content_id', id)
      .order('page_number', { ascending: true });

    return NextResponse.json({ content: { ...content, pages: savedPages ?? [] } }, { status: 200 });
  } catch (error) {
    console.error('Content update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required.' },
        { status: 400 }
      );
    }

    if (sessionUser.role === 'moderator') {
      await submitApprovalRequest(
        sessionUser.id,
        'content',
        'delete',
        id,
        {}
      );
      return NextResponse.json(
        { pendingApproval: true, message: 'Your content deletion request has been submitted to the admin for approval.' },
        { status: 202 }
      );
    }

    if (sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Content delete error:', error);
      return NextResponse.json(
        { error: error.message || 'Unable to delete content.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Content delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
