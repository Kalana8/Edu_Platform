import Link from "next/link";

type SearchParams =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>;

function pickValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function ConfirmSchool({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = await Promise.resolve(searchParams ?? {});
  const schoolCode = pickValue(params.code);
  const schoolName = pickValue(params.name) || "Loading...";
  const tier = pickValue(params.tier) || "Loading...";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col  px-4 py-8">
        <div className="space-y-4 ">
          <h1 className="text-3xl font-semibold ">Confirm Your School</h1>
        </div>

        <div className="mt-8 rounded-[1rem] bg-white p-6 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.35)]">
          <div>
            <div className="space-y-2 p-1">
              <p className="text-xs   text-slate-500">School Name</p>
              <p className="text-base font-semibold text-slate-950">{schoolName}</p>
            </div>
            <div className="space-y-2 p-1">
              <p className="text-xs   text-slate-500">Tier</p>
              <p className="text-base font-semibold text-slate-950">{tier}</p>
            </div>
          </div>
        </div>

        <Link
          href={`/create-student-id?code=${encodeURIComponent(schoolCode)}`}
          className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-blue-500 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-600"
        >
          Join School Team
        </Link>
      </main>
    </div>
  );
}
