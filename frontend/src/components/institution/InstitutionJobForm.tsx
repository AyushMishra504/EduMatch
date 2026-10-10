"use client";

import { useActionState } from "react";
import {
  createInstitutionJob,
  type InstitutionJobFormState,
} from "@/lib/institution/actions";

const initialState: InstitutionJobFormState = {
  message: null,
  fieldErrors: {},
};

const fieldClassName =
  "w-full rounded-md border border-rule bg-paper-deep px-3 py-2 text-small text-ink placeholder:text-ink-muted/80 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";

function FieldError({ children }: { children?: string }) {
  return children ? (
    <p className="mt-1 text-tiny text-red-400" role="alert">
      {children}
    </p>
  ) : null;
}

export function InstitutionJobForm() {
  const [state, formAction, pending] = useActionState(
    createInstitutionJob,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="institution-vacancy-form mt-8 space-y-5 rounded-md border border-rule bg-paper p-6"
      noValidate
    >
      {state.message ? (
        <p
          className="rounded-md border border-red-400/40 bg-red-950/30 px-3 py-2 text-small text-red-200"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      <div>
        <label htmlFor="title" className="mb-1 block text-small font-medium text-ink">
          Role title
        </label>
        <input
          id="title"
          name="title"
          placeholder="e.g. Assistant Professor of Economics"
          aria-invalid={Boolean(state.fieldErrors.title)}
          aria-describedby={state.fieldErrors.title ? "title-error" : undefined}
          className={fieldClassName}
          required
        />
        {state.fieldErrors.title ? (
          <p id="title-error" className="mt-1 text-tiny text-red-400" role="alert">
            {state.fieldErrors.title}
          </p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="location" className="mb-1 block text-small font-medium text-ink">
            Location
          </label>
          <input
            id="location"
            name="location"
            placeholder="City, state"
            aria-invalid={Boolean(state.fieldErrors.location)}
            className={fieldClassName}
          />
          <FieldError>{state.fieldErrors.location}</FieldError>
        </div>
        <div>
          <label
            htmlFor="employmentType"
            className="mb-1 block text-small font-medium text-ink"
          >
            Employment type
          </label>
          <select
            id="employmentType"
            name="employmentType"
            defaultValue="FULL_TIME"
            aria-invalid={Boolean(state.fieldErrors.employmentType)}
            className={`${fieldClassName} institution-vacancy-select`}
          >
            <option value="FULL_TIME">Full time</option>
            <option value="PART_TIME">Part time</option>
            <option value="CONTRACT">Contract</option>
            <option value="VISITING">Visiting</option>
          </select>
          <FieldError>{state.fieldErrors.employmentType}</FieldError>
        </div>
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-small font-medium text-ink">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={7}
          placeholder="Describe the role, teaching responsibilities, and what the successful candidate will contribute."
          aria-invalid={Boolean(state.fieldErrors.description)}
          aria-describedby={
            state.fieldErrors.description ? "description-error" : undefined
          }
          className={fieldClassName}
          required
        />
        {state.fieldErrors.description ? (
          <p
            id="description-error"
            className="mt-1 text-tiny text-red-400"
            role="alert"
          >
            {state.fieldErrors.description}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-5 py-3 text-small font-semibold text-on-accent hover:bg-accent-deep disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Publishing…" : "Publish role"}
      </button>
    </form>
  );
}
