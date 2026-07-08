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
  targetType: 'category' | 'school',
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

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, label, icon, code, status')
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
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { slug, label, code, icon, status } = body;

    if (!slug || !label || !code) {
      return NextResponse.json(
        { error: 'Category slug, name and code are required.' },
        { status: 400 }
      );
    }

    if (sessionUser.role === 'moderator') {
      await submitApprovalRequest(
        sessionUser.id,
        'category',
        'update',
        slug,
        { label, code, icon, status }
      );
      return NextResponse.json(
        { pendingApproval: true, message: 'Your update request has been submitted to the admin for approval.' },
        { status: 202 }
      );
    }

    if (sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('categories')
      .update({
        label: label.trim(),
        icon: icon?.trim() || '📚',
        code: code.trim().toUpperCase(),
        status: status || 'Active',
      })
      .eq('slug', slug)
      .select('id, slug, label, icon, code, status')
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
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { error: 'Category slug is required.' },
        { status: 400 }
      );
    }

    if (sessionUser.role === 'moderator') {
      const supabase = createAdminClient();
      const { data: category } = await supabase
        .from('categories')
        .select('slug, code')
        .eq('slug', slug)
        .maybeSingle();

      await submitApprovalRequest(
        sessionUser.id,
        'category',
        'delete',
        slug,
        { label: slug, code: category?.code || '' }
      );
      return NextResponse.json(
        { pendingApproval: true, message: 'Your delete request has been submitted to the admin for approval.' },
        { status: 202 }
      );
    }

    if (sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
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
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { label, code, icon, status, description } = body;

    if (!label || !code) {
      return NextResponse.json(
        { error: 'Category name and code are required.' },
        { status: 400 }
      );
    }

    if (sessionUser.role === 'moderator') {
      await submitApprovalRequest(
        sessionUser.id,
        'category',
        'create',
        null,
        { label, code, icon, status, description }
      );
      return NextResponse.json(
        { pendingApproval: true, message: 'Your addition request has been submitted to the admin for approval.' },
        { status: 202 }
      );
    }

    if (sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
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
          label: label.trim(),
          icon: icon?.trim() || '📚',
          code: code.trim().toUpperCase(),
          status: status || 'Active',
        },
      ])
      .select('id, slug, label, icon, code, status')
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
