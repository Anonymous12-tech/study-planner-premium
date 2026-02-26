import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../constants/theme';
import { Card } from '../components/ui/Card';
import {
    getSessions,
    getDailyStats,
    getSubjects,
    getTasks,
    getTodos,
    hasLocalData,
    migrateLocalData,
    getUserPreferences,
    saveUserPreferences
} from '../utils/storage';
import {
    calculateStatistics,
    formatTime,
    filterSessionsByPeriod,
    getAchievements,
    getLast7DaysStats,
    AchievementBadge,
    checkAuraUnlock,
    isWithinPeriod
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

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const MAX_CONTENT_WIDTH = 960;
const width = isWeb ? Math.min(screenWidth, MAX_CONTENT_WIDTH) : screenWidth;

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

    const handleSelectAura = (aura: any, isUnlocked: boolean) => {
        if (!isUnlocked) {
            Alert.alert('Aura Locked', `You need to complete its criteria to unlock ${aura.name}.`);
            return;
        }

        if (aura.isPremium && !isPro) {
            Alert.alert(
                'Pro Feature',
                'This Aura requires a Pro subscription. Since you are testing, you can enable Pro at the bottom of the screen.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Activate Pro (Trial)', onPress: togglePro }
                ]
            );
            return;
        }

        setAura(aura.id);
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
        const periodTasks = tasks.filter(t => isWithinPeriod(t.date, period));
        const periodTodos = todos.filter(t => isWithinPeriod(t.date, period));

        const hasAnyData = periodSessions.length > 0 || periodTasks.length > 0 || periodTodos.length > 0;

        if (!hasAnyData) {
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
            <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
        </View>
    );

    const recapSessions = filterSessionsByPeriod(sessions, period);
    const recapTotalMinutes = recapSessions.reduce((acc, s) => acc + s.duration, 0) / 60;

    const last7Days = getLast7DaysStats(stats.dailyStats || []);
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const lineData = {
        labels: last7Days.map(d => {
            const dt = new Date(d.date + 'T12:00:00');
            return dayLabels[dt.getDay()];
        }),
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
            <View style={[isWeb ? styles.webWrapper : undefined, { flex: 1 }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.primary }]}>Analytics</Text>
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
                        <Card style={styles.summaryCard} variant="neumorphic">
                            <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="time" size={20} color={colors.primary} />
                            </View>
                            <Text style={styles.summaryValue}>{Math.floor(stats.totalStudyTime / 3600)}<Text style={styles.unit}>h</Text></Text>
                            <Text style={styles.summaryLabel}>Total Focused</Text>
                        </Card>
                        <Card style={styles.summaryCard} variant="neumorphic">
                            <View style={[styles.summaryIcon, { backgroundColor: colors.secondary + '15' }]}>
                                <Ionicons name="flash" size={20} color={colors.secondary} />
                            </View>
                            <Text style={styles.summaryValue}>{stats.totalSessions}</Text>
                            <Text style={styles.summaryLabel}>Sessions</Text>
                        </Card>
                        <Card style={styles.summaryCard} variant="neumorphic">
                            <View style={[styles.summaryIcon, { backgroundColor: colors.success + '15' }]}>
                                <Ionicons name="analytics" size={20} color={colors.success} />
                            </View>
                            <Text style={styles.summaryValue}>{Math.floor(stats.averageSessionDuration / 60)}<Text style={styles.unit}>m</Text></Text>
                            <Text style={styles.summaryLabel}>Avg Session</Text>
                        </Card>
                    </View>

                    <View style={isWeb ? styles.gridRow : undefined}>
                        <View style={isWeb ? styles.gridCol : undefined}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Trend</Text>
                                <Text style={styles.sectionSub}>Study activity over 7 days</Text>
                            </View>
                            <Card style={styles.chartCard} variant="neumorphic">
                                <BarChart
                                    data={lineData}
                                    width={isWeb ? (width / 2) - spacing.lg * 3 : width - spacing.lg * 4}
                                    height={220}
                                    chartConfig={chartConfig}
                                    style={styles.chart}
                                    fromZero
                                    withInnerLines={false}
                                    yAxisLabel=""
                                    yAxisSuffix=""
                                />
                            </Card>
                        </View>

                        <View style={isWeb ? styles.gridCol : undefined}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recap</Text>
                                <View style={styles.periodSelector}>
                                    {(['day', 'week', 'month'] as PeriodType[]).map((p) => (
                                        <TouchableOpacity
                                            key={p}
                                            style={[styles.periodButton, period === p && styles.periodButtonActive]}
                                            onPress={() => setPeriod(p)}
                                        >
                                            <Text style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}>
                                                {p.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <Card style={[styles.chartCardPie, { height: 260, justifyContent: 'center' }]} variant="neumorphic">
                                {pieData.length > 0 ? (
                                    <DonutChart
                                        data={pieData}
                                        size={160}
                                        strokeWidth={18}
                                        centerValue={formatTime(recapTotalMinutes * 60)}
                                        centerLabel={period === 'day' ? 'Today' : period === 'week' ? 'Weekly' : 'Monthly'}
                                    />
                                ) : (
                                    <View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
                                        <Ionicons name="stats-chart" size={40} color={colors.textTertiary} />
                                        <Text style={{ ...typography.small, color: colors.textSecondary, marginTop: 10 }}>No data for this period</Text>
                                    </View>
                                )}
                            </Card>
                        </View>
                    </View>

                    <View style={isWeb ? styles.gridRow : undefined}>
                        <View style={isWeb ? { flex: 2 } : undefined}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Momentum</Text>
                                <Text style={styles.sectionSub}>Last 18 weeks</Text>
                            </View>
                            <Card style={{ padding: spacing.lg, marginBottom: spacing.xl }}>
                                <MomentumHeatmap data={stats.dailyStats.map(d => ({ date: d.date, count: d.totalStudyTime }))} />
                            </Card>
                        </View>

                        <View style={isWeb ? { flex: 1.2 } : undefined}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Badges</Text>
                                <TouchableOpacity onPress={() => Alert.alert("Achievements", "Complete goals to unlock badges.")}>
                                    <Text style={styles.sectionSub}>View all →</Text>
                                </TouchableOpacity>
                            </View>
                            <Card style={styles.badgesCard} variant="neumorphic">
                                <View style={styles.badgesGrid}>
                                    {achievements.slice(0, 6).map((badge, idx) => (
                                        <BadgeItem key={idx} badge={badge} />
                                    ))}
                                </View>
                            </Card>
                        </View>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Focus Aura</Text>
                        <Text style={styles.sectionSub}>Unlocked by your progress</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.auraScroll}
                        contentContainerStyle={styles.auraContainer}
                    >
                        {AURAS.map((aura) => {
                            const isUnlocked = aura.isPremium ? isPro : checkAuraUnlock(aura.id, stats);
                            const isActive = activeAura.id === aura.id;

                            return (
                                <TouchableOpacity
                                    key={aura.id}
                                    style={[
                                        styles.auraCard,
                                        isActive && { borderColor: colors.primary, borderWidth: 2 },
                                        !isUnlocked && { opacity: 0.5 }
                                    ]}
                                    onPress={() => handleSelectAura(aura, isUnlocked)}
                                >
                                    <LinearGradient
                                        colors={aura.gradients as any}
                                        style={styles.auraPreview}
                                    >
                                        {isActive && <Ionicons name="checkmark-circle" size={24} color="#FFF" />}
                                        {!isUnlocked && <Ionicons name="lock-closed" size={24} color="#FFF" />}
                                    </LinearGradient>
                                    <View style={styles.auraInfo}>
                                        <Text style={styles.auraName}>{aura.name}</Text>
                                        <Text style={styles.auraCriteria}>
                                            {aura.isPremium ? "Premium Only" :
                                                aura.unlockCriteria.type === 'streak' ? `${aura.unlockCriteria.value} Day Streak` :
                                                    aura.unlockCriteria.type === 'hours' ? `${aura.unlockCriteria.value} Hours` :
                                                        `${aura.unlockCriteria.value} Sessions`}
                                        </Text>
                                    </View>
                                    {aura.isPremium && <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.proToggle, { backgroundColor: isPro ? colors.success + '20' : colors.primary + '20' }]}
                        onPress={togglePro}
                    >
                        <Ionicons name={isPro ? "star" : "star-outline"} size={20} color={isPro ? colors.success : colors.primary} />
                        <Text style={[styles.proToggleText, { color: isPro ? colors.success : colors.primary }]}>
                            {isPro ? "PRO ACCOUNT ACTIVE" : "UPGRADE TO PRO (TEST)"}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    webWrapper: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' as const, flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'web' ? 24 : Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
    title: { ...typography.h1, color: colors.text },
    shareButton: { backgroundColor: colors.primary + '10', paddingHorizontal: 16, paddingVertical: 8, borderRadius: borderRadius.full },
    shareText: { ...typography.caption, color: colors.primary, fontWeight: '700' as any },
    scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
    gridRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xl },
    gridCol: { flex: 1 },
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
    badgesCard: { padding: spacing.lg },
    badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' },
    chartCard: { padding: spacing.md, alignItems: 'center' },
    chart: { marginVertical: 8, borderRadius: 16 },
    chartCardPie: { padding: spacing.xl, alignItems: 'center' },
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
