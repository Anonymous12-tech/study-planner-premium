"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Users, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
    const [liveCount, setLiveCount] = useState(42);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const gradientX = useTransform(mouseX, [0, window.innerWidth], [-20, 20]);
    const gradientY = useTransform(mouseY, [0, window.innerHeight], [-20, 20]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveCount((prev) => prev + Math.floor(Math.random() * 3) - 1);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
    };

    const headlineVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    };

    return (
        <section
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
            onMouseMove={handleMouseMove}
        >
            {/* Animated grid background with cursor tracking */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

            {/* Cursor-following gradient orb */}
            <motion.div
                className="absolute w-96 h-96 rounded-full blur-3xl opacity-30"
                style={{
                    background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)",
                    x: gradientX,
                    y: gradientY,
                    left: mouseX,
                    top: mouseY,
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
                {/* Live ticker */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm mb-8 cursor-pointer"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm text-zinc-400">
                        <span className="text-white font-semibold">{liveCount}</span>{" "}
                        students using Study Planner
                    </span>
                </motion.div>

                {/* Main headline */}
                <div className="space-y-4 mb-8">
                    {["Master Your", "Study", "Sessions."].map((word, i) => (
                        <motion.h1
                            key={word}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={headlineVariants}
                            whileHover={{ scale: 1.02 }}
                            className="text-7xl md:text-9xl font-bold tracking-tight cursor-default"
                        >
                            <span
                                className={
                                    i === 2
                                        ? "bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                                        : "text-white"
                                }
                            >
                                {word}
                            </span>
                        </motion.h1>
                    ))}
                </div>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12"
                >
                    Plan smarter. Track progress.{" "}
                    <span className="text-white font-semibold">
                        Build unstoppable momentum
                    </span>{" "}
                    with streaks and analytics.
                </motion.p>

                {/* CTA */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(16,185,129,0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-lg rounded-full transition-shadow"
                >
                    Start Planning Free
                </motion.button>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
                >
                    {[
                        { icon: Users, label: "Active Users", value: "10,000+" },
                        { icon: TrendingUp, label: "Hours Tracked", value: "500K+" },
                        { icon: Zap, label: "Avg. Streak", value: "12 days" },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ y: -5, scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm cursor-pointer"
                        >
                            <stat.icon className="w-6 h-6 text-emerald-400" />
                            <div className="text-3xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-zinc-500">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
