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
import { colors, spacing, typography, borderRadius, gradients } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Subject } from '../types';
import { getSubjects, addSubject, deleteSubject, updateSubject, getSessions } from '../utils/storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Internal Component for Masonry-like Card
const SubjectGridCard = ({ subject, sessionsCount, onPress, onEdit, onDelete }: any) => (
    <TouchableOpacity
        style={[styles.card, { borderColor: subject.color + '40' }]}
        onPress={onPress}
        activeOpacity={0.8}
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
                <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
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
            <Ionicons name="trash-outline" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
    </TouchableOpacity>
);

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
        Haptics.selectionAsync();
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
            <LinearGradient colors={['#000000', '#0F1218']} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Curriculum</Text>
                    <Text style={styles.subtitle}>Manage your study portfolio</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleOpenModal()}
                >
                    <Ionicons name="add" size={24} color={colors.background} />
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
                            style={{ marginTop: 20, width: 200 }}
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
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        {editingSubject ? 'Edit Subject' : 'New Subject'}
                                    </Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={colors.textSecondary} />
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
                                        >
                                            {selectedColor === color && <Ionicons name="checkmark" size={16} color="#000" />}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Button
                                    title={editingSubject ? 'Save Changes' : 'Create Subject'}
                                    onPress={handleSaveSubject}
                                    style={styles.saveButton}
                                />
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
        backgroundColor: '#000000',
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
        color: colors.text,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    addButton: {
        backgroundColor: colors.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
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
        backgroundColor: '#15151A',
        borderRadius: 20,
        height: 160,
        padding: 15,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#252530',
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
        bottom: 15,
        right: 15,
        opacity: 0.5,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    cardStats: {
        marginTop: 'auto',
    },
    statText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
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
        color: colors.textSecondary,
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
        backgroundColor: '#1A1A22',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#2A2A35',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
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
        backgroundColor: '#15151A',
        borderRadius: 24,
        padding: 25,
        borderWidth: 1,
        borderColor: '#252530',
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
        color: colors.text,
    },
    colorLabel: {
        fontSize: 12,
        color: colors.textSecondary,
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
    colorOptionSelected: {
        borderWidth: 3,
        borderColor: '#FFF',
    },
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: 14,
        height: 50,
    },
});
