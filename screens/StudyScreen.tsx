import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    StatusBar,
    Alert,
    Platform,
    AppState,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../constants/theme';
import { Subject, StudySession, StudyTask } from '../types';
import {
    getSubjects,
    getActiveSession,
    saveActiveSession,
    addSession,
    updateSubject,
    getTasks,
} from '../utils/storage';
import { getTodayDateString } from '../utils/calculations';
import * as Haptics from 'expo-haptics';

export const StudyScreen = ({ route, navigation }: any) => {
    const { taskId, subjectId } = route.params || {};

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [task, setTask] = useState<StudyTask | null>(null);
    const [activeSession, setActiveSession] = useState<StudySession | null>(null);
    const [seconds, setSeconds] = useState(0);
    const [isAmbientOn, setIsAmbientOn] = useState(false);

    // Animation values
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const loadData = async () => {
        const [subjectsData, active, allTasks] = await Promise.all([
            getSubjects(),
            getActiveSession(),
            getTasks(),
        ]);

        setSubjects(subjectsData);
        setActiveSession(active);

        if (active) {
            const subject = subjectsData.find(s => s.id === active.subjectId);
            setSelectedSubject(subject || null);
            startPulse();
        } else if (subjectId) {
            const subject = subjectsData.find(s => s.id === subjectId);
            setSelectedSubject(subject || null);
        }

        if (taskId) {
            const currentTask = allTasks.find(t => t.id === taskId);
            setTask(currentTask || null);
        }
    };

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                getActiveSession().then(session => {
                    if (session) {
                        setActiveSession(session);
                    }
                });
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (activeSession && !activeSession.isPaused) {
            const sync = () => {
                const currentSeconds = Math.floor((Date.now() - activeSession.startTime - activeSession.totalPausedTime) / 1000);
                setSeconds(currentSeconds > 0 ? currentSeconds : 0);
            };

            sync(); // Initial sync
            interval = setInterval(sync, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeSession]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [taskId, subjectId])
    );

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    // startTimer and syncTimer are now handled reactively by useEffect

    const stopTimer = () => {
        // Redundant with reactive useEffect cleanup but kept for any manual overrides if needed
    };

    const handleStart = async () => {
        if (!selectedSubject) {
            Alert.alert('Selection Required', 'Choose a subject to start focus mode.');
            return;
        }

        const session: StudySession = {
            id: Date.now().toString(),
            subjectId: selectedSubject.id,
            startTime: Date.now(),
            duration: 0,
            isPaused: false,
            totalPausedTime: 0,
        };

        await saveActiveSession(session);
        setActiveSession(session);
        setSeconds(0);
        startPulse();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handlePauseResume = async () => {
        if (!activeSession) return;

        if (activeSession.isPaused) {
            // Resume
            const pauseDuration = Date.now() - (activeSession.pausedAt || 0);
            const updated = {
                ...activeSession,
                isPaused: false,
                pausedAt: undefined,
                totalPausedTime: activeSession.totalPausedTime + pauseDuration,
            };
            await saveActiveSession(updated);
            setActiveSession(updated);
            startPulse();
        } else {
            // Pause
            const updated = {
                ...activeSession,
                isPaused: true,
                pausedAt: Date.now(),
            };
            await saveActiveSession(updated);
            setActiveSession(updated);
            pulseAnim.setValue(1);
        }
    };

    const handleEnd = async () => {
        if (!activeSession || !selectedSubject) return;

        Alert.alert(
            'End Session?',
            'Are you sure you want to finish your study session now?',
            [
                { text: 'Continue', style: 'cancel' },
                {
                    text: 'Finish',
                    onPress: async () => {
                        const endTime = Date.now();
                        const finalDuration = seconds;

                        const completedSession: StudySession = {
                            ...activeSession,
                            endTime,
                            duration: finalDuration,
                        };

                        await addSession(completedSession);

                        const updatedSubject = {
                            ...selectedSubject,
                            totalStudyTime: selectedSubject.totalStudyTime + finalDuration,
                        };
                        await updateSubject(updatedSubject);

                        const { updateDailyStats } = require('../utils/storage');
                        await updateDailyStats(getTodayDateString(), completedSession);

                        await saveActiveSession(null);
                        setActiveSession(null);
                        navigation.navigate('Home');
                    }
                }
            ]
        );
    };

    const formatTimer = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 && hrs > 0 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={gradients.dark as any} style={StyleSheet.absoluteFill} />

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>✕</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.ambientButton, isAmbientOn && styles.ambientButtonActive]}
                        onPress={() => setIsAmbientOn(!isAmbientOn)}
                    >
                        <Text style={styles.ambientText}>{isAmbientOn ? '🔊 Ambient' : '🔇 Nature'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Session View */}
                {!activeSession ? (
                    <View style={styles.setupView}>
                        <Text style={styles.setupTitle}>Start Focus</Text>
                        <Text style={styles.setupSubtitle}>Choose a subject to begin your deep work session.</Text>

                        <View style={styles.subjectList}>
                            {subjects && subjects.map(subject => (
                                <TouchableOpacity
                                    key={subject.id}
                                    style={[styles.subjectCard, selectedSubject?.id === subject.id && { borderColor: subject.color, backgroundColor: subject.color + '20' }]}
                                    onPress={() => setSelectedSubject(subject)}
                                >
                                    <Text style={styles.subjectIcon}>{subject.icon}</Text>
                                    <Text style={[styles.subjectName, selectedSubject?.id === subject.id && { color: subject.color }]}>{subject.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.startFab} onPress={handleStart}>
                            <Text style={styles.startFabText}>Begin Deep Work</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.focusView}>
                        <View style={styles.targetInfo}>
                            <Text style={styles.targetIcon}>{selectedSubject?.icon}</Text>
                            <Text style={styles.targetSubject}>{selectedSubject?.name}</Text>
                            {task && <Text style={styles.targetTopic}>{task.topic}</Text>}
                        </View>

                        <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
                            <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
                            <Text style={styles.timerLabel}>{activeSession.isPaused ? 'PAUSED' : 'FOCUSED ON...'}</Text>
                        </Animated.View>

                        <View style={styles.controls}>
                            <TouchableOpacity style={styles.ctrlButton} onPress={handleEnd}>
                                <Text style={styles.ctrlIcon}>⏹</Text>
                                <Text style={styles.ctrlLabel}>Stop</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.ctrlButtonLarge, activeSession.isPaused && styles.ctrlButtonPaused]}
                                onPress={handlePauseResume}
                            >
                                <Text style={styles.ctrlIconLarge}>{activeSession.isPaused ? '▶' : '||'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.ctrlButton}>
                                <Text style={styles.ctrlIcon}>🎵</Text>
                                <Text style={styles.ctrlLabel}>Tune</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
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
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
    },
    backButton: {
        fontSize: 24,
        color: colors.textSecondary,
        padding: 10,
    },
    ambientButton: {
        backgroundColor: colors.backgroundSecondary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    ambientButtonActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '20',
    },
    ambientText: {
        ...typography.caption,
        color: colors.text,
        fontWeight: '600' as any,
    },
    setupView: {
        flex: 1,
        justifyContent: 'center',
    },
    setupTitle: {
        ...typography.h1,
        fontSize: 42,
        color: colors.text,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    setupSubtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xxl,
    },
    subjectList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        justifyContent: 'center',
        marginBottom: spacing.xxl,
    },
    subjectCard: {
        width: '45%',
        padding: spacing.lg,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    subjectIcon: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    subjectName: {
        ...typography.body,
        fontWeight: '600' as any,
        color: colors.textSecondary,
    },
    startFab: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    startFabText: {
        ...typography.h3,
        color: colors.background,
        fontWeight: '700' as any,
    },
    focusView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    targetInfo: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    targetIcon: {
        fontSize: 48,
        marginBottom: spacing.sm,
    },
    targetSubject: {
        ...typography.h2,
        color: colors.primary,
        marginBottom: 4,
    },
    targetTopic: {
        ...typography.body,
        color: colors.textSecondary,
    },
    timerCircle: {
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: colors.primary + '40',
        ...shadows.large,
    },
    timerText: {
        fontSize: 72,
        fontWeight: '800' as any,
        color: colors.text,
    },
    timerLabel: {
        ...typography.caption,
        color: colors.primary,
        letterSpacing: 2,
        marginTop: 8,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 80,
        width: '100%',
        justifyContent: 'space-around',
    },
    ctrlButton: {
        alignItems: 'center',
        opacity: 0.8,
    },
    ctrlButtonLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    ctrlButtonPaused: {
        backgroundColor: colors.primary,
    },
    ctrlIcon: {
        fontSize: 24,
        color: colors.text,
        marginBottom: 4,
    },
    ctrlIconLarge: {
        fontSize: 32,
        color: colors.text,
    },
    ctrlLabel: {
        ...typography.small,
        color: colors.textSecondary,
    },
});
