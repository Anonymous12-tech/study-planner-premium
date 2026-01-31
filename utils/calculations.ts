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
    return today.toISOString().split('T')[0];
};

export const getWeekDateStrings = (): string[] => {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
};

export const calculateStreak = (dailyStats: DailyStats[]): { current: number; longest: number } => {
    if (!dailyStats || dailyStats.length === 0) {
        return { current: 0, longest: 0 };
    }

    // Sort by date descending
    const sorted = [...dailyStats].sort((a, b) => b.date.localeCompare(a.date));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = getTodayDateString();
    let expectedDate = new Date(today);

    // Calculate current streak
    for (const stat of sorted) {
        const statDate = stat.date;
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (statDate === expectedDateStr && stat.totalStudyTime > 0) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
            break;
        }
    }

    // Calculate longest streak
    for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].totalStudyTime > 0) {
            tempStreak = 1;

            for (let j = i + 1; j < sorted.length; j++) {
                const currentDate = new Date(sorted[j - 1].date);
                currentDate.setDate(currentDate.getDate() - 1);
                const expectedDateStr = currentDate.toISOString().split('T')[0];

                if (sorted[j].date === expectedDateStr && sorted[j].totalStudyTime > 0) {
                    tempStreak++;
                } else {
                    break;
                }
            }

            longestStreak = Math.max(longestStreak, tempStreak);
        }
    }

    return { current: currentStreak, longest: longestStreak };
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

export const filterSessionsByPeriod = (
    sessions: StudySession[],
    period: 'day' | 'week' | 'month',
    date: string = getTodayDateString()
): StudySession[] => {
    const targetDate = new Date(date);

    if (period === 'day') {
        return (sessions || []).filter(s =>
            s.endTime && new Date(s.startTime).toISOString().split('T')[0] === date
        );
    }

    if (period === 'week') {
        const weekDates = getWeekDateStrings(); // This gets last 7 days, let's stick to that for "Week"
        return (sessions || []).filter(s =>
            s.endTime && weekDates.includes(new Date(s.startTime).toISOString().split('T')[0])
        );
    }

    if (period === 'month') {
        const targetMonth = getMonthIdentifier(targetDate);
        return (sessions || []).filter(s =>
            s.endTime && getMonthIdentifier(new Date(s.startTime)) === targetMonth
        );
    }

    return [];
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
        default:
            return false;
    }
};
