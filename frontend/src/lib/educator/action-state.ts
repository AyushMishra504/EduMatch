import type { PublishGap } from "./completeness";

/** Shared server-action result shape for educator forms (client-safe). */
export type ActionState = {
  ok: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
  formError?: string;
  /** Publish-blocking sections with deep-link steps (publish flows only). */
  missingSteps?: PublishGap[];
};

export const initial: ActionState = { ok: false };
