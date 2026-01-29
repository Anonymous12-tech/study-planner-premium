import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Subject } from '../types';
import { Card } from './ui/Card';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { formatTime } from '../utils/calculations';

interface SubjectCardProps {
    subject: Subject;
    onPress: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    sessionsCount?: number;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
    subject,
    onPress,
    onEdit,
    onDelete,
    sessionsCount = 0,
}) => {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <Card style={styles.card}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.7}
                style={styles.touchable}
            >
                <View style={styles.content}>
                    <Text style={styles.emoji}>{subject.icon || '📚'}</Text>
                    <View style={styles.info}>
                        <Text style={styles.name}>{subject.name}</Text>
                        <Text style={styles.stats}>
                            {formatTime(subject.totalStudyTime)} focus time • {sessionsCount} sessions
                        </Text>
                    </View>
                    <View style={[styles.colorIndicator, { backgroundColor: subject.color }]} />
                </View>
            </TouchableOpacity>

            {(onEdit || onDelete) && (
                <View style={styles.actions}>
                    {onEdit && (
                        <TouchableOpacity
                            onPress={onEdit}
                            style={styles.actionButton}
                        >
                            <Text style={styles.actionEmoji}>✏️</Text>
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity
                            onPress={onDelete}
                            style={styles.actionButton}
                        >
                            <Text style={styles.actionEmoji}>🗑️</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </Card>
    );
};


const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.md,
        backgroundColor: colors.backgroundSecondary,
    },
    touchable: {
        padding: spacing.lg,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    colorIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginLeft: spacing.md,
    },
    info: {
        flex: 1,
    },
    name: {
        ...typography.bodyLarge,
        fontWeight: '700' as any,
        color: colors.text,
        marginBottom: 2,
    },
    stats: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        justifyContent: 'flex-end',
    },
    actionButton: {
        padding: spacing.sm,
    },
    actionEmoji: {
        fontSize: 16,
    },
});
