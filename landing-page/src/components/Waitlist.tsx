"use client";

import { motion } from "framer-motion";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Waitlist() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setLoading(false);
        setSubmitted(true);
        setEmail("");
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center px-6 py-32 overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 8,
                        ease: "easeInOut",
                    }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 10,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
                        Ready to{" "}
                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            Transform
                        </span>
                        <br />
                        Your Study Game?
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
                        Join thousands of students already using Study Planner to achieve their goals.
                        Get early access and exclusive updates.
                    </p>
                </motion.div>

                {!submitted ? (
                    <motion.form
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        onSubmit={handleSubmit}
                        className="max-w-md mx-auto"
                    >
                        <div className="relative">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center gap-3 p-2 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm"
                            >
                                <div className="flex-1 flex items-center gap-3 px-4">
                                    <Mail className="w-5 h-5 text-zinc-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        className="flex-1 bg-transparent text-white placeholder:text-zinc-500 outline-none text-lg"
                                    />
                                </div>
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-shadow disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                                        />
                                    ) : (
                                        <>
                                            Join Waitlist
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: false }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 text-sm text-zinc-500"
                        >
                            No spam, ever. Unsubscribe anytime.
                        </motion.p>
                    </motion.form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="max-w-md mx-auto p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2">You're on the list! 🎉</h3>
                        <p className="text-zinc-400">
                            We'll send you updates and early access when we launch.
                        </p>
                        <motion.button
                            onClick={() => setSubmitted(false)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-6 text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            Join with another email
                        </motion.button>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 flex items-center justify-center gap-8 text-zinc-500"
                >
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">10,000+</div>
                        <div className="text-sm">Students</div>
                    </div>
                    <div className="w-px h-12 bg-zinc-800" />
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">500K+</div>
                        <div className="text-sm">Hours Focused</div>
                    </div>
                    <div className="w-px h-12 bg-zinc-800" />
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">4.9★</div>
                        <div className="text-sm">Rating</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
