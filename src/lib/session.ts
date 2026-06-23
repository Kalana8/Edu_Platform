export type Role = "admin" | "moderator";

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
