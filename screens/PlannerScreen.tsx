import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Dimensions,
    Platform,
    RefreshControl,
    Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CircularProgress } from '../components/ui/CircularProgress';
import {
    getTasks,
    addTask,
    deleteTask,
    updateTask,
    getSubjects,
    getUserPreferences,
    getDailyStats,
    getTodos,
    addTodo,
    updateTodo,
    deleteTodo
} from '../utils/storage';
import { StudyTask, Subject, UserPreferences, DailyStats, StudyTodo } from '../types';
import { getTodayDateString, getWeekIdentifier, getMonthIdentifier } from '../utils/calculations';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const PlannerScreen = ({ navigation }: any) => {
    const [selectedDate, setSelectedDate] = useState(getTodayDateString());
    const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [tasks, setTasks] = useState<StudyTask[]>([]);
    const [todos, setTodos] = useState<StudyTodo[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [prefs, setPrefs] = useState<UserPreferences | null>(null);
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [isTaskModalVisible, setTaskModalVisible] = useState(false);
    const [isTodoModalVisible, setTodoModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Form states
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState('45');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [todoText, setTodoText] = useState('');

    const loadData = async () => {
        const [allTasks, allSubjects, userPrefs, allStats, allTodos] = await Promise.all([
            getTasks(),
            getSubjects(),
            getUserPreferences(),
            getDailyStats(),
            getTodos(),
        ]);

        setTasks((allTasks || []).filter(t => t.date === selectedDate));

        // Filter todos by period and appropriate identifier
        let currentPeriodId = selectedDate;
        if (selectedPeriod === 'weekly') currentPeriodId = getWeekIdentifier(new Date(selectedDate));
        if (selectedPeriod === 'monthly') currentPeriodId = getMonthIdentifier(new Date(selectedDate));

        setTodos((allTodos || []).filter(t => t.period === selectedPeriod && t.date === currentPeriodId));
        setSubjects(allSubjects);
        setPrefs(userPrefs);
        setDailyStats(allStats);

        if (allSubjects.length > 0 && !selectedSubject) {
            setSelectedSubject(allSubjects[0]);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [selectedDate, selectedPeriod])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleAddTask = async () => {
        if (!topic || !selectedSubject) return;

        const newTask: StudyTask = {
            id: Date.now().toString(),
            subjectId: selectedSubject.id,
            topic,
            plannedDuration: parseInt(duration),
            isCompleted: false,
            date: selectedDate,
            priority,
            createdAt: Date.now(),
        };

        await addTask(newTask);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTaskModalVisible(false);
        setTopic('');
        loadData();
    };

    const handleAddTodo = async () => {
        if (!todoText) return;

        let dateId = selectedDate;
        if (selectedPeriod === 'weekly') dateId = getWeekIdentifier(new Date(selectedDate));
        if (selectedPeriod === 'monthly') dateId = getMonthIdentifier(new Date(selectedDate));

        const newTodo: StudyTodo = {
            id: Date.now().toString(),
            text: todoText,
            isCompleted: false,
            date: dateId,
            period: selectedPeriod,
            createdAt: Date.now(),
        };

        await addTodo(newTodo);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTodoModalVisible(false);
        setTodoText('');
        loadData();
    };

    const toggleTask = async (task: StudyTask) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const updated = { ...task, isCompleted: !task.isCompleted };
        await updateTask(updated);
        loadData();
    };

    const toggleTodo = async (todo: StudyTodo) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const updated = { ...todo, isCompleted: !todo.isCompleted };
        await updateTodo(updated);
        loadData();
    };

    const calculateStreak = () => {
        if (dailyStats.length === 0) return 0;
        const sorted = [...dailyStats].sort((a, b) => b.date.localeCompare(a.date));
        let streak = 0;
        for (let i = 0; i < sorted.length; i++) {
            if (sorted[i].totalStudyTime > 0) streak++;
            else break;
        }
        return streak;
    };

    const getCompletionPercentage = () => {
        // If daily: consider both tasks and todos
        // If weekly/monthly: only consider todos (for now)
        if (selectedPeriod === 'daily') {
            const total = tasks.length + todos.length;
            if (total === 0) return 0;
            const completed = (tasks || []).filter(t => t.isCompleted).length + (todos || []).filter(t => t.isCompleted).length;
            return (completed / total) * 100;
        } else {
            const total = todos.length;
            if (total === 0) return 0;
            const completed = (todos || []).filter(t => t.isCompleted).length;
            return (completed / total) * 100;
        }
    };

    const getProgressLabel = () => {
        if (selectedPeriod === 'daily') return 'Daily Done';
        if (selectedPeriod === 'weekly') return 'Weekly Done';
        return 'Monthly Done';
    };

    const renderCalendar = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);

        return (
            <View style={styles.calendarContainer}>
                {(DAYS || []).map((day, index) => {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + index);
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;

                    return (
                        <TouchableOpacity
                            key={day}
                            style={[styles.dayItem, isSelected && styles.dayItemActive]}
                            onPress={() => setSelectedDate(dateStr)}
                        >
                            <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>{day}</Text>
                            <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>{date.getDate()}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={gradients.dark as any} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Focus, {prefs?.academicLevel || 'Pragati'}</Text>
                    <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                </View>
                <TouchableOpacity style={styles.streakBadge} onPress={() => navigation.navigate('Stats')}>
                    <Text style={styles.streakEmoji}>🔥</Text>
                    <Text style={styles.streakText}>{calculateStreak()} Day Streak</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Progress Card */}
                <View style={styles.progressSection}>
                    <CircularProgress percentage={getCompletionPercentage()} size={160} label={getProgressLabel()} />
                    <View style={styles.actionGrid}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => setTaskModalVisible(true)}>
                            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                                <Text style={styles.actionEmoji}>📅</Text>
                            </View>
                            <Text style={styles.actionLabel}>Add Task</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => setTodoModalVisible(true)}>
                            <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
                                <Text style={styles.actionEmoji}>✅</Text>
                            </View>
                            <Text style={styles.actionLabel}>Add Goal</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {renderCalendar()}

                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    {['daily', 'weekly', 'monthly'].map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.periodTab, selectedPeriod === p && styles.periodTabActive]}
                            onPress={() => {
                                setSelectedPeriod(p as any);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                        >
                            <Text style={[styles.periodTabText, selectedPeriod === p && styles.periodTabTextActive]}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* To-dos Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {selectedPeriod === 'daily' ? "Today's Goals" :
                            selectedPeriod === 'weekly' ? "Weekly Goals" : "Monthly Goals"}
                    </Text>
                    <Text style={styles.sectionCount}>{todos.filter(t => t.isCompleted).length}/{todos.length}</Text>
                </View>

                {(todos || []).map(todo => (
                    <Card key={todo.id} style={styles.todoCard}>
                        <TouchableOpacity style={styles.todoContent} onPress={() => toggleTodo(todo)}>
                            <View style={[styles.checkbox, todo.isCompleted && styles.checkboxChecked]}>
                                {todo.isCompleted && <Text style={styles.checkIcon}>✓</Text>}
                            </View>
                            <Text style={[styles.todoText, todo.isCompleted && styles.todoTextCompleted]}>{todo.text}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { deleteTodo(todo.id).then(loadData); }}>
                            <Text style={styles.deleteMini}>✕</Text>
                        </TouchableOpacity>
                    </Card>
                ))}
                {todos.length === 0 && <Text style={styles.emptySmall}>No quick goals set for this day.</Text>}

                {/* Study Tasks Section */}
                <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                    <Text style={styles.sectionTitle}>Study Sessions</Text>
                    <Text style={styles.sectionCount}>{tasks.filter(t => t.isCompleted).length}/{tasks.length}</Text>
                </View>

                {(tasks || []).map(task => {
                    const subject = subjects.find(s => s.id === task.subjectId);
                    return (
                        <Card key={task.id} style={styles.taskCard}>
                            <TouchableOpacity style={styles.taskTouch} onPress={() => toggleTask(task)}>
                                <View style={[styles.subjectIndicator, { backgroundColor: subject?.color || colors.primary }]} />
                                <View style={styles.taskInfo}>
                                    <View style={styles.taskRow}>
                                        <Text style={[styles.taskTopic, task.isCompleted && styles.todoTextCompleted]}>{task.topic}</Text>
                                        <View style={[styles.priorityBadge, { backgroundColor: task.priority === 'high' ? colors.error + '20' : colors.backgroundTertiary }]}>
                                            <Text style={[styles.priorityLabel, { color: task.priority === 'high' ? colors.error : colors.textSecondary }]}>{task.priority.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.taskMeta}>{subject?.icon} {subject?.name} • {task.plannedDuration} min</Text>
                                </View>
                                {task.isCompleted ? (
                                    <View style={styles.taskCompletedIcon}><Text style={{ color: colors.success }}>✓</Text></View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.taskActionBtn}
                                        onPress={() => navigation.navigate('Study', { taskId: task.id, subjectId: task.subjectId })}
                                    >
                                        <Text style={styles.taskActionText}>Focus</Text>
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteAbsolute} onPress={() => { deleteTask(task.id).then(loadData); }}>
                                <Text style={styles.deleteMini}>✕</Text>
                            </TouchableOpacity>
                        </Card>
                    );
                })}
                {tasks.length === 0 && <Text style={styles.emptySmall}>No focus sessions scheduled.</Text>}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Task Modal */}
            <Modal visible={isTaskModalVisible} animationType="slide" transparent onRequestClose={() => setTaskModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <Card style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Schedule Study</Text>
                        <Input label="What are you studying?" placeholder="e.g. Quantum Mechanics" value={topic} onChangeText={setTopic} />
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: spacing.md }}>
                                <Input label="Minutes" keyboardType="numeric" value={duration} onChangeText={setDuration} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Priority</Text>
                                <View style={styles.priorityToggle}>
                                    {['low', 'medium', 'high'].map(p => (
                                        <TouchableOpacity key={p} style={[styles.pChip, priority === p && styles.pChipActive]} onPress={() => setPriority(p as any)}>
                                            <Text style={[styles.pChipText, priority === p && styles.pChipTextActive]}>{p[0].toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                        <Text style={styles.label}>Subject</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
                            {(subjects || []).map(s => (
                                <TouchableOpacity key={s.id} style={[styles.subjectChip, selectedSubject?.id === s.id && { borderColor: s.color, backgroundColor: s.color + '20' }]} onPress={() => setSelectedSubject(s)}>
                                    <Text style={[styles.subjectChipText, selectedSubject?.id === s.id && { color: s.color }]}>{s.icon} {s.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <Button title="Cancel" variant="ghost" onPress={() => setTaskModalVisible(false)} style={{ flex: 1, marginRight: spacing.md }} />
                            <Button title="Plan" onPress={handleAddTask} style={{ flex: 2 }} disabled={!topic || !selectedSubject} />
                        </View>
                    </Card>
                </View>
            </Modal>

            {/* Todo Modal */}
            <Modal visible={isTodoModalVisible} animationType="slide" transparent onRequestClose={() => setTodoModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <Card style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Daily Goal</Text>
                        <Input label="Task name" placeholder="e.g. Buy notebooks" value={todoText} onChangeText={setTodoText} autoFocus />
                        <View style={styles.modalActions}>
                            <Button title="Cancel" variant="ghost" onPress={() => setTodoModalVisible(false)} style={{ flex: 1, marginRight: spacing.md }} />
                            <Button title="Add Goal" onPress={handleAddTodo} style={{ flex: 2 }} disabled={!todoText} />
                        </View>
                    </Card>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: spacing.lg,
    },
    greeting: { ...typography.h2, color: colors.text },
    dateText: { ...typography.caption, color: colors.textSecondary },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    streakEmoji: { fontSize: 18, marginRight: 6 },
    streakText: { ...typography.small, color: colors.primary, fontWeight: '700' as any },
    content: { flex: 1, paddingHorizontal: spacing.lg },
    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
        backgroundColor: colors.backgroundSecondary,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        ...shadows.medium,
    },
    actionGrid: { gap: 12 },
    actionItem: { alignItems: 'center' },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionEmoji: { fontSize: 24 },
    actionLabel: { ...typography.small, color: colors.textSecondary, marginTop: 4 },
    calendarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    dayItem: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        width: (width - spacing.lg * 2) / 7 - 4,
    },
    dayItemActive: { backgroundColor: colors.primary },
    dayName: { ...typography.small, color: colors.textSecondary, marginBottom: 4 },
    dayNameActive: { color: colors.background, fontWeight: '700' as any },
    dayNumber: { ...typography.body, color: colors.text, fontWeight: '600' as any },
    dayNumberActive: { color: colors.background },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundSecondary,
        padding: 4,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    periodTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: borderRadius.md,
    },
    periodTabActive: {
        backgroundColor: colors.backgroundTertiary,
    },
    periodTabText: {
        ...typography.small,
        color: colors.textSecondary,
        fontWeight: '600' as any,
    },
    periodTabTextActive: {
        color: colors.primary,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: { ...typography.h3, color: colors.textSecondary },
    sectionCount: { ...typography.caption, color: colors.primary, fontWeight: '700' as any },
    todoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    todoContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.primary,
        marginRight: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: { backgroundColor: colors.primary },
    checkIcon: { color: colors.background, fontSize: 14, fontWeight: '900' as any },
    todoText: { ...typography.body, color: colors.text },
    todoTextCompleted: { color: colors.textMuted, textDecorationLine: 'line-through' },
    deleteMini: { color: colors.textMuted, fontSize: 16, padding: 4 },
    taskCard: { marginBottom: spacing.md, padding: 0 },
    taskTouch: { padding: spacing.md, flexDirection: 'row', alignItems: 'center' },
    subjectIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: spacing.md },
    taskInfo: { flex: 1 },
    taskRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    taskTopic: { ...typography.body, fontWeight: '700' as any, color: colors.text },
    taskMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    priorityLabel: { fontSize: 10, fontWeight: '800' as any },
    taskActionBtn: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    taskActionText: { ...typography.small, color: colors.primary, fontWeight: '700' as any },
    taskCompletedIcon: { marginRight: 8 },
    deleteAbsolute: { position: 'absolute', top: 12, right: 12 },
    emptySmall: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginVertical: spacing.lg },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: spacing.lg },
    modalContent: { backgroundColor: colors.backgroundSecondary },
    modalTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.xl },
    modalActions: { flexDirection: 'row', marginTop: spacing.xl },
    row: { flexDirection: 'row', marginBottom: spacing.md },
    label: { ...typography.caption, color: colors.textSecondary, marginBottom: 8 },
    priorityToggle: { flexDirection: 'row', gap: 8 },
    pChip: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
    pChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    pChipText: { fontSize: 12, color: colors.textSecondary },
    pChipTextActive: { color: colors.background, fontWeight: '700' as any },
    subjectScroll: { marginVertical: spacing.md },
    subjectChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
    subjectChipText: { ...typography.caption, color: colors.textSecondary },
});
