"use client";

import { useEffect } from "react";
import { getAdminAccessToken } from "@/lib/auth/admin-token";
import { adminPushService } from "@/lib/push/admin-push.service";

/** Registers SW and saves push subscription when staff is signed in. */
export function AdminWebPushManager() {
  useEffect(() => {
    if (!getAdminAccessToken()) return;
    if (!adminPushService.supportsWebPush()) return;

    const timer = window.setTimeout(() => {
      void adminPushService.ensureSubscribed();
    }, 2500);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
