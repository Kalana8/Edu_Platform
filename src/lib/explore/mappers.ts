/**
 * Database row → domain type mapping for the Explore tables (see supabase/explore.sql).
 * Server-side only: used by ./api.ts and the /api/explore route handlers.
 */

import type {
  AcademicResource,
  CommunityPost,
  LabProject,
  SubjectDetail,
  SubjectSummary,
} from "./types";
import type { ProjectState } from "./store-types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export const SUBJECT_SUMMARY_COLUMNS =
  "slug, title, tagline, description, discipline, difficulty, motif, theme, status, tags, featured, trending, emerging, beginner_friendly, university_level, added_at, estimated_hours, learners_exploring";

export function toSubjectSummary(r: Row): SubjectSummary {
  return {
    slug: r.slug,
    title: r.title,
    tagline: r.tagline,
    description: r.description,
    discipline: r.discipline,
    difficulty: r.difficulty,
    motif: r.motif,
    theme: r.theme,
    status: r.status,
    tags: r.tags ?? [],
    featured: r.featured || undefined,
    trending: r.trending || undefined,
    emerging: r.emerging || undefined,
    beginnerFriendly: r.beginner_friendly || undefined,
    universityLevel: r.university_level || undefined,
    addedAt: r.added_at,
    estimatedHours: r.estimated_hours,
    learnersExploring: r.learners_exploring,
  };
}

export function toSubjectDetail(r: Row): SubjectDetail {
  const d = r.detail ?? {};
  return {
    ...toSubjectSummary(r),
    introduction: d.introduction ?? "",
    applications: d.applications ?? [],
    whyItMatters: d.whyItMatters ?? [],
    outcomes: d.outcomes ?? [],
    foundationalKnowledge: d.foundationalKnowledge ?? [],
    prerequisites: d.prerequisites ?? [],
    stages: d.stages ?? [],
    durationLabel: d.durationLabel ?? "",
    relatedCategorySlug: d.relatedCategorySlug ?? undefined,
    curriculum: d.curriculum ?? null,
  };
}

export function toLabProject(r: Row): LabProject {
  return {
    id: r.id,
    subjectSlug: r.subject_slug,
    title: r.title,
    type: r.type,
    difficulty: r.difficulty,
    durationMins: r.duration_mins,
    summary: r.summary,
    objectives: r.objectives ?? [],
    steps: r.steps ?? [],
    criteria: r.criteria ?? [],
    deliverable: r.deliverable,
    simulation: r.simulation ?? undefined,
  };
}

export function toResource(r: Row): AcademicResource {
  return {
    id: r.id,
    title: r.title,
    author: r.author,
    type: r.type,
    year: r.year ?? undefined,
    description: r.description,
    url: r.url,
    licence: r.licence ?? undefined,
    access: r.access,
    subjectSlugs: r.subject_slugs ?? [],
  };
}

export const POST_COLUMNS =
  "id, kind, title, excerpt, author_display, author_band, region, subject_slug, created_at, appreciations, replies, achievement, moderation";

export function toCommunityPost(r: Row): CommunityPost {
  return {
    id: r.id,
    kind: r.kind,
    title: r.title,
    excerpt: r.excerpt,
    authorDisplay: r.author_display,
    authorBand: r.author_band ?? undefined,
    region: r.region ?? undefined,
    subjectSlug: r.subject_slug,
    createdAt: String(r.created_at).slice(0, 10),
    appreciations: r.appreciations ?? r.base_appreciations ?? 0,
    replies: r.replies ?? 0,
    achievement: r.achievement ?? undefined,
    moderation: r.moderation,
  };
}

export const PROGRESS_COLUMNS =
  "project_id, started, completed_steps, submission_summary, submission_link, submitted_at, review_status, review_feedback";

export function toProjectState(r: Row): ProjectState {
  return {
    started: r.started,
    completedSteps: r.completed_steps ?? [],
    submission: r.submitted_at
      ? {
          summary: r.submission_summary ?? "",
          link: r.submission_link ?? "",
          submittedAt: r.submitted_at,
          reviewStatus: r.review_status ?? "pending",
          feedback: r.review_feedback ?? undefined,
        }
      : undefined,
  };
}

/** "Amara Kowalski" → "Amara K." — never expose full names in the community. */
export function toDisplayName(name: unknown): string {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Learner";
  const first = parts[0].slice(0, 20);
  return parts.length > 1 ? `${first} ${parts[parts.length - 1][0].toUpperCase()}.` : first;
}
