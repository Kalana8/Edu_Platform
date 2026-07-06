import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { schoolCode, studentNumber, name } = await request.json();

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
      .select('id, student_id')
      .eq('student_id', fullStudentId)
      .maybeSingle();

    if (existingError) {
      console.error('Student lookup error:', existingError);
      return NextResponse.json(
        { error: 'Unable to verify student ID.' },
        { status: 500 }
      );
    }

    if (existingStudent) {
      return NextResponse.json(
        { error: 'This student ID already exists.' },
        { status: 409 }
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

    return NextResponse.json(
      {
        student: {
          id: student.id,
          name: student.name,
          studentId: student.student_id,
          schoolId: student.school_id,
          school: school.name,
          totalCredits: student.total_credits ?? 0,
          availableCredits: student.available_credits ?? 0,
          withheldCredits: student.withheld_credits ?? 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Student registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
