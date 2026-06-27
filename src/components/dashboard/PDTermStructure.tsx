import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { pdTermStructure } from "@/lib/segments";
import type { Borrower } from "@/lib/mock-data";

export function PDTermStructure({ borrower }: { borrower: Borrower }) {
  const data = useMemo(() => pdTermStructure(borrower), [borrower]);
  const pd12 = data[data.length - 1].pd;

  return (
    <div className="p-5 border border-border rounded-xl bg-card">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            12-Month PD Term Structure
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Cumulative default probability over horizon · Weibull-fit, segment-calibrated
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-bold text-idbi-green-deep tabular-nums leading-none">
            {pd12.toFixed(1)}%
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">PD @ 12mo</div>
        </div>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="pdfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--idbi-orange-hsl, 22 90% 52%))" stopOpacity={0.45} />
                <stop offset="100%" stopColor="hsl(var(--idbi-orange-hsl, 22 90% 52%))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tickFormatter={(m) => `M${m}`}
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <ReferenceLine y={60} stroke="hsl(var(--border))" strokeDasharray="3 3" label={{ value: "Elevated", fontSize: 9, fill: "hsl(var(--muted-foreground))", position: "insideTopRight" }} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 6 }}
              formatter={(v) => [`${Number(v).toFixed(1)}%`, "Cum. PD"]}
              labelFormatter={(m) => `Month ${m}`}
            />
            <Area type="monotone" dataKey="pd" stroke="hsl(22 90% 52%)" strokeWidth={2} fill="url(#pdfill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
