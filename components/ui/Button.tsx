import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
}) => {
    const handlePress = () => {
        if (!disabled && !loading) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
        }
    };

    const buttonStyle: ViewStyle = [
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
    ] as ViewStyle;

    const textStyle: TextStyle = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
    ] as TextStyle;

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'ghost' ? colors.primary : colors.text} />
            ) : (
                <Text style={textStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },

    // Variants
    primary: {
        backgroundColor: colors.primary,
        ...shadows.medium,
    },
    secondary: {
        backgroundColor: colors.secondary,
        ...shadows.medium,
    },
    ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    danger: {
        backgroundColor: colors.error,
        ...shadows.medium,
    },

    // Sizes
    small: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    medium: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    large: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
    },

    // Text styles
    text: {
        fontWeight: '600' as '600',
    },
    primaryText: {
        color: colors.text,
        fontSize: 16,
    },
    secondaryText: {
        color: colors.text,
        fontSize: 16,
    },
    ghostText: {
        color: colors.primary,
        fontSize: 16,
    },
    dangerText: {
        color: colors.text,
        fontSize: 16,
    },

    // Size text
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },

    disabled: {
        opacity: 0.5,
    },
});
