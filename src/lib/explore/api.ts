/**
 * API INTEGRATION BOUNDARY for the Explore expansion.
 *
 * Every page reads data ONLY through these functions. They query the Explore
 * tables in Supabase (supabase/explore.sql) on the server. Return types are the
 * domain types in ./types.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  POST_COLUMNS,
  SUBJECT_SUMMARY_COLUMNS,
  toCommunityPost,
  toLabProject,
  toResource,
  toSubjectDetail,
  toSubjectSummary,
} from "./mappers";
import type {
  AcademicResource,
  CommunityPost,
  LabProject,
  SubjectDetail,
  SubjectSummary,
} from "./types";

/** Demo switch for reviewing states: append ?demo=empty or ?demo=error to an Explore URL. */
export type DemoMode = "empty" | "error" | undefined;

export function parseDemo(value: string | string[] | undefined): DemoMode {
  return value === "empty" || value === "error" ? value : undefined;
}

function throwIfDemoError(demo?: DemoMode) {
  if (demo === "error") throw new Error("Demo error: the Explore service is unavailable.");
}

function applyDemo<T>(data: T, empty: T, demo?: DemoMode): T {
  return demo === "empty" ? empty : data;
}

function fail(what: string, error: { message: string }): never {
  console.error(`Explore: failed to load ${what}:`, error);
  throw new Error(`Unable to load ${what}.`);
}

export async function listSubjects(demo?: DemoMode): Promise<SubjectSummary[]> {
  throwIfDemoError(demo);
  const { data, error } = await createAdminClient()
    .from("explore_subjects")
    .select(SUBJECT_SUMMARY_COLUMNS)
    .eq("is_published", true)
    .order("sort_order");
  if (error) fail("subjects", error);
  return applyDemo(data.map(toSubjectSummary), [], demo);
}

export async function getSubject(slug: string): Promise<SubjectDetail | null> {
  const { data, error } = await createAdminClient()
    .from("explore_subjects")
    .select(`${SUBJECT_SUMMARY_COLUMNS}, detail`)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) fail("subject", error);
  return data ? toSubjectDetail(data) : null;
}

export async function listLabProjects(demo?: DemoMode): Promise<LabProject[]> {
  throwIfDemoError(demo);
  const { data, error } = await createAdminClient()
    .from("explore_lab_projects")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (error) fail("lab projects", error);
  return applyDemo(data.map(toLabProject), [], demo);
}

export async function getLabProject(id: string): Promise<LabProject | null> {
  const { data, error } = await createAdminClient()
    .from("explore_lab_projects")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();
  if (error) fail("lab project", error);
  return data ? toLabProject(data) : null;
}

export async function listResources(demo?: DemoMode): Promise<AcademicResource[]> {
  throwIfDemoError(demo);
  const { data, error } = await createAdminClient()
    .from("explore_resources")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (error) fail("resources", error);
  return applyDemo(data.map(toResource), [], demo);
}

export async function getResourcesByIds(ids: string[]): Promise<AcademicResource[]> {
  if (ids.length === 0) return [];
  const { data, error } = await createAdminClient()
    .from("explore_resources")
    .select("*")
    .in("id", ids)
    .eq("is_published", true)
    .order("sort_order");
  if (error) fail("resources", error);
  return data.map(toResource);
}

/** Moderator-approved posts only. A learner's own pending posts come from /api/explore/me. */
export async function listCommunityPosts(demo?: DemoMode): Promise<CommunityPost[]> {
  throwIfDemoError(demo);
  const { data, error } = await createAdminClient()
    .from("explore_community_feed")
    .select(POST_COLUMNS)
    .eq("moderation", "reviewed")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) fail("community posts", error);
  return applyDemo(data.map(toCommunityPost), [], demo);
}
