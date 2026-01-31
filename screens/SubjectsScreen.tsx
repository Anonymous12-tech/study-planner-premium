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
    Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors as baseColors, spacing, typography, borderRadius, gradients as baseGradients, shadows } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Subject } from '../types';
import { getSubjects, addSubject, deleteSubject, updateSubject, getSessions } from '../utils/storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Internal Component for Masonry-like Card
const SubjectGridCard = ({ subject, sessionsCount, onPress, onEdit, onDelete }: any) => {
    const { colors } = useTheme();
    return (
        <Card
            variant="glass"
            padding="none"
            style={[styles.card, { borderColor: subject.color + '40' }]}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={{ flex: 1, padding: 15 }}
            >
                <LinearGradient
                    colors={[subject.color + '15', subject.color + '05']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                />

                <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: subject.color + '20' }]}>
                        <Text style={styles.icon}>{subject.icon}</Text>
                    </View>
                    <TouchableOpacity onPress={onEdit} style={styles.moreBtn}>
                        <Ionicons name="ellipsis-horizontal" size={16} color={baseColors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>{subject.name}</Text>

                <View style={styles.cardStats}>
                    <Text style={styles.statText}>
                        {Math.floor(subject.totalStudyTime / 3600)}h {(Math.floor(subject.totalStudyTime / 60) % 60)}m
                    </Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{sessionsCount} sessions</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                    <Ionicons name="trash-outline" size={18} color={baseColors.textSecondary} />
                </TouchableOpacity>
            </TouchableOpacity>
        </Card>
    );
};

export const SubjectsScreen = () => {
    const { colors, gradients } = useTheme();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [selectedColor, setSelectedColor] = useState(baseColors.subjectColors[0]);
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
        Haptics.selectionAsync();
        if (subject) {
            setEditingSubject(subject);
            setNewSubjectName(subject.name);
            setSelectedColor(subject.color);
        } else {
            setEditingSubject(null);
            setNewSubjectName('');
            setSelectedColor(baseColors.subjectColors[0]);
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
        setSelectedColor(baseColors.subjectColors[0]);
        setModalVisible(false);
        setEditingSubject(null);
    };

    const handleDeleteSubject = (subject: Subject) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
            <LinearGradient colors={gradients.aura as any} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Curriculum</Text>
                    <Text style={styles.subtitle}>Manage your study portfolio</Text>
                </View>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleOpenModal()}
                >
                    <Ionicons name="add" size={24} color={baseColors.background} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {subjects && subjects.map(subject => (
                        <View key={subject.id} style={styles.gridItem}>
                            <SubjectGridCard
                                subject={subject}
                                sessionsCount={sessionCounts[subject.id] || 0}
                                onPress={() => { }}
                                onEdit={() => handleOpenModal(subject)}
                                onDelete={() => handleDeleteSubject(subject)}
                            />
                        </View>
                    ))}
                </View>

                {subjects.length === 0 && (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="library" size={40} color={colors.primary} />
                        </View>
                        <Text style={styles.emptyTitle}>Curate Your Knowledge</Text>
                        <Text style={styles.emptySubtitle}>Add subjects to start organizing your deep work sessions effectively.</Text>
                        <Button
                            title="Create First Subject"
                            onPress={() => handleOpenModal()}
                            style={{ marginTop: 20, width: 220, backgroundColor: colors.primary }}
                        />
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Add/Edit Subject Modal */}
            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardView}
                        >
                            <Card variant="glass" intensity={60} style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        {editingSubject ? 'Edit Subject' : 'New Subject'}
                                    </Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={baseColors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <Input
                                    label="Subject Name"
                                    placeholder="e.g. Quantum Physics"
                                    value={newSubjectName}
                                    onChangeText={setNewSubjectName}
                                    autoFocus
                                />

                                <Text style={styles.colorLabel}>Theme Color</Text>
                                <View style={styles.colorGrid}>
                                    {baseColors.subjectColors && baseColors.subjectColors.map(color => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[
                                                styles.colorOption,
                                                { backgroundColor: color },
                                                selectedColor === color && { borderColor: '#FFF', borderWidth: 3 },
                                            ]}
                                            onPress={() => {
                                                setSelectedColor(color);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }}
                                        >
                                            {selectedColor === color && <Ionicons name="checkmark" size={16} color="#000" />}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Button
                                    title={editingSubject ? 'Save Changes' : 'Create Subject'}
                                    onPress={handleSaveSubject}
                                    style={[styles.saveButton, { backgroundColor: colors.primary }]}
                                />
                            </Card>
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
        backgroundColor: baseColors.background,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 70 : 40,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        color: baseColors.text,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        color: baseColors.textSecondary,
        marginTop: 4,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.medium,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%', // 2 columns
        marginBottom: 15,
    },
    card: {
        borderRadius: 20,
        height: 160,
        borderWidth: 1,
        borderColor: baseColors.border,
        overflow: 'hidden',
        position: 'relative',
    },
    cardGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 20,
    },
    moreBtn: {
        padding: 4,
    },
    deleteBtn: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 69, 58, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: baseColors.text,
        marginBottom: 4,
    },
    cardStats: {
        marginTop: 'auto',
    },
    statText: {
        fontSize: 13,
        fontWeight: '600',
        color: baseColors.textSecondary,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 6,
    },
    badgeText: {
        fontSize: 10,
        color: baseColors.textSecondary,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
        padding: 20,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: baseColors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: baseColors.border,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: baseColors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: baseColors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    keyboardView: {
        width: '100%',
    },
    modalContent: {
        borderRadius: 24,
        width: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: baseColors.text,
    },
    colorLabel: {
        fontSize: 12,
        color: baseColors.textSecondary,
        marginBottom: 10,
        marginTop: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 25,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        borderRadius: 14,
        height: 50,
    },
});
