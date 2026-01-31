import React, { useState } from 'react';
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { colors as baseColors, spacing, borderRadius, typography } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    style,
    ...props
}) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    isFocused && { borderColor: colors.primary },
                    error && styles.inputError,
                    style,
                ]}
                placeholderTextColor={baseColors.textMuted}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
            {error && <Text style={[styles.error, { color: baseColors.error }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.caption,
        color: baseColors.textSecondary,
        marginBottom: spacing.xs,
        fontWeight: '600' as '600',
    },
    input: {
        backgroundColor: baseColors.backgroundSecondary,
        borderWidth: 1,
        borderColor: baseColors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        color: baseColors.text,
        fontSize: 16,
    },
    inputFocused: {
        // borderColor: colors.primary,  // Will be applied dynamically in JSX
    },
    inputError: {
        borderColor: baseColors.error,
    },
    error: {
        ...typography.small,
        marginTop: spacing.xs,
    },
});
