import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useOnboarding, STUDY_PROBLEMS } from '../../context/OnboardingContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const Paywall = () => {
    const { selectedProblems } = useOnboarding();
    const problem = STUDY_PROBLEMS.find(p => selectedProblems.includes(p.id)) || STUDY_PROBLEMS[0];

    const benefits = [
        { icon: 'infinite', text: 'Unlimited Study Sessions' },
        { icon: 'analytics', text: 'Advanced Cognitive Insights' },
        { icon: 'shield-checkmark', text: 'Systematic Habit Formation' }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={styles.heroGradient}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                />
                <View style={styles.headerContent}>
                    <Text style={styles.badgeText}>PREMIUM ACCESS</Text>
                    <Text style={styles.heroTitle}>Fix Your Focus This Week</Text>
                    <Text style={styles.heroSubtitle}>
                        Join 10,000+ students who have mastered their study workflow with {problem.solution}.
                    </Text>
                </View>
            </View>

            <View style={styles.benefitsContainer}>
                {benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                        <View style={styles.benefitIcon}>
                            <Ionicons name={benefit.icon as any} size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.benefitText}>{benefit.text}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.pricingSection}>
                <View style={styles.planCard}>
                    <View style={styles.planHeader}>
                        <Text style={styles.planName}>Annual Access</Text>
                        <View style={styles.saveBadge}>
                            <Text style={styles.saveBadgeText}>SAVE 65%</Text>
                        </View>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.currency}>$</Text>
                        <Text style={styles.price}>4.99</Text>
                        <Text style={styles.period}>/month</Text>
                    </View>
                    <Text style={styles.billingNote}>Billed annually at $59.99</Text>
                </View>
            </View>

            <View style={styles.disclaimer}>
                <Ionicons name="information-circle-outline" size={12} color={colors.textTertiary} />
                <Text style={styles.disclaimerText}>
                    Cancel anytime. No commitment. Secure 256-bit encryption.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 220,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginBottom: spacing.xl,
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.9,
    },
    headerContent: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    badgeText: {
        ...typography.tiny,
        color: colors.background,
        fontWeight: '800',
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: spacing.sm,
    },
    heroTitle: {
        ...typography.h1,
        color: colors.background,
        marginBottom: spacing.xs,
        fontWeight: '800',
    },
    heroSubtitle: {
        ...typography.body,
        color: colors.background,
        opacity: 0.9,
        lineHeight: 22,
    },
    benefitsContainer: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    benefitIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        // Neumorphic Convex
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        borderLeftColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 3,
    },
    benefitText: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
    },
    pricingSection: {
        marginBottom: spacing.xl,
    },
    planCard: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        // Neumorphic Convex Deep
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        borderLeftColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderBottomColor: colors.primary,
        borderRightColor: colors.primary,
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    planName: {
        ...typography.h3,
        color: colors.text,
        fontWeight: '700',
    },
    saveBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    saveBadgeText: {
        ...typography.tiny,
        color: colors.background,
        fontWeight: '800',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        ...typography.h3,
        color: colors.textSecondary,
        marginRight: 2,
    },
    price: {
        fontSize: 40,
        fontWeight: '800',
        color: colors.text,
    },
    period: {
        ...typography.body,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    billingNote: {
        ...typography.caption,
        color: colors.textTertiary,
        marginTop: spacing.xs,
    },
    disclaimer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    disclaimerText: {
        ...typography.tiny,
        color: colors.textTertiary,
    }
});
