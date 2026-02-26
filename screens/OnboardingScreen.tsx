import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';
import { ProblemIdentification } from '../components/onboarding/ProblemIdentification';
import { PersonalizedResponse } from '../components/onboarding/PersonalizedResponse';
import { ValueDemonstration } from '../components/onboarding/ValueDemonstration';
import { Paywall } from '../components/onboarding/Paywall';
import { Button } from '../components/ui/Button';
import { saveUserPreferences } from '../utils/storage';

const { width } = Dimensions.get('window');

const OnboardingContent = ({ navigation }: any) => {
    const { step, setStep, selectedProblems } = useOnboarding();
    const { colors: themeColors } = useTheme();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, [step]);

    const handleNext = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (step < 4) {
            setStep(step + 1);
        } else {
            // Finalize Onboarding
            await saveUserPreferences({
                onboardingComplete: true,
                dailyGoalMinutes: 120, // Default goal
                selectedSubjectIds: [], // User can add later
                isPro: false,
                fullName: 'Student', // Default or could be collected in a later flow
                academicLevel: selectedProblems.join(', '), // Reusing field or adding one
            });
            navigation.replace('Home');
        }
    };

    const handleSkip = () => {
        setStep(4); // Skip to paywall or home
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <ProblemIdentification />;
            case 2: return <PersonalizedResponse />;
            case 3: return <ValueDemonstration />;
            case 4: return <Paywall />;
            default: return <ProblemIdentification />;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header with Progress and Skip */}
                <View style={styles.header}>
                    <View style={styles.progressContainer}>
                        {[1, 2, 3, 4].map((i) => (
                            <View
                                key={i}
                                style={[
                                    styles.progressBar,
                                    step >= i && { backgroundColor: themeColors.primary },
                                    { width: (width - spacing.lg * 2 - 48) / 4 - 8 }
                                ]}
                            />
                        ))}
                    </View>
                    {step < 4 && (
                        <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={styles.skipButton}>Skip</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Content */}
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    {renderStep()}
                </Animated.View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Button
                        title={step === 4 ? "Start Free Trial" : "Continue"}
                        onPress={handleNext}
                        disabled={step === 1 && selectedProblems.length === 0}
                    />
                    {step === 4 && (
                        <TouchableOpacity
                            onPress={() => navigation.replace('Home')}
                            style={styles.dismissButton}
                        >
                            <Text style={styles.dismissText}>Not now, take me to my dashboard</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export const OnboardingScreen = (props: any) => {
    return (
        <OnboardingProvider>
            <OnboardingContent {...props} />
        </OnboardingProvider>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        marginBottom: spacing.lg,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.backgroundTertiary,
        borderRadius: 2,
    },
    skipButton: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    footer: {
        paddingVertical: spacing.xl,
    },
    dismissButton: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    dismissText: {
        ...typography.caption,
        color: colors.textTertiary,
        textDecorationLine: 'underline',
    },
});
