import { useState } from "react";
import { motion } from "motion/react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import AnimatedNumber from "./AnimatedNumber";
import { colorFor, formatMoney } from "../lib/format";
import { itemVariants, listVariants } from "../lib/motion";

export default function CategoryDonut({ data, label = "Spent" }) {
    const [active, setActive] = useState(null);
    const total = data.reduce((sum, row) => sum + row.total, 0);
    const focus = active === null ? null : data[active];

    return (
        <div className="donut">
            <div className="donut__chart">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="total"
                            nameKey="categoryName"
                            innerRadius="72%"
                            outerRadius="100%"
                            paddingAngle={2.5}
                            cornerRadius={7}
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                            animationDuration={1300}
                            onMouseEnter={(_, index) => setActive(index)}
                            onMouseLeave={() => setActive(null)}
                        >
                            {data.map((row, index) => (
                                <Cell key={row.categoryId} fill={colorFor(row.categoryId)} fillOpacity={active === null || active === index ? 1 : 0.28} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="donut__center">
                    <span className="donut__caption">{focus ? focus.categoryName : label}</span>
                    <span className="donut__value">
                        {focus ? formatMoney(focus.total) : <AnimatedNumber value={total} format={formatMoney} />}
                    </span>
                    {focus && <span className="donut__share">{focus.percentage}% of total</span>}
                </div>
            </div>

            <motion.ul className="legend" variants={listVariants} initial="hidden" animate="visible">
                {data.map((row, index) => (
                    <motion.li
                        key={row.categoryId}
                        variants={itemVariants}
                        className={`legend__item${active === index ? " is-active" : ""}`}
                        onMouseEnter={() => setActive(index)}
                        onMouseLeave={() => setActive(null)}
                    >
                        <span className="legend__dot" style={{ background: colorFor(row.categoryId) }} />
                        <span className="legend__text">
                            <span className="legend__name">{row.categoryName}</span>
                            <span className="legend__value">{formatMoney(row.total)}</span>
                        </span>
                        <span className="legend__share">{row.percentage}%</span>
                    </motion.li>
                ))}
            </motion.ul>
        </div>
    );
}
