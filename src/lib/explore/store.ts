"use client";

/**
 * Learner state for Explore (saved interests, lab progress, submissions,
 * community interactions), backed by the /api/explore routes.
 *
 * State is loaded once per page session from GET /api/explore/me and shared by
 * every hook. Actions update the UI immediately, then sync to the server; if a
 * request fails the state is reloaded from the server so the UI never drifts.
 */

import { useCallback, useSyncExternalStore } from "react";
import type { CommunityPost } from "./types";
import type {
  ExploreLearnerState,
  NewPostInput,
  ProjectAction,
  ProjectMap,
  ProjectState,
} from "./store-types";

export type { ProjectState, Submission } from "./store-types";

interface StoreState extends ExploreLearnerState {
  status: "idle" | "loading" | "ready" | "error";
  /** Posts the learner had appreciated when state was loaded (already counted in post.appreciations). */
  initiallyAppreciated: string[];
}

const EMPTY: StoreState = {
  status: "idle",
  savedInterests: [],
  projects: {},
  appreciated: [],
  reported: [],
  myPosts: [],
  initiallyAppreciated: [],
};

let state: StoreState = EMPTY;
const listeners = new Set<() => void>();

function setState(patch: Partial<StoreState> | ((s: StoreState) => Partial<StoreState>)) {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  listeners.forEach((l) => l());
}

let inflight: Promise<void> | null = null;

function load(force = false): Promise<void> {
  if (inflight) return inflight;
  if (!force && state.status !== "idle") return Promise.resolve();
  if (state.status === "idle") setState({ status: "loading" });
  inflight = fetch("/api/explore/me", { cache: "no-store" })
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ExploreLearnerState;
      setState({ ...data, initiallyAppreciated: data.appreciated, status: "ready" });
    })
    .catch((err) => {
      console.error("Explore: could not load learner state", err);
      setState({ status: "error" });
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void load();
  return () => {
    listeners.delete(listener);
  };
}

function useStore() {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

async function send(url: string, method: string, body?: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`Explore: ${method} ${url} failed`, data);
      void load(true);
    }
    return { ok: res.ok, data };
  } catch (err) {
    console.error(`Explore: ${method} ${url} failed`, err);
    void load(true);
    return { ok: false, data: { error: "Network error. Please try again." } };
  }
}

const toggleIn = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

// ── Saved interests ─────────────────────────────────────────────────────────

export function useSavedInterests() {
  const { savedInterests: saved } = useStore();
  const toggle = useCallback((slug: string) => {
    const wasSaved = state.savedInterests.includes(slug);
    setState((s) => ({ savedInterests: toggleIn(s.savedInterests, slug) }));
    void send("/api/explore/interests", wasSaved ? "DELETE" : "POST", { subjectSlug: slug });
  }, []);
  return { saved, toggle, isSaved: (slug: string) => saved.includes(slug) };
}

// ── Lab / project progress ──────────────────────────────────────────────────

const EMPTY_PROJECT: ProjectState = { started: false, completedSteps: [] };

export function useAllProjectStates(): ProjectMap {
  return useStore().projects;
}

export function useProjectState(projectId: string) {
  const state = useStore().projects[projectId] ?? EMPTY_PROJECT;

  const run = useCallback(
    async (action: ProjectAction, optimistic: (s: ProjectState) => ProjectState) => {
      setState((s) => ({ projects: { ...s.projects, [projectId]: optimistic(s.projects[projectId] ?? EMPTY_PROJECT) } }));
      const { ok, data } = await send(`/api/explore/projects/${encodeURIComponent(projectId)}`, "POST", action);
      if (ok && data.state) setState((s) => ({ projects: { ...s.projects, [projectId]: data.state as ProjectState } }));
      return { ok, error: ok ? undefined : (data.error as string | undefined) };
    },
    [projectId],
  );

  return {
    state,
    start: () => run({ action: "start" }, (s) => ({ ...s, started: true })),
    toggleStep: (stepId: string) =>
      run({ action: "toggleStep", stepId }, (s) => ({ ...s, started: true, completedSteps: toggleIn(s.completedSteps, stepId) })),
    submit: (submission: { summary: string; link: string }) =>
      run({ action: "submit", ...submission }, (s) => ({
        ...s,
        started: true,
        submission: { ...submission, submittedAt: new Date().toISOString(), reviewStatus: "pending" },
      })),
    withdraw: () => run({ action: "withdraw" }, (s) => ({ ...s, submission: undefined })),
    reset: () => run({ action: "reset" }, () => EMPTY_PROJECT),
  };
}

// ── Community interactions ──────────────────────────────────────────────────

export function useCommunityState() {
  const { appreciated, reported, myPosts, initiallyAppreciated } = useStore();

  return {
    appreciated,
    reported,
    myPosts,
    /** Live count for a feed post, including this learner's toggle since the page loaded. */
    appreciationCount: (post: CommunityPost) =>
      post.appreciations - (initiallyAppreciated.includes(post.id) ? 1 : 0) + (appreciated.includes(post.id) ? 1 : 0),
    toggleAppreciate: (id: string) => {
      const was = state.appreciated.includes(id);
      setState((s) => ({ appreciated: toggleIn(s.appreciated, id) }));
      void send(`/api/explore/community/posts/${encodeURIComponent(id)}/appreciate`, was ? "DELETE" : "POST");
    },
    report: (id: string) => {
      if (state.reported.includes(id)) return;
      setState((s) => ({ reported: [...s.reported, id] }));
      void send(`/api/explore/community/posts/${encodeURIComponent(id)}/report`, "POST", {});
    },
    undoReport: (id: string) => {
      setState((s) => ({ reported: s.reported.filter((x) => x !== id) }));
      void send(`/api/explore/community/posts/${encodeURIComponent(id)}/report`, "DELETE");
    },
    /** Submits a post for moderation. Resolves with an error message if the server rejects it. */
    addPost: async (input: NewPostInput): Promise<{ ok: boolean; error?: string }> => {
      const { ok, data } = await send("/api/explore/community/posts", "POST", input);
      if (!ok) return { ok, error: (data.error as string) ?? "Unable to submit your post." };
      setState((s) => ({ myPosts: [data.post as CommunityPost, ...s.myPosts] }));
      return { ok };
    },
    removePost: (id: string) => {
      setState((s) => ({ myPosts: s.myPosts.filter((p) => p.id !== id) }));
      void send(`/api/explore/community/posts/${encodeURIComponent(id)}`, "DELETE");
    },
  };
}
