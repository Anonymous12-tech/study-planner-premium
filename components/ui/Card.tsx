import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors as baseColors, borderRadius, spacing, glassmorphism } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'glass' | 'solid';
    padding?: keyof typeof spacing;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'glass',
    padding = 'md',
}) => {
    const { colors } = useTheme();
    return (
        <View
            style={[
                styles.card,
                variant === 'glass' ? styles.glass : {
                    backgroundColor: baseColors.backgroundSecondary,
                    borderWidth: 1,
                    borderColor: baseColors.borderLight,
                },
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
        overflow: 'hidden' as 'hidden',
    },
    glass: {
        ...glassmorphism.medium,
    },
    solid: {
        // Dynamic mapping in JSX
    },
});
