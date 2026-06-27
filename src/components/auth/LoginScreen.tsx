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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar — IDBI brand */}
      <header className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <IdbiLogo />
            <div className="hidden sm:block h-8 w-px bg-border" />
            <div className="hidden sm:block text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
              Innovate 2026 · Track 04
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-xs text-idbi-green-deep font-medium">
            <span>Personal</span>
            <span>Corporate</span>
            <span>MSME</span>
            <span className="text-muted-foreground">NRI</span>
          </nav>
        </div>
        {/* Secondary green bar */}
        <div className="bg-idbi-green text-white">
          <div className="max-w-6xl mx-auto px-6 py-2 text-[11px] tracking-wide flex items-center justify-between">
            <span>MSME Early Warning System — Loan Officer Portal</span>
            <span className="hidden sm:inline opacity-80">Secure · Audited · RBI-aligned</span>
          </div>
        </div>
      </header>

      {/* Split body */}
      <div className="flex-1 grid lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden bg-idbi-green-deep">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, #f47b20 0%, transparent 40%), radial-gradient(circle at 80% 70%, #ffffff 0%, transparent 35%)",
            }}
          />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.3em] opacity-70 mb-3">IDBI Bank</div>
            <h2 className="font-display text-4xl leading-tight mb-4">
              Banking for a<br />stronger Bharat.
            </h2>
            <p className="text-sm opacity-80 max-w-sm">
              Early Warning System for MSME loan defaults — fusing GST, UPI and bank-statement
              signals into a 12-month probability of default with regulator-grade interpretability.
            </p>
          </div>
          <div className="relative grid grid-cols-3 gap-4 text-xs">
            <Stat k="90%" v="Target accuracy" />
            <Stat k="12 mo" v="PD horizon" />
            <Stat k="3" v="Signal sources" />
          </div>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-6 sm:p-12 bg-idbi-sand/40">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="text-[10px] uppercase tracking-[0.25em] text-idbi-orange font-bold mb-2">
                Internet Banking · Officer
              </div>
              <h1 className="font-display text-3xl text-idbi-green-deep mb-2">Sign in to continue</h1>
              <p className="text-sm text-muted-foreground">
                Restricted access. All activity is logged for audit.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5 bg-white border border-border rounded-lg p-6 shadow-sm">
              <Field label="Work email">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded outline-none focus:border-idbi-green focus:ring-2 focus:ring-idbi-green/15"
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  required={firebaseConfigured}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded outline-none focus:border-idbi-green focus:ring-2 focus:ring-idbi-green/15"
                />
              </Field>

              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="accent-idbi-green" />
                  Keep me signed in
                </label>
                <a className="text-idbi-green-deep font-medium hover:underline cursor-pointer">
                  Forgot password?
                </a>
              </div>

              {error && <p className="text-xs text-risk-red">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-idbi-orange text-white text-xs font-bold rounded uppercase tracking-[0.2em] hover:brightness-95 transition disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Login"}
              </button>

              <button
                type="button"
                className="w-full py-3 border border-idbi-green text-idbi-green-deep text-xs font-bold rounded uppercase tracking-[0.2em] hover:bg-idbi-green/5 transition"
              >
                Login with SSO
              </button>

              {!firebaseConfigured && (
                <p className="text-[10px] text-muted-foreground leading-relaxed pt-3 border-t border-border">
                  <strong>Demo mode:</strong> Firebase isn't configured. Any email logs you in. Prefix with{" "}
                  <code>admin@</code> or <code>manager@</code> to preview role tiers.
                </p>
              )}
            </form>

            <p className="text-[10px] text-muted-foreground text-center mt-6 leading-relaxed">
              © {new Date().getFullYear()} IDBI Bank Ltd. For authorised personnel only. Unauthorised
              access is a punishable offence under the IT Act, 2000.
            </p>
          </div>
        </div>
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

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-white/20 pt-3">
      <div className="font-display text-2xl text-idbi-orange">{k}</div>
      <div className="opacity-70 mt-1">{v}</div>
    </div>
  );
}

function IdbiLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative size-9 rounded-full bg-idbi-green grid place-items-center">
        <span className="text-white font-display text-lg leading-none">i</span>
        <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-idbi-orange ring-2 ring-white" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-lg text-idbi-green-deep tracking-tight">IDBI <span className="text-idbi-orange">BANK</span></div>
        <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">Banking for all</div>
      </div>
    </div>
  );
}
