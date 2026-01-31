import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors as baseColors, borderRadius, spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'glass' | 'solid' | 'flat';
    padding?: keyof typeof spacing;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'glass',
    padding = 'md',
    intensity = 40,
    tint = 'dark',
}) => {
    const { colors } = useTheme();

    if (variant === 'glass') {
        return (
            <BlurView
                intensity={intensity}
                tint={tint}
                style={[
                    styles.card,
                    styles.glass,
                    { padding: spacing[padding] },
                    style,
                ]}
            >
                {children}
            </BlurView>
        );
    }

    return (
        <View
            style={[
                styles.card,
                variant === 'solid' ? styles.solid : styles.flat,
                { padding: spacing[padding] },
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    solid: {
        backgroundColor: baseColors.backgroundSecondary,
        borderWidth: 1,
        borderColor: baseColors.borderLight,
    },
    flat: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: baseColors.borderLight,
    }
});

