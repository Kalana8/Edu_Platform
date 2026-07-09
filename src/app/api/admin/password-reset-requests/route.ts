import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/password';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: requests, error } = await supabase
      .from('password_reset_requests')
      .select('id, student_id, student_name, school_id, status, comment, reviewed_by, reviewed_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Password reset requests fetch error:', error);
      return NextResponse.json(
        { error: 'Unable to load password reset requests.' },
        { status: 500 }
      );
    }

    const schoolIds = Array.from(new Set((requests ?? []).map((r) => r.school_id).filter(Boolean)));
    let schoolsMap: Record<string, string> = {};

    if (schoolIds.length > 0) {
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .in('id', schoolIds);

      if (!schoolsError && schoolsData) {
        schoolsMap = Object.fromEntries(schoolsData.map((s) => [s.id, s.name]));
      }
    }

    const mapped = (requests ?? []).map((req) => ({
      id: req.id,
      studentId: req.student_id,
      studentName: req.student_name,
      schoolId: req.school_id,
      schoolName: schoolsMap[req.school_id] || 'Unknown',
      status: req.status,
      comment: req.comment,
      reviewedBy: req.reviewed_by,
      reviewedAt: req.reviewed_at,
      createdAt: req.created_at,
    }));

    return NextResponse.json({ requests: mapped }, { status: 200 });
  } catch (error) {
    console.error('Password reset requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, action, newPassword } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Request ID and action are required.' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be approve or reject.' },
        { status: 400 }
      );
    }

    if (action === 'approve' && !newPassword) {
      return NextResponse.json(
        { error: 'New password is required to approve a reset request.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: resetRequest, error: fetchError } = await supabase
      .from('password_reset_requests')
      .select('id, student_id, student_name, status')
      .eq('id', requestId)
      .maybeSingle();

    if (fetchError || !resetRequest) {
      return NextResponse.json(
        { error: 'Password reset request not found.' },
        { status: 404 }
      );
    }

    if (resetRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been processed.' },
        { status: 409 }
      );
    }

    if (action === 'approve') {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, student_id')
        .eq('student_id', resetRequest.student_id)
        .maybeSingle();

      if (studentError || !student) {
        return NextResponse.json(
          { error: 'Student not found.' },
          { status: 404 }
        );
      }

      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', student.id)
        .maybeSingle();

      const trimmedEmail = existingUser?.email?.trim().toLowerCase() || `${resetRequest.student_id}@student.local`;

      if (existingUser) {
        const hashedPassword = hashPassword(newPassword);
        const { error: updateError } = await supabase
          .from('users')
          .update({ password_hash: hashedPassword })
          .eq('id', student.id);

        if (updateError) {
          console.error('Password update error:', updateError);
          return NextResponse.json(
            { error: 'Unable to update password.' },
            { status: 500 }
          );
        }
      } else {
        const hashedPassword = hashPassword(newPassword);
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: student.id,
            email: trimmedEmail,
            name: resetRequest.student_name || student.student_id,
            role: 'student',
            password_hash: hashedPassword,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('User create error:', insertError);
        }
      }

      try {
        let { data: authUsers, error: authListError } = await supabase.auth.admin.listUsers();

        if (authListError || !authUsers?.users) {
          console.error('Supabase Auth list users error:', authListError);
        } else {
          const authUser = authUsers.users.find((u) => u.email?.toLowerCase() === trimmedEmail.toLowerCase());
          if (authUser) {
            const { error: authUpdateError } = await supabase.auth.admin.updateUserById(authUser.id, {
              password: newPassword,
              email_confirm: true,
            });
            if (authUpdateError) {
              console.error('Supabase Auth password update error:', authUpdateError);
            }
          } else {
            const { error: authCreateError } = await supabase.auth.admin.createUser({
              email: trimmedEmail,
              password: newPassword,
              email_confirm: true,
              user_metadata: { role: 'student', student_id: resetRequest.student_id },
            });
            if (authCreateError) {
              console.error('Supabase Auth create user error:', authCreateError);
            }
          }
        }
      } catch (authError) {
        console.error('Supabase Auth operation exception:', authError);
      }
    }

    const { error: updateRequestError } = await supabase
      .from('password_reset_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateRequestError) {
      console.error('Request status update error:', updateRequestError);
      return NextResponse.json(
        { error: 'Unable to update request status.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: `Password reset request ${action === 'approve' ? 'approved' : 'rejected'}.` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
