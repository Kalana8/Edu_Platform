/**
 * Integration points between the Explore expansion and EXISTING EduMate features.
 * Everything that leaves the Explore area goes through here, so the mapping can be
 * updated in one place as backend features land.
 */

import type { AcademyLevel } from "./types";

export type ExistingLevel = "essential" | "intermediate" | "advanced";

export const existingRoutes = {
  home: "/home",
  /** Current "Learn" area: knowledge categories. */
  learn: "/choose-category",
  category: (slug: string) => `/category/${slug}`,
  categoryLevel: (slug: string, level: ExistingLevel) => `/category/${slug}/${level}`,
  /** Existing reading-based micro-lessons. */
  microLesson: (contentId: string) => `/read/${contentId}`,
  /** Existing mastery verification (quiz). */
  masteryCheck: (contentId: string) => `/quiz/${contentId}`,
  profile: "/profile",
  ranks: "/ranks",
};

/** Academy stage → existing category level (Essential / Intermediate / Advanced). */
export const academyToLevel: Record<AcademyLevel, ExistingLevel> = {
  Foundation: "essential",
  Advanced: "intermediate",
  "Elite Mastery": "advanced",
};
