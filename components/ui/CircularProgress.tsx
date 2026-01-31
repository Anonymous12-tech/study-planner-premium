import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors as baseColors, typography } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    duration?: number;
    label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    percentage,
    size = 200,
    strokeWidth = 20,
    duration = 1000,
    label = 'DAILY DONE',
}) => {
    const { colors } = useTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;

    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: percentage,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [percentage]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${center}, ${center}`}>
                    {/* Background Circle */}
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={colors.backgroundTertiary}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress Circle */}
                    <AnimatedCircle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={colors.primary}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </G>
            </Svg>
            <View style={styles.textContainer}>
                <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
                <Text style={styles.label}>{label}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    percentageText: {
        ...typography.h1,
        fontSize: 38,
        color: baseColors.text,
        fontWeight: '700',
    },
    label: {
        ...typography.caption,
        color: baseColors.textTertiary,
        marginTop: -4,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
