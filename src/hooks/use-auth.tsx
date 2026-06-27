import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, type AuthUser } from "@/lib/firebase";

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const off = auth.onChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => off();
  }, []);
  return (
    <Ctx.Provider value={{ user, loading, signIn: auth.signIn, signOut: auth.signOut }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
