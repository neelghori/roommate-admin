"use client";

import { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { toast } from "sonner";
import { useFormikForm } from "@/hooks/use-formik-form";
import {
  FAQ_DEFAULT_ITEMS,
  type FaqItem,
  loadAdminFaqs,
  newFaqId,
  saveAdminFaqs,
} from "@/lib/faq/admin-faq-store";

export type { FaqItem };

const addSchema = Yup.object({
  question: Yup.string().trim().required("Please add the question"),
  answer: Yup.string().trim().required("Please add the answer"),
});

type AddFormValues = Yup.InferType<typeof addSchema>;

export function FaqModule() {
  const [items, setItems] = useState<FaqItem[]>(FAQ_DEFAULT_ITEMS);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(true);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ question: "", answer: "" });
  const [editFieldErrors, setEditFieldErrors] = useState<{
    question?: string;
    answer?: string;
  }>({});

  useEffect(() => {
    setItems(loadAdminFaqs());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveAdminFaqs(items);
  }, [items, mounted]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q),
    );
  }, [items, query]);

  const addForm = useFormikForm<AddFormValues>({
    initialValues: { question: "", answer: "" },
    validationSchema: addSchema,
    onSubmit: (values, { resetForm }) => {
      const next: FaqItem = {
        id: newFaqId(),
        question: values.question.trim(),
        answer: values.answer.trim(),
      };
      setItems((prev) => [next, ...prev]);
      setOpenIds((prev) => new Set(prev).add(next.id));
      resetForm();
      toast.success("Saved to your FAQ list.");
    },
  });

  const qInvalid =
    Boolean(addForm.touched.question && addForm.errors.question);
  const aInvalid =
    Boolean(addForm.touched.answer && addForm.errors.answer);

  function startEdit(item: FaqItem) {
    setEditingId(item.id);
    setEditDraft({ question: item.question, answer: item.answer });
    setEditFieldErrors({});
    setOpenIds((prev) => new Set(prev).add(item.id));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditFieldErrors({});
  }

  function saveEdit() {
    if (!editingId) return;
    const q = editDraft.question.trim();
    const a = editDraft.answer.trim();
    const err: { question?: string; answer?: string } = {};
    if (!q) err.question = "Please add the question";
    if (!a) err.answer = "Please add the answer";
    if (Object.keys(err).length > 0) {
      setEditFieldErrors(err);
      return;
    }
    setItems((prev) =>
      prev.map((x) =>
        x.id === editingId ? { ...x, question: q, answer: a } : x,
      ),
    );
    setEditingId(null);
    setEditFieldErrors({});
    toast.success("FAQ updated.");
  }

  function removeFaq(item: FaqItem) {
    if (editingId === item.id) cancelEdit();
    const ok = window.confirm(
      `Remove this FAQ?\n\n“${item.question.slice(0, 80)}${item.question.length > 80 ? "…" : ""}”`,
    );
    if (!ok) return;
    setItems((prev) => prev.filter((x) => x.id !== item.id));
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
    toast.success("FAQ removed.");
  }

  function toggleOpen(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const inputStyles = (invalid: boolean) =>
    `w-full rounded-xl border px-4 py-3 text-sm text-neutral-900 shadow-sm outline-none transition-[box-shadow,border-color] placeholder:text-neutral-400 focus:ring-2 ${
      invalid
        ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-200/50"
        : "border-neutral-200 bg-white focus:border-roommat-teal focus:ring-roommat-teal/20"
    }`;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-roommat-teal/90">
            Module
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            FAQ &amp; help center
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-roommat-muted sm:text-base">
            Keep answers in one place so your admin team finds them fast. Add
            entries below — they stay saved on this computer for next time.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-roommat-teal/20 bg-roommat-mint-bg/60 px-4 py-2 text-sm font-medium text-roommat-teal">
            <span className="tabular-nums font-bold text-neutral-900">
              {items.length}
            </span>
            {items.length === 1 ? "question" : "questions"}
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Add panel */}
        <section className="lg:col-span-5 xl:col-span-4">
          <div className="overflow-hidden rounded-2xl border border-roommat-teal/20 bg-gradient-to-b from-white to-roommat-mint-bg/30 shadow-[0_12px_40px_-20px_rgba(21,128,120,0.35)]">
            <button
              type="button"
              onClick={() => setShowAddPanel((v) => !v)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-white/60 sm:px-6"
              aria-expanded={showAddPanel}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-roommat-teal text-white shadow-sm">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </span>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    New FAQ entry
                  </h2>
                  <p className="text-xs text-roommat-muted">
                    {showAddPanel ? "Fill in both fields, then save" : "Tap to expand"}
                  </p>
                </div>
              </div>
              <svg
                className={`h-5 w-5 shrink-0 text-roommat-teal transition-transform ${showAddPanel ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {showAddPanel ? (
              <form
                className="space-y-4 border-t border-roommat-teal/10 bg-white/80 px-5 pb-6 pt-5 sm:px-6"
                onSubmit={addForm.handleSubmit}
                noValidate
              >
                <div className="space-y-2">
                  <label
                    htmlFor="faq-new-question"
                    className="block text-sm font-semibold text-neutral-800"
                  >
                    What is the question?
                  </label>
                  <textarea
                    id="faq-new-question"
                    rows={3}
                    placeholder="e.g. How do I reset someone’s password?"
                    {...addForm.getFieldProps("question")}
                    className={`resize-y ${inputStyles(qInvalid)}`}
                  />
                  {qInvalid ? (
                    <p className="text-sm text-red-600">{addForm.errors.question}</p>
                  ) : (
                    <p className="text-xs text-roommat-muted">
                      Write it like your teammate would ask it out loud.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="faq-new-answer"
                    className="block text-sm font-semibold text-neutral-800"
                  >
                    What is the answer?
                  </label>
                  <textarea
                    id="faq-new-answer"
                    rows={5}
                    placeholder="Short steps or explanation — you can change this anytime with Edit."
                    {...addForm.getFieldProps("answer")}
                    className={`resize-y ${inputStyles(aInvalid)}`}
                  />
                  {aInvalid ? (
                    <p className="text-sm text-red-600">{addForm.errors.answer}</p>
                  ) : (
                    <p className="text-xs text-roommat-muted">
                      Use plain language and bullet steps if it helps.
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <button
                    type="submit"
                    disabled={addForm.isSubmitting}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-roommat-teal px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-roommat-teal-hover disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none"
                  >
                    Save to list
                  </button>
                  <button
                    type="button"
                    onClick={() => addForm.resetForm()}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    Clear form
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </section>

        {/* List + search */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-neutral-900">All questions</h2>
            <div className="relative w-full sm:max-w-md">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-roommat-muted"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                id="faq-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by keyword…"
                className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-10 text-sm shadow-md shadow-neutral-900/5 outline-none transition focus:border-roommat-teal focus:ring-2 focus:ring-roommat-teal/20"
                aria-label="Search FAQs"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-roommat-teal hover:bg-roommat-mint-bg/50"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <p className="mb-4 text-sm text-roommat-muted">
            {query.trim() ? (
              <>
                Showing{" "}
                <span className="font-semibold text-neutral-800">
                  {filtered.length}
                </span>{" "}
                of {items.length} — tap a card to show or hide the answer.
              </>
            ) : (
              <>
                Tap a card to read the answer. Use Edit to change text, or Remove
                if it is outdated.
              </>
            )}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-roommat-mint-bg/25 px-6 py-14 text-center">
              <p className="font-medium text-neutral-800">No matches</p>
              <p className="mt-2 text-sm text-roommat-muted">
                Try a different search, or clear the box to see everything again.
              </p>
              {query.trim() ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-5 rounded-xl bg-roommat-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-roommat-teal-hover"
                >
                  Clear search
                </button>
              ) : null}
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((item) => {
                const open = openIds.has(item.id);
                const isEditing = editingId === item.id;
                return (
                  <li key={item.id}>
                    <div
                      className={`overflow-hidden rounded-2xl border bg-white shadow-md shadow-neutral-900/[0.04] transition-[border-color,box-shadow] ${
                        isEditing || open
                          ? "border-roommat-teal/30 ring-1 ring-roommat-teal/10"
                          : "border-neutral-100 hover:border-roommat-teal/20"
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-4 p-4 sm:p-5">
                          <p className="flex items-center gap-2 text-sm font-bold text-roommat-teal">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                            Edit this FAQ
                          </p>
                          <div className="space-y-2">
                            <label
                              htmlFor={`faq-edit-q-${item.id}`}
                              className="block text-sm font-semibold text-neutral-800"
                            >
                              Question
                            </label>
                            <textarea
                              id={`faq-edit-q-${item.id}`}
                              rows={3}
                              value={editDraft.question}
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...d,
                                  question: e.target.value,
                                }))
                              }
                              className={`resize-y ${inputStyles(Boolean(editFieldErrors.question))}`}
                            />
                            {editFieldErrors.question ? (
                              <p className="text-sm text-red-600">
                                {editFieldErrors.question}
                              </p>
                            ) : null}
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor={`faq-edit-a-${item.id}`}
                              className="block text-sm font-semibold text-neutral-800"
                            >
                              Answer
                            </label>
                            <textarea
                              id={`faq-edit-a-${item.id}`}
                              rows={5}
                              value={editDraft.answer}
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...d,
                                  answer: e.target.value,
                                }))
                              }
                              className={`resize-y ${inputStyles(Boolean(editFieldErrors.answer))}`}
                            />
                            {editFieldErrors.answer ? (
                              <p className="text-sm text-red-600">
                                {editFieldErrors.answer}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            <button
                              type="button"
                              onClick={saveEdit}
                              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-roommat-teal px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-roommat-teal-hover sm:flex-none"
                            >
                              Save changes
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-3 sm:p-5">
                            <button
                              type="button"
                              onClick={() => toggleOpen(item.id)}
                              className="min-w-0 flex-1 text-left"
                              aria-expanded={open}
                            >
                              <span className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-roommat-mint-bg/80 text-xs font-bold text-roommat-teal">
                                  Q
                                </span>
                                <span>
                                  <span className="block font-semibold leading-snug text-neutral-900">
                                    {item.question}
                                  </span>
                                  <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-roommat-teal">
                                    {open ? (
                                      <>
                                        Hide answer
                                        <svg
                                          className="h-3.5 w-3.5"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth={2}
                                          stroke="currentColor"
                                          aria-hidden
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4.5 15.75l7.5-7.5 7.5 7.5"
                                          />
                                        </svg>
                                      </>
                                    ) : (
                                      <>
                                        Show answer
                                        <svg
                                          className="h-3.5 w-3.5"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth={2}
                                          stroke="currentColor"
                                          aria-hidden
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                          />
                                        </svg>
                                      </>
                                    )}
                                  </span>
                                </span>
                              </span>
                            </button>
                            <div className="flex shrink-0 justify-end gap-1 sm:flex-col sm:items-stretch sm:justify-start">
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="rounded-xl border border-roommat-teal/25 bg-roommat-mint-bg/40 px-3 py-2 text-xs font-semibold text-roommat-teal transition-colors hover:bg-roommat-mint-bg"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFaq(item)}
                                className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold text-red-600/90 transition-colors hover:border-red-100 hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          {open ? (
                            <div className="border-t border-roommat-teal/10 bg-roommat-mint-bg/25 px-4 pb-5 pt-4 sm:px-5">
                              <div className="flex gap-3">
                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-roommat-teal shadow-sm ring-1 ring-roommat-teal/15">
                                  A
                                </span>
                                <p className="min-w-0 flex-1 text-sm leading-relaxed text-neutral-700 sm:text-base">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
