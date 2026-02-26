import { StudySession, DailyStats, Statistics } from '../types';

export const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
};

export const formatTimeDetailed = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getWeekDateStrings = (): string[] => {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
    }

    return dates;
};

export const calculateStreak = (dailyStats: DailyStats[]): { current: number; longest: number } => {
    if (!dailyStats || dailyStats.length === 0) {
        return { current: 0, longest: 0 };
    }

    // Build a Set of dates that have study activity for O(1) lookup
    const activeDatesSet = new Set<string>();
    for (const stat of dailyStats) {
        if (stat.totalStudyTime > 0) {
            activeDatesSet.add(stat.date);
        }
    }

    const today = getTodayDateString();
    let currentStreak = 0;

    // Current streak: start from today. If today has no entry, try yesterday.
    // If yesterday also has no entry, streak is 0.
    let checkDate = new Date(today + 'T12:00:00'); // noon to avoid timezone issues

    if (activeDatesSet.has(today)) {
        // Today counts
        currentStreak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
    } else {
        // Today has no study — check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        const year = checkDate.getFullYear();
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const yesterdayStr = `${year}-${month}-${day}`;
        if (!activeDatesSet.has(yesterdayStr)) {
            // No yesterday either — streak is broken
            currentStreak = 0;
        } else {
            currentStreak = 1;
            checkDate.setDate(checkDate.getDate() - 1);
        }
    }

    // Continue counting backwards
    if (currentStreak > 0) {
        while (true) {
            const y = checkDate.getFullYear();
            const m = String(checkDate.getMonth() + 1).padStart(2, '0');
            const d = String(checkDate.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            if (activeDatesSet.has(dateStr)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
    }

    // Calculate longest streak from all data
    const sortedDates = Array.from(activeDatesSet).sort();
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
            tempStreak = 1;
        } else {
            const prevDate = new Date(sortedDates[i - 1] + 'T12:00:00');
            prevDate.setDate(prevDate.getDate() + 1);
            const y = prevDate.getFullYear();
            const m = String(prevDate.getMonth() + 1).padStart(2, '0');
            const d = String(prevDate.getDate()).padStart(2, '0');
            const expectedStr = `${y}-${m}-${d}`;

            if (sortedDates[i] === expectedStr) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
    }

    return { current: currentStreak, longest: longestStreak };
};

/**
 * Returns stats for the last 7 calendar days, filling in zeros for missing days.
 * This ensures the Trend chart always shows the actual recent 7 days.
 */
export const getLast7DaysStats = (dailyStats: DailyStats[]): DailyStats[] => {
    const dataMap = new Map<string, DailyStats>();
    for (const stat of dailyStats) {
        dataMap.set(stat.date, stat);
    }

    const result: DailyStats[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;

        if (dataMap.has(dateStr)) {
            result.push(dataMap.get(dateStr)!);
        } else {
            result.push({
                date: dateStr,
                totalStudyTime: 0,
                sessionsCount: 0,
                subjectsStudied: [],
            });
        }
    }

    return result;
};

export const calculateStatistics = (
    sessions: StudySession[],
    dailyStats: DailyStats[]
): Statistics => {
    const completedSessions = (sessions || []).filter(s => s.endTime);
    const totalStudyTime = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSessionDuration = completedSessions.length > 0
        ? totalStudyTime / completedSessions.length
        : 0;

    const { current, longest } = calculateStreak(dailyStats);

    return {
        totalStudyTime,
        currentStreak: current,
        longestStreak: longest,
        totalSessions: completedSessions.length,
        averageSessionDuration,
        dailyStats,
    };
};

export const getTodayStudyTime = (dailyStats: DailyStats[]): number => {
    const today = getTodayDateString();
    const todayStats = (dailyStats || []).find(s => s.date === today);
    return todayStats ? todayStats.totalStudyTime : 0;
};

export const getWeekStudyTime = (dailyStats: DailyStats[]): number => {
    const weekDates = getWeekDateStrings();
    return (dailyStats || [])
        .filter(s => weekDates.includes(s.date))
        .reduce((sum, s) => sum + s.totalStudyTime, 0);
};

export const getWeekIdentifier = (date: Date = new Date()): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

export const getMonthIdentifier = (date: Date = new Date()): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const isWithinPeriod = (dateStr: string, period: string): boolean => {
    // Parse YYYY-MM-DD manually to create local date at 00:00:00
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'day') {
        return date.getTime() === today.getTime();
    }

    if (period === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        // Include future dates if they exist (e.g. planner items)
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return date >= weekAgo && date <= nextWeek;
    }

    if (period === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return date >= monthStart && date <= monthEnd;
    }

    return false;
};

export const filterSessionsByPeriod = (
    sessions: StudySession[],
    period: 'day' | 'week' | 'month'
): StudySession[] => {
    return (sessions || []).filter(s => {
        if (!s.endTime) return false;
        const sessionDate = new Date(s.startTime);
        const dateStr = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}-${String(sessionDate.getDate()).padStart(2, '0')}`;
        return isWithinPeriod(dateStr, period);
    });
};

export interface AchievementBadge {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
}

export const getAchievements = (
    sessions: StudySession[],
    dailyStats: DailyStats[]
): AchievementBadge[] => {
    const completedSessions = (sessions || []).filter(s => s.endTime);
    const { longest: longestStreak } = calculateStreak(dailyStats);

    const badges: AchievementBadge[] = [
        {
            id: 'early_bird',
            title: 'Early Bird',
            description: 'Study before 8:00 AM',
            icon: '🌅',
            unlocked: completedSessions.some(s => new Date(s.startTime).getHours() < 8),
        },
        {
            id: 'night_owl',
            title: 'Night Owl',
            description: 'Study after 10:00 PM',
            icon: '🦉',
            unlocked: completedSessions.some(s => new Date(s.startTime).getHours() >= 22),
        },
        {
            id: 'marathon',
            title: 'Focus Marathon',
            description: 'Study for more than 2 hours in one session',
            icon: '🏃',
            unlocked: completedSessions.some(s => s.duration > 7200),
        },
        {
            id: 'streak_3',
            title: 'Consistency King',
            description: 'Hold a 3-day study streak',
            icon: '👑',
            unlocked: longestStreak >= 3,
        },
        {
            id: 'subject_master',
            title: 'Deep Diver',
            description: 'Spend 5+ hours on a single subject',
            icon: '🤿',
            unlocked: false, // Will calculate based on subject sums if needed
        }
    ];

    return badges;
};

export const checkAuraUnlock = (auraId: string, stats: Statistics): boolean => {
    switch (auraId) {
        case 'default':
            return true;
        case 'golden':
            return stats.currentStreak >= 7 || stats.longestStreak >= 7;
        case 'emerald':
            return (stats.totalStudyTime / 3600) >= 50;
        case 'ruby':
            return stats.totalSessions >= 100;
        case 'midnight':
            return stats.currentStreak >= 14 || stats.longestStreak >= 14;
        case 'cyberpunk':
        case 'sakura':
        case 'oceanic':
            return true; // Unlocked by default (Pro status handled in UI)
        default:
            return false;
    }
};
