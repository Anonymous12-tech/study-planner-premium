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
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as baseColors, spacing, typography, borderRadius, gradients as baseGradients, shadows } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useFocus } from '../context/FocusContext';
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
    const { colors, gradients } = useTheme();
    const { activeStudentsCount } = useFocus();
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
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
            // Ignore haptics
        }

        const updated = { ...task, isCompleted: !task.isCompleted };

        // Optimistic UI update
        setTasks(prev => prev.map(t => t.id === task.id ? updated : t));

        try {
            await updateTask(updated);
            loadData();
        } catch (error) {
            console.error('Failed to update task:', error);
            // Revert
            setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        }
    };

    const toggleTodo = async (todo: StudyTodo) => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
            // Ignore haptics on web
        }

        const updated = { ...todo, isCompleted: !todo.isCompleted };

        // Optimistic UI update
        setTodos(prev => prev.map(t => t.id === todo.id ? updated : t));

        try {
            await updateTodo(updated);
            loadData();
        } catch (error) {
            console.error('Failed to update todo:', error);
            // Revert on error
            setTodos(prev => prev.map(t => t.id === todo.id ? todo : t));
        }
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
                            style={[
                                styles.dayItem,
                                isSelected && { backgroundColor: colors.primary }
                            ]}
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
            <LinearGradient
                colors={gradients.aura as any}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Focus, {prefs?.username || prefs?.fullName || 'Pragati'}</Text>
                    <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                    <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 100,
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.1)'
                        }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 }} />
                            <Text style={{ ...typography.caption, color: '#fff', fontWeight: '700' as any }}>
                                {activeStudentsCount > 0 ? `${activeStudentsCount} Students Focusing` : 'Focus Room: Live'}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.streakBadge} onPress={() => navigation.navigate('Stats')}>
                    <Ionicons name="flame" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.streakText}>{calculateStreak()} Day Streak</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Progress Card */}
                <Card style={styles.progressSection} variant="glass" padding="none">
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, width: '100%' }}>
                        <CircularProgress percentage={getCompletionPercentage()} size={160} label={getProgressLabel()} />
                        <View style={styles.actionGrid}>
                            <TouchableOpacity style={styles.actionItem} onPress={() => setTaskModalVisible(true)}>
                                <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons name="add-circle" size={28} color={colors.primary} />
                                </View>
                                <Text style={styles.actionLabel}>Add Task</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionItem} onPress={() => setTodoModalVisible(true)}>
                                <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '15' }]}>
                                    <Ionicons name="checkmark-done-circle" size={28} color={colors.secondary} />
                                </View>
                                <Text style={styles.actionLabel}>Add Goal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Card>

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
                            <Text style={[
                                styles.periodTabText,
                                selectedPeriod === p && { color: colors.primary }
                            ]}>
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
                    <Text style={[styles.sectionCount, { color: colors.primary }]}>{todos.filter(t => t.isCompleted).length}/{todos.length}</Text>
                </View>

                {(todos || []).map(todo => (
                    <Card key={todo.id} style={styles.todoCard} variant="glass" padding="none">
                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, flex: 1 }}>
                            <TouchableOpacity style={styles.todoContent} onPress={() => toggleTodo(todo)}>
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: colors.primary },
                                    todo.isCompleted && { backgroundColor: colors.primary }
                                ]}>
                                    {todo.isCompleted && <Text style={styles.checkIcon}>✓</Text>}
                                </View>
                                <Text style={[styles.todoText, todo.isCompleted && styles.todoTextCompleted]}>{todo.text}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { deleteTodo(todo.id).then(loadData); }}>
                                <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </Card>
                ))}
                {todos.length === 0 && <Text style={styles.emptySmall}>No quick goals set for this day.</Text>}

                {/* Study Tasks Section */}
                <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                    <Text style={styles.sectionTitle}>Study Sessions</Text>
                    <Text style={[styles.sectionCount, { color: colors.primary }]}>{tasks.filter(t => t.isCompleted).length}/{tasks.length}</Text>
                </View>

                {(tasks || []).map(task => {
                    const subject = subjects.find(s => s.id === task.subjectId);
                    return (
                        <Card key={task.id} style={styles.taskCard} variant="glass" padding="none">
                            <TouchableOpacity
                                style={styles.taskTouch}
                                activeOpacity={0.7}
                                onPress={() => toggleTask(task)}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        { borderColor: colors.primary, marginRight: spacing.md },
                                        task.isCompleted && { backgroundColor: colors.primary }
                                    ]}
                                >
                                    {task.isCompleted && <Ionicons name="checkmark" size={14} color={colors.background} />}
                                </View>
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
                                {!task.isCompleted && (
                                    <TouchableOpacity
                                        style={[styles.taskActionBtn, { backgroundColor: colors.primary + '15' }]}
                                        onPress={() => navigation.navigate('Study', { taskId: task.id, subjectId: task.subjectId })}
                                    >
                                        <Text style={[styles.taskActionText, { color: colors.primary }]}>Focus</Text>
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteAbsolute} onPress={() => { deleteTask(task.id).then(loadData); }}>
                                <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
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
                                        <TouchableOpacity
                                            key={p}
                                            style={[
                                                styles.pChip,
                                                priority === p && { backgroundColor: colors.primary, borderColor: colors.primary }
                                            ]}
                                            onPress={() => setPriority(p as any)}
                                        >
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
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseColors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: spacing.lg,
    },
    greeting: { ...typography.h2, color: baseColors.text },
    dateText: { ...typography.caption, color: baseColors.textSecondary },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: baseColors.backgroundSecondary,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: baseColors.border,
    },
    streakEmoji: { fontSize: 18, marginRight: 6 },
    streakText: { ...typography.small, fontWeight: '700' as any, color: baseColors.text },
    content: { flex: 1, paddingHorizontal: spacing.lg },
    progressSection: {
        marginBottom: spacing.xl,
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
    actionLabel: { ...typography.small, color: baseColors.textSecondary, marginTop: 4 },
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
    dayItemActive: { /* Dynamic */ },
    dayName: { ...typography.small, color: baseColors.textSecondary, marginBottom: 4 },
    dayNameActive: { color: baseColors.background, fontWeight: '700' as any },
    dayNumber: { ...typography.body, color: baseColors.text, fontWeight: '600' as any },
    dayNumberActive: { color: baseColors.background },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: baseColors.backgroundSecondary,
        padding: 4,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: baseColors.border,
    },
    periodTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: borderRadius.md,
    },
    periodTabActive: {
        backgroundColor: baseColors.backgroundTertiary,
    },
    periodTabText: {
        ...typography.small,
        color: baseColors.textSecondary,
        fontWeight: '600' as any,
    },
    periodTabTextActive: {
        /* Dynamic */
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: { ...typography.h3, color: baseColors.textSecondary },
    sectionCount: { ...typography.caption, fontWeight: '700' as any },
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
        marginRight: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: { /* Dynamic */ },
    checkIcon: { color: baseColors.background, fontSize: 14, fontWeight: '900' as any },
    todoText: { ...typography.body, color: baseColors.text },
    todoTextCompleted: { color: baseColors.textMuted, textDecorationLine: 'line-through' },
    deleteMini: { color: baseColors.textMuted, fontSize: 16, padding: 4 },
    taskCard: { marginBottom: spacing.md, padding: 0 },
    taskTouch: { padding: spacing.md, flexDirection: 'row', alignItems: 'center' },
    subjectIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: spacing.md },
    taskInfo: { flex: 1 },
    taskRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    taskTopic: { ...typography.body, fontWeight: '700' as any, color: baseColors.text },
    taskMeta: { ...typography.caption, color: baseColors.textSecondary, marginTop: 2 },
    priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    priorityLabel: { fontSize: 10, fontWeight: '800' as any },
    taskActionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    taskActionText: { ...typography.small, fontWeight: '700' as any },
    taskCompletedIcon: { marginRight: 8 },
    deleteAbsolute: { position: 'absolute', top: 12, right: 12 },
    emptySmall: { ...typography.caption, color: baseColors.textMuted, textAlign: 'center', marginVertical: spacing.lg },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: spacing.lg },
    modalContent: { backgroundColor: baseColors.backgroundSecondary },
    modalTitle: { ...typography.h2, color: baseColors.text, marginBottom: spacing.xl },
    modalActions: { flexDirection: 'row', marginTop: spacing.xl },
    row: { flexDirection: 'row', marginBottom: spacing.md },
    label: { ...typography.caption, color: baseColors.textSecondary, marginBottom: 8 },
    priorityToggle: { flexDirection: 'row', gap: 8 },
    pChip: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: baseColors.border, justifyContent: 'center', alignItems: 'center' },
    pChipActive: { /* Dynamic */ },
    pChipText: { fontSize: 12, color: baseColors.textSecondary },
    pChipTextActive: { color: baseColors.background, fontWeight: '700' as any },
    subjectScroll: { marginVertical: spacing.md },
    subjectChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, borderColor: baseColors.border, marginRight: spacing.sm },
    subjectChipText: { ...typography.caption, color: baseColors.textSecondary },
});
