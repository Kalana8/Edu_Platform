import CreditsPageClient from "./CreditsPageClient";

type SearchParams =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>;

function pickValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function CreditsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = await Promise.resolve(searchParams ?? {});
  const studentId = pickValue(params.studentId);

  return <CreditsPageClient studentId={studentId} />;
}
