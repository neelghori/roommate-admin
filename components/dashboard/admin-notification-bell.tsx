"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPublicApiBaseUrl } from "@/lib/env";
import { buildApiWebSocketUrl } from "@/lib/api-websocket";
import { getAdminAccessToken } from "@/lib/auth/admin-token";

type ApiNotif = {
  _id: string;
  title: string;
  description?: string;
  type: string;
  payload?: { kind?: string; propertyId?: string; title?: string };
  isRead: boolean;
  createdAt: string;
};

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 45) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`;
  if (sec < 172800) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

async function fetchNotifications(): Promise<ApiNotif[]> {
  const token = getAdminAccessToken();
  if (!token) return [];
  const res = await fetch(`${getPublicApiBaseUrl()}/api/v1/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: { items?: ApiNotif[] } };
  return Array.isArray(json?.data?.items) ? json.data!.items! : [];
}

async function markRead(id: string): Promise<void> {
  const token = getAdminAccessToken();
  if (!token) return;
  await fetch(`${getPublicApiBaseUrl()}/api/v1/notifications/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
}

export function AdminNotificationBell() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ApiNotif[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ApiNotif | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const token = getAdminAccessToken();
    if (!token) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      setItems(await fetchNotifications());
    } finally {
      setLoading(false);
    }
  }, []);

  /** Load on every dashboard route change (bell stays mounted in the shell). */
  useEffect(() => {
    void load();
  }, [load, pathname]);

  /** One delayed fetch after mount so the list loads even if the token wasn’t readable on the first paint. */
  useEffect(() => {
    const t = window.setTimeout(() => void load(), 400);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  /** Realtime inbox — staff receive `notification:new` as soon as a listing (etc.) is persisted. */
  useEffect(() => {
    const token = getAdminAccessToken();
    if (!token) return;

    let cancelled = false;
    let ws: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      if (cancelled) return;
      const url = buildApiWebSocketUrl(`/ws?token=${encodeURIComponent(token)}`);
      try {
        ws = new WebSocket(url);
      } catch {
        retryTimer = setTimeout(connect, 5000);
        return;
      }

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(String(ev.data)) as { type?: string; payload?: ApiNotif };
          if (msg.type !== "notification:new" || !msg.payload?._id) return;
          const incoming = msg.payload;
          setItems((prev) => {
            if (prev.some((x) => x._id === incoming._id)) return prev;
            return [incoming, ...prev];
          });
        } catch {
          /* ignore malformed */
        }
      };

      ws.onclose = (ev) => {
        ws = null;
        if (cancelled) return;
        // Do not retry on auth / user errors (server closes with 4001–4003)
        if (ev.code >= 4001 && ev.code <= 4003) return;
        retryTimer = setTimeout(connect, 4000);
      };

      ws.onerror = () => {
        try {
          ws?.close();
        } catch {
          /* ignore */
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      try {
        ws?.close();
      } catch {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent | PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const unread = items.filter((n) => !n.isRead).length;

  const openRow = async (n: ApiNotif) => {
    setDetail(n);
    if (!n.isRead) {
      try {
        await markRead(n._id);
        setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      } catch {
        /* ignore */
      }
    }
  };

  const markAllRead = async () => {
    const targets = items.filter((n) => !n.isRead);
    await Promise.all(targets.map((n) => markRead(n._id)));
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl border border-neutral-200/80 bg-white p-2 text-neutral-600 shadow-sm transition-colors hover:border-roommat-teal/25 hover:text-roommat-teal"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.113V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unread > 0 ? (
          <span className="absolute right-1.5 top-1.5 h-2 min-w-2 rounded-full bg-roommat-orange ring-2 ring-white" />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-[120] mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <h3 className="text-sm font-bold text-neutral-900">Notifications</h3>
            <button
              type="button"
              disabled={!unread}
              onClick={() => void markAllRead()}
              className="text-[11px] font-semibold text-roommat-teal hover:opacity-90 disabled:opacity-40"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-[min(22rem,50vh)] overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-neutral-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-neutral-500">No notifications yet</p>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => void openRow(n)}
                  className="flex w-full gap-3 border-b border-neutral-50 px-4 py-3 text-left last:border-0 hover:bg-roommat-mint-bg/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-neutral-900">{n.title}</p>
                    {n.description ? (
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-neutral-600">{n.description}</p>
                    ) : null}
                    <p className="mt-1 text-[10px] text-neutral-400">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                  {!n.isRead ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-roommat-teal" /> : null}
                </button>
              ))
            )}
          </div>
          <Link
            href="/dashboard/properties"
            className="block border-t border-neutral-100 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-roommat-teal hover:bg-neutral-50"
            onClick={() => setOpen(false)}
          >
            Open properties
          </Link>
        </div>
      ) : null}

      {detail ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-notif-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetail(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="admin-notif-title" className="text-lg font-bold text-neutral-900">
              {detail.title}
            </h2>
            {detail.description ? <p className="mt-3 text-sm text-neutral-600">{detail.description}</p> : null}
            <p className="mt-2 text-xs text-neutral-400">{formatRelativeTime(detail.createdAt)}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                onClick={() => setDetail(null)}
              >
                Close
              </button>
              {detail.payload?.propertyId ? (
                <Link
                  href={`/dashboard/properties/${detail.payload.propertyId}`}
                  className="inline-flex items-center justify-center rounded-xl bg-roommat-teal px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
                  onClick={() => {
                    setDetail(null);
                    setOpen(false);
                  }}
                >
                  Review listing
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
