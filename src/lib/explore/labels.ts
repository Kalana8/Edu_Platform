import type { LabProject } from "./types";

export const activityLabels: Record<LabProject["type"], string> = {
  simulation: "Interactive simulation",
  coding: "Coding exercise",
  challenge: "Engineering challenge",
  experiment: "Virtual experiment",
  project: "Project",
};
