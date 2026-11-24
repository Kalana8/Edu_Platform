/**
 * Domain types for the University-Informed Advanced Learning expansion.
 * These mirror the shapes the backend is expected to return (see ./api.ts).
 */

export type Difficulty = "beginner" | "intermediate" | "advanced" | "university";

export type Discipline =
  | "Engineering"
  | "Computing"
  | "Energy & Environment"
  | "Physical Sciences"
  | "Life Sciences";

export type Motif =
  | "robot"
  | "neural"
  | "battery"
  | "chip"
  | "cycle"
  | "rocket"
  | "dna"
  | "qubit"
  | "lattice";

/** Maps onto the EXISTING academy structure — no new academy tiers are introduced. */
export type AcademyLevel = "Foundation" | "Advanced" | "Elite Mastery";

export interface SubjectTheme {
  /** Main illustration colour (hex). */
  base: string;
  /** Accent used for highlights in the illustration (hex). */
  accent: string;
  /** Soft tint used for chips/backgrounds (hex). */
  tint: string;
  /** Readable text colour on the tint (hex). */
  ink: string;
}

export interface SubjectSummary {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  discipline: Discipline;
  difficulty: Difficulty;
  motif: Motif;
  theme: SubjectTheme;
  status: "available" | "coming-soon";
  tags: string[];
  featured?: boolean;
  trending?: boolean;
  emerging?: boolean;
  beginnerFriendly?: boolean;
  universityLevel?: boolean;
  /** ISO date the pathway was added. */
  addedAt: string;
  estimatedHours: number;
  /** Illustrative demo metric. */
  learnersExploring: number;
}

export interface Prerequisite {
  title: string;
  why: string;
  /** Slug of an EXISTING EduMate knowledge category that teaches this. */
  categorySlug?: string;
}

export interface LearningStage {
  id: string;
  title: string;
  academy: AcademyLevel;
  summary: string;
  weeks: number;
}

export interface Topic {
  id: string;
  title: string;
  /** "edumate" = original EduMate content; "reference" = adapted from an external academic reference. */
  source: "edumate" | "reference";
  durationMins: number;
  /** Placeholder link to an existing micro-lesson (content id) once mapped. */
  microLessonId?: string;
}

export interface CurriculumModule {
  id: string;
  number: number;
  title: string;
  summary: string;
  weeks: string;
  topics: Topic[];
  /** Resource ids (lectures / videos). */
  lectureRefs: string[];
  /** Resource ids (readings). */
  readings: string[];
  /** LabProject id for the practical activity, if any. */
  practicalId?: string;
}

export interface CurriculumAssessment {
  title: string;
  type: "Mastery quiz" | "Project" | "Practical" | "Written explanation";
  weight: number;
  description: string;
}

export interface Curriculum {
  referenceInstitution: string;
  referenceUnitTitle: string;
  referenceUnitCode: string | null;
  isIllustrative: true;
  description: string;
  outcomes: string[];
  prerequisites: string[];
  modules: CurriculumModule[];
  assessments: CurriculumAssessment[];
  furtherStudy: string[];
}

export interface SubjectDetail extends SubjectSummary {
  introduction: string;
  applications: { title: string; description: string }[];
  whyItMatters: string[];
  outcomes: string[];
  foundationalKnowledge: string[];
  prerequisites: Prerequisite[];
  stages: LearningStage[];
  durationLabel: string;
  /** EXISTING EduMate category this subject extends. */
  relatedCategorySlug?: string;
  curriculum: Curriculum | null;
}

export type ActivityType = "simulation" | "coding" | "challenge" | "experiment" | "project";

export type SimulationKind = "battery" | "robot-arm" | "transistor" | "neural-net" | "circuit" | "resources";

export interface LabProject {
  id: string;
  subjectSlug: string;
  title: string;
  type: ActivityType;
  difficulty: Difficulty;
  durationMins: number;
  summary: string;
  objectives: string[];
  steps: { id: string; title: string; detail: string }[];
  criteria: { criterion: string; weight: number; description: string }[];
  deliverable: string;
  simulation?: SimulationKind;
}

export type ResourceType =
  | "unit-outline"
  | "lecture"
  | "paper"
  | "article"
  | "textbook"
  | "video"
  | "oer"
  | "documentation";

export interface AcademicResource {
  id: string;
  title: string;
  author: string;
  type: ResourceType;
  year?: string;
  description: string;
  url: string;
  licence?: string;
  /** "external" = linked out (EduMate does not reproduce it). */
  access: "external" | "edumate";
  subjectSlugs: string[];
}

export type PostKind = "showcase" | "discovery" | "explanation" | "discussion";

export interface CommunityPost {
  id: string;
  kind: PostKind;
  title: string;
  excerpt: string;
  /** Privacy-safe display name: first name + initial only. */
  authorDisplay: string;
  authorBand?: "Under 16" | "16–18" | "Adult learner";
  /** Broad region only (e.g. continent); absent when unknown. */
  region?: string;
  subjectSlug: string;
  createdAt: string;
  appreciations: number;
  replies: number;
  achievement?: string;
  moderation: "reviewed" | "pending" | "rejected";
}
