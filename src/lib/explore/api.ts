/**
 * API INTEGRATION BOUNDARY for the Explore expansion.
 *
 * Every page reads data ONLY through these functions. They currently resolve
 * mock data with a small artificial latency (so loading states are visible).
 * To connect the backend, replace each body with a call to the real endpoint,
 * e.g. `createAdminClient().from("explore_subjects")...` or `fetch("/api/explore/...")`,
 * keeping the return types unchanged.
 */

import { subjects, toSummary } from "./data/subjects";
import { labProjects } from "./data/labs";
import { resources } from "./data/resources";
import { communityPosts } from "./data/community";
import type {
  AcademicResource,
  CommunityPost,
  LabProject,
  SubjectDetail,
  SubjectSummary,
} from "./types";

const MOCK_LATENCY_MS = 300;

/** Demo switch for reviewing states: append ?demo=empty or ?demo=error to an Explore URL. */
export type DemoMode = "empty" | "error" | undefined;

export function parseDemo(value: string | string[] | undefined): DemoMode {
  return value === "empty" || value === "error" ? value : undefined;
}

async function respond<T>(data: T, empty: T, demo?: DemoMode): Promise<T> {
  await new Promise((r) => setTimeout(r, MOCK_LATENCY_MS));
  if (demo === "error") throw new Error("Demo error: the Explore service is unavailable.");
  return demo === "empty" ? empty : data;
}

export async function listSubjects(demo?: DemoMode): Promise<SubjectSummary[]> {
  return respond(subjects.map(toSummary), [], demo);
}

export async function getSubject(slug: string): Promise<SubjectDetail | null> {
  return respond(subjects.find((s) => s.slug === slug) ?? null, null);
}

export async function listLabProjects(demo?: DemoMode): Promise<LabProject[]> {
  return respond(labProjects, [], demo);
}

export async function getLabProject(id: string): Promise<LabProject | null> {
  return respond(labProjects.find((p) => p.id === id) ?? null, null);
}

export async function listResources(demo?: DemoMode): Promise<AcademicResource[]> {
  return respond(resources, [], demo);
}

export async function getResourcesByIds(ids: string[]): Promise<AcademicResource[]> {
  const set = new Set(ids);
  return respond(resources.filter((r) => set.has(r.id)), []);
}

export async function listCommunityPosts(demo?: DemoMode): Promise<CommunityPost[]> {
  return respond(communityPosts, [], demo);
}
