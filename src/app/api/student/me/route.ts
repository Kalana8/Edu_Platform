import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionUserStr = cookieStore.get('session_user')?.value;
  if (!sessionUserStr) return null;
  try {
    return JSON.parse(sessionUserStr);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('student_id, name, school_id, total_credits, available_credits, withheld_credits')
      .eq('id', user.id)
      .maybeSingle();

    if (studentError) {
      console.error('Student profile fetch error:', studentError);
      return NextResponse.json(
        { error: studentError.message || 'Unable to load student profile.' },
        { status: 500 }
      );
    }

    const schoolId = student?.school_id ?? null;
    let schoolName = 'Unassigned';
    let schoolTier = 'N/A';
    let schoolCode = '';

    if (schoolId) {
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('name, tier, code')
        .eq('id', schoolId)
        .maybeSingle();

      if (schoolError) {
        console.error('School fetch error:', schoolError);
      } else if (school) {
        schoolName = school.name;
        schoolTier = school.tier;
        schoolCode = school.code;
      }
    }

    const { data: progressItems, error: progressError } = await supabase
      .from('reading_progress')
      .select('pages_read, is_completed, content_id')
      .eq('user_id', user.id);

    if (progressError) {
      console.error('Reading progress fetch error:', progressError);
    }

    const activeReading = (progressItems ?? []).filter((p) => !p.is_completed);
    const completedReading = (progressItems ?? []).filter((p) => p.is_completed);

    return NextResponse.json(
      {
        profile: {
          name: student?.name ?? user.name ?? '',
          studentId: student?.student_id ?? '',
          schoolName,
          schoolTier,
          schoolCode,
          totalCredits: student?.total_credits ?? 0,
          availableCredits: student?.available_credits ?? 0,
          withheldCredits: student?.withheld_credits ?? 0,
        },
        reading: {
          activeCount: activeReading.length,
          completedCount: completedReading.length,
          totalPagesRead: (progressItems ?? []).reduce((sum, p) => sum + (p.pages_read ?? 0), 0),
          activeItems: activeReading.map((p) => ({
            contentId: p.content_id,
            pagesRead: p.pages_read ?? 0,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Student me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
