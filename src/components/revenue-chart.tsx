"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";

const LINE_COLOR = "#2a78d6";

function TooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const date = label ? new Date(label) : null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-slate-500">
        {date ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date) : ""}
      </p>
      <p className="mt-0.5 font-semibold text-slate-900">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function RevenueChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.18} />
            <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) =>
            new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value))
          }
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={{ stroke: "#e2e8f0" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(value: number) => formatCurrency(value).replace(".00", "")}
        />
        <Tooltip content={<TooltipContent />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={LINE_COLOR}
          strokeWidth={2}
          fill="url(#revenueFill)"
          dot={false}
          activeDot={{ r: 4, fill: LINE_COLOR, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
