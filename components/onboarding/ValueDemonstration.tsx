import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useOnboarding, STUDY_PROBLEMS } from '../../context/OnboardingContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export const ValueDemonstration = () => {
    const { selectedProblems } = useOnboarding();
    const [isGenerating, setIsGenerating] = useState(false);
    const [blueprint, setBlueprint] = useState<null | any>(null);

    const generateBlueprint = () => {
        setIsGenerating(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Simulate "AI" blueprint generation
        setTimeout(() => {
            setIsGenerating(false);
            setBlueprint({
                score: 84,
                focusWindow: "25m / 5m",
                dailyGoal: "2.5 hours",
                priority: selectedProblems.includes('focus') ? "Deep Work Training" : "Atomic Atomic Consistency"
            });
        }, 2000);
    };

    if (isGenerating) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Synthesizing your study protocols...</Text>
                <Text style={styles.loadingSubtext}>Optimizing for maximum neuro-retention</Text>
            </View>
        );
    }

    if (blueprint) {
        return (
            <View style={styles.container}>
                <Text style={styles.headline}>Your Growth Blueprint is ready</Text>
                <Text style={styles.subheadline}>Based on your study profile, here is your path to academic excellence.</Text>

                <View style={styles.scoreContainer}>
                    <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.scoreBadge}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.scoreValue}>{blueprint.score}</Text>
                        <Text style={styles.scoreLabel}>Success Potential</Text>
                    </LinearGradient>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Ionicons name="timer-outline" size={24} color={colors.primary} />
                        <Text style={styles.statTitle}>Focus Window</Text>
                        <Text style={styles.statValueSmall}>{blueprint.focusWindow}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="calendar-outline" size={24} color={colors.secondary} />
                        <Text style={styles.statTitle}>Daily Load</Text>
                        <Text style={styles.statValueSmall}>{blueprint.dailyGoal}</Text>
                    </View>
                </View>

                <View style={styles.previewCard}>
                    <View style={styles.previewHeader}>
                        <Text style={styles.previewTitle}>WEEK 1: FOUNDATION PHASE</Text>
                        <Ionicons name="lock-closed" size={16} color={colors.textTertiary} />
                    </View>
                    <View style={styles.previewContent}>
                        <View style={styles.previewItem}>
                            <View style={styles.dot} />
                            <Text style={styles.previewText}>Circadian Rhythm Alignment</Text>
                        </View>
                        <View style={styles.previewItem}>
                            <View style={styles.dot} />
                            <Text style={styles.previewText}>Dopamine Detox Protocols</Text>
                        </View>
                        <View style={[styles.previewItem, { opacity: 0.3 }]}>
                            <View style={styles.dot} />
                            <Text style={styles.previewText}>Cognitive Load Balancing</Text>
                        </View>
                    </View>
                    <View style={styles.blurOverlay}>
                        <LinearGradient
                            colors={['transparent', colors.background]}
                            style={styles.blurGradient}
                        />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headline}>Unlock your performance diagnostics</Text>
            <Text style={styles.subheadline}>We'll generate a custom study plan and identify your cognitive bottlenecks.</Text>

            <View style={styles.graphicContainer}>
                <LinearGradient
                    colors={[colors.backgroundSecondary, colors.backgroundTertiary]}
                    style={styles.graphic}
                >
                    <Ionicons name="analytics" size={80} color={colors.primary + '40'} />
                    <View style={styles.pulseContainer}>
                        <View style={styles.pulse} />
                    </View>
                </LinearGradient>
            </View>

            <TouchableOpacity
                style={styles.generateButton}
                onPress={generateBlueprint}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={styles.buttonText}>Generate My Blueprint</Text>
                    <Ionicons name="flash" size={20} color={colors.background} />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    loadingText: {
        ...typography.h2,
        color: colors.text,
        marginTop: spacing.lg,
        textAlign: 'center',
    },
    loadingSubtext: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    headline: {
        ...typography.h1,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    subheadline: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    graphicContainer: {
        height: 200,
        marginBottom: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    graphic: {
        width: '100%',
        height: '100%',
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundSecondary,
        // Neumorphic Convex
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        borderLeftColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.5)',
        borderRightColor: 'rgba(0, 0, 0, 0.5)',
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    pulseContainer: {
        position: 'absolute',
    },
    pulse: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: colors.primary,
        opacity: 0.2,
    },
    generateButton: {
        height: 64,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    buttonText: {
        ...typography.h3,
        color: colors.background,
        fontWeight: '700',
    },
    scoreContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    scoreBadge: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 8,
        borderColor: colors.backgroundSecondary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: '800',
        color: colors.background,
    },
    scoreLabel: {
        ...typography.tiny,
        color: colors.background,
        fontWeight: '700',
        marginTop: -4,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        // Neumorphic Convex
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        borderLeftColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.5)',
        borderRightColor: 'rgba(0, 0, 0, 0.5)',
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    statTitle: {
        ...typography.tiny,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        fontWeight: '600',
    },
    statValueSmall: {
        ...typography.h3,
        color: colors.text,
        marginTop: spacing.xs,
    },
    previewCard: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        position: 'relative',
        overflow: 'hidden',
        // Neumorphic Convex (Subtle)
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        borderLeftColor: 'rgba(255, 255, 255, 0.05)',
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    previewTitle: {
        ...typography.tiny,
        color: colors.textTertiary,
        fontWeight: '700',
        letterSpacing: 1,
    },
    previewContent: {
        gap: spacing.sm,
    },
    previewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
    },
    previewText: {
        ...typography.body,
        color: colors.text,
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    blurGradient: {
        height: '60%',
    }
});
