import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Platform,
    Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { CircularProgress } from '../components/ui/CircularProgress';
import {
    getTasks,
    getUserPreferences,
    getDailyStats,
    getActiveSession,
    updateTask,
} from '../utils/storage';
import { StudyTask, UserPreferences, DailyStats, StudySession } from '../types';
import { getTodayDateString } from '../utils/calculations';
import * as Haptics from 'expo-haptics';

export const HomeScreen = ({ navigation }: any) => {
    const [tasks, setTasks] = useState<StudyTask[]>([]);
    const [prefs, setPrefs] = useState<UserPreferences | null>(null);
    const [stats, setStats] = useState<DailyStats[]>([]);
    const [activeSession, setActiveSession] = useState<StudySession | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [todayMinutes, setTodayMinutes] = useState(0);
    const [chartData, setChartData] = useState<any>(null);

    const loadData = async () => {
        const today = getTodayDateString();
        const [allTasks, userPrefs, allStats, active] = await Promise.all([
            getTasks(),
            getUserPreferences(),
            getDailyStats(),
            getActiveSession(),
        ]);

        setTasks((allTasks || []).filter(t => t.date === today));
        const last7Days = allStats.slice(-7); // Assuming allStats is sorted by date
        const barData = {
            labels: (last7Days || []).map(d => {
                const parts = (d.date || '').split('-');
                return parts.length > 2 ? parts[2] : '';
            }), // Day numbers
            datasets: [{ data: (last7Days || []).map(d => Math.floor((d.totalStudyTime || 0) / 60)) }],
        };
        setChartData(barData);
        setPrefs(userPrefs);
        setStats(allStats);

        const todayStat = (allStats || []).find(s => s.date === today);
        setTodayMinutes(todayStat ? Math.floor(todayStat.totalStudyTime / 60) : 0);
        setActiveSession(active);
    };

    const calculateCurrentStreak = () => {
        if (stats.length === 0) return 0;
        const sorted = [...stats].sort((a, b) => b.date.localeCompare(a.date));
        let streak = 0;
        let checkDate = new Date();

        // If today has study time, or yesterday had study time, we check backwards
        for (let i = 0; i < sorted.length; i++) {
            const statDate = sorted[i].date;
            // Simple check: if there is study time on that date, streak continues
            if (sorted[i].totalStudyTime > 0) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    const streak = calculateCurrentStreak();

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const toggleTask = async (task: StudyTask) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const updated = { ...task, isCompleted: !task.isCompleted };
        await updateTask(updated);
        loadData();
    };

    const completedCount = (tasks || []).filter(t => t.isCompleted).length;
    const completionPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.dark as any}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Focus, {prefs?.username || prefs?.fullName || 'Student'}</Text>
                        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                    </View>
                    <TouchableOpacity style={styles.streakBadge} onPress={() => navigation.navigate('Stats')}>
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <Text style={styles.streakText}>{streak} Day Streak</Text>
                    </TouchableOpacity>
                </View>

                {/* Progress Card */}
                <View style={styles.progressSection}>
                    <CircularProgress percentage={completionPercentage} size={180} />
                </View>

                {/* Study Trend Chart */}
                {chartData && chartData.labels.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Weekly Activity</Text>
                        <Card style={styles.chartCard}>
                            <BarChart
                                data={chartData}
                                width={Dimensions.get('window').width - spacing.lg * 4}
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix="m"
                                chartConfig={{
                                    backgroundGradientFrom: colors.backgroundSecondary,
                                    backgroundGradientTo: colors.backgroundSecondary,
                                    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                                    labelColor: (opacity = 1) => colors.textSecondary,
                                    strokeWidth: 2,
                                    barPercentage: 0.6,
                                    decimalPlaces: 0,
                                }}
                                style={styles.chart}
                                fromZero
                                showValuesOnTopOfBars
                            />
                        </Card>
                    </View>
                )}

                {/* Today's Tasks */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Study Plan</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Planner')}>
                            <Text style={styles.actionText}>Customize</Text>
                        </TouchableOpacity>
                    </View>

                    {(tasks && tasks.length > 0) ? (
                        (tasks || []).map(task => (
                            <TouchableOpacity
                                key={task.id}
                                style={[styles.taskCard, task.isCompleted && styles.taskCardCompleted]}
                                onPress={() => toggleTask(task)}
                            >
                                <View style={styles.taskInfo}>
                                    <View style={[styles.priorityIndicator, { backgroundColor: task.priority === 'high' ? colors.error : colors.primary }]} />
                                    <View>
                                        <Text style={[styles.taskTopic, task.isCompleted && styles.textCompleted]}>{task.topic}</Text>
                                        <Text style={styles.taskMeta}>{task.plannedDuration} min • {task.priority} priority</Text>
                                    </View>
                                </View>
                                <View style={[styles.checkbox, task.isCompleted && styles.checkboxChecked]}>
                                    {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Card style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No tasks for today yet.</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Planner')}>
                                <Text style={styles.emptyAction}>Schedule a task</Text>
                            </TouchableOpacity>
                        </Card>
                    )}
                </View>

                {/* Active Session Snippet */}
                {activeSession && (
                    <TouchableOpacity
                        style={styles.activeSessionBanner}
                        onPress={() => navigation.navigate('Study')}
                    >
                        <LinearGradient
                            colors={gradients.primary as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.activeGradient}
                        >
                            <Text style={styles.activeText}>Active Study Session</Text>
                            <Text style={styles.activeSubtext}>Tap to resume focus</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: spacing.xl,
    },
    greeting: {
        ...typography.h1,
        fontSize: 28,
        color: colors.text,
    },
    date: {
        ...typography.body,
        color: colors.textSecondary,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    streakEmoji: {
        fontSize: 16,
        marginRight: 4,
    },
    streakText: {
        ...typography.caption,
        color: colors.text,
        fontWeight: '600' as any,
    },
    progressSection: {
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    section: {
        marginTop: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text,
    },
    actionText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '600' as any,
    },
    taskCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    taskCardCompleted: {
        opacity: 0.6,
        backgroundColor: colors.backgroundTertiary,
    },
    taskInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityIndicator: {
        width: 4,
        height: 30,
        borderRadius: 2,
        marginRight: spacing.md,
    },
    taskTopic: {
        ...typography.body,
        fontWeight: '600' as any,
        color: colors.text,
    },
    textCompleted: {
        textDecorationLine: 'line-through',
    },
    taskMeta: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
    },
    checkmark: {
        color: colors.background,
        fontSize: 14,
        fontWeight: '900' as any,
    },
    activeSessionBanner: {
        marginTop: spacing.xl,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    activeGradient: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    activeText: {
        ...typography.h3,
        color: colors.background,
    },
    activeSubtext: {
        ...typography.caption,
        color: colors.background,
        opacity: 0.8,
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    emptyAction: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600' as any,
        marginTop: spacing.sm,
    },
    chartCard: {
        marginTop: spacing.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
});
