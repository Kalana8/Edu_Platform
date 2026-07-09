import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { schoolCode, studentNumber } = await request.json();

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

    return NextResponse.json(
      {
        exists: !!existingStudent,
        studentId: fullStudentId,
        schoolCode: trimmedSchoolCode,
        schoolName: school.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Student check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
