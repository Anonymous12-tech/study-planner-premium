export interface Subject {
    id: string;
    name: string;
    color: string;
    icon?: string;
    createdAt: number;
    totalStudyTime: number; // in seconds
}

export interface StudySession {
    id: string;
    subjectId: string;
    startTime: number;
    endTime?: number;
    duration: number; // in seconds
    notes?: string;
    isPaused: boolean;
    pausedAt?: number;
    totalPausedTime: number; // in seconds
}

export interface Goal {
    id: string;
    type: 'daily' | 'weekly';
    targetMinutes: number;
    createdAt: number;
}

export interface StudyTask {
    id: string;
    subjectId: string;
    topic: string;
    plannedDuration: number; // in minutes
    isCompleted: boolean;
    date: string; // YYYY-MM-DD
    priority: 'low' | 'medium' | 'high';
    createdAt: number;
}

export interface ExamDeadline {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    preparationLevel: number; // 0-100 percentage
    createdAt: number;
}

export interface UserPreferences {
    onboardingComplete: boolean;
    fullName?: string;
    username?: string;
    academicLevel?: string;
    dailyGoalMinutes: number;
    accentColor?: string;
    selectedSubjectIds: string[];
    activeThemeId?: string;
    isPro?: boolean;
}

export interface DailyStats {
    date: string; // YYYY-MM-DD
    totalStudyTime: number; // in seconds
    sessionsCount: number;
    subjectsStudied: string[]; // subject IDs
}

export interface StudyTodo {
    id: string;
    text: string;
    isCompleted: boolean;
    date: string; // YYYY-MM-DD for daily, or a period identifier for weekly/monthly
    period: 'daily' | 'weekly' | 'monthly';
    createdAt: number;
}

export interface Statistics {
    totalStudyTime: number; // all time, in seconds
    currentStreak: number; // days
    longestStreak: number; // days
    totalSessions: number;
    averageSessionDuration: number; // in seconds
    dailyStats: DailyStats[];
}

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Onboarding: undefined;
    Home: undefined;
    Planner: undefined;
    Study: { taskId?: string; subjectId?: string }; // Focus Mode
    Deadlines: undefined;
    Stats: undefined;
    Settings: undefined;
};
