import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { Subject, StudySession, Goal, DailyStats, StudyTask, ExamDeadline, UserPreferences, StudyTodo } from '../types';

const KEYS = {
    SUBJECTS: '@study_planner_subjects',
    SESSIONS: '@study_planner_sessions',
    GOALS: '@study_planner_goals',
    TASKS: '@study_planner_tasks',
    DEADLINES: '@study_planner_deadlines',
    PREFERENCES: '@study_planner_preferences',
    DAILY_STATS: '@study_planner_daily_stats',
    ACTIVE_SESSION: '@study_planner_active_session',
    TODOS: '@study_planner_todos',
};

// Subjects
export const getSubjects = async (): Promise<Subject[]> => {
    try {
        const { data, error } = await supabase
            .from('subjects')
            .select('*');

        if (error) throw error;

        return (data || []).map(s => ({
            id: s.id,
            name: s.name,
            color: s.color,
            icon: s.icon,
            createdAt: s.created_at ? new Date(s.created_at).getTime() : Date.now(),
            totalStudyTime: s.total_study_time || 0
        }));
    } catch (error) {
        console.error('Error getting subjects:', error);
        return [];
    }
};

export const saveSubjects = async (subjects: Subject[]): Promise<void> => {
    // No-op or deprecated for direct DB usage, kept for compatibility if needed
};

export const addSubject = async (subject: Subject): Promise<void> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        // Map to DB snake_case
        const { error } = await supabase.from('subjects').insert({
            id: subject.id, // Include local ID
            user_id: user.id,
            name: subject.name,
            color: subject.color,
            icon: subject.icon,
            total_study_time: subject.totalStudyTime
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error adding subject:', error);
    }
};

export const updateSubject = async (updatedSubject: Subject): Promise<void> => {
    try {
        const { error } = await supabase
            .from('subjects')
            .update({
                name: updatedSubject.name,
                color: updatedSubject.color,
                icon: updatedSubject.icon,
                total_study_time: updatedSubject.totalStudyTime
            })
            .eq('id', updatedSubject.id);
        if (error) throw error;
    } catch (error) {
        console.error('Error updating subject:', error);
    }
};

export const deleteSubject = async (subjectId: string): Promise<void> => {
    try {
        const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting subject:', error);
    }
};

// Study Sessions
export const getSessions = async (): Promise<StudySession[]> => {
    try {
        const { data, error } = await supabase.from('study_sessions').select('*');
        if (error) throw error;

        return (data || []).map(s => ({
            id: s.id,
            subjectId: s.subject_id,
            startTime: s.start_time,
            endTime: s.end_time || undefined,
            duration: s.duration,
            notes: s.notes,
            isPaused: s.is_paused || false,
            pausedAt: s.paused_at,
            totalPausedTime: s.total_paused_time || 0,
        }));
    } catch (error) {
        console.error('Error getting sessions:', error);
        return [];
    }
};

export const saveSessions = async (sessions: StudySession[]): Promise<void> => {
    // No-op
};

export const addSession = async (session: StudySession): Promise<void> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { error } = await supabase.from('study_sessions').insert({
            id: session.id, // Include local ID
            user_id: user.id,
            subject_id: session.subjectId,
            start_time: session.startTime,
            end_time: session.endTime,
            duration: session.duration,
            notes: session.notes,
            is_paused: session.isPaused,
            paused_at: session.pausedAt,
            total_paused_time: session.totalPausedTime,
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error adding session:', error);
    }
};

export const updateSession = async (updatedSession: StudySession): Promise<void> => {
    try {
        const { error } = await supabase.from('study_sessions').update({
            end_time: updatedSession.endTime,
            duration: updatedSession.duration,
            is_paused: updatedSession.isPaused,
            paused_at: updatedSession.pausedAt,
            total_paused_time: updatedSession.totalPausedTime,
        }).eq('id', updatedSession.id);
        if (error) throw error;
    } catch (error) {
        console.error('Error updating session:', error);
    }
};

// Active Session
export const getActiveSession = async (): Promise<StudySession | null> => {
    try {
        const data = await AsyncStorage.getItem(KEYS.ACTIVE_SESSION);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting active session:', error);
        return null;
    }
};

export const saveActiveSession = async (session: StudySession | null): Promise<void> => {
    try {
        if (session) {
            await AsyncStorage.setItem(KEYS.ACTIVE_SESSION, JSON.stringify(session));
        } else {
            await AsyncStorage.removeItem(KEYS.ACTIVE_SESSION);
        }
    } catch (error) {
        console.error('Error saving active session:', error);
    }
};

// Goals
export const getGoals = async (): Promise<Goal[]> => {
    try {
        const data = await AsyncStorage.getItem(KEYS.GOALS);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error getting goals:', error);
        return [];
    }
};

export const saveGoals = async (goals: Goal[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
    } catch (error) {
        console.error('Error saving goals:', error);
    }
};

export const addGoal = async (goal: Goal): Promise<void> => {
    const goals = await getGoals();
    goals.push(goal);
    await saveGoals(goals);
};

export const updateGoal = async (updatedGoal: Goal): Promise<void> => {
    const goals = await getGoals();
    const index = goals.findIndex(g => g.id === updatedGoal.id);
    if (index !== -1) {
        goals[index] = updatedGoal;
        await saveGoals(goals);
    }
};

export const deleteGoal = async (goalId: string): Promise<void> => {
    const goals = await getGoals();
    const filtered = goals.filter(g => g.id !== goalId);
    await saveGoals(filtered);
};

// Tasks
export const getTasks = async (): Promise<StudyTask[]> => {
    try {
        const { data, error } = await supabase.from('tasks').select('*');
        if (error) throw error;

        return (data || []).map(t => ({
            id: t.id,
            subjectId: t.subject_id,
            topic: t.topic,
            plannedDuration: t.planned_duration,
            isCompleted: t.is_completed,
            date: t.date,
            priority: t.priority,
            createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
        }));
    } catch (error) {
        console.error('Error getting tasks:', error);
        return [];
    }
};

export const saveTasks = async (tasks: StudyTask[]): Promise<void> => {
    // No-op
};

export const addTask = async (task: StudyTask): Promise<void> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { error } = await supabase.from('tasks').insert({
            id: task.id, // Include local ID
            user_id: user.id,
            subject_id: task.subjectId,
            topic: task.topic,
            planned_duration: task.plannedDuration,
            is_completed: task.isCompleted,
            date: task.date,
            priority: task.priority,
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error adding task:', error);
    }
};

export const updateTask = async (updatedTask: StudyTask): Promise<void> => {
    try {
        const { error } = await supabase.from('tasks').update({
            topic: updatedTask.topic,
            planned_duration: updatedTask.plannedDuration,
            is_completed: updatedTask.isCompleted,
            priority: updatedTask.priority,
        }).eq('id', updatedTask.id);
        if (error) throw error;
    } catch (error) {
        console.error('Error updating task:', error);
    }
};

export const deleteTask = async (taskId: string): Promise<void> => {
    try {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting task:', error);
    }
};

// Deadlines
export const getDeadlines = async (): Promise<ExamDeadline[]> => {
    try {
        const { data, error } = await supabase.from('exam_deadlines').select('*');
        if (error) throw error;

        return (data || []).map(d => ({
            id: d.id,
            name: d.name,
            date: d.date,
            preparationLevel: d.preparation_level,
            createdAt: d.created_at ? new Date(d.created_at).getTime() : Date.now(),
        }));
    } catch (error) {
        console.error('Error getting deadlines:', error);
        return [];
    }
};

export const saveDeadlines = async (deadlines: ExamDeadline[]): Promise<void> => {
    // No-op
};

export const addDeadline = async (deadline: ExamDeadline): Promise<void> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { error } = await supabase.from('exam_deadlines').insert({
            id: deadline.id, // Include local ID
            user_id: user.id,
            name: deadline.name,
            date: deadline.date,
            preparation_level: deadline.preparationLevel,
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error adding deadline:', error);
    }
};

export const updateDeadline = async (updatedDeadline: ExamDeadline): Promise<void> => {
    try {
        const { error } = await supabase.from('exam_deadlines').update({
            name: updatedDeadline.name,
            date: updatedDeadline.date,
            preparation_level: updatedDeadline.preparationLevel,
        }).eq('id', updatedDeadline.id);
        if (error) throw error;
    } catch (error) {
        console.error('Error updating deadline:', error);
    }
};

export const deleteDeadline = async (deadlineId: string): Promise<void> => {
    try {
        const { error } = await supabase.from('exam_deadlines').delete().eq('id', deadlineId);
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting deadline:', error);
    }
};

// User Preferences
export const getUserPreferences = async (): Promise<UserPreferences | null> => {
    try {
        // Assuming a single row per user, controlled by RLS.
        const { data, error } = await supabase.from('profiles').select('*').single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Row not found"

        if (!data) return null;

        return {
            onboardingComplete: data.onboarding_complete || false,
            fullName: data.full_name,
            username: data.username,
            academicLevel: data.academic_level,
            dailyGoalMinutes: data.daily_goal_minutes || 60,
            accentColor: data.accent_color,
            selectedSubjectIds: data.selected_subject_ids || [],
        };
    } catch (error) {
        console.error('Error getting preferences:', error);
        return null;
    }
};

export const saveUserPreferences = async (prefs: UserPreferences): Promise<void> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { error } = await supabase.from('profiles').upsert({
            id: user.id,
            onboarding_complete: prefs.onboardingComplete,
            full_name: prefs.fullName,
            username: prefs.username,
            academic_level: prefs.academicLevel,
            daily_goal_minutes: prefs.dailyGoalMinutes,
            accent_color: prefs.accentColor,
            selected_subject_ids: prefs.selectedSubjectIds,
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error saving preferences:', error);
    }
};

// Daily Stats
export const getDailyStats = async (): Promise<DailyStats[]> => {
    try {
        const { data, error } = await supabase.from('daily_stats').select('*');
        if (error) throw error;

        return (data || []).map(s => ({
            date: s.date,
            totalStudyTime: s.total_study_time || 0,
            sessionsCount: s.sessions_count || 0,
            subjectsStudied: s.subjects_studied || [],
        }));
    } catch (error) {
        console.error('Error getting daily stats:', error);
        return [];
    }
};

export const saveDailyStats = async (stats: DailyStats[]): Promise<void> => {
    // No-op, use specific update/add methods
};

export const updateDailyStats = async (date: string, session: StudySession): Promise<void> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        // Fetch existing stat for this date
        const { data: existing, error: fetchError } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('date', date)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        let stat: DailyStats;

        if (existing) {
            const subjects = existing.subjects_studied || [];
            if (!subjects.includes(session.subjectId)) {
                subjects.push(session.subjectId);
            }
            stat = {
                date: existing.date,
                totalStudyTime: (existing.total_study_time || 0) + session.duration,
                sessionsCount: (existing.sessions_count || 0) + 1,
                subjectsStudied: subjects,
            };
        } else {
            stat = {
                date,
                totalStudyTime: session.duration,
                sessionsCount: 1,
                subjectsStudied: [session.subjectId],
            };
        }

        // Upsert
        const { error: upsertError } = await supabase.from('daily_stats').upsert({
            user_id: user.id,
            date: stat.date,
            total_study_time: stat.totalStudyTime,
            sessions_count: stat.sessionsCount,
            subjects_studied: stat.subjectsStudied
        }, { onConflict: 'user_id,date' });

        if (upsertError) throw upsertError;

    } catch (error) {
        console.error('Error updating daily stats:', error);
    }
};

// Todos
export const getTodos = async (): Promise<StudyTodo[]> => {
    try {
        const { data, error } = await supabase.from('todos').select('*');
        if (error) throw error;

        return (data || []).map(t => ({
            id: t.id,
            text: t.text,
            isCompleted: t.is_completed,
            date: t.date,
            period: t.period,
            createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
        }));
    } catch (error) {
        console.error('Error getting todos:', error);
        return [];
    }
};

export const saveTodos = async (todos: StudyTodo[]): Promise<void> => {
    // No-op
};

export const addTodo = async (todo: StudyTodo): Promise<void> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { error } = await supabase.from('todos').insert({
            id: todo.id, // Include local ID
            user_id: user.id,
            text: todo.text,
            is_completed: todo.isCompleted,
            date: todo.date,
            period: todo.period,
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error adding todo:', error);
    }
};

export const updateTodo = async (updatedTodo: StudyTodo): Promise<void> => {
    try {
        const { error } = await supabase.from('todos').update({
            text: updatedTodo.text,
            is_completed: updatedTodo.isCompleted,
        }).eq('id', updatedTodo.id);
        if (error) throw error;
    } catch (error) {
        console.error('Error updating todo:', error);
    }
};

export const deleteTodo = async (todoId: string): Promise<void> => {
    try {
        const { error } = await supabase.from('todos').delete().eq('id', todoId);
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
};

// Migration Utility
export const hasLocalData = async (): Promise<boolean> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const appKeys = Object.values(KEYS);
        // Check if any of our keys exist and have non-empty data
        for (const key of appKeys) {
            if (keys.includes(key)) {
                const data = await AsyncStorage.getItem(key);
                if (data && data !== '[]' && data !== '{}' && data !== 'null') {
                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        return false;
    }
};

export const migrateLocalData = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User must be logged in to migrate data');

        let migrationCount = 0;

        // 1. Subjects
        const localSubjectsRaw = await AsyncStorage.getItem(KEYS.SUBJECTS);
        const localSubjects: Subject[] = localSubjectsRaw ? JSON.parse(localSubjectsRaw) : [];
        if (localSubjects.length > 0) {
            const { error: sError } = await supabase.from('subjects').upsert(
                localSubjects.map(s => ({
                    id: s.id,
                    user_id: user.id,
                    name: s.name,
                    color: s.color,
                    icon: s.icon,
                    total_study_time: s.totalStudyTime,
                }))
            );
            if (sError) throw sError;
            migrationCount += localSubjects.length;
        }

        // 2. Tasks
        const localTasksRaw = await AsyncStorage.getItem(KEYS.TASKS);
        const localTasks: StudyTask[] = localTasksRaw ? JSON.parse(localTasksRaw) : [];
        if (localTasks.length > 0) {
            const { error: tError } = await supabase.from('tasks').upsert(
                localTasks.map(t => ({
                    id: t.id,
                    user_id: user.id,
                    subject_id: t.subjectId,
                    topic: t.topic,
                    planned_duration: t.plannedDuration,
                    is_completed: t.isCompleted,
                    date: t.date,
                    priority: t.priority,
                }))
            );
            if (tError) throw tError;
            migrationCount += localTasks.length;
        }

        // 3. Sessions
        const localSessionsRaw = await AsyncStorage.getItem(KEYS.SESSIONS);
        const localSessions: StudySession[] = localSessionsRaw ? JSON.parse(localSessionsRaw) : [];
        if (localSessions.length > 0) {
            const { error: sessError } = await supabase.from('study_sessions').upsert(
                localSessions.map(s => ({
                    id: s.id,
                    user_id: user.id,
                    subject_id: s.subjectId,
                    start_time: s.startTime,
                    end_time: s.endTime,
                    duration: s.duration,
                    notes: s.notes,
                    is_paused: s.isPaused,
                    paused_at: s.pausedAt,
                    total_paused_time: s.totalPausedTime,
                }))
            );
            if (sessError) throw sessError;
            migrationCount += localSessions.length;
        }

        // 4. Todos
        const localTodosRaw = await AsyncStorage.getItem(KEYS.TODOS);
        const localTodos: StudyTodo[] = localTodosRaw ? JSON.parse(localTodosRaw) : [];
        if (localTodos.length > 0) {
            const { error: todoError } = await supabase.from('todos').upsert(
                localTodos.map(t => ({
                    id: t.id,
                    user_id: user.id,
                    text: t.text,
                    is_completed: t.isCompleted,
                    date: t.date,
                    period: t.period,
                }))
            );
            if (todoError) throw todoError;
            migrationCount += localTodos.length;
        }

        // 5. Deadlines
        const localDeadlinesRaw = await AsyncStorage.getItem(KEYS.DEADLINES);
        const localDeadlines: ExamDeadline[] = localDeadlinesRaw ? JSON.parse(localDeadlinesRaw) : [];
        if (localDeadlines.length > 0) {
            const { error: dError } = await supabase.from('exam_deadlines').upsert(
                localDeadlines.map(d => ({
                    id: d.id,
                    user_id: user.id,
                    name: d.name,
                    date: d.date,
                    preparation_level: d.preparationLevel,
                }))
            );
            if (dError) throw dError;
            migrationCount += localDeadlines.length;
        }

        // 6. Daily Stats
        const localStatsRaw = await AsyncStorage.getItem(KEYS.DAILY_STATS);
        const localStats: DailyStats[] = localStatsRaw ? JSON.parse(localStatsRaw) : [];
        if (localStats.length > 0) {
            const { error: statError } = await supabase.from('daily_stats').upsert(
                localStats.map(s => ({
                    user_id: user.id,
                    date: s.date,
                    total_study_time: s.totalStudyTime,
                    sessions_count: s.sessionsCount,
                    subjects_studied: s.subjectsStudied,
                }))
            );
            if (statError) throw statError;
            migrationCount += localStats.length;
        }

        // 7. Preferences
        const localPrefsRaw = await AsyncStorage.getItem(KEYS.PREFERENCES);
        if (localPrefsRaw) {
            const prefs: UserPreferences = JSON.parse(localPrefsRaw);
            const { error: pError } = await supabase.from('profiles').upsert({
                id: user.id,
                onboarding_complete: prefs.onboardingComplete,
                academic_level: prefs.academicLevel,
                daily_goal_minutes: prefs.dailyGoalMinutes,
                accent_color: prefs.accentColor,
                selected_subject_ids: prefs.selectedSubjectIds,
            });
            if (pError) throw pError;
            migrationCount += 1;
        }

        return { success: true, count: migrationCount };
    } catch (error: any) {
        console.error('Migration error:', error);
        return { success: false, count: 0, error: error.message };
    }
};

export const clearLocalData = async (): Promise<void> => {
    try {
        const appKeys = Object.values(KEYS);
        await AsyncStorage.multiRemove(appKeys);
    } catch (error) {
        console.error('Error clearing local data:', error);
    }
};
