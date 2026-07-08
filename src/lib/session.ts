export type Role = "admin" | "moderator";

export type UserSession = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isSuperAdmin?: boolean;
};

export function setRole(role: Role) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_role", role);
  }
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem("user_role") as Role) || null;
}

export function clearRole() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user_role");
  }
}

export function setUser(user: UserSession) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_session", JSON.stringify(user));
    localStorage.setItem("user_role", user.role);
  }
}

export function getUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem("user_session");
  return session ? JSON.parse(session) : null;
}

export function clearUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user_session");
    localStorage.removeItem("user_role");
  }
}

