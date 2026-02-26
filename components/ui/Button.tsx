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
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'neumorphic';
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
    const [isPressed, setIsPressed] = React.useState(false);

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
                    variant === 'danger' ? baseColors.error :
                        variant === 'neumorphic' ? baseColors.backgroundSecondary : 'transparent',
            borderColor: variant === 'ghost' ? baseColors.border : 'transparent',
            borderWidth: variant === 'ghost' ? 1 : 0,
        },
        variant === 'neumorphic' && (isPressed ? styles.neumorphicInner : styles.neumorphicOuter),
        styles[size],
        disabled && styles.disabled,
        style,
    ];

    const textStyle = [
        styles.text,
        {
            color: variant === 'ghost' ? colors.primary :
                variant === 'neumorphic' ? colors.primary : baseColors.text,
        },
        styles[`${size}Text`],
    ];

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={handlePress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            disabled={disabled || loading}
            activeOpacity={variant === 'neumorphic' ? 1 : 0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'ghost' || variant === 'neumorphic' ? colors.primary : baseColors.text} />
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
    neumorphicOuter: {
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
    },
    neumorphicInner: {
        backgroundColor: baseColors.backgroundSecondary,
        borderWidth: 2,
        borderTopColor: 'rgba(0, 0, 0, 0.5)',
        borderLeftColor: 'rgba(0, 0, 0, 0.5)',
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        borderRightColor: 'rgba(255, 255, 255, 0.05)',
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
