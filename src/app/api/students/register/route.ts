import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { nextStudentId } from '@/lib/student/studentId';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ID_ATTEMPTS = 5;

/**
 * Creates a student account from an email and password.
 * The Student ID is generated here; the student never picks it.
 */
export async function POST(request: NextRequest) {
  try {
    const { schoolCode, email, name, password } = await request.json();

    const trimmedSchoolCode = typeof schoolCode === 'string' ? schoolCode.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const trimmedName = typeof name === 'string' ? name.trim() : '';

    if (!trimmedSchoolCode) {
      return NextResponse.json({ error: 'Please choose your school first.' }, { status: 400 });
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id, name, code, tier')
      .eq('code', trimmedSchoolCode)
      .maybeSingle();

    if (schoolError) {
      console.error('School lookup error:', schoolError);
      return NextResponse.json({ error: 'Unable to verify school.' }, { status: 500 });
    }
    if (!school) {
      return NextResponse.json({ error: 'Invalid school code.' }, { status: 404 });
    }

    // 1. Create the login. Supabase Auth keeps emails unique, so this also
    //    catches an email that is already registered.
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true,
      user_metadata: { role: 'student', school_code: school.code },
    });

    if (authError || !authData?.user) {
      const message = authError?.message ?? '';
      if (/already|registered|exists/i.test(message)) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 }
        );
      }
      console.error('Supabase Auth create user error:', authError);
      return NextResponse.json({ error: 'Unable to create your account.' }, { status: 500 });
    }

    const authUserId = authData.user.id;

    // 2. Create the student profile with a generated Student ID.
    //    Retry if another sign-up took the same number at the same moment.
    let student: {
      id: string;
      student_id: string;
      name: string | null;
      school_id: string;
      total_credits: number | null;
      available_credits: number | null;
      withheld_credits: number | null;
    } | null = null;

    for (let attempt = 0; attempt < MAX_ID_ATTEMPTS && !student; attempt++) {
      let studentId: string;
      try {
        studentId = await nextStudentId(supabase, school.code);
      } catch (idError) {
        console.error('Student ID generation error:', idError);
        break;
      }

      const { data, error } = await supabase
        .from('students')
        .insert({
          id: authUserId,
          student_id: studentId,
          name: trimmedName || `Student ${studentId.slice(school.code.length + 1)}`,
          school_id: school.id,
          total_credits: 0,
          available_credits: 0,
          withheld_credits: 0,
        })
        .select('id, student_id, name, school_id, total_credits, available_credits, withheld_credits')
        .single();

      if (data) {
        student = data;
      } else if (error?.code !== '23505') {
        // Anything other than a duplicate Student ID is not worth retrying.
        console.error('Student profile create error:', error);
        break;
      }
    }

    if (!student) {
      // Don't leave a login behind that has no student profile.
      await supabase.auth.admin.deleteUser(authUserId).catch((err) =>
        console.error('Supabase Auth cleanup error:', err)
      );
      return NextResponse.json({ error: 'Unable to create your student profile.' }, { status: 500 });
    }

    await supabase.auth.admin
      .updateUserById(authUserId, {
        user_metadata: { role: 'student', school_code: school.code, student_id: student.student_id },
      })
      .catch((err) => console.error('Supabase Auth metadata update error:', err));

    const sessionUser = {
      id: student.id,
      role: 'student',
      studentId: student.student_id,
      name: student.name ?? '',
      schoolId: student.school_id,
      schoolName: school.name,
      schoolTier: school.tier ?? 'N/A',
      totalCredits: student.total_credits ?? 0,
      availableCredits: student.available_credits ?? 0,
      withheldCredits: student.withheld_credits ?? 0,
    };

    const response = NextResponse.json(
      { studentId: student.student_id, user: sessionUser },
      { status: 201 }
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
    console.error('Student registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
