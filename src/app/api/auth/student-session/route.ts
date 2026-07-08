import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId } = body;

    if (!studentId || typeof studentId !== 'string') {
      return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, student_id, name, school_id, total_credits, available_credits, withheld_credits')
      .eq('student_id', studentId.trim())
      .maybeSingle();

    if (studentError) {
      console.error('Student session lookup error:', studentError);
      return NextResponse.json(
        { error: studentError.message || 'Unable to find student.' },
        { status: 500 }
      );
    }

    if (!student) {
      return NextResponse.json({ error: 'Invalid student ID.' }, { status: 404 });
    }

    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('name, tier')
      .eq('id', student.school_id)
      .maybeSingle();

    if (schoolError) {
      console.error('School fetch error:', schoolError);
    }

    const sessionUser = {
      id: student.id,
      role: 'student',
      studentId: student.student_id,
      name: student.name,
      schoolId: student.school_id,
      schoolName: school?.name ?? 'Unassigned School',
      schoolTier: school?.tier ?? 'N/A',
      totalCredits: student.total_credits ?? 0,
      availableCredits: student.available_credits ?? 0,
      withheldCredits: student.withheld_credits ?? 0,
    };

    const response = NextResponse.json(
      { success: true, user: sessionUser },
      { status: 200 }
    );

    response.cookies.set('session_user', JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Student session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
