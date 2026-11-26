import type { createAdminClient } from "@/lib/supabase/admin";

/**
 * Next free Student ID for a school, in the form "<SCHOOL CODE>-<n>".
 * Takes the highest number already used at that school and adds one.
 * Two sign-ups at the same moment can pick the same number; the caller
 * relies on the unique constraint on students.student_id and retries.
 */
export async function nextStudentId(
  supabase: ReturnType<typeof createAdminClient>,
  schoolCode: string,
): Promise<string> {
  const prefix = `${schoolCode}-`;
  const { data, error } = await supabase
    .from("students")
    .select("student_id")
    .like("student_id", `${prefix}%`);

  if (error) throw error;

  let max = 0;
  for (const row of data ?? []) {
    const n = Number(String(row.student_id).slice(prefix.length));
    if (Number.isInteger(n) && n > max) max = n;
  }
  return `${prefix}${max + 1}`;
}
