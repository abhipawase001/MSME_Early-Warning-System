// Firebase client. Stays inert until VITE_FIREBASE_* envs are set.
// When unconfigured we expose a tiny in-memory demo auth so the dashboard remains usable.
import type { User } from "firebase/auth";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "officer" | "manager" | "admin";
}

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseConfigured = Boolean(cfg.apiKey && cfg.projectId && cfg.appId);

// Simple role mapping by email domain — replace with custom claims when wired to real Firebase.
function roleFor(email: string | null): AuthUser["role"] {
  if (!email) return "officer";
  if (email.startsWith("admin@")) return "admin";
  if (email.startsWith("manager@")) return "manager";
  return "officer";
}

function toAuthUser(u: User): AuthUser {
  return { uid: u.uid, email: u.email, displayName: u.displayName, role: roleFor(u.email) };
}

type Listener = (u: AuthUser | null) => void;

class DemoAuth {
  private user: AuthUser | null = null;
  private listeners = new Set<Listener>();
  constructor() {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("demo-auth-user");
      if (saved) this.user = JSON.parse(saved);
    }
  }
  onChange(l: Listener) {
    this.listeners.add(l);
    l(this.user);
    return () => this.listeners.delete(l);
  }
  async signIn(email: string, _password: string) {
    this.user = { uid: `demo-${email}`, email, displayName: email.split("@")[0], role: roleFor(email) };
    if (typeof window !== "undefined") window.localStorage.setItem("demo-auth-user", JSON.stringify(this.user));
    this.listeners.forEach((l) => l(this.user));
  }
  async signOut() {
    this.user = null;
    if (typeof window !== "undefined") window.localStorage.removeItem("demo-auth-user");
    this.listeners.forEach((l) => l(null));
  }
}

const demo = new DemoAuth();

let realAuthPromise: Promise<{
  onChange: (l: Listener) => () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}> | null = null;

async function getRealAuth() {
  if (realAuthPromise) return realAuthPromise;
  realAuthPromise = (async () => {
    const { initializeApp, getApps } = await import("firebase/app");
    const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } = await import("firebase/auth");
    const app = getApps()[0] ?? initializeApp(cfg as Record<string, string>);
    const auth = getAuth(app);
    return {
      onChange: (l: Listener) =>
        onAuthStateChanged(auth, (u) => l(u ? toAuthUser(u) : null)),
      signIn: async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      signOut: async () => {
        await signOut(auth);
      },
    };
  })();
  return realAuthPromise;
}

export const auth = {
  onChange(l: Listener) {
    if (!firebaseConfigured) return demo.onChange(l);
    let cancelled = false;
    let cleanup: (() => void) | null = null;
    getRealAuth().then((a) => {
      if (cancelled) return;
      cleanup = a.onChange(l);
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  },
  async signIn(email: string, password: string) {
    if (!firebaseConfigured) return demo.signIn(email, password);
    const a = await getRealAuth();
    return a.signIn(email, password);
  },
  async signOut() {
    if (!firebaseConfigured) return demo.signOut();
    const a = await getRealAuth();
    return a.signOut();
  },
};
