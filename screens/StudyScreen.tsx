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
    ScrollView,
    Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as baseColors, spacing, typography, borderRadius, gradients as baseGradients, shadows } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useFocus } from '../context/FocusContext';
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
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/ui/Card';


const { width, height } = Dimensions.get('window');

export const StudyScreen = ({ route, navigation }: any) => {
    const { colors, gradients } = useTheme();
    const { taskId, subjectId } = route.params || {};
    const { setIsFocusing } = useFocus();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [task, setTask] = useState<StudyTask | null>(null);
    const [activeSession, setActiveSession] = useState<StudySession | null>(null);
    const [seconds, setSeconds] = useState(0);
    const [isAmbientOn, setIsAmbientOn] = useState(false);

    // Animation values
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current; // For smooth entry

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

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
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
        // Sync focus state with context for Realtime presence
        setIsFocusing(!!activeSession && !activeSession.isPaused);
    }, [activeSession]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (activeSession && !activeSession.isPaused) {
            const sync = () => {
                const currentSeconds = Math.floor((Date.now() - activeSession.startTime - activeSession.totalPausedTime) / 1000);
                setSeconds(currentSeconds > 0 ? currentSeconds : 0);
            };

            sync();
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
        // Subtle breathing for the background glow
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
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
        Haptics.selectionAsync();

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
            pulseAnim.setValue(1); // Reset glow
        }
    };

    const handleEnd = async () => {
        if (!activeSession || !selectedSubject) return;

        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        const finalizeSession = async () => {
            try {
                const endTime = Date.now();
                const finalDuration = seconds;

                const completedSession: StudySession = {
                    ...activeSession,
                    endTime,
                    duration: finalDuration,
                };

                // Save session details
                await addSession(completedSession);

                // Update subject total time
                const updatedSubject = {
                    ...selectedSubject,
                    totalStudyTime: selectedSubject.totalStudyTime + finalDuration,
                };
                await updateSubject(updatedSubject);

                // Update daily statistics
                const { updateDailyStats } = require('../utils/storage');
                await updateDailyStats(getTodayDateString(), completedSession);

                // Clear active session
                await saveActiveSession(null);
                setActiveSession(null);

                // Success feedback and transition
                if (Platform.OS !== 'web') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                navigation.navigate('Home');
            } catch (error) {
                console.error('Error ending session:', error);
                Alert.alert('Error', 'Failed to save session details. Please try again.');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to finish your study session now?')) {
                await finalizeSession();
            }
        } else {
            Alert.alert(
                'End Session?',
                'Are you sure you want to finish your study session now?',
                [
                    { text: 'Continue Focus', style: 'cancel' },
                    { text: 'Finish', style: 'default', onPress: finalizeSession }
                ]
            );
        }
    };

    const formatTimer = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        // Return structured for simpler layout logic if needed, but string is fine for now
        // We want HH:MM:SS or MM:SS logic
        if (hrs > 0) {
            return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={gradients.aura as any} style={StyleSheet.absoluteFill} pointerEvents="none" />

            {/* Ambient Background Glow */}
            {activeSession && !activeSession.isPaused && (
                <Animated.View
                    style={[
                        styles.ambientGlow,
                        {
                            transform: [{ scale: pulseAnim }],
                            backgroundColor: selectedSubject ? selectedSubject.color + '20' : colors.primary + '20'
                        }
                    ]}
                />
            )}

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                        <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {activeSession && (
                        <BlurView intensity={30} tint="dark" style={[styles.liveIndicator, { borderColor: activeSession.isPaused ? colors.error + '40' : colors.primary + '40' }]}>
                            <View style={[styles.liveDot, { backgroundColor: activeSession.isPaused ? colors.error : colors.primary }]} />
                            <Text style={styles.liveText}>{activeSession.isPaused ? 'PAUSED' : 'LIVE FOCUS'}</Text>
                        </BlurView>
                    )}

                    <TouchableOpacity
                        style={[styles.headerButton, isAmbientOn && styles.headerButtonActive]}
                        onPress={() => {
                            setIsAmbientOn(!isAmbientOn);
                            Haptics.selectionAsync();
                        }}
                    >
                        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                        <Ionicons name={isAmbientOn ? "volume-high" : "volume-mute"} size={20} color={isAmbientOn ? colors.primary : colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Main Session View */}
                {!activeSession ? (
                    <Animated.View style={[styles.setupView, { opacity: fadeAnim }]}>
                        <View style={styles.setupHeader}>
                            <Text style={styles.setupTitle}>Focus Mode</Text>
                            <Text style={styles.setupSubtitle}>Select a subject to enter deep work.</Text>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.subjectList}
                            showsVerticalScrollIndicator={false}
                        >
                            {subjects && subjects.map(subject => (
                                <Card
                                    key={subject.id}
                                    variant="glass"
                                    padding="none"
                                    style={[
                                        styles.subjectCard,
                                        selectedSubject?.id === subject.id && { borderColor: subject.color }
                                    ]}
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedSubject(subject);
                                            Haptics.selectionAsync();
                                        }}
                                        activeOpacity={0.7}
                                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: spacing.md }}
                                    >
                                        <View style={[styles.subjectIconBox, { backgroundColor: subject.color + '20' }]}>
                                            <Text style={{ fontSize: 24 }}>{subject.icon}</Text>
                                        </View>
                                        <View style={styles.subjectInfo}>
                                            <Text style={styles.subjectName}>{subject.name}</Text>
                                            <Text style={styles.subjectStats}>{Math.floor(subject.totalStudyTime / 3600)}h {(Math.floor(subject.totalStudyTime / 60) % 60)}m focused</Text>
                                        </View>
                                        {selectedSubject?.id === subject.id && (
                                            <Ionicons name="checkmark-circle" size={24} color={subject.color} />
                                        )}
                                    </TouchableOpacity>
                                </Card>
                            ))}
                        </ScrollView>
                    </Animated.View>
                ) : (
                    <View style={styles.focusView}>

                        <View style={styles.clockContainer}>
                            <Text style={[styles.timerText, { color: activeSession.isPaused ? colors.textSecondary : colors.text }]}>
                                {formatTimer(seconds)}
                            </Text>
                            <Text style={styles.focusContext}>
                                {selectedSubject?.name} • {task ? task.topic : 'General Study'}
                            </Text>
                        </View>

                        <View style={styles.controlsContainer}>
                            <TouchableOpacity
                                style={styles.secondaryCtrl}
                                onPress={handleEnd}
                            >
                                <View style={styles.ctrlIconCircle}>
                                    <Ionicons name="stop" size={24} color={colors.error} />
                                </View>
                                <Text style={styles.ctrlLabel}>Stop</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.primaryCtrl}
                                onPress={handlePauseResume}
                            >
                                <View style={[styles.playPauseBtn, { borderColor: selectedSubject?.color || colors.primary }]}>
                                    <Ionicons
                                        name={activeSession.isPaused ? "play" : "pause"}
                                        size={40}
                                        color={colors.text}
                                        style={{ marginLeft: activeSession.isPaused ? 4 : 0 }}
                                    />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.secondaryCtrl}>
                                <View style={styles.ctrlIconCircle}>
                                    <Ionicons name="options" size={24} color={colors.textSecondary} />
                                </View>
                                <Text style={styles.ctrlLabel}>Adjust</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {!activeSession && (
                <View style={styles.footerContainer}>
                    <TouchableOpacity
                        style={[styles.startBtn, !selectedSubject && styles.startBtnDisabled]}
                        onPress={handleStart}
                        disabled={!selectedSubject}
                    >
                        <LinearGradient
                            colors={selectedSubject ? gradients.primary as any : [colors.border, colors.border]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.startBtnGradient}
                        >
                            <Text style={styles.startBtnText}>BEGIN SESSION</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseColors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    ambientGlow: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width,
        top: -width * 0.4,
        left: -width * 0.25,
        opacity: 0.3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: spacing.lg,
        zIndex: 10,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerButtonActive: {
        // Dynamic mapping in JSX
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
    },
    liveText: {
        ...typography.tiny,
        color: baseColors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // Setup Mode
    setupView: {
        flex: 1,
    },
    setupHeader: {
        marginBottom: spacing.lg,
    },
    setupTitle: {
        ...typography.h1,
        color: baseColors.text,
    },
    setupSubtitle: {
        ...typography.caption,
        color: baseColors.textSecondary,
        marginTop: 4,
    },
    subjectList: {
        paddingBottom: 150, // Added extra padding to clear footer and tab bar
    },
    subjectCard: {
        marginBottom: 12,
        overflow: 'hidden',
    },
    subjectIconBox: {
        width: 50,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    subjectInfo: {
        flex: 1,
    },
    subjectName: {
        ...typography.body,
        fontWeight: '600' as any,
        color: baseColors.text,
        marginBottom: 2,
    },
    subjectStats: {
        ...typography.small,
        color: baseColors.textSecondary,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 110, // Increased to clear the tab bar height (88) + some margin
        left: spacing.lg,
        right: spacing.lg,
        alignItems: 'center',
    },
    startBtn: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
    },
    startBtnDisabled: {
        opacity: 0.5,
    },
    startBtnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    startBtnText: {
        ...typography.body,
        fontWeight: '700' as any,
        color: '#FFFFFF',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },

    // Focus View
    focusView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clockContainer: {
        alignItems: 'center',
        marginBottom: 80,
    },
    timerText: {
        fontSize: 92,
        fontWeight: '200',
        fontVariant: ['tabular-nums'],
        letterSpacing: -2,
        color: '#FFFFFF',
    },
    focusContext: {
        ...typography.body,
        color: baseColors.textSecondary,
        letterSpacing: 0.5,
        marginTop: 8,
    },


    // Controls
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        width: '100%',
    },
    secondaryCtrl: {
        alignItems: 'center',
    },
    ctrlIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: baseColors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 8,
    },
    ctrlLabel: {
        ...typography.tiny,
        color: baseColors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    primaryCtrl: {
        alignItems: 'center',
        marginTop: -20, // push up slightly
    },
    playPauseBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: baseColors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        ...shadows.medium,
    },
});
