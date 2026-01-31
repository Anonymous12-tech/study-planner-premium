import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { getSessions, getDailyStats, getSubjects, getTasks, getTodos, hasLocalData, migrateLocalData, getUserPreferences, saveUserPreferences } from '../utils/storage';
import {
    calculateStatistics,
    formatTime,
    filterSessionsByPeriod,
    getAchievements,
    AchievementBadge
} from '../utils/calculations';
import { DonutChart } from '../components/DonutChart';
import { Statistics, Subject, StudySession, StudyTask, StudyTodo } from '../types';
import { BadgeItem } from '../components/BadgeItem';
import { MomentumHeatmap } from '../components/MomentumHeatmap';
import { useTheme } from '../context/ThemeContext';
import { AURAS } from '../constants/theme';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { generateReportHTML } from '../utils/reportGenerator';
import { checkAuraUnlock } from '../utils/calculations';

const { width } = Dimensions.get('window');

type PeriodType = 'day' | 'week' | 'month';

export const StatsScreen = () => {
    const [stats, setStats] = useState<Statistics | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [tasks, setTasks] = useState<StudyTask[]>([]);
    const [todos, setTodos] = useState<StudyTodo[]>([]);
    const [period, setPeriod] = useState<PeriodType>('week');
    const { colors, gradients, activeAura, setAura } = useTheme();
    const [achievements, setAchievements] = useState<AchievementBadge[]>([]);
    const [localDataExists, setLocalDataExists] = useState(false);
    const [migrating, setMigrating] = useState(false);
    const [isPro, setIsPro] = useState(false);

    const loadData = async () => {
        try {
            const [sessionsData, dailyStats, subjectsData, tasksData, todosData, prefs] = await Promise.all([
                getSessions(),
                getDailyStats(),
                getSubjects(),
                getTasks(),
                getTodos(),
                getUserPreferences(),
            ]);

            const statistics = calculateStatistics(sessionsData, dailyStats);
            setStats(statistics);
            setSubjects(subjectsData);
            setSessions(sessionsData);
            setTasks(tasksData);
            setTodos(todosData);
            setAchievements(getAchievements(sessionsData, dailyStats));
            if (prefs) setIsPro(prefs.isPro || false);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const togglePro = async () => {
        const newProValue = !isPro;
        setIsPro(newProValue);

        const prefs = await getUserPreferences();
        if (prefs) {
            await saveUserPreferences({ ...prefs, isPro: newProValue });
            Alert.alert(
                newProValue ? 'Pro Activated' : 'Pro Deactivated',
                newProValue ? 'You now have access to premium Auras!' : 'Premium features locked.'
            );
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
            checkLocal();
        }, [])
    );

    const checkLocal = async () => {
        const exists = await hasLocalData();
        setLocalDataExists(exists);
    };

    const handleMigrate = async () => {
        Alert.alert(
            'Migrate Data',
            'This will upload your old local data to the cloud. New data will not be overwritten.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Migrate Now',
                    onPress: async () => {
                        setMigrating(true);
                        const result = await migrateLocalData();
                        setMigrating(false);
                        if (result.success) {
                            Alert.alert('Success', `Successfully migrated ${result.count} items!`);
                            setLocalDataExists(false);
                            loadData();
                        } else {
                            Alert.alert('Error', result.error || 'Failed to migrate data');
                        }
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        const periodSessions = filterSessionsByPeriod(sessions, period);
        if (periodSessions.length === 0) {
            Alert.alert('No Data', `You haven't completed any goals this ${period} to share!`);
            return;
        }
        if (!stats) return;

        try {
            const html = generateReportHTML(period, stats, subjects, periodSessions, achievements, tasks, todos);
            if (Platform.OS === 'web') {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(html);
                    printWindow.document.close();
                    printWindow.onload = () => printWindow.print();
                } else {
                    await Print.printAsync({ html });
                }
            } else {
                const { uri } = await Print.printToFileAsync({ html, margins: { left: 0, top: 0, right: 0, bottom: 0 } });
                await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
            }
        } catch (error) {
            Alert.alert('Report Failed', 'Could not generate your visual recap.');
        }
    };

    if (!stats) return (
        <View style={styles.container}>
            <LinearGradient colors={gradients.aura as any} style={StyleSheet.absoluteFill} pointerEvents="none" />
            <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
        </View>
    );

    const recapSessions = filterSessionsByPeriod(sessions, period);
    const recapTotalMinutes = recapSessions.reduce((acc, s) => acc + s.duration, 0) / 60;

    const dailyStatsData = stats.dailyStats || [];
    const last7Days = dailyStatsData.slice(-7);
    const lineData = {
        labels: last7Days.map(d => d.date.split('-')[2] || ''),
        datasets: [{
            data: last7Days.map(d => Math.floor(d.totalStudyTime / 60)),
            color: (opacity = 1) => `rgba(34, 211, 238, ${opacity})`,
            strokeWidth: 3
        }],
    };

    const subjectPeriodTotals: Record<string, number> = {};
    recapSessions.forEach(session => {
        subjectPeriodTotals[session.subjectId] = (subjectPeriodTotals[session.subjectId] || 0) + session.duration;
    });

    const pieData = subjects
        .map(s => ({
            name: s.name,
            population: Math.floor((subjectPeriodTotals[s.id] || 0) / 60),
            color: s.color,
            legendFontColor: colors.textSecondary,
            legendFontSize: 12,
        }))
        .filter(data => data.population > 0);

    const chartConfig = {
        backgroundGradientFrom: 'transparent',
        backgroundGradientTo: 'transparent',
        color: (opacity = 1) => `rgba(34, 211, 238, ${opacity})`,
        labelColor: (opacity = 1) => colors.textSecondary,
        strokeWidth: 2,
        barPercentage: 0.7,
        decimalPlaces: 0,
        propsForBackgroundLines: { strokeDasharray: '', stroke: colors.border, strokeWidth: 1, opacity: 0.1 },
        propsForLabels: { fontSize: 10 },
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={gradients.aura as any} style={StyleSheet.absoluteFill} pointerEvents="none" />

            <View style={styles.header}>
                <Text style={styles.title}>Analytics</Text>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Text style={styles.shareText}>📤 Share</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {localDataExists && (
                    <Card style={styles.migrationCard}>
                        <View style={styles.migrationInfo}>
                            <Text style={styles.migrationEmoji}>📦</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.migrationTitle}>Legacy Data Found</Text>
                                <Text style={styles.migrationSubtitle}>Transfer your old local data to the cloud.</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.migrationButton, migrating && { opacity: 0.7 }]}
                            onPress={handleMigrate}
                            disabled={migrating}
                        >
                            {migrating ? <ActivityIndicator size="small" color={colors.background} /> : <Text style={styles.migrationButtonText}>Migrate to Cloud</Text>}
                        </TouchableOpacity>
                    </Card>
                )}

                <View style={styles.summaryGrid}>
                    <Card style={styles.summaryCard} variant="glass">
                        <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="time" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.summaryValue}>{Math.floor(stats.totalStudyTime / 3600)}<Text style={styles.unit}>h</Text></Text>
                        <Text style={styles.summaryLabel}>Total Focused</Text>
                    </Card>
                    <Card style={styles.summaryCard} variant="glass">
                        <View style={[styles.summaryIcon, { backgroundColor: colors.secondary + '15' }]}>
                            <Ionicons name="flash" size={20} color={colors.secondary} />
                        </View>
                        <Text style={styles.summaryValue}>{stats.totalSessions}</Text>
                        <Text style={styles.summaryLabel}>Sessions</Text>
                    </Card>
                    <Card style={styles.summaryCard} variant="glass">
                        <View style={[styles.summaryIcon, { backgroundColor: colors.success + '15' }]}>
                            <Ionicons name="analytics" size={20} color={colors.success} />
                        </View>
                        <Text style={styles.summaryValue}>{Math.floor(stats.averageSessionDuration / 60)}<Text style={styles.unit}>m</Text></Text>
                        <Text style={styles.summaryLabel}>Avg Session</Text>
                    </Card>
                </View>

                <MomentumHeatmap
                    data={stats.dailyStats.map(d => ({ date: d.date, count: d.totalStudyTime }))}
                    color={colors.primary}
                />

                <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                    <Text style={styles.sectionTitle}>Unlockable Auras</Text>
                    <Text style={styles.sectionSub}>CUSTOMIZE YOUR AMBIENCE</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.auraScroll} contentContainerStyle={styles.auraContainer}>
                    {AURAS.map((aura) => {
                        const isUnlocked = checkAuraUnlock(aura.id, stats);
                        const isActive = activeAura.id === aura.id;
                        return (
                            <TouchableOpacity
                                key={aura.id}
                                style={[styles.auraCard, isActive && { borderColor: colors.primary, borderWidth: 2 }]}
                                onPress={() => {
                                    if (!isUnlocked) return;
                                    if (aura.isPremium && !isPro) {
                                        Alert.alert('Premium Aura', `The ${aura.name} is a Pro feature.`, [
                                            { text: 'Not Now' },
                                            { text: 'Upgrade to Pro', onPress: togglePro }
                                        ]);
                                        return;
                                    }
                                    setAura(aura.id);
                                }}
                            >
                                <LinearGradient colors={aura.gradients} style={styles.auraPreview}>
                                    {!isUnlocked && !aura.isPremium && <Ionicons name="lock-closed" size={20} color="#FFF" />}
                                    {aura.isPremium && <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>}
                                </LinearGradient>
                                <View style={styles.auraInfo}>
                                    <Text style={styles.auraName}>{aura.name}</Text>
                                    <Text style={styles.auraCriteria} numberOfLines={1}>{aura.isPremium && !isPro ? 'PRO ACCESS' : (isUnlocked ? 'Unlocked' : aura.description)}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recap</Text>
                    <View style={styles.periodSelector}>
                        {(['day', 'week', 'month'] as PeriodType[]).map((p) => (
                            <TouchableOpacity key={p} style={[styles.periodButton, period === p && styles.periodButtonActive]} onPress={() => setPeriod(p)}>
                                <Text style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}>{p.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Card style={styles.recapCard} variant="glass">
                    <Text style={styles.recapValue}>{Math.floor(recapTotalMinutes)}<Text style={styles.unit}>m</Text></Text>
                    <Text style={styles.recapLabel}>Focus this {period}</Text>
                </Card>

                <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                    <Text style={styles.sectionTitle}>Achievements</Text>
                </View>
                <Card style={styles.badgesCard} variant="glass">
                    <View style={styles.badgesGrid}>
                        {achievements.map(badge => <BadgeItem key={badge.id} badge={badge} />)}
                    </View>
                </Card>

                <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                    <Text style={styles.sectionTitle}>Trend</Text>
                    <Text style={styles.sectionSub}>LAST 7 DAYS (min)</Text>
                </View>
                <Card style={styles.chartCard} variant="glass">
                    <BarChart
                        data={lineData}
                        width={width - spacing.lg * 4}
                        height={200}
                        chartConfig={chartConfig}
                        style={styles.chart}
                        fromZero
                        withInnerLines={false}
                        yAxisLabel=""
                        yAxisSuffix=""
                    />
                </Card>

                <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                    <Text style={styles.sectionTitle}>Focus Allocation</Text>
                </View>
                <Card style={styles.chartCardPie} variant="glass">
                    <DonutChart data={pieData} centerValue={`${Math.floor(recapTotalMinutes / 60)}h`} centerLabel="Focused" size={160} strokeWidth={15} />
                </Card>

                <Card style={styles.streakCard}>
                    <LinearGradient colors={['rgba(34, 211, 238, 0.1)', 'rgba(139, 92, 246, 0.1)'] as any} style={styles.streakGradient}>
                        <View>
                            <Text style={styles.streakTitle}>Academic Streak</Text>
                            <Text style={styles.streakSubtitle}>Keep up the consistency!</Text>
                        </View>
                        <View style={styles.streakCircle}>
                            <Text style={styles.streakValue}>{stats.currentStreak}</Text>
                            <Text style={styles.streakLabel}>DAYS</Text>
                        </View>
                    </LinearGradient>
                </Card>

                <TouchableOpacity style={[styles.proToggle, { backgroundColor: isPro ? colors.success + '20' : colors.primary + '20' }]} onPress={togglePro}>
                    <Ionicons name={isPro ? "star" : "star-outline"} size={20} color={isPro ? colors.success : colors.primary} />
                    <Text style={[styles.proToggleText, { color: isPro ? colors.success : colors.primary }]}>
                        {isPro ? "PRO ACCOUNT ACTIVE" : "UPGRADE TO PRO (TEST)"}
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
    title: { ...typography.h1, color: colors.text },
    shareButton: { backgroundColor: colors.primary + '10', paddingHorizontal: 16, paddingVertical: 8, borderRadius: borderRadius.full },
    shareText: { ...typography.caption, color: colors.primary, fontWeight: '700' as any },
    scrollContent: { paddingHorizontal: spacing.lg },
    summaryGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
    summaryCard: { flex: 1, padding: spacing.md, alignItems: 'center' },
    summaryIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    summaryValue: { ...typography.h2, color: colors.text },
    summaryLabel: { ...typography.tiny, color: colors.textSecondary },
    unit: { fontSize: 14, color: colors.primary },
    sectionHeader: { marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { ...typography.h3, color: colors.text },
    sectionSub: { ...typography.tiny, color: colors.textSecondary },
    auraScroll: { marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
    auraContainer: { gap: spacing.md, flexDirection: 'row', paddingRight: spacing.xl },
    auraCard: { width: 140, borderRadius: borderRadius.lg, backgroundColor: colors.backgroundSecondary, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
    auraPreview: { height: 80, justifyContent: 'center', alignItems: 'center' },
    auraInfo: { padding: spacing.sm },
    auraName: { ...typography.body, fontWeight: '700' as any, color: colors.text },
    auraCriteria: { fontSize: 10, color: colors.textSecondary },
    periodSelector: { flexDirection: 'row', backgroundColor: colors.backgroundTertiary, borderRadius: borderRadius.md, padding: 2 },
    periodButton: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    periodButtonActive: { backgroundColor: colors.backgroundSecondary },
    periodButtonText: { fontSize: 10, color: colors.textSecondary },
    periodButtonTextActive: { color: colors.primary, fontWeight: '700' as any },
    recapCard: { padding: spacing.lg, alignItems: 'center' },
    recapValue: { ...typography.h1, color: colors.text },
    recapLabel: { ...typography.caption, color: colors.textSecondary },
    badgesCard: { padding: spacing.lg },
    badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' },
    chartCard: { padding: spacing.md, alignItems: 'center' },
    chart: { marginVertical: 8, borderRadius: 16 },
    chartCardPie: { padding: spacing.xl, alignItems: 'center' },
    streakCard: { marginTop: spacing.xl, borderRadius: borderRadius.xl, overflow: 'hidden' },
    streakGradient: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl },
    streakTitle: { ...typography.h2, color: colors.primary },
    streakSubtitle: { ...typography.tiny, color: colors.textSecondary },
    streakCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primary + '10', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.primary + '30' },
    streakValue: { fontSize: 28, fontWeight: '900' as any, color: colors.primary },
    streakLabel: { fontSize: 9, fontWeight: '700' as any, color: colors.primary },
    proBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: colors.primary, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
    proBadgeText: { color: '#000', fontSize: 8, fontWeight: '900' as any },
    proToggle: { marginTop: spacing.xl, padding: 16, borderRadius: borderRadius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary + '30' },
    proToggleText: { fontSize: 12, fontWeight: '700' as any, letterSpacing: 1 },
    migrationCard: { marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.primary + '05' },
    migrationInfo: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
    migrationEmoji: { fontSize: 24 },
    migrationTitle: { ...typography.body, fontWeight: '700' as any, color: colors.primary },
    migrationSubtitle: { ...typography.tiny, color: colors.textSecondary },
    migrationButton: { backgroundColor: colors.primary, padding: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' },
    migrationButtonText: { color: colors.background, fontWeight: '700' as any },
});
