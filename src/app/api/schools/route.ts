import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, code, name, location, tier, total_points, is_active')
      .order('name', { ascending: true });

    if (schoolsError) {
      console.error('School fetch error:', schoolsError);
      return NextResponse.json(
        { error: schoolsError.message || 'Unable to load schools.' },
        { status: 500 }
      );
    }

    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('school_id');

    if (studentsError) {
      console.error('Student fetch error:', studentsError);
      return NextResponse.json(
        { error: studentsError.message || 'Unable to count students.' },
        { status: 500 }
      );
    }

    const studentCounts: Record<string, number> = {};
    students?.forEach((student) => {
      if (student.school_id) {
        studentCounts[student.school_id] = (studentCounts[student.school_id] || 0) + 1;
      }
    });

    const mappedSchools = (schools ?? []).map((school) => ({
      id: school.id,
      code: school.code,
      name: school.name,
      location: school.location,
      tier: school.tier,
      points: school.total_points ?? 0,
      students: studentCounts[school.id] ?? 0,
      isActive: school.is_active ?? true,
    }));

    return NextResponse.json({ schools: mappedSchools }, { status: 200 });
  } catch (error) {
    console.error('School fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, code, location, tier, isActive } = await request.json();

    if (!name || !code || !location || !tier) {
      return NextResponse.json(
        { error: 'School name, code, location, and tier are required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('schools')
      .insert([
        {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          location: location.trim(),
          tier,
          is_active: isActive ?? true,
          total_points: 0,
        },
      ])
      .select('id, code, name, location, tier, total_points, is_active')
      .single();

    if (error) {
      console.error('School create error:', error);
      return NextResponse.json(
        { error: error.message || 'Unable to create school.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        school: {
          id: data.id,
          code: data.code,
          name: data.name,
          location: data.location,
          tier: data.tier,
          points: data.total_points ?? 0,
          students: 0,
          isActive: data.is_active ?? true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('School create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, code, location, tier, isActive } = await request.json();

    if (!id || !name || !code || !location || !tier) {
      return NextResponse.json(
        { error: 'School id, name, code, location, and tier are required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('schools')
      .update({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        location: location.trim(),
        tier,
        is_active: isActive ?? true,
      })
      .eq('id', id)
      .select('id, code, name, location, tier, total_points, is_active')
      .single();

    if (error) {
      console.error('School update error:', error);
      return NextResponse.json(
        { error: error.message || 'Unable to update school.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        school: {
          id: data.id,
          code: data.code,
          name: data.name,
          location: data.location,
          tier: data.tier,
          points: data.total_points ?? 0,
          students: 0,
          isActive: data.is_active ?? true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('School update error:', error);
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
        { error: 'School id is required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('schools').delete().eq('id', id);

    if (error) {
      console.error('School delete error:', error);
      return NextResponse.json(
        { error: error.message || 'Unable to delete school.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('School delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
