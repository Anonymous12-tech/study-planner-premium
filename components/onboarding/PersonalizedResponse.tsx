import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useOnboarding, STUDY_PROBLEMS } from '../../context/OnboardingContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const PersonalizedResponse = () => {
    const { selectedProblems } = useOnboarding();
    const problems = STUDY_PROBLEMS.filter(p => selectedProblems.includes(p.id));

    return (
        <View style={styles.container}>
            <Text style={styles.tagline}>YOUR PERSONALIZED SUCCESS PATH</Text>
            <Text style={styles.headline}>We've designed a system for you.</Text>

            <Text style={styles.description}>
                It’s not your fault. Standard study methods aren’t built for how your brain works. We're rebuilding your process from the ground up:
            </Text>

            <View style={styles.solutionContainer}>
                {problems.map((p, index) => (
                    <View key={p.id} style={styles.solutionCard}>
                        <LinearGradient
                            colors={[colors.primary + '20', colors.primary + '05']}
                            style={styles.solutionGradient}
                        />
                        <View style={styles.iconContainer}>
                            <Ionicons name="sparkles" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.solutionTitle}>{p.solution}</Text>
                            <Text style={styles.solutionDescription}>{p.description}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.focusNote}>
                <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.focusNoteText}>
                    Our deterministic logic has mapped your challenges to these specific high-performance protocols.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tagline: {
        ...typography.tiny,
        color: colors.primary,
        letterSpacing: 2,
        marginBottom: spacing.xs,
        fontWeight: '700',
    },
    headline: {
        ...typography.h1,
        color: colors.text,
        marginBottom: spacing.md,
    },
    description: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    solutionContainer: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    solutionCard: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    solutionGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.backgroundTertiary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    solutionTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    solutionDescription: {
        ...typography.caption,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    focusNote: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    focusNoteText: {
        ...typography.tiny,
        color: colors.textSecondary,
        flex: 1,
    }
});
