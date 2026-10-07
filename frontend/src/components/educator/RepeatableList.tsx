"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

/**
 * Accordion repeatable list: filled entries render as collapsed summary
 * cards (Edit to expand), so the user never faces a wall of empty forms.
 * New entries open automatically. Data still serializes to one JSON hidden
 * input — the server contract is unchanged.
 */
export function RepeatableList<T>({
  name,
  rows,
  onChange,
  renderRow,
  renderSummary,
  emptyRow,
  emptyTitle,
  emptyBody,
  addLabel,
  max,
  min,
  isRowEmpty,
}: {
  name: string;
  rows: T[];
  onChange: (rows: T[]) => void;
  renderRow: (row: T, index: number, update: (patch: Partial<T>) => void) => React.ReactNode;
  renderSummary: (row: T, index: number) => React.ReactNode;
  emptyRow: T;
  emptyTitle: string;
  emptyBody: string;
  addLabel: string;
  max: number;
  min: number;
  /**
   * Rows the user never touched are dropped from the serialized payload.
   * Without this, the always-present blank starter row would fail server
   * validation ("add an end year") and block the save.
   */
  isRowEmpty?: (row: T) => boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(
    rows.length <= 1 ? 0 : null,
  );

  function update(index: number, patch: Partial<T>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function remove(index: number) {
    const next = rows.filter((_, i) => i !== index);
    onChange(next);
    setOpenIndex((open) => {
      if (open === null) return null;
      if (open === index) return null;
      return open > index ? open - 1 : open;
    });
  }

  function add() {
    onChange([...rows, emptyRow]);
    setOpenIndex(rows.length);
  }

  return (
    <div>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(
          isRowEmpty ? rows.filter((row) => !isRowEmpty(row)) : rows,
        )}
      />
      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-rule px-4 py-6 text-center">
          <p className="text-small font-semibold text-ink">{emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-sm text-small leading-relaxed text-ink-muted">
            {emptyBody}
          </p>
        </div>
      ) : null}
      <div className="space-y-3">
        {rows.map((row, index) => {
          const open = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-md border border-rule bg-paper p-4"
            >
              {open ? (
                <div className="animate-fadein">
                  {renderRow(row, index, (patch) => update(index, patch))}
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={rows.length <= min}
                      onClick={() => remove(index)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-small font-medium text-ink-muted transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(null)}
                      className="rounded-md border border-rule px-3 py-1.5 text-small font-semibold text-ink transition-colors hover:bg-paper-deep"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">{renderSummary(row, index)}</div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setOpenIndex(index)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-small font-semibold text-accent transition-colors hover:text-accent-deep"
                      aria-label={`Edit entry ${index + 1}`}
                    >
                      <Pencil size={13} aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={rows.length <= min}
                      onClick={() => remove(index)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-small font-medium text-ink-muted transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Remove entry ${index + 1}`}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {rows.length < max ? (
        <button
          type="button"
          onClick={add}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-rule px-3 py-2 text-small font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <Plus size={16} aria-hidden="true" />
          {addLabel}
        </button>
      ) : (
        <p className="mt-2 text-small text-ink-muted">{max} maximum</p>
      )}
    </div>
  );
}
