import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function mapStudents(supabase: ReturnType<typeof createAdminClient>) {
  const { data: studentsData, error: studentsError } = await supabase
    .from('students')
    .select('id, student_id, name, school_id, total_credits, available_credits, withheld_credits')
    .order('name', { ascending: true });

  if (studentsError) {
    throw studentsError;
  }

  const userIds = (studentsData ?? []).map((student) => student.id);
  let usersEmailMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'student')
      .in('id', userIds);

    if (!usersError && usersData) {
      usersEmailMap = Object.fromEntries(usersData.map((user) => [user.id, user.email]));
    }
  }

  const { data: schoolsData, error: schoolsError } = await supabase
    .from('schools')
    .select('id, name')
    .order('name', { ascending: true });

  if (schoolsError) {
    throw schoolsError;
  }

  const schoolsById = Object.fromEntries((schoolsData ?? []).map((school) => [school.id, school.name]));

  return (studentsData ?? []).map((student) => {
    return {
      id: student.id,
      name: student.name,
      email: usersEmailMap[student.id] ?? '',
      studentId: student.student_id,
      schoolId: student.school_id,
      school: student.school_id ? schoolsById[student.school_id] ?? 'Unassigned' : 'Unassigned',
      totalCredits: student.total_credits ?? 0,
      availableCredits: student.available_credits ?? 0,
      withheldCredits: student.withheld_credits ?? 0,
      isActive: true,
    };
  });
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const students = await mapStudents(supabase);

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error('Student fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, studentId, schoolId, totalCredits, availableCredits } = await request.json();

    if (!name || !email || !studentId || !schoolId) {
      return NextResponse.json(
        { error: 'Name, email, student ID, and school are required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: createdUser, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email: email.trim().toLowerCase(),
          name: name.trim(),
          role: 'student',
          password_hash: null,
        },
      ])
      .select('id, name, email, role')
      .single();

    if (userError || !createdUser) {
      console.error('Student create user error:', userError);
      return NextResponse.json(
        { error: userError?.message || 'Unable to create student account.' },
        { status: 500 }
      );
    }

    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .insert([
        {
          id: createdUser.id,
          student_id: studentId.trim(),
          name: name.trim(),
          school_id: schoolId,
          total_credits: Number(totalCredits) || 0,
          available_credits: Number(availableCredits) || 0,
          withheld_credits: 0,
        },
      ])
      .select('id, student_id, name, school_id, total_credits, available_credits, withheld_credits')
      .single();

    if (studentError || !studentData) {
      console.error('Student create row error:', studentError);
      return NextResponse.json(
        { error: studentError?.message || 'Unable to create student profile.' },
        { status: 500 }
      );
    }

    const { data: schoolData } = await supabase.from('schools').select('name').eq('id', schoolId).single();

    return NextResponse.json(
      {
        student: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          studentId: studentData.student_id,
          schoolId: studentData.school_id,
          school: schoolData?.name ?? 'Unassigned',
          totalCredits: studentData.total_credits ?? 0,
          availableCredits: studentData.available_credits ?? 0,
          withheldCredits: studentData.withheld_credits ?? 0,
          isActive: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Student create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, email, studentId, schoolId, totalCredits, availableCredits } = await request.json();

    if (!id || !name || !email || !studentId || !schoolId) {
      return NextResponse.json(
        { error: 'Student id, name, email, student ID, and school are required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .update({ name: name.trim(), email: email.trim().toLowerCase() })
      .eq('id', id)
      .select('id, name, email, role')
      .single();

    if (userError || !updatedUser) {
      console.error('Student update user error:', userError);
      return NextResponse.json(
        { error: userError?.message || 'Unable to update student account.' },
        { status: 500 }
      );
    }

    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .update({
        student_id: studentId.trim(),
        school_id: schoolId,
        name: name.trim(),
        total_credits: Number(totalCredits) || 0,
        available_credits: Number(availableCredits) || 0,
      })
      .eq('id', id)
      .select('id, student_id, name, school_id, total_credits, available_credits, withheld_credits')
      .single();

    if (studentError || !studentData) {
      console.error('Student update row error:', studentError);
      return NextResponse.json(
        { error: studentError?.message || 'Unable to update student profile.' },
        { status: 500 }
      );
    }

    const { data: schoolData } = await supabase.from('schools').select('name').eq('id', schoolId).single();

    return NextResponse.json(
      {
        student: {
          id: studentData.id,
          name: studentData.name,
          email: updatedUser.email,
          studentId: studentData.student_id,
          schoolId: studentData.school_id,
          school: schoolData?.name ?? 'Unassigned',
          totalCredits: studentData.total_credits ?? 0,
          availableCredits: studentData.available_credits ?? 0,
          withheldCredits: studentData.withheld_credits ?? 0,
          isActive: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Student update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Student id is required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      console.error('Student delete error:', error);
      return NextResponse.json(
        { error: error.message || 'Unable to delete student.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Student delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
