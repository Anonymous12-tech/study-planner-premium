import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors as baseColors, borderRadius, spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'glass' | 'solid' | 'flat' | 'neumorphic';
    padding?: keyof typeof spacing;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'neumorphic',
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
                    {
                        backgroundColor: colors.glass,
                        borderColor: colors.border,
                        borderWidth: 1
                    },
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
                variant === 'solid' ? styles.solid :
                    variant === 'neumorphic' ? styles.neumorphic :
                        styles.flat,
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
    },
    neumorphic: {
        backgroundColor: baseColors.backgroundSecondary,
        borderColor: baseColors.border,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        borderLeftColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.5)',
        borderRightColor: 'rgba(0, 0, 0, 0.5)',
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    }
});

