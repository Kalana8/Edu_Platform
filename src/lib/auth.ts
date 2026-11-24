import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type SessionRole = "student" | "moderator" | "admin";

export interface SessionUser {
  id: string;
  role: SessionRole;
  name?: string;
  [key: string]: unknown;
}

/**
 * Reads the current user from the `session_user` cookie.
 *
 * SECURITY: the cookie is currently unsigned JSON, so its contents can be edited
 * by the browser user. Keep all session reads going through this function so that
 * switching to a signed token only needs to change this one place.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const raw = (await cookies()).get("session_user")?.value;
  if (!raw) return null;
  for (const candidate of [raw, safeDecode(raw)]) {
    try {
      const user = JSON.parse(candidate);
      if (user && typeof user.id === "string" && typeof user.role === "string") return user as SessionUser;
    } catch {
      // try the next form
    }
  }
  return null;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

type AuthResult = { user: SessionUser; error?: never } | { user?: never; error: NextResponse };

/** For route handlers: returns the user, or a 401/403 response to return as-is. */
export async function requireRole(...roles: SessionRole[]): Promise<AuthResult> {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  if (!roles.includes(user.role)) return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  return { user };
}
