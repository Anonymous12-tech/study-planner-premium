import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    StyleProp
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors as baseColors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
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
    const { colors } = useTheme();
    const handlePress = () => {
        if (!disabled && !loading) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
        }
    };

    const buttonStyle = [
        styles.button,
        {
            backgroundColor: variant === 'primary' ? colors.primary :
                variant === 'secondary' ? colors.secondary :
                    variant === 'danger' ? baseColors.error : 'transparent',
            borderColor: variant === 'ghost' ? baseColors.border : 'transparent',
            borderWidth: variant === 'ghost' ? 1 : 0,
        },
        styles[size],
        disabled && styles.disabled,
        style,
    ];

    const textStyle = [
        styles.text,
        {
            color: variant === 'ghost' ? colors.primary : baseColors.text,
        },
        styles[`${size}Text`],
    ];

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'ghost' ? colors.primary : baseColors.text} />
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

    // Variant bases removed in favor of dynamic mapping above

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
    // Text bases removed in favor of dynamic mapping

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
