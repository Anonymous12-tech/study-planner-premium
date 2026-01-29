import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { getSessions, getDailyStats, getSubjects } from '../utils/storage';
import { calculateStatistics, formatTime } from '../utils/calculations';
import { Statistics, Subject } from '../types';

const { width } = Dimensions.get('window');

export const StatsScreen = () => {
    const [stats, setStats] = useState<Statistics | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const loadData = async () => {
        const [sessions, dailyStats, subjectsData] = await Promise.all([
            getSessions(),
            getDailyStats(),
            getSubjects(),
        ]);

        const statistics = calculateStatistics(sessions, dailyStats);
        setStats(statistics);
        setSubjects(subjectsData);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    if (!stats) return null;

    // Prepare chart data
    const dailyStats = stats.dailyStats || [];
    const last7Days = dailyStats.slice(-7);
    const lineData = {
        labels: (last7Days || []).map(d => {
            const parts = (d.date || '').split('-');
            return parts.length > 2 ? parts[2] : '';
        }), // Day numbers
        datasets: [{
            data: (last7Days || []).map(d => Math.floor((d.totalStudyTime || 0) / 60)),
            color: (opacity = 1) => `rgba(34, 211, 238, ${opacity})`, // primary glow
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
                <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>Live Metrics</Text>
                </View>
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

                {/* Weekly Trend Chart */}
                <View style={styles.sectionHeader}>
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
                <View style={styles.sectionHeader}>
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
    headerBadge: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    headerBadgeText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '700' as any,
        letterSpacing: 1,
        textTransform: 'uppercase',
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
    chartCardShadow: {
        padding: 0,
        marginBottom: spacing.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.medium,
    },
    chartCard: {
        marginTop: spacing.md,
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
        marginBottom: spacing.xl,
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
