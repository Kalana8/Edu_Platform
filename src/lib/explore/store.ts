"use client";

/**
 * Local learner state for Explore (saved interests, lab progress,
 * submissions, community interactions). Persists to localStorage until backend
 * endpoints exist — swap the read/write functions for API calls later.
 */

import { useCallback, useSyncExternalStore } from "react";
import type { CommunityPost } from "./types";

const PREFIX = "edumate.explore.";
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function read<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode etc.) — keep in-memory value.
    cache.set(key, { raw: JSON.stringify(value), value });
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(PREFIX)) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function usePersistent<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const set = useCallback(
    (update: (prev: T) => T) => write(key, update(read(key, fallback))),
    [key, fallback],
  );
  return [value, set] as const;
}

// ── Saved interests ─────────────────────────────────────────────────────────

const NO_STRINGS: string[] = [];

export function useSavedInterests() {
  const [saved, setSaved] = usePersistent<string[]>("interests", NO_STRINGS);
  const toggle = useCallback(
    (slug: string) =>
      setSaved((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug])),
    [setSaved],
  );
  return { saved, toggle, isSaved: (slug: string) => saved.includes(slug) };
}

// ── Lab / project progress ──────────────────────────────────────────────────

export interface Submission {
  summary: string;
  link: string;
  submittedAt: string;
}

export interface ProjectState {
  started: boolean;
  completedSteps: string[];
  submission?: Submission;
}

type ProjectMap = Record<string, ProjectState>;
const NO_PROJECTS: ProjectMap = {};
const EMPTY_PROJECT: ProjectState = { started: false, completedSteps: [] };

export function useAllProjectStates() {
  const [projects] = usePersistent<ProjectMap>("projects", NO_PROJECTS);
  return projects;
}

export function useProjectState(projectId: string) {
  const [projects, setProjects] = usePersistent<ProjectMap>("projects", NO_PROJECTS);
  const state = projects[projectId] ?? EMPTY_PROJECT;

  const update = useCallback(
    (fn: (s: ProjectState) => ProjectState) =>
      setProjects((prev) => ({ ...prev, [projectId]: fn(prev[projectId] ?? EMPTY_PROJECT) })),
    [projectId, setProjects],
  );

  return {
    state,
    start: () => update((s) => ({ ...s, started: true })),
    toggleStep: (stepId: string) =>
      update((s) => ({
        ...s,
        started: true,
        completedSteps: s.completedSteps.includes(stepId)
          ? s.completedSteps.filter((x) => x !== stepId)
          : [...s.completedSteps, stepId],
      })),
    submit: (submission: Omit<Submission, "submittedAt">) =>
      update((s) => ({ ...s, started: true, submission: { ...submission, submittedAt: new Date().toISOString() } })),
    withdraw: () => update((s) => ({ ...s, submission: undefined })),
    reset: () => update(() => EMPTY_PROJECT),
  };
}

// ── Community interactions ──────────────────────────────────────────────────

const NO_POSTS: CommunityPost[] = [];

export function useCommunityState() {
  const [appreciated, setAppreciated] = usePersistent<string[]>("appreciated", NO_STRINGS);
  const [reported, setReported] = usePersistent<string[]>("reported", NO_STRINGS);
  const [myPosts, setMyPosts] = usePersistent<CommunityPost[]>("myPosts", NO_POSTS);

  return {
    appreciated,
    reported,
    myPosts,
    toggleAppreciate: (id: string) =>
      setAppreciated((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    report: (id: string) => setReported((prev) => (prev.includes(id) ? prev : [...prev, id])),
    undoReport: (id: string) => setReported((prev) => prev.filter((x) => x !== id)),
    addPost: (post: CommunityPost) => setMyPosts((prev) => [post, ...prev]),
    removePost: (id: string) => setMyPosts((prev) => prev.filter((p) => p.id !== id)),
  };
}
