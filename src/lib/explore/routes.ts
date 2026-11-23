/**
 * Single source of truth for Explore URLs.
 * Pages live in src/app/(student)/explore/*; change EXPLORE_BASE together with
 * that folder if the area is ever remounted.
 */
export const EXPLORE_BASE = "/explore";

/** The existing screen that holds the "Discover" entry point (DiscoverEntryCard). */
export const ENTRY_ROUTE = "/choose-category";

export const exploreRoutes = {
  entry: () => ENTRY_ROUTE,
  discover: () => `${EXPLORE_BASE}/discover`,
  subject: (slug: string) => `${EXPLORE_BASE}/subjects/${slug}`,
  curriculum: (slug: string) => `${EXPLORE_BASE}/subjects/${slug}/curriculum`,
  labs: (subjectSlug?: string) =>
    subjectSlug ? `${EXPLORE_BASE}/labs?subject=${subjectSlug}` : `${EXPLORE_BASE}/labs`,
  project: (id: string) => `${EXPLORE_BASE}/labs/${id}`,
  resources: (subjectSlug?: string) =>
    subjectSlug ? `${EXPLORE_BASE}/resources?subject=${subjectSlug}` : `${EXPLORE_BASE}/resources`,
  community: (subjectSlug?: string) =>
    subjectSlug ? `${EXPLORE_BASE}/community?subject=${subjectSlug}` : `${EXPLORE_BASE}/community`,
};
