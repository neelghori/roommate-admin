/**
 * Web Push for admin panel — uses admin JWT on /api/v1/push/*
 */
import { getPublicApiBaseUrl } from "@/lib/env";
import { getAdminAccessToken } from "@/lib/auth/admin-token";

const SW_PATH = "/sw.js";
const PROMPTED_KEY = "roommat-admin-push-prompted";

export type AdminPushNotification = {
  _id: string;
  title: string;
  description?: string;
  type: string;
  payload?: { kind?: string; propertyId?: string; title?: string; senderId?: string };
  isRead?: boolean;
  createdAt?: string;
};

function supportsWebPush(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    typeof Notification !== "undefined"
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function fetchVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch(`${getPublicApiBaseUrl()}/api/v1/push/vapid-public-key`);
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { publicKey?: string }; publicKey?: string };
    const pk = json?.data?.publicKey ?? json?.publicKey;
    return typeof pk === "string" && pk.trim() ? pk.trim() : null;
  } catch {
    return null;
  }
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!supportsWebPush()) return null;
  try {
    return await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
  } catch {
    return null;
  }
}

async function getReadyRegistration(): Promise<ServiceWorkerRegistration | null> {
  const reg = await registerServiceWorker();
  if (!reg) return null;
  await navigator.serviceWorker.ready;
  return reg;
}

function subscriptionPayload(sub: PushSubscription) {
  const json = sub.toJSON();
  return {
    endpoint: json.endpoint!,
    keys: {
      p256dh: json.keys!.p256dh!,
      auth: json.keys!.auth!,
    },
    expirationTime: sub.expirationTime,
  };
}

function adminNotificationUrl(n: AdminPushNotification): string {
  const propertyId = n.payload?.propertyId;
  if (n.type === "listing" && propertyId) {
    return `/dashboard/properties/${propertyId}`;
  }
  return "/dashboard/properties";
}

export const adminPushService = {
  supportsWebPush,

  async requestPermission(): Promise<NotificationPermission> {
    if (!supportsWebPush()) return "denied";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    return Notification.requestPermission();
  },

  async subscribeAndSave(): Promise<boolean> {
    if (!supportsWebPush() || !getAdminAccessToken()) return false;
    if (Notification.permission !== "granted") return false;

    const publicKey = await fetchVapidPublicKey();
    if (!publicKey) return false;

    const registration = await getReadyRegistration();
    if (!registration) return false;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
    }

    const token = getAdminAccessToken();
    const res = await fetch(`${getPublicApiBaseUrl()}/api/v1/push/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscriptionPayload(subscription)),
    });
    if (!res.ok) {
      throw new Error("Could not save push subscription");
    }
    return true;
  },

  async ensureSubscribed(): Promise<void> {
    if (!supportsWebPush() || !getAdminAccessToken()) return;

    if (Notification.permission === "granted") {
      await this.subscribeAndSave().catch(() => {
        /* ignore */
      });
      return;
    }

    if (Notification.permission === "denied") return;

    if (localStorage.getItem(PROMPTED_KEY) === "1") return;
    localStorage.setItem(PROMPTED_KEY, "1");

    const perm = await this.requestPermission();
    if (perm === "granted") {
      await this.subscribeAndSave().catch(() => {
        /* ignore */
      });
    }
  },

  showBrowserNotification(n: AdminPushNotification): void {
    if (!supportsWebPush() || Notification.permission !== "granted") return;

    const url = adminNotificationUrl(n);
    try {
      const notif = new Notification(n.title, {
        body: n.description || "",
        icon: "/favicon.ico",
        tag: `roommat-admin-${n._id}`,
        data: { url },
      });
      notif.onclick = () => {
        window.focus();
        window.location.href = url;
        notif.close();
      };
    } catch {
      /* ignore */
    }
  },
};
