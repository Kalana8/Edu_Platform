import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const { studentId, password } = await request.json();

    if (!studentId || !password) {
      return NextResponse.json(
        { error: 'Student ID and password are required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, student_id, name, school_id, total_credits, available_credits, withheld_credits')
      .eq('student_id', studentId.trim())
      .maybeSingle();

    if (studentError) {
      console.error('Student lookup error:', studentError);
      return NextResponse.json(
        { error: 'Unable to find student.' },
        { status: 500 }
      );
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Invalid student ID.' },
        { status: 404 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, password_hash, email, name')
      .eq('id', student.id)
      .maybeSingle();

    const trimmedPassword = typeof password === 'string' ? password.trim() : '';
    let passwordMatch = false;

    if (user && !userError) {
      if (user.password_hash) {
        passwordMatch = verifyPassword(trimmedPassword, user.password_hash);
      }
    }

    if (!passwordMatch) {
      const authEmail = user?.email?.trim() || `${student.student_id}@student.local`;
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: trimmedPassword,
        });
        if (authData?.user && !authError) {
          passwordMatch = true;
        }
        if (authError) {
          console.error('Supabase Auth sign-in error:', authError);
        }
      } catch (authErr) {
        console.error('Supabase Auth sign-in exception:', authErr);
      }
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    if (passwordMatch) {
      if (user?.id) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);
      }
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
      name: user?.name || user?.email || student.name,
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
    console.error('Student login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
