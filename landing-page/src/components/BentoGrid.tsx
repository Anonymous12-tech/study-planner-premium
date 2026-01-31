"use client";

import { motion } from "framer-motion";
import { Calendar, Flame, BarChart3, Users, Sparkles, Clock } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useEffect, useState } from "react";

const mockData = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    hours: Math.floor(Math.random() * 8) + 2,
}));

export default function BentoGrid() {
    const [activeUsers, setActiveUsers] = useState(42);
    const [todayHours, setTodayHours] = useState(4.2);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveUsers((prev) => prev + Math.floor(Math.random() * 5) - 2);
            setTodayHours((prev) => +(prev + (Math.random() * 0.2 - 0.1)).toFixed(1));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative py-32 px-6 bg-black">
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-6xl font-bold text-white mb-4 text-center"
                >
                    Everything you need to{" "}
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        dominate
                    </span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-zinc-400 text-center mb-16 text-lg"
                >
                    Built for students who want to focus better, track smarter, and achieve more.
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Live Focus Room */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 backdrop-blur-sm group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="p-3 rounded-xl bg-emerald-500/20"
                                >
                                    <Users className="w-6 h-6 text-emerald-400" />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Live Focus Room</h3>
                                    <p className="text-sm text-zinc-400">Study together, stay accountable</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="w-3 h-3 rounded-full bg-emerald-400"
                                />
                                <span className="text-zinc-300 text-sm">Real-time presence</span>
                            </div>
                            <motion.div
                                key={activeUsers}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-6xl font-bold text-white mb-2"
                            >
                                {activeUsers}
                            </motion.div>
                            <div className="text-zinc-400">students focusing right now</div>
                        </div>
                    </motion.div>

                    {/* Card 2: Smart Planner */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm hover:border-cyan-500/50 transition-colors group"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                                <Calendar className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Smart Planner</h3>
                                <p className="text-sm text-zinc-400">Daily, weekly, monthly goals</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { task: "Complete Quantum Physics", done: true },
                                { task: "Review React Hooks", done: true },
                                { task: "Calculus II Practice", done: false },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.task}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${item.done ? "bg-cyan-500 border-cyan-500" : "border-zinc-600"
                                            }`}
                                    >
                                        {item.done && (
                                            <motion.svg
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className="w-3 h-3 text-black"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            >
                                                <motion.path d="M5 13l4 4L19 7" />
                                            </motion.svg>
                                        )}
                                    </motion.div>
                                    <span className={`text-sm ${item.done ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                                        {item.task}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Card 3: Streak System */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/50 backdrop-blur-sm group relative overflow-hidden"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                            className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"
                        />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="p-3 rounded-xl bg-orange-500/20"
                                >
                                    <Flame className="w-6 h-6 text-orange-400" />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Streak System</h3>
                                    <p className="text-sm text-zinc-400">Build consistency</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    className="text-7xl font-bold text-white mb-2"
                                >
                                    14
                                </motion.div>
                                <div className="text-zinc-400">Day Streak 🔥</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 4: Real-Time Analytics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        className="md:col-span-2 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm hover:border-emerald-500/50 transition-colors group"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                                <BarChart3 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Real-Time Analytics</h3>
                                <p className="text-sm text-zinc-500">Track your progress live</p>
                            </div>
                        </div>
                        <div className="h-48 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockData}>
                                    <defs>
                                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="hours"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fill="url(#colorHours)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <motion.div
                            key={todayHours}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold text-white"
                        >
                            {todayHours} <span className="text-xl text-zinc-500">hrs today</span>
                        </motion.div>
                    </motion.div>

                    {/* Card 5: Unlockable Auras */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm hover:border-purple-500/50 transition-colors group relative overflow-hidden"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20"
                        />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                    className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors"
                                >
                                    <Sparkles className="w-6 h-6 text-purple-400" />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Unlockable Auras</h3>
                                    <p className="text-sm text-zinc-400">Customize your vibe</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { color: "from-cyan-400 to-blue-500", locked: false },
                                    { color: "from-orange-400 to-red-500", locked: false },
                                    { color: "from-purple-400 to-pink-500", locked: true },
                                    { color: "from-emerald-400 to-teal-500", locked: true },
                                    { color: "from-yellow-400 to-orange-500", locked: true },
                                    { color: "from-indigo-400 to-purple-500", locked: true },
                                ].map((aura, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.6 + i * 0.05 }}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className={`aspect-square rounded-xl bg-gradient-to-br ${aura.color} ${aura.locked ? "opacity-30" : "opacity-100"
                                            } relative`}
                                    >
                                        {aura.locked && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-4 h-4 border-2 border-white rounded-sm" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 6: Study Sessions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        className="md:col-span-2 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm hover:border-blue-500/50 transition-colors group"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                                <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Focused Study Sessions</h3>
                                <p className="text-sm text-zinc-500">Track every minute that matters</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Total Sessions", value: "127" },
                                { label: "This Week", value: "18" },
                                { label: "Avg Duration", value: "45m" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.7 + i * 0.1 }}
                                    className="text-center"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="text-4xl font-bold text-white mb-1"
                                    >
                                        {stat.value}
                                    </motion.div>
                                    <div className="text-sm text-zinc-500">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
