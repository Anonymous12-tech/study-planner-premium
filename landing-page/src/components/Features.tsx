"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Calendar, Flame, BarChart3, Sparkles } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

const mockData = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    hours: Math.floor(Math.random() * 8) + 2,
}));

function SmartPlannerSection() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
    const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mouseX.set(x);
        mouseY.set(y);
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center px-6 py-32">
            <div className="max-w-6xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
                        Plan Your{" "}
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Perfect Day
                        </span>
                    </h2>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                        Organize tasks by day, week, or month. Check them off as you conquer your goals.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.8 }}
                        onMouseMove={handleMouseMove}
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                        className="p-8 rounded-3xl bg-surface/50 border border-border-subtle backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-cyan-500/10">
                                <Calendar className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Today's Tasks</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { task: "Complete Quantum Physics", done: true, time: "45 min" },
                                { task: "Review React Hooks", done: true, time: "30 min" },
                                { task: "Calculus II Practice", done: false, time: "60 min" },
                                { task: "Study for Chemistry Exam", done: false, time: "90 min" },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.task}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    whileHover={{ x: 8, scale: 1.02 }}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-surface-highlight/50 hover:bg-surface-highlight transition-all cursor-pointer"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: 360 }}
                                        transition={{ duration: 0.3 }}
                                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${item.done ? "bg-cyan-500 border-cyan-500" : "border-zinc-600"
                                            }`}
                                    >
                                        {item.done && (
                                            <motion.svg
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className="w-4 h-4 text-black"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            >
                                                <motion.path d="M5 13l4 4L19 7" />
                                            </motion.svg>
                                        )}
                                    </motion.div>
                                    <div className="flex-1">
                                        <span className={`text-base ${item.done ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                                            {item.task}
                                        </span>
                                    </div>
                                    <span className="text-sm text-zinc-500">{item.time}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm flex flex-col justify-center"
                    >
                        <div className="space-y-8">
                            <div>
                                <div className="text-sm text-zinc-500 mb-2">Daily Progress</div>
                                <div className="flex items-end gap-2">
                                    <div className="text-6xl font-bold text-white">50%</div>
                                    <div className="text-2xl text-zinc-500 mb-2">complete</div>
                                </div>
                                <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "50%" }}
                                        viewport={{ once: false }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: "Total", value: "8" },
                                    { label: "Done", value: "4" },
                                    { label: "Left", value: "4" },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: false }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                        whileHover={{ scale: 1.1, y: -5 }}
                                        className="text-center p-4 rounded-xl bg-surface-highlight/50 cursor-pointer"
                                    >
                                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                        <div className="text-xs text-zinc-500">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function StreakSection() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const flameRotate = useTransform(mouseX, [-200, 200], [-10, 10]);
    const flameScale = useTransform(mouseY, [-200, 200], [0.95, 1.05]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mouseX.set(x);
        mouseY.set(y);
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center px-6 py-32">
            <div className="max-w-6xl mx-auto w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
                        Build Your{" "}
                        <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                            Momentum
                        </span>
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-16">
                        Consistency is key. Track your daily streak and watch your discipline grow.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onMouseMove={handleMouseMove}
                    className="relative p-16 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/50 backdrop-blur-sm overflow-hidden"
                >
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                        className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl"
                    />

                    <div className="relative z-10">
                        <motion.div
                            style={{ rotate: flameRotate, scale: flameScale }}
                            className="inline-block mb-8"
                        >
                            <Flame className="w-24 h-24 text-orange-400" />
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: false }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                            className="text-9xl font-bold text-white mb-4"
                        >
                            14
                        </motion.div>

                        <p className="text-3xl text-zinc-400 mb-12">Day Streak 🔥</p>

                        <div className="flex justify-center gap-2">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false }}
                                    transition={{ delay: 0.6 + i * 0.05 }}
                                    whileHover={{ scale: 1.2, y: -10 }}
                                    className={`w-12 h-12 rounded-lg ${i < 5 ? "bg-orange-500" : "bg-zinc-800"
                                        } flex items-center justify-center cursor-pointer`}
                                >
                                    {i < 5 && <Flame className="w-6 h-6 text-white" />}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function AnalyticsSection() {
    const [todayHours, setTodayHours] = useState(4.2);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const chartY = useTransform(mouseY, [-200, 200], [-10, 10]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTodayHours((prev) => +(prev + (Math.random() * 0.2 - 0.1)).toFixed(1));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mouseX.set(x);
        mouseY.set(y);
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center px-6 py-32">
            <div className="max-w-6xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
                        Track Every{" "}
                        <span className="bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent">
                            Minute
                        </span>
                    </h2>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                        Visualize your progress with beautiful charts. See your growth over time.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onMouseMove={handleMouseMove}
                    className="p-12 rounded-3xl bg-surface/50 border border-border-subtle backdrop-blur-sm"
                >
                    <div className="mb-8">
                        <motion.div
                            key={todayHours}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl font-bold text-white mb-2"
                        >
                            {todayHours} <span className="text-3xl text-zinc-500">hours today</span>
                        </motion.div>
                        <p className="text-zinc-400">Keep it up! You're on track.</p>
                    </div>

                    <motion.div style={{ y: chartY }} className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockData}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="hours"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fill="url(#colorHours)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    <div className="mt-8 grid grid-cols-4 gap-4">
                        {[
                            { label: "This Week", value: "28.5h" },
                            { label: "This Month", value: "112h" },
                            { label: "Total", value: "847h" },
                            { label: "Avg/Day", value: "4.2h" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: false }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="text-center p-4 rounded-xl bg-zinc-800/50 cursor-pointer"
                            >
                                <div className="text-2xl font-bold text-emerald-400 mb-1">{stat.value}</div>
                                <div className="text-xs text-zinc-500">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function AurasSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-6 py-32">
            <div className="max-w-6xl mx-auto w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
                        Unlock Your{" "}
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                            Vibe
                        </span>
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-16">
                        Earn new themes as you hit milestones. Customize your study experience.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {[
                        { name: "Cyan Focus", color: "from-cyan-400 to-blue-500", locked: false },
                        { name: "Golden Hour", color: "from-orange-400 to-red-500", locked: false },
                        { name: "Midnight Purple", color: "from-purple-400 to-pink-500", locked: true, requirement: "50 hour streak" },
                        { name: "Ocean Breeze", color: "from-emerald-400 to-teal-500", locked: true, requirement: "100 sessions" },
                        { name: "Sunset Glow", color: "from-yellow-400 to-orange-500", locked: true, requirement: "30 day streak" },
                        { name: "Cosmic Dream", color: "from-indigo-400 to-purple-500", locked: true, requirement: "Pro member" },
                    ].map((aura, i) => (
                        <motion.div
                            key={aura.name}
                            initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                            viewport={{ once: false }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            whileHover={{ scale: 1.05, y: -10, rotateZ: 5 }}
                            className="relative cursor-pointer"
                        >
                            <div
                                className={`aspect-square rounded-2xl bg-gradient-to-br ${aura.color} p-1 ${aura.locked ? "opacity-40" : "opacity-100"
                                    }`}
                            >
                                <div className="w-full h-full rounded-xl bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                                    {aura.locked && (
                                        <div className="mb-4">
                                            <div className="w-8 h-8 border-2 border-white rounded-md" />
                                        </div>
                                    )}
                                    <div className="text-white font-bold text-lg mb-2">{aura.name}</div>
                                    {aura.locked && (
                                        <div className="text-zinc-400 text-xs text-center">{aura.requirement}</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Features() {
    return (
        <div className="bg-black">
            <SmartPlannerSection />
            <StreakSection />
            <AnalyticsSection />
            <AurasSection />
        </div>
    );
}
