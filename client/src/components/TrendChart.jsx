import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact, formatMoney, monthLabel, monthShort } from "../lib/format";

function TrendTooltip({ active, payload }) {
    if (!active || !payload?.length) {
        return null;
    }
    const row = payload[0].payload;
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip__title">{monthLabel(row.month)}</p>
            <p className="chart-tooltip__row">
                <span className="swatch swatch--income" /> Income <strong>{formatMoney(row.totalIncome)}</strong>
            </p>
            <p className="chart-tooltip__row">
                <span className="swatch swatch--expense" /> Expenses <strong>{formatMoney(row.totalExpenses)}</strong>
            </p>
            <p className="chart-tooltip__row chart-tooltip__row--total">
                Balance <strong>{formatMoney(row.balance, { sign: true })}</strong>
            </p>
        </div>
    );
}

export default function TrendChart({ data, activeMonth }) {
    const rows = data.map((row) => ({ ...row, label: monthShort(row.month) }));

    return (
        <ResponsiveContainer width="100%" height={270}>
            <BarChart data={rows} barGap={6} barCategoryGap="26%" margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="bar-income" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7CE8CF" />
                        <stop offset="100%" stopColor="#2F9C86" />
                    </linearGradient>
                    <linearGradient id="bar-expense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF9C80" />
                        <stop offset="100%" stopColor="#C8553B" />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(236, 225, 255, 0.06)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#8A819B", fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8A819B", fontSize: 11 }} tickFormatter={formatCompact} width={64} />
                <Tooltip cursor={{ fill: "rgba(232, 200, 140, 0.05)", radius: 10 }} content={<TrendTooltip />} />
                <Bar dataKey="totalIncome" name="Income" fill="url(#bar-income)" radius={[7, 7, 3, 3]} maxBarSize={26} animationDuration={1200} animationEasing="ease-out">
                    {rows.map((row) => (
                        <Cell key={row.month} fillOpacity={row.month === activeMonth ? 1 : 0.42} />
                    ))}
                </Bar>
                <Bar dataKey="totalExpenses" name="Expenses" fill="url(#bar-expense)" radius={[7, 7, 3, 3]} maxBarSize={26} animationDuration={1200} animationBegin={150} animationEasing="ease-out">
                    {rows.map((row) => (
                        <Cell key={row.month} fillOpacity={row.month === activeMonth ? 1 : 0.42} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
