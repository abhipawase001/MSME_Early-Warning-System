import { useEffect, useState } from "react";
import { Keyboard, X } from "lucide-react";

const SHORTCUTS: [string, string][] = [
  ["?", "Toggle this cheat-sheet"],
  ["1 – 5", "Jump to borrower row"],
  ["m", "Open Credit Memo for current borrower"],
  ["a", "Open About / Approach page"],
  ["Esc", "Close any overlay"],
];

export function DemoControls() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 px-3 py-2 rounded-full bg-idbi-green-deep text-white text-[11px] font-semibold uppercase tracking-widest shadow-lg hover:bg-idbi-green transition-colors flex items-center gap-2"
        aria-label="Open demo cheat-sheet"
      >
        <Keyboard className="size-3.5" /> Demo · ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4 animate-in-soft"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-idbi-orange font-bold">
                  IDBI Innovate 2026 · Track 04
                </div>
                <h3 className="font-display text-xl text-idbi-green-deep mt-1">Demo cheat-sheet</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="size-7 grid place-items-center rounded hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <ul className="space-y-2 mb-5">
              {SHORTCUTS.map(([k, v]) => (
                <li key={k} className="flex items-center gap-3 text-[12px]">
                  <kbd className="font-mono text-[10px] px-2 py-0.5 rounded border border-border bg-muted min-w-12 text-center font-bold">
                    {k}
                  </kbd>
                  <span className="text-foreground/80">{v}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">3-minute demo flow:</strong> heatmap → click red borrower → review
              SHAP waterfall → drag scenario sliders → counterfactual → Generate Credit Memo.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
