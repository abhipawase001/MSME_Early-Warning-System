import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { firebaseConfigured } from "@/lib/firebase";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("officer@bank.example");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-idbi-sand via-background to-idbi-green/5 p-6">
      <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-8 animate-in-soft shadow-xl shadow-idbi-green-deep/5">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-full bg-idbi-green grid place-items-center text-white font-display text-xl">
            i
          </div>
          <div>
            <div className="font-display text-base leading-tight text-idbi-green-deep">IDBI Innovate 2026</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
              Track 04 · MSME Default EWS
            </div>
          </div>
        </div>

        <h1 className="font-display text-2xl mb-1 text-foreground">Loan officer sign-in</h1>
        <p className="text-xs text-muted-foreground mb-6">Restricted access. All activity is logged for audit.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Work email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded outline-none focus:ring-2 focus:ring-accent/15"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required={firebaseConfigured}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded outline-none focus:ring-2 focus:ring-accent/15"
            />
          </Field>

          {error && <p className="text-xs text-risk-red">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent text-accent-foreground text-xs font-bold rounded uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {!firebaseConfigured && (
            <p className="text-[10px] text-muted-foreground leading-relaxed pt-2 border-t border-border">
              <strong>Demo mode:</strong> Firebase isn't configured. Any email logs you in. Prefix with{" "}
              <code>admin@</code> or <code>manager@</code> to preview role tiers.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}
