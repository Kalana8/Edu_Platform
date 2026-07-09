import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { studentId, comment } = await request.json();

    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      return NextResponse.json(
        { error: 'Student ID is required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const trimmedId = studentId.trim();

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, student_id, name, school_id')
      .eq('student_id', trimmedId)
      .maybeSingle();

    if (studentError) {
      console.error('Student lookup error:', studentError);
      return NextResponse.json(
        { error: 'Unable to verify student ID.' },
        { status: 500 }
      );
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student ID not found.' },
        { status: 404 }
      );
    }

    const trimmedComment = typeof comment === 'string' ? comment.trim() : '';

    const { data: requestData, error: insertError } = await supabase
      .from('password_reset_requests')
      .insert({
        student_id: student.student_id,
        student_name: student.name,
        school_id: student.school_id,
        comment: trimmedComment || null,
      })
      .select('id, status, created_at')
      .single();

    if (insertError || !requestData) {
      console.error('Password reset request create error:', insertError);
      return NextResponse.json(
        { error: 'Unable to submit password reset request.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        request: {
          id: requestData.id,
          status: requestData.status,
          createdAt: requestData.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
