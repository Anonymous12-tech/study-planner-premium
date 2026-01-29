import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Modal,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography, borderRadius, gradients } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { getDeadlines, addDeadline, deleteDeadline, updateDeadline } from '../utils/storage';
import { ExamDeadline } from '../types';
import * as Haptics from 'expo-haptics';

export const GoalsScreen = () => {
    const [deadlines, setDeadlines] = useState<ExamDeadline[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);

    const [editingDeadline, setEditingDeadline] = useState<ExamDeadline | null>(null);
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date());
    const [prepLevel, setPrepLevel] = useState(20);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const loadData = async () => {
        const data = await getDeadlines();
        // Sort by date soonest first
        const sorted = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setDeadlines(sorted);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleOpenAdd = () => {
        setEditingDeadline(null);
        setName('');
        setDate(new Date());
        setPrepLevel(20);
        setModalVisible(true);
    };

    const handleOpenEdit = (deadline: ExamDeadline) => {
        setEditingDeadline(deadline);
        setName(deadline.name);
        setDate(new Date(deadline.date));
        setPrepLevel(deadline.preparationLevel);
        setModalVisible(true);
    };

    const handleSaveDeadline = async () => {
        if (!name.trim()) return;

        if (editingDeadline) {
            const updated: ExamDeadline = {
                ...editingDeadline,
                name: name.trim(),
                date: date.toISOString().split('T')[0],
                preparationLevel: prepLevel,
            };
            await updateDeadline(updated);
        } else {
            const newDeadline: ExamDeadline = {
                id: Date.now().toString(),
                name: name.trim(),
                date: date.toISOString().split('T')[0],
                preparationLevel: prepLevel,
                createdAt: Date.now(),
            };
            await addDeadline(newDeadline);
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setModalVisible(false);
        loadData();
    };

    const handleDelete = async (id: string) => {
        await deleteDeadline(id);
        loadData();
    };

    const getDaysRemaining = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={gradients.dark as any} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <Text style={styles.title}>Deadlines</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleOpenAdd}
                >
                    <Text style={styles.addButtonText}>+ Add Exam</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {deadlines && deadlines.length > 0 ? (
                    (deadlines || []).map((item, index) => {
                        const daysLeft = getDaysRemaining(item.date);
                        const isUrgent = daysLeft < 7;

                        return (
                            <Card key={item.id} style={[styles.deadlineCard, index === 0 ? styles.featuredCard : {}]}>
                                <TouchableOpacity onPress={() => handleOpenEdit(item)}>
                                    <View style={styles.cardHeader}>
                                        <View>
                                            <Text style={styles.deadlineName}>{item.name}</Text>
                                            <Text style={styles.deadlineDate}>{new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                                        </View>
                                        <View style={[styles.daysBadge, isUrgent && { backgroundColor: colors.error }]}>
                                            <Text style={styles.daysValue}>{daysLeft}</Text>
                                            <Text style={styles.daysLabel}>days</Text>
                                        </View>
                                    </View>

                                    <View style={styles.prepSection}>
                                        <View style={styles.prepHeader}>
                                            <Text style={styles.prepLabel}>Preparation Level</Text>
                                            <Text style={styles.prepValue}>{item.preparationLevel}%</Text>
                                        </View>
                                        <View style={styles.progressBg}>
                                            <View style={[styles.progressFill, { width: `${item.preparationLevel}%`, backgroundColor: item.preparationLevel > 80 ? colors.success : colors.secondary }]} />
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                                    <Text style={styles.deleteBtnText}>Remove</Text>
                                </TouchableOpacity>
                            </Card>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🎯</Text>
                        <Text style={styles.emptyTitle}>Stay Ahead of Your Exams</Text>
                        <Text style={styles.emptySubtitle}>Add your upcoming deadlines to track your preparation progress and countdown the days.</Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <Card style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingDeadline ? 'Edit Deadline' : 'Add Deadline'}</Text>

                        <Input
                            label="Exam / Milestone Name"
                            placeholder="e.g. Finals - Advanced Calculus"
                            value={name}
                            onChangeText={setName}
                        />

                        <TouchableOpacity
                            style={styles.dateSelector}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.label}>Exam Date</Text>
                            <Text style={styles.dateValue}>{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(Platform.OS === 'ios');
                                    if (selectedDate) setDate(selectedDate);
                                }}
                                minimumDate={new Date()}
                            />
                        )}

                        <View style={styles.prepInput}>
                            <View style={styles.prepHeader}>
                                <Text style={styles.label}>Current Prep Level</Text>
                                <Text style={styles.prepValueText}>{prepLevel}%</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={5}
                                value={prepLevel}
                                onValueChange={setPrepLevel}
                                minimumTrackTintColor={colors.primary}
                                maximumTrackTintColor={colors.backgroundTertiary}
                                thumbTintColor={colors.primary}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <Button title="Cancel" variant="ghost" onPress={() => setModalVisible(false)} style={{ flex: 1, marginRight: spacing.md }} />
                            <Button title={editingDeadline ? "Save Changes" : "Add Deadline"} onPress={handleSaveDeadline} style={{ flex: 2 }} disabled={!name} />
                        </View>
                    </Card>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h1,
        color: colors.text,
    },
    addButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    addButtonText: {
        ...typography.caption,
        color: colors.background,
        fontWeight: '700' as any,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    deadlineCard: {
        marginBottom: spacing.lg,
        padding: spacing.lg,
    },
    featuredCard: {
        borderColor: colors.primary + '40',
        borderWidth: 2,
        backgroundColor: colors.backgroundSecondary,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    deadlineName: {
        ...typography.h2,
        fontSize: 22,
        color: colors.text,
        marginBottom: 4,
    },
    deadlineDate: {
        ...typography.body,
        color: colors.textSecondary,
    },
    daysBadge: {
        backgroundColor: colors.backgroundTertiary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    daysValue: {
        ...typography.h3,
        color: colors.text,
        lineHeight: 20,
    },
    daysLabel: {
        ...typography.small,
        color: colors.textSecondary,
        fontSize: 10,
    },
    prepSection: {
        marginBottom: spacing.md,
    },
    prepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    prepLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    prepValue: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '700' as any,
    },
    progressBg: {
        height: 8,
        backgroundColor: colors.backgroundTertiary,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    deleteBtn: {
        alignSelf: 'flex-end',
        marginTop: spacing.sm,
    },
    deleteBtnText: {
        ...typography.small,
        color: colors.textMuted,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        ...typography.h2,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        backgroundColor: colors.backgroundSecondary,
    },
    modalTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.xl,
    },
    dateSelector: {
        marginVertical: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.backgroundTertiary,
        borderRadius: borderRadius.md,
    },
    label: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    dateValue: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600' as any,
    },
    prepInput: {
        marginTop: spacing.md,
    },
    prepValueText: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '700' as any,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: spacing.xl,
    },
});
