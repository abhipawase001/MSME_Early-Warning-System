import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vantage EWS — MSME Loan Default Early Warning" },
      {
        name: "description",
        content:
          "Enterprise dashboard for bank loan officers: monitor MSME default risk, GST compliance, cash flow trends, and run what-if scenario simulations.",
      },
      { property: "og:title", content: "Vantage EWS — MSME Default Early Warning" },
      {
        property: "og:description",
        content: "Real-time MSME loan default risk monitoring with scenario simulation.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Loading…</div>
      </div>
    );
  }
  return user ? <Dashboard /> : <LoginScreen />;
}
