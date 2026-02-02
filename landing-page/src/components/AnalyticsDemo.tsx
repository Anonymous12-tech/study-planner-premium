"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { useState, useEffect } from "react";
import { Activity, Zap, TrendingUp, Target } from "lucide-react";

const data = [
    { name: 'Mon', study: 4, focus: 85 },
    { name: 'Tue', study: 6, focus: 88 },
    { name: 'Wed', study: 5, focus: 92 },
    { name: 'Thu', study: 8, focus: 90 },
    { name: 'Fri', study: 7, focus: 95 },
    { name: 'Sat', study: 9, focus: 98 },
    { name: 'Sun', study: 6, focus: 91 },
];

const activityData = [
    { name: '06:00', value: 20 },
    { name: '09:00', value: 80 },
    { name: '12:00', value: 40 },
    { name: '15:00', value: 90 },
    { name: '18:00', value: 60 },
    { name: '21:00', value: 30 },
];

export default function AnalyticsDemo() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <section className="py-32 bg-zinc-950 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent">
                            Visualize Your Victory.
                        </span>
                    </h2>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                        Deep analytics that turn your study habits into a game you can win.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Chart Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-8 p-8 rounded-3xl bg-surface/50 border border-border-subtle backdrop-blur-xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary-light" />
                                    Focus Intensity
                                </h3>
                                <p className="text-text-muted">Weekly breakdown</p>
                            </div>
                            <div className="flex gap-2">
                                {['Day', 'Week', 'Month'].map((tab, i) => (
                                    <span key={tab} className={`px-4 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${i === 1 ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:text-text-secondary'}`}>
                                        {tab}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="h-[400px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#52525B" tick={{ fill: '#52525B' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis stroke="#52525B" tick={{ fill: '#52525B' }} axisLine={false} tickLine={false} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#E4E4E7' }}
                                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="study"
                                        stroke="#10B981"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorStudy)"
                                        animationDuration={2000}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="focus"
                                        stroke="#06B6D4"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorFocus)"
                                        animationDuration={2500} // Different timing for flavor
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Side Cards */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Stat Card 1 */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="p-6 rounded-3xl bg-surface/50 border border-border-subtle backdrop-blur-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10" />
                            <h4 className="text-zinc-400 mb-2 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" /> Current Streak
                            </h4>
                            <div className="text-5xl font-bold text-white mb-4">12 <span className="text-lg text-primary font-normal">days</span></div>
                            <div className="w-full h-2 bg-surface-highlight rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '85%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-primary to-yellow-500"
                                />
                            </div>
                            <p className="text-xs text-text-muted mt-2">Top 5% of students this week</p>
                        </motion.div>

                        {/* Stat Card 2 - Bar Chart */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="p-6 rounded-3xl bg-surface/50 border border-border-subtle backdrop-blur-xl h-[280px]"
                        >
                            <h4 className="text-zinc-400 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-secondary" /> Daily Rhythm
                            </h4>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={activityData}>
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {activityData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={index === activeIndex ? '#22D3EE' : '#27272A'}
                                                    onMouseEnter={() => setActiveIndex(index)}
                                                    onMouseLeave={() => setActiveIndex(null)}
                                                    className="transition-all duration-300 cursor-pointer"
                                                />
                                            ))}
                                        </Bar>
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', color: '#fff' }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
