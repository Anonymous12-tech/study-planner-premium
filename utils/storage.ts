import AsyncStorage from '@react-native-async-storage/async-storage';
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
        const data = await AsyncStorage.getItem(KEYS.SUBJECTS);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error getting subjects:', error);
        return [];
    }
};

export const saveSubjects = async (subjects: Subject[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch (error) {
        console.error('Error saving subjects:', error);
    }
};

export const addSubject = async (subject: Subject): Promise<void> => {
    const subjects = await getSubjects();
    subjects.push(subject);
    await saveSubjects(subjects);
};

export const updateSubject = async (updatedSubject: Subject): Promise<void> => {
    const subjects = await getSubjects();
    const index = subjects.findIndex(s => s.id === updatedSubject.id);
    if (index !== -1) {
        subjects[index] = updatedSubject;
        await saveSubjects(subjects);
    }
};

export const deleteSubject = async (subjectId: string): Promise<void> => {
    const subjects = await getSubjects();
    const filtered = subjects.filter(s => s.id !== subjectId);
    await saveSubjects(filtered);
};

// Study Sessions
export const getSessions = async (): Promise<StudySession[]> => {
    try {
        const data = await AsyncStorage.getItem(KEYS.SESSIONS);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error getting sessions:', error);
        return [];
    }
};

export const saveSessions = async (sessions: StudySession[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
        console.error('Error saving sessions:', error);
    }
};

export const addSession = async (session: StudySession): Promise<void> => {
    const sessions = await getSessions();
    sessions.push(session);
    await saveSessions(sessions);
};

export const updateSession = async (updatedSession: StudySession): Promise<void> => {
    const sessions = await getSessions();
    const index = sessions.findIndex(s => s.id === updatedSession.id);
    if (index !== -1) {
        sessions[index] = updatedSession;
        await saveSessions(sessions);
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
        const data = await AsyncStorage.getItem(KEYS.TASKS);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error getting tasks:', error);
        return [];
    }
};

export const saveTasks = async (tasks: StudyTask[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
};

export const addTask = async (task: StudyTask): Promise<void> => {
    const tasks = await getTasks();
    tasks.push(task);
    await saveTasks(tasks);
};

export const updateTask = async (updatedTask: StudyTask): Promise<void> => {
    const tasks = await getTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
        tasks[index] = updatedTask;
        await saveTasks(tasks);
    }
};

export const deleteTask = async (taskId: string): Promise<void> => {
    const tasks = await getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    await saveTasks(filtered);
};

// Deadlines
export const getDeadlines = async (): Promise<ExamDeadline[]> => {
    try {
        const data = await AsyncStorage.getItem(KEYS.DEADLINES);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error getting deadlines:', error);
        return [];
    }
};

export const saveDeadlines = async (deadlines: ExamDeadline[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.DEADLINES, JSON.stringify(deadlines));
    } catch (error) {
        console.error('Error saving deadlines:', error);
    }
};

export const addDeadline = async (deadline: ExamDeadline): Promise<void> => {
    const deadlines = await getDeadlines();
    deadlines.push(deadline);
    await saveDeadlines(deadlines);
};

export const updateDeadline = async (updatedDeadline: ExamDeadline): Promise<void> => {
    const deadlines = await getDeadlines();
    const index = deadlines.findIndex(d => d.id === updatedDeadline.id);
    if (index !== -1) {
        deadlines[index] = updatedDeadline;
        await saveDeadlines(deadlines);
    }
};

export const deleteDeadline = async (deadlineId: string): Promise<void> => {
    const deadlines = await getDeadlines();
    const filtered = deadlines.filter(d => d.id !== deadlineId);
    await saveDeadlines(filtered);
};

// User Preferences
export const getUserPreferences = async (): Promise<UserPreferences | null> => {
    try {
        const data = await AsyncStorage.getItem(KEYS.PREFERENCES);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting preferences:', error);
        return null;
    }
};

export const saveUserPreferences = async (prefs: UserPreferences): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (error) {
        console.error('Error saving preferences:', error);
    }
};

// Daily Stats
export const getDailyStats = async (): Promise<DailyStats[]> => {
    try {
        const data = await AsyncStorage.getItem(KEYS.DAILY_STATS);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error getting daily stats:', error);
        return [];
    }
};

export const saveDailyStats = async (stats: DailyStats[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.DAILY_STATS, JSON.stringify(stats));
    } catch (error) {
        console.error('Error saving daily stats:', error);
    }
};

export const updateDailyStats = async (date: string, session: StudySession): Promise<void> => {
    const stats = await getDailyStats();
    const existingIndex = stats.findIndex(s => s.date === date);

    if (existingIndex !== -1) {
        stats[existingIndex].totalStudyTime += session.duration;
        stats[existingIndex].sessionsCount += 1;
        if (!stats[existingIndex].subjectsStudied.includes(session.subjectId)) {
            stats[existingIndex].subjectsStudied.push(session.subjectId);
        }
    } else {
        stats.push({
            date,
            totalStudyTime: session.duration,
            sessionsCount: 1,
            subjectsStudied: [session.subjectId],
        });
    }

    await saveDailyStats(stats);
};

// Todos
export const getTodos = async (): Promise<StudyTodo[]> => {
    try {
        const data = await AsyncStorage.getItem(KEYS.TODOS);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error getting todos:', error);
        return [];
    }
};

export const saveTodos = async (todos: StudyTodo[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.TODOS, JSON.stringify(todos));
    } catch (error) {
        console.error('Error saving todos:', error);
    }
};

export const addTodo = async (todo: StudyTodo): Promise<void> => {
    const todos = await getTodos();
    todos.push(todo);
    await saveTodos(todos);
};

export const updateTodo = async (updatedTodo: StudyTodo): Promise<void> => {
    const todos = await getTodos();
    const index = todos.findIndex(t => t.id === updatedTodo.id);
    if (index !== -1) {
        todos[index] = updatedTodo;
        await saveTodos(todos);
    }
};

export const deleteTodo = async (todoId: string): Promise<void> => {
    const todos = await getTodos();
    const filtered = todos.filter(t => t.id !== todoId);
    await saveTodos(filtered);
};
