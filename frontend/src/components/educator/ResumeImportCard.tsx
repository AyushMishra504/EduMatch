"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, FileUp, TriangleAlert } from "lucide-react";

type Status = "idle" | "uploading" | "success" | "error";

type ImportResult =
  | { success: true; filled: string[]; warnings: string[] }
  | { success: false; error: { message: string }; warnings: string[] };

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Lightweight resume import card (spec §47). Uploads PDF/DOCX to
 * /api/profile/import-resume, which prefills the educator draft with
 * fill-only-empty rules. Never shows percentages or parser internals.
 */
export function ResumeImportCard({
  title = "Have your CV handy?",
  description = "Upload it once — we'll prefill what we can. Review and edit everything.",
  manualHref = null,
  className = "",
}: {
  title?: string;
  description?: string;
  manualHref?: string | null;
  className?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [stage, setStage] = useState(0);
  const [filled, setFilled] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setStatus("error");
      setError("Resume is too large (max 5 MB).");
      setWarnings([]);
      return;
    }
    setStatus("uploading");
    setStage(0);
    setError(null);
    const stageTimer = window.setTimeout(() => setStage(1), 2500);

    const form = new FormData();
    form.append("file", file, file.name);
    try {
      const response = await fetch("/api/profile/import-resume", {
        method: "POST",
        body: form,
      });
      const body = (await response.json()) as ImportResult;
      window.clearTimeout(stageTimer);
      if (body.success) {
        setFilled(body.filled);
        setWarnings(body.warnings);
        setStatus("success");
        router.refresh();
      } else {
        setError(
          body.error?.message ??
            "We couldn't read that resume. You can try another file or continue manually.",
        );
        setWarnings(body.warnings ?? []);
        setStatus("error");
      }
    } catch {
      window.clearTimeout(stageTimer);
      setError(
        "The resume service is not reachable right now. You can enter your details manually.",
      );
      setWarnings([]);
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setFilled([]);
    setWarnings([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div
      className={`rounded-md border border-rule bg-paper p-5 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-tint text-accent">
          <FileUp size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-serif text-lg font-medium text-ink">{title}</h2>
          <p className="mt-0.5 text-small text-ink-muted">{description}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        aria-label="Choose a resume file (PDF or DOCX, max 5 MB)"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {status === "idle" && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-11 items-center rounded-md bg-accent px-5 text-small font-semibold text-on-accent transition-colors hover:bg-accent-deep"
          >
            Upload resume
          </button>
          {manualHref ? (
            <Link
              href={manualHref}
              className="inline-flex h-11 items-center rounded-md border border-rule px-5 text-small font-semibold text-ink transition-colors hover:bg-paper-deep"
            >
              Enter details manually
            </Link>
          ) : null}
          <span className="w-full text-tiny text-ink-muted">
            PDF or DOCX · Max 5 MB · Never stored — only the extracted details are kept.
          </span>
        </div>
      )}

      {status === "uploading" && (
        <p className="mt-4 text-small text-ink-muted" role="status" aria-live="polite">
          {stage === 0 ? "Reading your resume…" : "Extracting your profile…"}
        </p>
      )}

      {status === "success" && (
        <div className="mt-4">
          <p className="text-small font-semibold text-ink">
            We&apos;ve filled in your profile from your resume.
          </p>
          {filled.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {filled.map((item) => (
                <li key={item} className="flex items-center gap-2 text-small text-ink-muted">
                  <Check size={14} aria-hidden="true" className="shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-small text-ink-muted">
              Nothing new to fill — your profile already had these details.
            </p>
          )}
          {warnings.length > 0 ? (
            <ul className="mt-3 space-y-1 border-t border-rule pt-3">
              {warnings.map((warning) => (
                <li key={warning} className="flex items-start gap-2 text-small text-ink-muted">
                  <TriangleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="mt-4 text-small font-semibold text-accent hover:text-accent-deep"
          >
            Upload a different resume
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="mt-4">
          <p className="text-small font-semibold text-ink">
            We couldn&apos;t read that resume.
          </p>
          <p className="mt-1 text-small text-ink-muted">{error}</p>
          {warnings.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {warnings.map((warning) => (
                <li key={warning} className="text-small text-ink-muted">
                  {warning}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 items-center rounded-md bg-accent px-4 text-small font-semibold text-on-accent transition-colors hover:bg-accent-deep"
            >
              Try another resume
            </button>
            {manualHref ? (
              <Link
                href={manualHref}
                className="inline-flex h-10 items-center rounded-md border border-rule px-4 text-small font-semibold text-ink transition-colors hover:bg-paper-deep"
              >
                Continue manually
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
