import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Card } from './ui/Card';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { Goal } from '../types';

interface GoalProgressProps {
    goal: Goal;
    currentMinutes: number;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
    goal,
    currentMinutes,
    onEdit,
    onDelete
}) => {
    const [progressAnim] = useState(new Animated.Value(0));
    const percentage = Math.min((currentMinutes / goal.targetMinutes) * 100, 100);
    const isCompleted = currentMinutes >= goal.targetMinutes;

    useEffect(() => {
        Animated.spring(progressAnim, {
            toValue: percentage,
            useNativeDriver: false,
            tension: 20,
            friction: 7,
        }).start();
    }, [percentage]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <Card style={styles.card}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        {goal.type === 'daily' ? 'Daily Goal' : 'Weekly Goal'}
                    </Text>
                    <View style={styles.actions}>
                        {onEdit && (
                            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                                <Text style={styles.actionEmoji}>✏️</Text>
                            </TouchableOpacity>
                        )}
                        {onDelete && (
                            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                                <Text style={styles.actionEmoji}>🗑️</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <Text style={[styles.percentage, isCompleted && styles.completed]}>
                    {Math.round(percentage)}%
                </Text>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                    <Animated.View
                        style={[
                            styles.progressBar,
                            {
                                width: progressWidth,
                                backgroundColor: isCompleted ? colors.success : colors.primary,
                            },
                        ]}
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.stats}>
                    {currentMinutes} / {goal.targetMinutes} minutes
                </Text>
                {isCompleted && <Text style={styles.completedText}>🎉 Goal Completed!</Text>}
            </View>
        </Card>
    );
};


const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        paddingVertical: 2,
    },
    actionEmoji: {
        fontSize: 18,
    },
    percentage: {
        ...typography.h3,
        color: colors.primary,
    },
    completed: {
        color: colors.success,
    },
    progressContainer: {
        marginBottom: spacing.sm,
    },
    progressBackground: {
        height: 12,
        backgroundColor: colors.backgroundTertiary,
        borderRadius: borderRadius.full,
        overflow: 'hidden' as 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stats: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    completedText: {
        ...typography.caption,
        color: colors.success,
        fontWeight: '600' as '600',
    },
});
