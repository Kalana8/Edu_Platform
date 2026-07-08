import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/password';

export type ModeratorApiItem = {
  id: string;
  name: string;
  email: string;
  role: 'moderator';
  status: 'Active' | 'Inactive';
  lastLogin: string;
};

async function mapModerators(supabase: ReturnType<typeof createAdminClient>) {
  const { data: moderators, error } = await supabase
    .from('users')
    .select('id, name, email, role, last_login, created_at, is_super_admin')
    .eq('role', 'moderator')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (moderators ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    status: m.last_login ? 'Active' : 'Inactive',
    lastLogin: m.last_login ? new Date(m.last_login).toISOString().split('T')[0] : 'Never',
    isSuperAdmin: m.is_super_admin ?? false,
  }));
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const moderators = await mapModerators(supabase);

    return NextResponse.json({ moderators }, { status: 200 });
  } catch (error) {
    console.error('Moderator fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);

    const { data: moderator, error } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash: hashedPassword,
        role: 'moderator',
      })
      .select('id, name, email, role, last_login, created_at')
      .single();

    if (error || !moderator) {
      console.error('Moderator create error:', error);
      return NextResponse.json(
        { error: error?.message || 'Unable to create moderator.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        moderator: {
          id: moderator.id,
          name: moderator.name,
          email: moderator.email,
          role: moderator.role,
          status: 'Active',
          lastLogin: 'Never',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Moderator create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, email } = await request.json();

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: 'Moderator id, name, and email are required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: target } = await supabase
      .from('users')
      .select('is_super_admin, email')
      .eq('id', id)
      .single();

    if (target?.is_super_admin) {
      return NextResponse.json(
        { error: 'Cannot modify super admin.' },
        { status: 403 }
      );
    }

    const { data: moderator, error } = await supabase
      .from('users')
      .update({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      })
      .eq('id', id)
      .select('id, name, email, role, last_login, created_at')
      .single();

    if (error || !moderator) {
      console.error('Moderator update error:', error);
      return NextResponse.json(
        { error: error?.message || 'Unable to update moderator.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        moderator: {
          id: moderator.id,
          name: moderator.name,
          email: moderator.email,
          role: moderator.role,
          status: moderator.last_login ? 'Active' : 'Inactive',
          lastLogin: moderator.last_login ? new Date(moderator.last_login).toISOString().split('T')[0] : 'Never',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Moderator update error:', error);
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
        { error: 'Moderator id is required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: target } = await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', id)
      .single();

    if (target?.is_super_admin) {
      return NextResponse.json(
        { error: 'Cannot delete super admin.' },
        { status: 403 }
      );
    }

    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      console.error('Moderator delete error:', error);
      return NextResponse.json(
        { error: error.message || 'Unable to delete moderator.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Moderator delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
