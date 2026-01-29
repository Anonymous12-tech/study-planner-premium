import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, typography } from '../constants/theme';
import { formatTimeDetailed } from '../utils/calculations';
import { Button } from './ui/Button';

interface StudyTimerProps {
    initialSeconds: number;
    isRunning: boolean;
    isPaused: boolean;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({
    initialSeconds,
    isRunning,
    isPaused,
    onStart,
    onPause,
    onResume,
    onStop,
}) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [totalSeconds, setTotalSeconds] = useState(0);
    const scaleAnim = useState(new Animated.Value(1))[0];

    useEffect(() => {
        setSeconds(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && !isPaused) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
                setTotalSeconds(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, isPaused]);

    // Pulse animation when running
    useEffect(() => {
        if (isRunning && !isPaused) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.05,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            scaleAnim.setValue(1);
        }
    }, [isRunning, isPaused]);

    const size = 280;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Calculate progress (for visual effect, we'll use a 60-minute max for the circle)
    const maxSeconds = 3600; // 1 hour
    const progress = Math.min(seconds / maxSeconds, 1);
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.timerCircle, { transform: [{ scale: scaleAnim }] }]}>
                <Svg width={size} height={size} style={styles.svg}>
                    {/* Background circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.backgroundTertiary}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.primary}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>

                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{formatTimeDetailed(seconds)}</Text>
                    <Text style={styles.statusText}>
                        {!isRunning ? 'Ready' : isPaused ? 'Paused' : 'Studying'}
                    </Text>
                </View>
            </Animated.View>

            <View style={styles.controls}>
                {!isRunning ? (
                    <Button title="Start Session" onPress={onStart} size="large" />
                ) : (
                    <View style={styles.activeControls}>
                        <Button
                            title={isPaused ? 'Resume' : 'Pause'}
                            onPress={isPaused ? onResume : onPause}
                            variant="secondary"
                            style={styles.controlButton}
                        />
                        <Button
                            title="End Session"
                            onPress={onStop}
                            variant="danger"
                            style={styles.controlButton}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerCircle: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    svg: {
        transform: [{ rotate: '-90deg' }],
    },
    timeContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 48,
        fontWeight: '700' as '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    statusText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    controls: {
        width: '100%',
        paddingHorizontal: spacing.lg,
    },
    activeControls: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    controlButton: {
        flex: 1,
    },
});
