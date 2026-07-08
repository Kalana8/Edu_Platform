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
    <div className="min-h-screen bg-slate-50 text-slate-950 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,.35),_transparent_25%),linear-gradient(180deg,#4f46e5_0%,#8b5cf6_45%,#9333ea_100%)]">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-8 py-8 text-white">
        <div className="space-y-4 mt-18 text-center">
          <h1 className="text-3xl font-semibold ">Confirm Your School</h1>
        </div>

        <div className="mt-19 overflow-hidden rounded-2xl border border-white/40 bg-white/10 p-1 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-md ring-1 ring-white/30">
          <div className="rounded-xl bg-white/75 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.6 54.6 0 0 1 4.653-2.52.75.75 0 0 0-.195-1.379 56.345 56.345 0 0 0-4.81-1.245.75.75 0 0 1-.448-.739A60.5 60.5 0 0 1 11.7 2.805Z" />
                  <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666 4.282c.63.355.146 1.285-.622 1.285h-8.552a.75.75 0 0 1-.704-.513l-2.81-9.778a.75.75 0 0 1 .54-.97 61.42 61.42 0 0 0 6.542-2.182 61.42 61.42 0 0 0 1.84-1.176l.079-.05a.75.75 0 0 1 .714.066 60.2 60.2 0 0 1 5.1 3.152.75.75 0 0 1-.34 1.345 48.3 48.3 0 0 0-7.78 2.91c-.252.084-.51.156-.773.215Z" />
                  <path d="M3.462 14.42a.75.75 0 0 0 .688.394 59.97 59.97 0 0 0 13.217-2.09.75.75 0 0 0 .406-1.304 55.5 55.5 0 0 0-8.59-3.409.75.75 0 0 0-.718.22l-3.084 3.498a.75.75 0 0 0-.154.838Z" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">School Name</p>
                <p className="text-base font-semibold text-slate-950">{schoolName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M5.166 2.62a.75.75 0 0 1 .75.75c0 .894.393 1.693 1.017 2.24a.75.75 0 1 1-.95 1.16A4.478 4.478 0 0 0 3.666 3.37a.75.75 0 0 1 .75-.75Zm8.27 0a.75.75 0 0 1 .75.75c0 .894.393 1.693 1.017 2.24a.75.75 0 1 1-.95 1.16 4.478 4.478 0 0 0-2.317-2.035.75.75 0 0 1 .5-1.165ZM3.9 8.7a.75.75 0 0 1 .75-.75h14.7a.75.75 0 0 1 0 1.5H4.65a.75.75 0 0 1-.75-.75ZM3.9 12.45a.75.75 0 0 1 .75-.75h14.7a.75.75 0 0 1 0 1.5H4.65a.75.75 0 0 1-.75-.75Zm0 3.75a.75.75 0 0 1 .75-.75h14.7a.75.75 0 0 1 0 1.5H4.65a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                  <path d="M4.5 19.5a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75Z" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">Tier</p>
                <p className="text-base font-semibold text-slate-950">{tier}</p>
              </div>
            </div>
          </div>
        </div>

        <Link
          href={`/create-student-id?code=${encodeURIComponent(schoolCode)}`}
          className="mt-8 inline-flex w-full items-center justify-center px-5 py-3 rounded-lg bg-white  text-base font-semibold text-blue-700 hover:cursor-pointer"
        >
          Join School Team
        </Link>

         <Link href="/" className="block text-center text-sm mt-4">Cancel</Link>
      </main>
    </div>
  );
}
