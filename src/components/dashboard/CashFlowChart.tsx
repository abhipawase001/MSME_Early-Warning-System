import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  data: { month: string; inflow: number; outflow: number }[];
}

export function CashFlowChart({ data }: Props) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${v}Cr`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => `₹${v}Cr`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={6} />
          <Line type="monotone" dataKey="inflow" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 3 }} name="Inflow" />
          <Line type="monotone" dataKey="outflow" stroke="var(--color-muted-foreground)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Outflow" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
