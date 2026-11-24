/**
 * Admin content management for Explore: input validation and domain → row mapping
 * for subjects, lab projects and resources. Used by /api/admin/explore routes.
 */

import type {
  AcademicResource,
  ActivityType,
  Difficulty,
  Discipline,
  LabProject,
  Motif,
  ResourceType,
  SimulationKind,
  SubjectDetail,
} from "./types";
import { toLabProject, toResource, toSubjectDetail } from "./mappers";

export const DISCIPLINES: Discipline[] = ["Engineering", "Computing", "Energy & Environment", "Physical Sciences", "Life Sciences"];
export const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced", "university"];
export const MOTIFS: Motif[] = ["robot", "neural", "battery", "chip", "cycle", "rocket", "dna", "qubit", "lattice"];
export const ACTIVITY_TYPES: ActivityType[] = ["simulation", "coding", "challenge", "experiment", "project"];
export const SIMULATIONS: SimulationKind[] = ["battery", "robot-arm", "transistor", "neural-net", "circuit", "resources"];
export const RESOURCE_TYPES: ResourceType[] = ["unit-outline", "lecture", "paper", "article", "textbook", "video", "oer", "documentation"];
export const ACADEMY_LEVELS = ["Foundation", "Advanced", "Elite Mastery"] as const;

export type AdminMeta = { isPublished: boolean; sortOrder: number };
export type AdminSubject = SubjectDetail & AdminMeta;
export type AdminLab = LabProject & AdminMeta;
export type AdminResource = AcademicResource & AdminMeta;

export type ContentKind = "subjects" | "labs" | "resources";

/** Table and primary key for each kind. */
export const KIND_TABLE: Record<ContentKind, { table: string; key: string }> = {
  subjects: { table: "explore_subjects", key: "slug" },
  labs: { table: "explore_lab_projects", key: "id" },
  resources: { table: "explore_resources", key: "id" },
};

export function isContentKind(v: string): v is ContentKind {
  return v === "subjects" || v === "labs" || v === "resources";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export function rowToAdmin(kind: ContentKind, r: Row): AdminSubject | AdminLab | AdminResource {
  const meta = { isPublished: r.is_published, sortOrder: r.sort_order };
  if (kind === "subjects") return { ...toSubjectDetail(r), ...meta };
  if (kind === "labs") return { ...toLabProject(r), ...meta };
  return { ...toResource(r), ...meta };
}

// ── Validation helpers ──────────────────────────────────────────────────────

class InvalidInput extends Error {}

const fail = (msg: string): never => {
  throw new InvalidInput(msg);
};

function str(v: unknown, field: string, { min = 0, max = 5000, optional = false } = {}): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s && optional) return "";
  if (s.length < Math.max(min, 1)) fail(`${field} is required${min > 1 ? ` (at least ${min} characters)` : ""}.`);
  if (s.length > max) fail(`${field} must be at most ${max} characters.`);
  return s;
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[], field: string): T {
  if (!allowed.includes(v as T)) fail(`${field} must be one of: ${allowed.join(", ")}.`);
  return v as T;
}

function int(v: unknown, field: string, min = 0, max = 1_000_000): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isInteger(n) || n < min || n > max) fail(`${field} must be a whole number between ${min} and ${max}.`);
  return n;
}

function strList(v: unknown, field: string, maxItems = 50): string[] {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) fail(`${field} must be a list.`);
  const list = (v as unknown[]).map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
  if (list.length > maxItems) fail(`${field} can have at most ${maxItems} items.`);
  return list;
}

function objList<T>(v: unknown, field: string, each: (item: Row, i: number) => T, maxItems = 50): T[] {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) fail(`${field} must be a list.`);
  if ((v as unknown[]).length > maxItems) fail(`${field} can have at most ${maxItems} items.`);
  return (v as Row[]).map((item, i) => {
    if (!item || typeof item !== "object") fail(`${field} item ${i + 1} is invalid.`);
    return each(item, i);
  });
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX = /^#[0-9a-fA-F]{6}$/;

function key(v: unknown, field: string): string {
  const s = str(v, field, { max: 100 });
  if (!SLUG.test(s)) fail(`${field} may only contain lowercase letters, numbers and single hyphens.`);
  return s;
}

function hex(v: unknown, field: string): string {
  if (typeof v !== "string" || !HEX.test(v)) fail(`${field} must be a colour like #1e3a8a.`);
  return (v as string).toLowerCase();
}

function meta(input: Row) {
  return {
    is_published: input.isPublished !== false,
    sort_order: input.sortOrder === undefined ? 0 : int(input.sortOrder, "Sort order", -10000, 10000),
  };
}

// ── Kind-specific parsing ───────────────────────────────────────────────────

function parseSubject(input: Row, existingKey?: string): Row {
  const slug = existingKey ?? key(input.slug, "Slug");
  const theme = input.theme ?? {};
  const prerequisites = objList(input.prerequisites, "Prerequisites", (p, i) => ({
    title: str(p.title, `Prerequisite ${i + 1} title`, { max: 200 }),
    why: str(p.why, `Prerequisite ${i + 1} reason`, { optional: true, max: 500 }),
    ...(p.categorySlug ? { categorySlug: str(p.categorySlug, "Category slug", { max: 100 }) } : {}),
  }));
  const stages = objList(input.stages, "Learning stages", (s, i) => ({
    id: typeof s.id === "string" && s.id ? s.id : `${slug}-s${i + 1}`,
    title: str(s.title, `Stage ${i + 1} title`, { max: 200 }),
    academy: oneOf(s.academy, ACADEMY_LEVELS, `Stage ${i + 1} academy level`),
    summary: str(s.summary, `Stage ${i + 1} summary`, { optional: true, max: 1000 }),
    weeks: int(s.weeks, `Stage ${i + 1} weeks`, 0, 520),
  }));
  const applications = objList(input.applications, "Applications", (a, i) => ({
    title: str(a.title, `Application ${i + 1} title`, { max: 200 }),
    description: str(a.description, `Application ${i + 1} description`, { optional: true, max: 1000 }),
  }));

  let curriculum = input.curriculum ?? null;
  if (curriculum !== null) {
    if (typeof curriculum !== "object" || Array.isArray(curriculum)) fail("Curriculum must be an object or empty.");
    if (!Array.isArray(curriculum.modules)) fail("Curriculum must include a modules list.");
    curriculum = { ...curriculum, isIllustrative: true };
  }

  return {
    slug,
    title: str(input.title, "Title", { max: 200 }),
    tagline: str(input.tagline, "Tagline", { optional: true, max: 300 }),
    description: str(input.description, "Description", { max: 2000 }),
    discipline: oneOf(input.discipline, DISCIPLINES, "Discipline"),
    difficulty: oneOf(input.difficulty, DIFFICULTIES, "Difficulty"),
    motif: oneOf(input.motif, MOTIFS, "Illustration"),
    theme: {
      base: hex(theme.base, "Main colour"),
      accent: hex(theme.accent, "Accent colour"),
      tint: hex(theme.tint, "Tint colour"),
      ink: hex(theme.ink, "Text colour"),
    },
    status: oneOf(input.status, ["available", "coming-soon"] as const, "Status"),
    tags: strList(input.tags, "Tags", 20),
    featured: !!input.featured,
    trending: !!input.trending,
    emerging: !!input.emerging,
    beginner_friendly: !!input.beginnerFriendly,
    university_level: !!input.universityLevel,
    added_at: /^\d{4}-\d{2}-\d{2}$/.test(input.addedAt ?? "") ? input.addedAt : new Date().toISOString().slice(0, 10),
    estimated_hours: int(input.estimatedHours ?? 0, "Estimated hours", 0, 10000),
    learners_exploring: int(input.learnersExploring ?? 0, "Learners exploring", 0, 100_000_000),
    detail: {
      introduction: str(input.introduction, "Introduction", { optional: true, max: 5000 }),
      applications,
      whyItMatters: strList(input.whyItMatters, "Why it matters"),
      outcomes: strList(input.outcomes, "Outcomes"),
      foundationalKnowledge: strList(input.foundationalKnowledge, "Foundational knowledge"),
      prerequisites,
      stages,
      durationLabel: str(input.durationLabel, "Duration label", { optional: true, max: 100 }),
      relatedCategorySlug: str(input.relatedCategorySlug, "Related category", { optional: true, max: 100 }) || undefined,
      curriculum,
    },
    ...meta(input),
  };
}

function parseLab(input: Row, existingKey?: string): Row {
  const id = existingKey ?? key(input.id, "ID");
  const simulation = input.simulation ? oneOf(input.simulation, SIMULATIONS, "Simulation") : null;
  return {
    id,
    subject_slug: key(input.subjectSlug, "Subject"),
    title: str(input.title, "Title", { max: 200 }),
    type: oneOf(input.type, ACTIVITY_TYPES, "Activity type"),
    difficulty: oneOf(input.difficulty, DIFFICULTIES, "Difficulty"),
    duration_mins: int(input.durationMins ?? 0, "Duration", 0, 10000),
    summary: str(input.summary, "Summary", { max: 2000 }),
    objectives: strList(input.objectives, "Objectives"),
    // Step ids are what learner progress records, so keep existing ids and only mint new ones.
    steps: objList(input.steps, "Steps", (s, i) => ({
      id: typeof s.id === "string" && s.id ? s.id : `${id}-step-${Date.now().toString(36)}-${i + 1}`,
      title: str(s.title, `Step ${i + 1} title`, { max: 200 }),
      detail: str(s.detail, `Step ${i + 1} detail`, { optional: true, max: 2000 }),
    })),
    criteria: objList(input.criteria, "Assessment criteria", (c, i) => ({
      criterion: str(c.criterion, `Criterion ${i + 1} name`, { max: 200 }),
      weight: int(c.weight, `Criterion ${i + 1} weight`, 0, 100),
      description: str(c.description, `Criterion ${i + 1} description`, { optional: true, max: 1000 }),
    })),
    deliverable: str(input.deliverable, "Deliverable", { optional: true, max: 2000 }),
    simulation,
    ...meta(input),
  };
}

function parseResource(input: Row, existingKey?: string): Row {
  const url = str(input.url, "URL", { max: 1000 });
  if (!/^(https?:\/\/|\/)\S+$/i.test(url)) fail("URL must start with https://, http:// or / (for an EduMate page).");
  return {
    id: existingKey ?? key(input.id, "ID"),
    title: str(input.title, "Title", { max: 300 }),
    author: str(input.author, "Author", { optional: true, max: 300 }),
    type: oneOf(input.type, RESOURCE_TYPES, "Resource type"),
    year: str(input.year, "Year", { optional: true, max: 20 }) || null,
    description: str(input.description, "Description", { optional: true, max: 2000 }),
    url,
    licence: str(input.licence, "Licence", { optional: true, max: 200 }) || null,
    access: oneOf(input.access, ["external", "edumate"] as const, "Access"),
    subject_slugs: strList(input.subjectSlugs, "Subjects", 20),
    ...meta(input),
  };
}

/** Validates admin input and returns a DB row, or an error message. */
export function parseContent(kind: ContentKind, input: unknown, existingKey?: string): { row: Row } | { error: string } {
  if (!input || typeof input !== "object") return { error: "Invalid request body." };
  try {
    const row =
      kind === "subjects" ? parseSubject(input as Row, existingKey)
      : kind === "labs" ? parseLab(input as Row, existingKey)
      : parseResource(input as Row, existingKey);
    return { row };
  } catch (err) {
    if (err instanceof InvalidInput) return { error: err.message };
    throw err;
  }
}
