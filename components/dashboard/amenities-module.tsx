"use client";

import { useCallback, useMemo, useState } from "react";
import * as Yup from "yup";
import { toast } from "sonner";
import { useFormikForm } from "@/hooks/use-formik-form";
import {
  createAmenity,
  deleteAmenity,
  fetchAmenities,
  updateAmenity,
  type AmenityItem,
} from "@/lib/api/admin-amenities";
import {
  AMENITY_ICON_KEYS,
  AMENITY_ICON_LABELS,
  AmenityIcon,
  type AmenityIconKey,
} from "@/lib/amenities/amenity-icon";
import { getAdminAccessToken } from "@/lib/auth/admin-token";

export type { AmenityItem };

const addSchema = Yup.object({
  name: Yup.string().trim().required("Enter a name for this amenity"),
  iconKey: Yup.string()
    .oneOf([...AMENITY_ICON_KEYS], "Pick an icon")
    .required("Pick an icon"),
});

type AddValues = Yup.InferType<typeof addSchema>;

const ADD_INITIAL: AddValues = {
  name: "",
  iconKey: "wifi",
};

type AmenitiesModuleProps = {
  initialItems: AmenityItem[];
  initialError?: string | null;
};

export function AmenitiesModule({
  initialItems,
  initialError = null,
}: AmenitiesModuleProps) {
  const [items, setItems] = useState<AmenityItem[]>(initialItems);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    name: string;
    iconKey: AmenityIconKey;
  }>({ name: "", iconKey: "wifi" });
  const [editErrors, setEditErrors] = useState<{
    name?: string;
    iconKey?: string;
  }>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">(
    initialError ? "error" : "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialError,
  );

  const loadAmenities = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    const token = getAdminAccessToken();
    if (!token) {
      if (!silent) {
        setLoadState("error");
        setErrorMessage("You are not signed in.");
      }
      return;
    }
    if (!silent) {
      setLoadState("loading");
      setErrorMessage(null);
    }
    const result = await fetchAmenities(token);
    if (!result.ok) {
      if (!silent) {
        setLoadState("error");
        setErrorMessage(result.message);
        toast.error(result.message);
      } else {
        toast.error(result.message);
      }
      return;
    }
    setItems(result.items);
    if (!silent) {
      setLoadState("idle");
    }
  }, []);

  const reloadItemsSilent = useCallback(async () => {
    await loadAmenities({ silent: true });
  }, [loadAmenities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((a) => a.name.toLowerCase().includes(q));
  }, [items, query]);

  const addForm = useFormikForm<AddValues>({
    initialValues: ADD_INITIAL,
    validationSchema: addSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      const token = getAdminAccessToken();
      if (!token) {
        toast.error("You are not signed in.");
        setSubmitting(false);
        return;
      }
      const created = await createAmenity(token, {
        name: values.name.trim(),
        iconKey: values.iconKey,
      });
      if (!created.ok) {
        toast.error(created.message);
        setSubmitting(false);
        return;
      }
      await reloadItemsSilent();
      resetForm();
      toast.success("Amenity added.");
      setSubmitting(false);
    },
  });

  const nameInvalid =
    Boolean(addForm.touched.name && addForm.errors.name);
  const iconInvalid =
    Boolean(addForm.touched.iconKey && addForm.errors.iconKey);

  function startEdit(item: AmenityItem) {
    setEditingId(item.id);
    setEditDraft({ name: item.name, iconKey: item.iconKey });
    setEditErrors({});
  }

  function cancelEdit() {
    setEditingId(null);
    setEditErrors({});
  }

  async function saveEdit() {
    if (!editingId) return;
    const name = editDraft.name.trim();
    const iconKey = editDraft.iconKey;
    const err: { name?: string; iconKey?: string } = {};
    if (!name) err.name = "Enter a name for this amenity";
    if (!(AMENITY_ICON_KEYS as readonly string[]).includes(iconKey)) {
      err.iconKey = "Pick an icon";
    }
    if (Object.keys(err).length > 0) {
      setEditErrors(err);
      return;
    }
    const token = getAdminAccessToken();
    if (!token) {
      toast.error("You are not signed in.");
      return;
    }
    setSavingEdit(true);
    const result = await updateAmenity(token, editingId, {
      name,
      iconKey,
    });
    setSavingEdit(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    await reloadItemsSilent();
    setEditingId(null);
    setEditErrors({});
    toast.success("Amenity updated.");
  }

  function confirmRemove(item: AmenityItem) {
    if (editingId === item.id) cancelEdit();
    const toastId = toast.warning("Remove this amenity?", {
      description: item.name,
      duration: Number.POSITIVE_INFINITY,
      action: {
        label: "Remove",
        onClick: () => {
          void (async () => {
            const token = getAdminAccessToken();
            if (!token) {
              toast.dismiss(toastId);
              toast.error("You are not signed in.");
              return;
            }
            const result = await deleteAmenity(token, item.id);
            toast.dismiss(toastId);
            if (!result.ok) {
              toast.error(result.message);
              return;
            }
            await reloadItemsSilent();
            toast.success("Amenity removed.");
          })();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(toastId),
      },
    });
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-roommat-teal focus:ring-2 focus:ring-roommat-teal/20";

  const isLoading = loadState === "loading";
  const isError = loadState === "error";
  const listEmpty = items.length === 0;
  const noMatches = filtered.length === 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-roommat-teal/90">
            Module
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Amenities
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-roommat-muted sm:text-base">
            Define what each listing can show to guests — a name and icon for
            every amenity. Use Edit to change a name or icon. This list is stored
            on the server for your team.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-roommat-teal/20 bg-roommat-mint-bg/60 px-4 py-2 text-sm font-medium text-roommat-teal">
          <span className="tabular-nums font-bold text-neutral-900">
            {isLoading || isError ? "—" : items.length}
          </span>
          {items.length === 1 ? "amenity" : "amenities"}
        </span>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50/40 px-6 py-8 text-center">
          <p className="text-sm text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={() => void loadAmenities()}
            className="mt-4 rounded-full bg-roommat-teal px-4 py-2 text-sm font-semibold text-white hover:bg-roommat-teal-hover"
          >
            Try again
          </button>
        </div>
      ) : (
      <div className="grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <div className="rounded-2xl border border-roommat-teal/20 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-neutral-900">
              Add amenity
            </h2>
            <p className="mt-1 text-xs text-roommat-muted">
              Choose a label and the icon that will appear on listings.
            </p>
            <form
              className="mt-5 space-y-5"
              onSubmit={addForm.handleSubmit}
              noValidate
            >
              <div className="space-y-2">
                <label
                  htmlFor="amenity-name"
                  className="block text-sm font-semibold text-neutral-800"
                >
                  Name
                </label>
                <input
                  id="amenity-name"
                  type="text"
                  placeholder="e.g. Rooftop lounge"
                  {...addForm.getFieldProps("name")}
                  disabled={isLoading}
                  className={`${inputClass} ${
                    nameInvalid ? "border-red-300 bg-red-50/50" : ""
                  } disabled:opacity-50`}
                />
                {nameInvalid ? (
                  <p className="text-sm text-red-600">{addForm.errors.name}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-semibold text-neutral-800">
                  Icon
                </span>
                <div
                  className="grid grid-cols-4 gap-2 sm:grid-cols-5"
                  role="group"
                  aria-label="Choose icon"
                >
                  {AMENITY_ICON_KEYS.map((key) => {
                    const selected = addForm.values.iconKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          void addForm.setFieldValue("iconKey", key);
                          void addForm.setFieldTouched("iconKey", true);
                        }}
                        title={AMENITY_ICON_LABELS[key]}
                        className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 text-center transition disabled:opacity-50 ${
                          selected
                            ? "border-roommat-teal bg-roommat-mint-bg/50 text-roommat-teal ring-1 ring-roommat-teal/20"
                            : "border-neutral-100 bg-roommat-mint-bg/20 text-neutral-500 hover:border-roommat-teal/30 hover:text-roommat-teal"
                        }`}
                      >
                        <AmenityIcon name={key} className="h-6 w-6" />
                        <span className="line-clamp-2 text-[0.6rem] font-medium leading-tight">
                          {AMENITY_ICON_LABELS[key]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {iconInvalid ? (
                  <p className="text-sm text-red-600">{addForm.errors.iconKey}</p>
                ) : (
                  <p className="text-xs text-roommat-muted">
                    Tap an icon to select it.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={addForm.isSubmitting || isLoading}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-roommat-teal px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-roommat-teal-hover disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                Add to list
              </button>
            </form>
          </div>
        </section>

        <div className="lg:col-span-7">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Your amenities</h2>
            <div className="relative w-full sm:max-w-xs">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-roommat-muted"
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
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by name…"
                disabled={isLoading}
                className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-roommat-teal focus:ring-2 focus:ring-roommat-teal/20 disabled:opacity-50"
                aria-label="Filter amenities"
              />
            </div>
          </div>

          {isLoading ? (
            <p className="rounded-2xl border border-neutral-100 bg-white px-6 py-12 text-center text-sm text-roommat-muted">
              Loading amenities…
            </p>
          ) : noMatches ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-roommat-mint-bg/30 px-6 py-12 text-center text-sm text-roommat-muted">
              {listEmpty && !query.trim() ? (
                <>
                  <span className="font-medium text-neutral-800">
                    No amenities yet
                  </span>
                  <span className="mt-2 block">
                    Add your first amenity using the form on the left.
                  </span>
                </>
              ) : (
                "No amenities match your search."
              )}
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filtered.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <li
                    key={item.id}
                    className={isEditing ? "sm:col-span-2" : undefined}
                  >
                    {isEditing ? (
                      <div className="rounded-2xl border border-roommat-teal/30 bg-white p-4 shadow-md ring-1 ring-roommat-teal/10 sm:p-5">
                        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-roommat-teal">
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
                          Edit amenity
                        </p>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label
                              htmlFor={`edit-amenity-name-${item.id}`}
                              className="block text-sm font-semibold text-neutral-800"
                            >
                              Name
                            </label>
                            <input
                              id={`edit-amenity-name-${item.id}`}
                              type="text"
                              value={editDraft.name}
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...d,
                                  name: e.target.value,
                                }))
                              }
                              disabled={savingEdit}
                              className={`${inputClass} ${
                                editErrors.name
                                  ? "border-red-300 bg-red-50/50"
                                  : ""
                              } disabled:opacity-50`}
                            />
                            {editErrors.name ? (
                              <p className="text-sm text-red-600">
                                {editErrors.name}
                              </p>
                            ) : null}
                          </div>
                          <div className="space-y-2">
                            <span className="block text-sm font-semibold text-neutral-800">
                              Icon
                            </span>
                            <div
                              className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8"
                              role="group"
                              aria-label="Choose icon"
                            >
                              {AMENITY_ICON_KEYS.map((key) => {
                                const selected = editDraft.iconKey === key;
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    disabled={savingEdit}
                                    onClick={() => {
                                      setEditDraft((d) => ({
                                        ...d,
                                        iconKey: key,
                                      }));
                                      setEditErrors((e) => ({
                                        ...e,
                                        iconKey: undefined,
                                      }));
                                    }}
                                    title={AMENITY_ICON_LABELS[key]}
                                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 text-center transition disabled:opacity-50 ${
                                      selected
                                        ? "border-roommat-teal bg-roommat-mint-bg/50 text-roommat-teal ring-1 ring-roommat-teal/20"
                                        : "border-neutral-100 bg-roommat-mint-bg/20 text-neutral-500 hover:border-roommat-teal/30 hover:text-roommat-teal"
                                    }`}
                                  >
                                    <AmenityIcon name={key} className="h-5 w-5" />
                                    <span className="line-clamp-2 text-[0.55rem] font-medium leading-tight">
                                      {AMENITY_ICON_LABELS[key]}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                            {editErrors.iconKey ? (
                              <p className="text-sm text-red-600">
                                {editErrors.iconKey}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                            <button
                              type="button"
                              onClick={() => void saveEdit()}
                              disabled={savingEdit}
                              className="inline-flex h-11 items-center justify-center rounded-xl bg-roommat-teal px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-roommat-teal-hover disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              Save changes
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={savingEdit}
                              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:border-roommat-teal/25">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-roommat-mint-bg/70 text-roommat-teal ring-1 ring-roommat-teal/10">
                          <AmenityIcon name={item.iconKey} className="h-8 w-8" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold leading-snug text-neutral-900">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs text-roommat-muted">
                            {AMENITY_ICON_LABELS[item.iconKey]}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col gap-1 sm:items-stretch">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="rounded-lg border border-roommat-teal/25 bg-roommat-mint-bg/40 px-3 py-1.5 text-xs font-semibold text-roommat-teal transition hover:bg-roommat-mint-bg"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmRemove(item)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600/90 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
