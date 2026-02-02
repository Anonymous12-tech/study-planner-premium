"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface Particle {
    id: number;
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
}

export default function Hero() {
    const [liveCount, setLiveCount] = useState(42);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);

    // Initialize particles
    useEffect(() => {
        const initParticles = () => {
            const newParticles: Particle[] = [];
            const particleCount = 150;

            for (let i = 0; i < particleCount; i++) {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                newParticles.push({
                    id: i,
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    vx: 0,
                    vy: 0,
                    size: Math.random() * 3 + 1,
                    opacity: Math.random() * 0.5 + 0.3,
                });
            }
            setParticles(newParticles);
        };

        initParticles();
        window.addEventListener('resize', initParticles);
        return () => window.removeEventListener('resize', initParticles);
    }, []);

    // Live count animation
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveCount((prev) => prev + Math.floor(Math.random() * 3) - 1);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Particle animation with cursor repulsion
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            setParticles((prevParticles) => {
                return prevParticles.map((particle) => {
                    // Calculate distance from mouse
                    const dx = mousePos.x - particle.x;
                    const dy = mousePos.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const repulsionRadius = 150;

                    // Apply repulsion force
                    if (distance < repulsionRadius) {
                        const force = (repulsionRadius - distance) / repulsionRadius;
                        const angle = Math.atan2(dy, dx);
                        particle.vx -= Math.cos(angle) * force * 2;
                        particle.vy -= Math.sin(angle) * force * 2;
                    }

                    // Return to base position
                    const returnForce = 0.05;
                    particle.vx += (particle.baseX - particle.x) * returnForce;
                    particle.vy += (particle.baseY - particle.y) * returnForce;

                    // Apply friction
                    particle.vx *= 0.9;
                    particle.vy *= 0.9;

                    // Update position
                    particle.x += particle.vx;
                    particle.y += particle.vy;

                    // Draw particle
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(16, 185, 129, ${particle.opacity})`;
                    ctx.fill();

                    // Draw connections to nearby particles
                    prevParticles.forEach((otherParticle) => {
                        if (particle.id >= otherParticle.id) return;

                        const dx = particle.x - otherParticle.x;
                        const dy = particle.y - otherParticle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 120) {
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(otherParticle.x, otherParticle.y);
                            ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * (1 - distance / 120)})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    });

                    return particle;
                });
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [mousePos, particles.length]);

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const headlineVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.6,
                ease: "easeInOut" as any,
            },
        }),
    };

    return (
        <section
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
            onMouseMove={handleMouseMove}
        >
            {/* Animated Aura Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[100px]"
                />
            </div >

            {/* Interactive particle canvas */}
            < canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
            />

            {/* Subtle gradient overlay */}
            < div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
                {/* Live ticker */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-border-subtle backdrop-blur-sm mb-8 cursor-pointer"
                >
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm text-text-secondary">
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
                                        ? "bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent"
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
                    className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-12"
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
                    className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-black font-bold text-lg rounded-full transition-shadow"
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
                            className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-surface/30 border border-border-subtle backdrop-blur-sm cursor-pointer"
                        >
                            <stat.icon className="w-6 h-6 text-primary-light" />
                            <div className="text-3xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-zinc-500">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section >
    );
}
