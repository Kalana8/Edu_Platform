/** Learner-state shapes shared by the client store and the /api/explore routes. */

import type { CommunityPost, PostKind } from "./types";

export interface Submission {
  summary: string;
  link: string;
  submittedAt: string;
  reviewStatus?: "pending" | "verified" | "returned";
  feedback?: string;
}

export interface ProjectState {
  started: boolean;
  completedSteps: string[];
  submission?: Submission;
}

export type ProjectMap = Record<string, ProjectState>;

export type ProjectAction =
  | { action: "start" }
  | { action: "toggleStep"; stepId: string }
  | { action: "submit"; summary: string; link: string }
  | { action: "withdraw" }
  | { action: "reset" };

export interface NewPostInput {
  kind: PostKind;
  subjectSlug: string;
  title: string;
  excerpt: string;
}

/** Response of GET /api/explore/me. */
export interface ExploreLearnerState {
  savedInterests: string[];
  projects: ProjectMap;
  appreciated: string[];
  reported: string[];
  myPosts: CommunityPost[];
}
