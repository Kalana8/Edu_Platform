import CreateStudentIdClient from "./CreateStudentIdClient";

type SearchParams =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>;

function pickValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function CreateStudentId({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = await Promise.resolve(searchParams ?? {});
  const schoolCode = pickValue(params.code);

  return <CreateStudentIdClient schoolCode={schoolCode} />;
}
