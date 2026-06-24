import Link from "next/link";

export type CategoryItem = {
  slug: string;
  code: string;
  label: string;
  icon: string;
  status: "Active" | "Inactive";
  description: string;
  badgeClass: string;
};

const categories: CategoryItem[] = [
  { slug: "artificial-intelligence", code: "CAT-001", label: "Artificial Intelligence", icon: "🤖", status: "Active", description: "AI curriculum and tiered learning paths.", badgeClass: "bg-emerald-100 text-emerald-700" },
  { slug: "innovation-design", code: "CAT-002", label: "Innovation & Design", icon: "💡", status: "Active", description: "Creative problem solving and design thinking.", badgeClass: "bg-amber-100 text-amber-700" },
  { slug: "personal-development", code: "CAT-003", label: "Personal Development", icon: "🌱", status: "Active", description: "Skills for growth, productivity, and wellbeing.", badgeClass: "bg-emerald-100 text-emerald-700" },
  { slug: "entrepreneurship", code: "CAT-004", label: "Entrepreneurship", icon: "🚀", status: "Active", description: "Business skills and startup fundamentals.", badgeClass: "bg-fuchsia-100 text-fuchsia-700" },
  { slug: "economics", code: "CAT-005", label: "Economics", icon: "📈", status: "Active", description: "Market systems, finance, and economic thinking.", badgeClass: "bg-sky-100 text-sky-700" },
  { slug: "science-discovery", code: "CAT-006", label: "Science & Discovery", icon: "🧪", status: "Active", description: "Scientific inquiry and exploration.", badgeClass: "bg-cyan-100 text-cyan-700" },
  { slug: "manufacturing", code: "CAT-007", label: "Manufacturing", icon: "⚙️", status: "Active", description: "Production systems and industrial technology.", badgeClass: "bg-slate-100 text-slate-700" },
  { slug: "history-society", code: "CAT-008", label: "History & Society", icon: "🏛️", status: "Active", description: "Culture, civics, and social studies.", badgeClass: "bg-rose-100 text-rose-700" },
];

interface CategoryPageProps {
  role?: "Admin" | "Moderator";
  basePath?: string;
}

export default function CategoryPage({ role = "Admin", basePath = "/admin" }: CategoryPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Category</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Manage curriculum categories</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              View categories, manage status, and access content tiers for {role.toLowerCase()} workflows.
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
          >
            + Add Category
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Category
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Code
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Description
                </th>
                <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {categories.map((category) => (
                <tr key={category.slug} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-3xl ${category.badgeClass}`}>
                        <span className="text-xl">{category.icon}</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{category.label}</div>
                        <div className="text-xs text-slate-500">{category.slug.replace(/-/g, " ")}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-slate-600">{category.code}</td>
                  <td className="px-6 py-4 align-top">
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {category.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-slate-500">{category.description}</td>
                  <td className="px-6 py-4 align-top text-right text-sm font-medium text-slate-600">
                    <div className="flex justify-end gap-3">
                      <Link href="#" className="transition hover:text-slate-950">
                        View
                      </Link>
                      <Link href="#" className="transition hover:text-slate-950">
                        Edit
                      </Link>
                      <button className="text-red-500 transition hover:text-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
