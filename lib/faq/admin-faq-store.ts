const STORAGE_KEY = "roommat_admin_faq_items";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_DEFAULT_ITEMS: FaqItem[] = [
  {
    id: "access",
    question: "Who can access this admin panel?",
    answer:
      "Only users with an active admin account can sign in. Inactive accounts are blocked until a super admin reactivates them. Use strong passwords and sign out on shared devices.",
  },
  {
    id: "users",
    question: "How do I add another admin teammate?",
    answer:
      "Open Admin users and use Add admin user. Enter their name, email, and a temporary password they should change after first sign-in. They sign in with the same login page you use.",
  },
  {
    id: "profile",
    question: "Can I change my email from my profile?",
    answer:
      "Your email is shown on Edit profile for reference only and cannot be changed there. Contact your technical or account owner if you need to update the sign-in email on the server.",
  },
  {
    id: "password",
    question: "How do I change my password?",
    answer:
      "Click your profile icon in the header, choose Change password, and enter your current password plus a new one. Use at least eight characters.",
  },
  {
    id: "listings",
    question: "Where are properties and bookings managed?",
    answer:
      "Use the Properties and Bookings modules in the main navigation to review listings, verification status, and reservation pipeline. Overview summarizes high-level metrics.",
  },
  {
    id: "support",
    question: "Something looks wrong—what should I do?",
    answer:
      "Try refreshing the page. If an action fails, read the error message from the server. For repeated errors or data issues, note the time, screen, and steps and reach your engineering or product contact.",
  },
];

function normalizeItem(raw: unknown): FaqItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : null;
  const question = typeof o.question === "string" ? o.question.trim() : "";
  const answer = typeof o.answer === "string" ? o.answer.trim() : "";
  if (!id || !question || !answer) return null;
  return { id, question, answer };
}

export function loadAdminFaqs(): FaqItem[] {
  if (typeof window === "undefined") return FAQ_DEFAULT_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return FAQ_DEFAULT_ITEMS;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return FAQ_DEFAULT_ITEMS;
    const items = parsed
      .map(normalizeItem)
      .filter((x): x is FaqItem => x !== null);
    return items.length > 0 ? items : FAQ_DEFAULT_ITEMS;
  } catch {
    return FAQ_DEFAULT_ITEMS;
  }
}

export function saveAdminFaqs(items: FaqItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}

export function newFaqId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `faq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
