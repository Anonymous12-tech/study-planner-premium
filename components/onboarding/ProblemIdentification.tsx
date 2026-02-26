import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useOnboarding, STUDY_PROBLEMS } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export const ProblemIdentification = () => {
    const { selectedProblems, toggleProblem } = useOnboarding();

    const handleSelect = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleProblem(id);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headline}>What's your biggest study challenge?</Text>
            <Text style={styles.subheadline}>Select up to 2 options to personalize your experience.</Text>

            <View style={styles.grid}>
                {STUDY_PROBLEMS.map((problem) => {
                    const isSelected = selectedProblems.includes(problem.id);
                    return (
                        <TouchableOpacity
                            key={problem.id}
                            onPress={() => handleSelect(problem.id)}
                            style={[
                                styles.card,
                                isSelected && styles.selectedCard
                            ]}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardContent}>
                                <Text style={[
                                    styles.problemLabel,
                                    isSelected && styles.selectedText
                                ]}>
                                    {problem.label}
                                </Text>
                                <View style={[
                                    styles.checkbox,
                                    isSelected && styles.selectedCheckbox
                                ]}>
                                    {isSelected && <Ionicons name="checkmark" size={16} color={colors.background} />}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    grid: {
        gap: spacing.md,
    },
    card: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        // Neumorphic Outer (Convex)
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
    selectedCard: {
        borderColor: colors.primary,
        backgroundColor: colors.backgroundSecondary,
        // Neumorphic Inner (Concave)
        borderWidth: 2,
        borderTopColor: 'rgba(0, 0, 0, 0.5)',
        borderLeftColor: 'rgba(0, 0, 0, 0.5)',
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        borderRightColor: 'rgba(255, 255, 255, 0.05)',
        elevation: 0,
        shadowOpacity: 0,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    problemLabel: {
        ...typography.body,
        color: colors.text,
        flex: 1,
        paddingRight: spacing.md,
    },
    selectedText: {
        color: colors.primary,
        fontWeight: '600',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedCheckbox: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
});
