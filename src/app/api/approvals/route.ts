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

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (sessionUser.role !== 'admin' && sessionUser.role !== 'moderator') {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const supabase = createAdminClient();
    
    // Fetch approvals, join with users table to get requester details
    const { data: approvals, error } = await supabase
      .from('approval_requests')
      .select(`
        id,
        user_id,
        target_type,
        action_type,
        target_id,
        change_data,
        status,
        admin_comment,
        reviewed_by,
        reviewed_at,
        created_at,
        users!user_id (name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch approvals error:', error);
      return NextResponse.json(
        { error: error.message || 'Unable to load approvals.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ approvals: approvals ?? [] }, { status: 200 });
  } catch (error) {
    console.error('Fetch approvals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can resolve approval requests.' },
        { status: 403 }
      );
    }

    const { id, status, comment } = await request.json();

    if (!id || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Approval request ID and a valid status (approved or rejected) are required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch the target approval request
    const { data: approvalRequest, error: fetchError } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !approvalRequest) {
      return NextResponse.json(
        { error: 'Approval request not found.' },
        { status: 404 }
      );
    }

    if (approvalRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been reviewed.' },
        { status: 400 }
      );
    }

    // Apply the changes to the schools or categories table if approved
    if (status === 'approved') {
      const { target_type, action_type, target_id, change_data } = approvalRequest;

      if (target_type === 'category') {
        if (action_type === 'create') {
          const { label, code, icon, status: catStatus, description } = change_data;
          const slug = label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || 'new-category';

          const { error: insertError } = await supabase
            .from('categories')
            .insert({
              slug,
              icon: icon?.trim() || '📚',
              code: code.trim().toUpperCase(),
              status: catStatus || 'Active',
            });

          if (insertError) {
            console.error('Approval execution: category insert failed', insertError);
            return NextResponse.json({ error: `Insert failed: ${insertError.message}` }, { status: 500 });
          }
        } 
        else if (action_type === 'update') {
          const { label, code, icon, status: catStatus } = change_data;
          const nextSlug = label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || 'new-category';

          const { error: updateError } = await supabase
            .from('categories')
            .update({
              slug: nextSlug,
              icon: icon?.trim() || '📚',
              code: code.trim().toUpperCase(),
              status: catStatus || 'Active',
            })
            .eq('slug', target_id);

          if (updateError) {
            console.error('Approval execution: category update failed', updateError);
            return NextResponse.json({ error: `Update failed: ${updateError.message}` }, { status: 500 });
          }
        } 
        else if (action_type === 'delete') {
          const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .eq('slug', target_id);

          if (deleteError) {
            console.error('Approval execution: category delete failed', deleteError);
            return NextResponse.json({ error: `Delete failed: ${deleteError.message}` }, { status: 500 });
          }
        }
      } 
      else if (target_type === 'school') {
        if (action_type === 'create') {
          const { name, code, location, tier, isActive } = change_data;
          const { error: insertError } = await supabase
            .from('schools')
            .insert({
              name: name.trim(),
              code: code.trim().toUpperCase(),
              location: location.trim(),
              tier,
              is_active: isActive ?? true,
              total_points: 0,
            });

          if (insertError) {
            console.error('Approval execution: school insert failed', insertError);
            return NextResponse.json({ error: `Insert failed: ${insertError.message}` }, { status: 500 });
          }
        } 
        else if (action_type === 'update') {
          const { name, code, location, tier, isActive } = change_data;
          const { error: updateError } = await supabase
            .from('schools')
            .update({
              name: name.trim(),
              code: code.trim().toUpperCase(),
              location: location.trim(),
              tier,
              is_active: isActive ?? true,
            })
            .eq('id', target_id);

          if (updateError) {
            console.error('Approval execution: school update failed', updateError);
            return NextResponse.json({ error: `Update failed: ${updateError.message}` }, { status: 500 });
          }
        } 
        else if (action_type === 'delete') {
          const { error: deleteError } = await supabase
            .from('schools')
            .delete()
            .eq('id', target_id);

          if (deleteError) {
            console.error('Approval execution: school delete failed', deleteError);
            return NextResponse.json({ error: `Delete failed: ${deleteError.message}` }, { status: 500 });
          }
        }
      }
      else if (target_type === 'content') {
        if (action_type === 'create') {
          const { category_id, level, description, pages, is_published } = change_data;
          const normalizedPages = (Array.isArray(pages) ? pages : [])
            .map((page: any, index: number) => ({
              page_number: typeof page?.page_number === 'number' ? page.page_number : index + 1,
              title: typeof page?.title === 'string' ? page.title : '',
              content: typeof page?.content === 'string' ? page.content : (typeof page === 'string' ? page : ''),
            }))
            .filter((page: any) => page.content.trim() !== '');

          const { data: existingContent, error: existingError } = await supabase
            .from('content')
            .select('id, description, page_count')
            .eq('category_id', category_id)
            .eq('level', level)
            .maybeSingle();

          if (existingError) {
            console.error('Existing content fetch error:', existingError);
            return NextResponse.json({ error: existingError.message || 'Unable to check existing content.' }, { status: 500 });
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
              return NextResponse.json({ error: maxPageError.message || 'Unable to check existing pages.' }, { status: 500 });
            }

            startingPageNumber = (maxPage?.page_number ?? 0) + 1;
          } else {
            const { data: content, error: insertError } = await supabase
              .from('content')
              .insert({
                category_id,
                level,
                description: (description || '').trim(),
                is_published: is_published ?? true,
              })
              .select('id')
              .single();

            if (insertError || !content) {
              console.error('Approval execution: content insert failed', insertError);
              return NextResponse.json({ error: `Insert failed: ${insertError?.message || 'Unknown error'}` }, { status: 500 });
            }

            contentId = content.id;
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
            console.error('Approval execution: content pages insert failed', pagesError);
            if (!existingContent) {
              await supabase.from('content').delete().eq('id', contentId);
            }
            return NextResponse.json({ error: `Pages insert failed: ${pagesError.message}` }, { status: 500 });
          }
        } 
        else if (action_type === 'update') {
          const { category_id, level, description, pages, is_published } = change_data;
          const updateData: any = {};
          if (category_id !== undefined) updateData.category_id = category_id;
          if (level !== undefined) updateData.level = level;
          if (description !== undefined) updateData.description = description.trim();
          if (is_published !== undefined) updateData.is_published = is_published;

          const { error: updateError } = await supabase
            .from('content')
            .update(updateData)
            .eq('id', target_id);

          if (updateError) {
            console.error('Approval execution: content update failed', updateError);
            return NextResponse.json({ error: `Update failed: ${updateError.message}` }, { status: 500 });
          }

          if (Array.isArray(pages)) {
            const normalizedPages = pages
              .map((page: any, index: number) => ({
                page_number: typeof page?.page_number === 'number' ? page.page_number : index + 1,
                title: typeof page?.title === 'string' ? page.title : '',
                content: typeof page?.content === 'string' ? page.content : (typeof page === 'string' ? page : ''),
              }))
              .filter((page: any) => page.content.trim() !== '');

            const { error: deleteError } = await supabase
              .from('content_pages')
              .delete()
              .eq('content_id', target_id);

            if (deleteError) {
              console.error('Approval execution: content pages delete failed', deleteError);
              return NextResponse.json({ error: `Pages update failed: ${deleteError.message}` }, { status: 500 });
            }

            if (normalizedPages.length > 0) {
              const { error: pagesError } = await supabase
                .from('content_pages')
                .insert(normalizedPages.map((page: any) => ({
                  content_id: target_id,
                  page_number: page.page_number,
                  title: page.title.trim(),
                  content: page.content.trim(),
                })));

              if (pagesError) {
                console.error('Approval execution: content pages insert failed', pagesError);
                return NextResponse.json({ error: `Pages insert failed: ${pagesError.message}` }, { status: 500 });
              }
            }
          }
        } 
        else if (action_type === 'delete') {
          const { error: deleteError } = await supabase
            .from('content')
            .delete()
            .eq('id', target_id);

          if (deleteError) {
            console.error('Approval execution: content delete failed', deleteError);
            return NextResponse.json({ error: `Delete failed: ${deleteError.message}` }, { status: 500 });
          }
        }
      }
    }

    // Update approval request status
    const { data: updatedRequest, error: updateRequestError } = await supabase
      .from('approval_requests')
      .update({
        status,
        admin_comment: comment || '',
        reviewed_by: sessionUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateRequestError) {
      console.error('Approval request state update failed', updateRequestError);
      return NextResponse.json(
        { error: 'Database update failed, but action was applied. Please check logs.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, approvalRequest: updatedRequest }, { status: 200 });
  } catch (error) {
    console.error('Resolve approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
