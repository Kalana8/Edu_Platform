import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { randomUUID } from 'crypto';
import { verifyPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const { schoolCode, studentNumber, name, password } = await request.json();

    if (!schoolCode || !studentNumber) {
      return NextResponse.json(
        { error: 'School code and student number are required.' },
        { status: 400 }
      );
    }

    const trimmedSchoolCode = schoolCode.trim();
    const trimmedStudentNumber = studentNumber.trim();

    if (!trimmedSchoolCode || !trimmedStudentNumber) {
      return NextResponse.json(
        { error: 'School code and student number cannot be empty.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const fullStudentId = `${trimmedSchoolCode}-${trimmedStudentNumber}`;

    const { data: existingStudent, error: existingError } = await supabase
      .from('students')
      .select('id, student_id, name, school_id, total_credits, available_credits, withheld_credits')
      .eq('student_id', fullStudentId)
      .maybeSingle();

    if (existingError) {
      console.error('Student lookup error:', existingError);
      return NextResponse.json(
        { error: 'Unable to verify student ID.' },
        { status: 500 }
      );
    }

    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id, name, code')
      .eq('code', trimmedSchoolCode)
      .maybeSingle();

    if (schoolError) {
      console.error('School lookup error:', schoolError);
      return NextResponse.json(
        { error: 'Unable to verify school.' },
        { status: 500 }
      );
    }

    if (!school) {
      return NextResponse.json(
        { error: 'Invalid school code.' },
        { status: 404 }
      );
    }

    // Case 1: Existing student ID with password provided -> sign in
    if (existingStudent) {
      if (!password) {
        return NextResponse.json(
          { error: 'This student ID already exists. Please enter your password to continue.', needsPassword: true, studentId: fullStudentId },
          { status: 409 }
        );
      }

      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, password_hash, email')
        .eq('id', existingStudent.id)
        .maybeSingle();

      if (userError || !existingUser) {
        return NextResponse.json(
          { error: 'Unable to verify password for this student.' },
          { status: 500 }
        );
      }

      const trimmedPassword = typeof password === 'string' ? password.trim() : '';
      const passwordMatch = trimmedPassword ? verifyPassword(trimmedPassword, existingUser.password_hash) : false;

      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Incorrect password. Please try again.', needsPassword: true, studentId: fullStudentId },
          { status: 401 }
        );
      }

      const { data: schoolData, error: schoolLookupError } = await supabase
        .from('schools')
        .select('name, tier')
        .eq('id', existingStudent.school_id)
        .maybeSingle();

      if (schoolLookupError) {
        console.error('School fetch error:', schoolLookupError);
      }

      const sessionUser = {
        id: existingStudent.id,
        role: 'student',
        studentId: existingStudent.student_id,
        name: existingUser.email || existingStudent.name || `Student ${trimmedStudentNumber}`,
        schoolId: existingStudent.school_id,
        schoolName: schoolData?.name ?? 'Unassigned School',
        schoolTier: schoolData?.tier ?? 'N/A',
        totalCredits: existingStudent.total_credits ?? 0,
        availableCredits: existingStudent.available_credits ?? 0,
        withheldCredits: existingStudent.withheld_credits ?? 0,
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
    }

    // Case 2: New student ID
    const finalName = name?.trim() || `Student ${trimmedStudentNumber}`;

    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        id: randomUUID(),
        student_id: fullStudentId,
        name: finalName,
        school_id: school.id,
        total_credits: 0,
        available_credits: 0,
        withheld_credits: 0,
      })
      .select('id, student_id, name, school_id, total_credits, available_credits, withheld_credits')
      .single();

    if (studentError || !student) {
      console.error('Student profile create error:', studentError);
      return NextResponse.json(
        { error: studentError?.message || 'Unable to create student profile.' },
        { status: 500 }
      );
    }

    const userId = student.id;

    try {
      const { error: authError } = await supabase.auth.admin.createUser({
        email: `${fullStudentId}@student.local`,
        password,
        email_confirm: true,
        user_metadata: { role: 'student', student_id: fullStudentId },
      });
      if (authError) {
        console.error('Supabase Auth create user error:', authError);
      }
    } catch (authError) {
      console.error('Supabase Auth create user exception:', authError);
    }

    const sessionUser = {
      id: student.id,
      role: 'student',
      studentId: student.student_id,
      name: finalName,
      schoolId: student.school_id,
      schoolName: school.name,
      schoolTier: 'N/A',
      totalCredits: student.total_credits ?? 0,
      availableCredits: student.available_credits ?? 0,
      withheldCredits: student.withheld_credits ?? 0,
    };

    const response = NextResponse.json(
      {
        student: {
          id: student.id,
          name: finalName,
          email: `${fullStudentId}@student.local`,
          studentId: student.student_id,
          schoolId: student.school_id,
          school: school.name,
          totalCredits: student.total_credits ?? 0,
          availableCredits: student.available_credits ?? 0,
          withheldCredits: student.withheld_credits ?? 0,
        },
        user: sessionUser,
      },
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
