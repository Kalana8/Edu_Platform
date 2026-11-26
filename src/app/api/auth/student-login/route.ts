import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const { email, studentId, password } = await request.json();

    if (typeof email === 'string' && email.trim()) {
      return loginWithEmail(email, password);
    }

    if (!studentId || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Older accounts made before email sign-up log in with their Student ID.
    const supabase = createAdminClient();

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(STUDENT_FIELDS)
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

    return startSession(supabase, student, user?.name || user?.email || student.name);
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

const STUDENT_FIELDS = 'id, student_id, name, school_id, total_credits, available_credits, withheld_credits';

type StudentRow = {
  id: string;
  student_id: string;
  name: string | null;
  school_id: string;
  total_credits: number | null;
  available_credits: number | null;
  withheld_credits: number | null;
};

async function loginWithEmail(email: string, password: unknown) {
  if (typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (authError || !authData?.user) {
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  }

  const authUser = authData.user;

  // New accounts share their id with the student profile. Fall back to the
  // Student ID saved on the login, in case the profile was made differently.
  let { data: student } = await supabase
    .from('students')
    .select(STUDENT_FIELDS)
    .eq('id', authUser.id)
    .maybeSingle();

  const metadataStudentId = authUser.user_metadata?.student_id;
  if (!student && typeof metadataStudentId === 'string') {
    ({ data: student } = await supabase
      .from('students')
      .select(STUDENT_FIELDS)
      .eq('student_id', metadataStudentId)
      .maybeSingle());
  }

  if (!student) {
    return NextResponse.json(
      { error: 'No student profile is linked to this email.' },
      { status: 404 }
    );
  }

  return startSession(supabase, student, student.name ?? '');
}

async function startSession(
  supabase: ReturnType<typeof createAdminClient>,
  student: StudentRow,
  name: string | null,
) {
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
    name,
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
}
