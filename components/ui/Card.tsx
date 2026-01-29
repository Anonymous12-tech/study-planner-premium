import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, borderRadius, spacing, glassmorphism } from '../../constants/theme';

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
    return (
        <View
            style={[
                styles.card,
                variant === 'glass' ? styles.glass : styles.solid,
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
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
});
