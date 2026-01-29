import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform, TouchableOpacity, Share, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { getSessions, getDailyStats, getSubjects } from '../utils/storage';
import {
    calculateStatistics,
    formatTime,
    filterSessionsByPeriod,
    getAchievements,
    AchievementBadge
} from '../utils/calculations';
import { Statistics, Subject, StudySession } from '../types';
import { BadgeItem } from '../components/BadgeItem';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

type PeriodType = 'day' | 'week' | 'month';

export const StatsScreen = () => {
    const [stats, setStats] = useState<Statistics | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [period, setPeriod] = useState<PeriodType>('week');
    const [achievements, setAchievements] = useState<AchievementBadge[]>([]);

    const loadData = async () => {
        const [sessionsData, dailyStats, subjectsData] = await Promise.all([
            getSessions(),
            getDailyStats(),
            getSubjects(),
        ]);

        const statistics = calculateStatistics(sessionsData, dailyStats);
        setStats(statistics);
        setSubjects(subjectsData);
        setSessions(sessionsData);
        setAchievements(getAchievements(sessionsData, dailyStats));
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleShare = async () => {
        const periodText = period === 'day' ? 'Today' : period === 'week' ? 'this Week' : 'this Month';
        const periodSessions = filterSessionsByPeriod(sessions, period);
        const totalMinutes = periodSessions.reduce((acc, s) => acc + s.duration, 0) / 60;

        const message = `🚀 Study Recap: I spent ${Math.floor(totalMinutes)} minutes focusing ${periodText}! \n\nCheck out my progress on StudyPlanner. #DeepFocus #StudyMotivation`;

        try {
            const result = await Share.share({
                message,
                title: 'My Study Recap',
            });
        } catch (error: any) {
            Alert.alert('Sharing Failed', error.message);
        }
    };

    if (!stats) return null;

    // Filter sessions for recap
    const recapSessions = filterSessionsByPeriod(sessions, period);
    const recapTotalMinutes = recapSessions.reduce((acc, s) => acc + s.duration, 0) / 60;

    // Prepare chart data
    const dailyStatsData = stats.dailyStats || [];
    const last7Days = dailyStatsData.slice(-7);
    const lineData = {
        labels: (last7Days || []).map(d => {
            const parts = (d.date || '').split('-');
            return parts.length > 2 ? parts[2] : '';
        }),
        datasets: [{
            data: (last7Days || []).map(d => Math.floor((d.totalStudyTime || 0) / 60)),
            color: (opacity = 1) => `rgba(34, 211, 238, ${opacity})`,
            strokeWidth: 3
        }],
    };

    const pieData = (subjects || [])
        .filter(s => s && s.totalStudyTime > 0)
        .map(s => ({
            name: s.name,
            population: Math.floor(s.totalStudyTime / 60),
            color: s.color,
            legendFontColor: colors.textSecondary,
            legendFontSize: 12,
        }));

    const chartConfig = {
        backgroundGradientFrom: colors.backgroundSecondary,
        backgroundGradientTo: colors.backgroundSecondary,
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        labelColor: (opacity = 1) => colors.textSecondary,
        strokeWidth: 2,
        barPercentage: 0.6,
        decimalPlaces: 0,
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: colors.border,
            strokeWidth: 1,
        },
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={gradients.dark as any} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <Text style={styles.title}>Analytics</Text>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Text style={styles.shareText}>📤 Share</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Stats Summary Grid */}
                <View style={styles.summaryGrid}>
                    <Card style={styles.summaryCard}>
                        <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={styles.summaryEmoji}>🕒</Text>
                        </View>
                        <Text style={styles.summaryValue}>{Math.floor(stats.totalStudyTime / 3600)}<Text style={styles.unit}>h</Text></Text>
                        <Text style={styles.summaryLabel}>Total Focused</Text>
                    </Card>
                    <Card style={styles.summaryCard}>
                        <View style={[styles.summaryIcon, { backgroundColor: colors.secondary + '20' }]}>
                            <Text style={styles.summaryEmoji}>🎯</Text>
                        </View>
                        <Text style={styles.summaryValue}>{stats.totalSessions}</Text>
                        <Text style={styles.summaryLabel}>Sessions</Text>
                    </Card>
                    <Card style={styles.summaryCard}>
                        <View style={[styles.summaryIcon, { backgroundColor: colors.success + '20' }]}>
                            <Text style={styles.summaryEmoji}>⚡</Text>
                        </View>
                        <Text style={styles.summaryValue}>{Math.floor(stats.averageSessionDuration / 60)}<Text style={styles.unit}>m</Text></Text>
                        <Text style={styles.summaryLabel}>Avg Session</Text>
                    </Card>
                </View>

                {/* Recap Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Momentum Recap</Text>
                    <View style={styles.periodSelector}>
                        {(['day', 'week', 'month'] as PeriodType[]).map((p) => (
                            <TouchableOpacity
                                key={p}
                                style={[styles.periodButton, period === p && styles.periodButtonActive]}
                                onPress={() => setPeriod(p)}
                            >
                                <Text style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}>
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Card style={styles.recapCard}>
                    <View style={styles.recapHeader}>
                        <View>
                            <Text style={styles.recapValue}>{Math.floor(recapTotalMinutes)}<Text style={styles.unit}>m</Text></Text>
                            <Text style={styles.recapLabel}>Focus Duration</Text>
                        </View>
                        <View style={styles.recapBadge}>
                            <Text style={styles.recapBadgeText}>{recapSessions.length} Goals</Text>
                        </View>
                    </View>

                    <View style={styles.completedList}>
                        {recapSessions.length > 0 ? (
                            recapSessions.slice(-3).map((s, idx) => {
                                const subject = subjects.find(sub => sub.id === s.subjectId);
                                return (
                                    <View key={s.id || idx} style={styles.completedItem}>
                                        <Text style={styles.completedIcon}>{subject?.icon || '📚'}</Text>
                                        <View style={styles.completedInfo}>
                                            <Text style={styles.completedText}>{subject?.name || 'Session'}</Text>
                                            <Text style={styles.completedTime}>{formatTime(s.duration)} focused</Text>
                                        </View>
                                        <Text style={styles.completedCheck}>✅</Text>
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={styles.emptyRecap}>No goals completed in this {period}.</Text>
                        )}
                    </View>
                </Card>

                {/* Badges Section */}
                <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                    <Text style={styles.sectionTitle}>Achievements</Text>
                </View>
                <Card style={styles.badgesCard}>
                    <View style={styles.badgesGrid}>
                        {achievements.map(badge => (
                            <BadgeItem key={badge.id} badge={badge} />
                        ))}
                    </View>
                </Card>

                {/* Weekly Trend Chart */}
                <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                    <Text style={styles.sectionTitle}>Performance Trend</Text>
                    <Text style={styles.sectionSub}>Last 7 Days (min)</Text>
                </View>
                {(lineData.labels.length > 0 && lineData.datasets[0].data.length > 0) ? (
                    <Card style={styles.chartCard}>
                        <BarChart
                            data={lineData}
                            width={Dimensions.get('window').width - spacing.lg * 4}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix="m"
                            chartConfig={{
                                backgroundGradientFrom: colors.backgroundSecondary,
                                backgroundGradientTo: colors.backgroundSecondary,
                                color: (opacity = 1) => `rgba(34, 211, 238, ${opacity})`,
                                labelColor: (opacity = 1) => colors.textSecondary,
                                strokeWidth: 2,
                                barPercentage: 0.6,
                                decimalPlaces: 0,
                                propsForBackgroundLines: {
                                    strokeDasharray: '',
                                    stroke: colors.border,
                                    strokeWidth: 1,
                                },
                            }}
                            style={styles.chart}
                            fromZero
                            showValuesOnTopOfBars
                        />
                    </Card>
                ) : (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No study data for the last 7 days.</Text>
                    </Card>
                )}

                {/* Subject Distribution */}
                <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                    <Text style={styles.sectionTitle}>Focus Allocation</Text>
                </View>
                <Card style={styles.chartCardPie}>
                    {pieData.length > 0 ? (
                        <PieChart
                            data={pieData}
                            width={width - spacing.lg * 2}
                            height={200}
                            chartConfig={chartConfig}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"0"}
                            center={[width / 4, 0]}
                            absolute
                        />
                    ) : (
                        <Text style={styles.emptyChart}>Start studying to see distribution.</Text>
                    )}
                </Card>

                {/* Streak Banner */}
                <Card style={styles.streakCard}>
                    <LinearGradient
                        colors={['rgba(34, 211, 238, 0.1)', 'rgba(139, 92, 246, 0.1)'] as any}
                        style={styles.streakGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.streakInfo}>
                            <Text style={styles.streakTitle}>Academic Streak</Text>
                            <Text style={styles.streakSubtitle}>Keep up the consistency!</Text>
                        </View>
                        <View style={styles.streakCircle}>
                            <Text style={styles.streakValue}>{stats.currentStreak}</Text>
                            <Text style={styles.streakLabel}>DAYS</Text>
                        </View>
                    </LinearGradient>
                </Card>

                <View style={{ height: 120 }} />
            </ScrollView>
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
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h1,
        color: colors.text,
    },
    shareButton: {
        backgroundColor: colors.primary + '20',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    shareText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '700' as any,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    summaryCard: {
        flex: 1,
        padding: spacing.md,
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
    },
    summaryIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryEmoji: {
        fontSize: 18,
    },
    summaryValue: {
        ...typography.h2,
        color: colors.text,
        marginBottom: 2,
    },
    summaryLabel: {
        ...typography.tiny,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    unit: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600' as any,
    },
    sectionHeader: {
        marginBottom: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text,
        letterSpacing: 0.5,
    },
    sectionSub: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundTertiary,
        borderRadius: borderRadius.lg,
        padding: 2,
    },
    periodButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: borderRadius.md,
    },
    periodButtonActive: {
        backgroundColor: colors.backgroundSecondary,
    },
    periodButtonText: {
        ...typography.tiny,
        color: colors.textSecondary,
    },
    periodButtonTextActive: {
        color: colors.primary,
        fontWeight: '700' as any,
    },
    recapCard: {
        backgroundColor: colors.backgroundSecondary,
        padding: spacing.lg,
    },
    recapHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: spacing.md,
    },
    recapValue: {
        ...typography.h1,
        color: colors.text,
        lineHeight: 32,
    },
    recapLabel: {
        ...typography.tiny,
        color: colors.textSecondary,
        marginTop: 2,
    },
    recapBadge: {
        backgroundColor: colors.success + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
    },
    recapBadgeText: {
        ...typography.tiny,
        color: colors.success,
        fontWeight: '700' as any,
    },
    completedList: {
        gap: spacing.md,
    },
    completedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    completedIcon: {
        fontSize: 24,
    },
    completedInfo: {
        flex: 1,
    },
    completedText: {
        ...typography.body,
        fontWeight: '600' as any,
        color: colors.text,
    },
    completedTime: {
        ...typography.tiny,
        color: colors.textSecondary,
    },
    completedCheck: {
        fontSize: 16,
    },
    emptyRecap: {
        ...typography.body,
        color: colors.textMuted,
        textAlign: 'center',
        paddingVertical: spacing.md,
    },
    badgesCard: {
        backgroundColor: colors.backgroundSecondary,
        padding: spacing.lg,
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    chartCard: {
        marginTop: spacing.sm,
        padding: spacing.md,
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    chartCardPie: {
        marginBottom: spacing.sm,
        padding: 0,
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
    },
    emptyChart: {
        ...typography.body,
        color: colors.textMuted,
        paddingVertical: 60,
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        ...typography.body,
        color: colors.textMuted,
    },
    streakCard: {
        padding: 0,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.primary + '20',
        marginBottom: spacing.xl,
    },
    streakGradient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.xl,
    },
    streakInfo: {
        flex: 1,
    },
    streakTitle: {
        ...typography.h2,
        color: colors.primary,
    },
    streakSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 4,
    },
    streakCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary + '10',
        borderWidth: 2,
        borderColor: colors.primary + '30',
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.glow,
    },
    streakValue: {
        fontSize: 32,
        fontWeight: '900' as any,
        color: colors.primary,
        lineHeight: 36,
    },
    streakLabel: {
        fontSize: 10,
        fontWeight: '800' as any,
        color: colors.primary,
        opacity: 0.8,
    },
});
