import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Modal,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, gradients } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SubjectCard } from '../components/SubjectCard';
import { Subject } from '../types';
import { getSubjects, addSubject, deleteSubject, updateSubject, getSessions } from '../utils/storage';
import * as Haptics from 'expo-haptics';

export const SubjectsScreen = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [selectedColor, setSelectedColor] = useState(colors.subjectColors[0]);
    const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});

    const loadData = async () => {
        const [subjectsData, sessions] = await Promise.all([
            getSubjects(),
            getSessions(),
        ]);

        setSubjects(subjectsData);

        // Count sessions per subject
        const counts: Record<string, number> = {};
        sessions.forEach(session => {
            counts[session.subjectId] = (counts[session.subjectId] || 0) + 1;
        });
        setSessionCounts(counts);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleOpenModal = (subject?: Subject) => {
        if (subject) {
            setEditingSubject(subject);
            setNewSubjectName(subject.name);
            setSelectedColor(subject.color);
        } else {
            setEditingSubject(null);
            setNewSubjectName('');
            setSelectedColor(colors.subjectColors[0]);
        }
        setModalVisible(true);
    };

    const handleSaveSubject = async () => {
        if (!newSubjectName.trim()) {
            Alert.alert('Error', 'Please enter a subject name');
            return;
        }

        if (editingSubject) {
            const updated: Subject = {
                ...editingSubject,
                name: newSubjectName.trim(),
                color: selectedColor,
            };
            await updateSubject(updated);
            loadData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            const newSubject: Subject = {
                id: Date.now().toString(),
                name: newSubjectName.trim(),
                color: selectedColor,
                createdAt: Date.now(),
                totalStudyTime: 0,
                icon: '📚', // Default icon
            };

            await addSubject(newSubject);
            loadData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setNewSubjectName('');
        setSelectedColor(colors.subjectColors[0]);
        setModalVisible(false);
        setEditingSubject(null);
    };

    const handleDeleteSubject = (subject: Subject) => {
        Alert.alert(
            'Delete Subject',
            `Are you sure you want to delete "${subject.name}"? This will not delete your study sessions.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteSubject(subject.id);
                        loadData();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={gradients.dark as any} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <Text style={styles.title}>Your Subjects</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleOpenModal()}
                >
                    <Text style={styles.addButtonText}>+ New Subject</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {subjects && subjects.map(subject => (
                    <SubjectCard
                        key={subject.id}
                        subject={subject}
                        onPress={() => { }}
                        onEdit={() => handleOpenModal(subject)}
                        onDelete={() => handleDeleteSubject(subject)}
                        sessionsCount={sessionCounts[subject.id] || 0}
                    />
                ))}

                {subjects.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📚</Text>
                        <Text style={styles.emptyTitle}>Curate Your Curriculum</Text>
                        <Text style={styles.emptySubtitle}>Organize your focus sessions by subject to track where your time goes.</Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Add/Edit Subject Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardView}
                        >
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>
                                    {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                                </Text>

                                <Input
                                    label="Subject Name"
                                    placeholder="e.g., Mathematics, Physics"
                                    value={newSubjectName}
                                    onChangeText={setNewSubjectName}
                                    autoFocus
                                />

                                <Text style={styles.colorLabel}>Choose Color</Text>
                                <View style={styles.colorGrid}>
                                    {colors.subjectColors && colors.subjectColors.map(color => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[
                                                styles.colorOption,
                                                { backgroundColor: color },
                                                selectedColor === color && styles.colorOptionSelected,
                                            ]}
                                            onPress={() => {
                                                setSelectedColor(color);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }}
                                        />
                                    ))}
                                </View>

                                <View style={styles.modalButtons}>
                                    <Button
                                        title="Cancel"
                                        onPress={() => {
                                            setModalVisible(false);
                                            setNewSubjectName('');
                                            setEditingSubject(null);
                                        }}
                                        variant="ghost"
                                        style={styles.modalButton}
                                    />
                                    <Button
                                        title={editingSubject ? 'Save' : 'Add'}
                                        onPress={handleSaveSubject}
                                        style={styles.modalButton}
                                    />
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
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
        paddingTop: spacing.xxl + 20,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: colors.backgroundSecondary,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.xl,
        paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    },
    modalTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.lg,
    },
    colorLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        fontWeight: '600' as '600',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    colorOption: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
    },
    colorOptionSelected: {
        borderWidth: 3,
        borderColor: colors.text,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    modalButton: {
        flex: 1,
    },
});
