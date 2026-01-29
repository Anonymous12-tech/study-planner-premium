import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { AchievementBadge } from '../utils/calculations';

interface BadgeItemProps {
    badge: AchievementBadge;
}

export const BadgeItem: React.FC<BadgeItemProps> = ({ badge }) => {
    return (
        <View style={[styles.container, !badge.unlocked && styles.locked]}>
            <View style={[styles.iconContainer, badge.unlocked ? styles.unlockedIcon : styles.lockedIcon]}>
                <Text style={[styles.icon, !badge.unlocked && { opacity: 0.3 }]}>{badge.icon}</Text>
            </View>
            <Text style={[styles.title, !badge.unlocked && styles.lockedText]}>{badge.title}</Text>
            <Text style={styles.description} numberOfLines={2}>{badge.description}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '30%',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    locked: {
        opacity: 0.6,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
        borderWidth: 2,
    },
    unlockedIcon: {
        backgroundColor: colors.primary + '20',
        borderColor: colors.primary,
    },
    lockedIcon: {
        backgroundColor: colors.backgroundSecondary,
        borderColor: colors.border,
    },
    icon: {
        fontSize: 28,
    },
    title: {
        ...typography.tiny,
        fontWeight: '700' as any,
        color: colors.text,
        textAlign: 'center',
    },
    lockedText: {
        color: colors.textMuted,
    },
    description: {
        ...typography.tiny,
        fontSize: 9,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 2,
    },
});
