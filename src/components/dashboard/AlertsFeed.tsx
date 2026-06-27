import { useState } from "react";
import { AlertTriangle, Bell, CheckCircle2 } from "lucide-react";
import { ALERTS, BORROWERS, type Alert } from "@/lib/mock-data";

const SEV: Record<Alert["severity"], { color: string; label: string; ring: string }> = {
  info: { color: "text-idbi-green", label: "Info", ring: "border-idbi-green/30 bg-idbi-green/5" },
  watch: { color: "text-risk-amber", label: "Watch", ring: "border-risk-amber/30 bg-risk-amber/5" },
  elevated: { color: "text-idbi-orange", label: "Elevated", ring: "border-idbi-orange/40 bg-idbi-orange/5" },
  high: { color: "text-risk-red", label: "High", ring: "border-risk-red/40 bg-risk-red/5" },
};

function fmtAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

interface Props {
  onSelectBorrower: (id: string) => void;
}

export function AlertsFeed({ onSelectBorrower }: Props) {
  const [acked, setAcked] = useState<Set<string>>(new Set());
  const open = ALERTS.filter((a) => !acked.has(a.id));

  return (
    <div className="p-5 border border-border rounded-xl bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="size-3.5 text-idbi-orange" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Early Warning Feed
          </h3>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-idbi-orange/10 text-idbi-orange font-bold">
          {open.length} OPEN
        </span>
      </div>

      <ul className="space-y-2">
        {open.map((a) => {
          const sev = SEV[a.severity];
          const borrower = BORROWERS.find((b) => b.id === a.borrowerId);
          return (
            <li key={a.id} className={`p-3 rounded-lg border ${sev.ring}`}>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className={`size-3.5 mt-0.5 shrink-0 ${sev.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${sev.color}`}>
                      {a.signal}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-mono shrink-0">{fmtAgo(a.timestamp)}</span>
                  </div>
                  <p className="text-[11px] text-foreground/80 leading-snug mt-0.5">{a.detail}</p>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <button
                      type="button"
                      onClick={() => borrower && onSelectBorrower(borrower.id)}
                      className="text-[10px] font-semibold text-idbi-green hover:underline truncate"
                    >
                      → {borrower?.name ?? a.borrowerId}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAcked((s) => new Set(s).add(a.id))}
                      className="text-[10px] font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="size-3" /> Ack
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {open.length === 0 && (
          <li className="text-center py-6 text-[11px] text-muted-foreground">
            All alerts acknowledged — portfolio quiet.
          </li>
        )}
      </ul>
    </div>
  );
}
