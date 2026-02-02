import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { colors as baseColors, spacing, typography, borderRadius, gradients as baseGradients, shadows } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { saveUserPreferences, addSubject } from '../utils/storage';
import { Subject } from '../types';

const { width } = Dimensions.get('window');

const EXAM_TYPES = ['High School', 'University', 'Medical', 'Engineering', 'Law', 'Other'];

const DEFAULT_SUBJECTS = [
    { name: 'Mathematics', color: '#22D3EE', icon: 'calculator' },
    { name: 'Physics', color: '#818CF8', icon: 'flash' },
    { name: 'Biology', color: '#10B981', icon: 'leaf' },
    { name: 'Chemistry', color: '#F472B6', icon: 'flask' },
    { name: 'History', color: '#FB923C', icon: 'library' },
    { name: 'Literature', color: '#EC4899', icon: 'book' },
];

export const OnboardingScreen = ({ navigation }: any) => {
    const { colors, gradients } = useTheme();
    const [step, setStep] = useState(0);
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [examType, setExamType] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<typeof DEFAULT_SUBJECTS>([]);
    const [dailyGoal, setDailyGoal] = useState(120); // minutes

    const handleNext = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (step < 3) {
            setStep(step + 1);
        } else {
            // Finalize
            const subjectPromises = (selectedSubjects || []).map(s => {
                const newSubject: Subject = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: s.name,
                    color: s.color,
                    icon: s.icon,
                    createdAt: Date.now(),
                    totalStudyTime: 0,
                };
                return addSubject(newSubject);
            });

            await Promise.all(subjectPromises);

            await saveUserPreferences({
                onboardingComplete: true,
                fullName,
                username,
                academicLevel: examType,
                dailyGoalMinutes: dailyGoal,
                selectedSubjectIds: [],
            });

            navigation.replace('Home');
        }
    };

    const renderIdentity = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.headline}>Who are you?</Text>
            <Text style={styles.subheadline}>Tell us your name and pick a username to personalize your profile.</Text>

            <View style={{ gap: spacing.lg }}>
                <View>
                    <Text style={[styles.label, { marginBottom: 8 }]}>Full Name</Text>
                    <Input
                        placeholder="Enter your name"
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                    />
                </View>
                <View>
                    <Text style={[styles.label, { marginBottom: 8 }]}>Username</Text>
                    <Input
                        placeholder="Choose a username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <Text style={{ color: baseColors.textSecondary, fontSize: 10, marginTop: 4 }}>
                        Available only for this account.
                    </Text>
                </View>
            </View>
        </View>
    );

    const toggleSubject = (subj: typeof DEFAULT_SUBJECTS[0]) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (selectedSubjects.some(s => s.name === subj.name)) {
            setSelectedSubjects(selectedSubjects.filter(s => s.name !== subj.name));
        } else {
            setSelectedSubjects([...selectedSubjects, subj]);
        }
    };

    const renderStep0 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.headline}>Achieve Academic Excellence</Text>
            <Text style={styles.subheadline}>Personalize your study experience for maximum productivity.</Text>

            <Text style={styles.label}>What are you preparing for?</Text>
            <View style={styles.chipGrid}>
                {EXAM_TYPES && EXAM_TYPES.map(type => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.chip,
                            examType === type && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                        ]}
                        onPress={() => {
                            setExamType(type);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                    >
                        <Text style={[styles.chipText, examType === type && { color: colors.primary, fontWeight: '600' }]}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.headline}>Select Your Subjects</Text>
            <Text style={styles.subheadline}>Pick the main areas you want to track. You can add more later.</Text>

            <View style={styles.subjectGrid}>
                {DEFAULT_SUBJECTS && DEFAULT_SUBJECTS.map(subj => {
                    const isSelected = selectedSubjects.some(s => s.name === subj.name);
                    return (
                        <TouchableOpacity
                            key={subj.name}
                            style={[
                                styles.subjectCard,
                                isSelected && { borderColor: subj.color, backgroundColor: subj.color + '10' }
                            ]}
                            onPress={() => toggleSubject(subj)}
                        >
                            <Ionicons
                                name={(isSelected ? subj.icon : `${subj.icon}-outline`) as any}
                                size={32}
                                color={isSelected ? subj.color : baseColors.textTertiary}
                                style={{ marginBottom: spacing.sm }}
                            />
                            <Text style={[styles.subjectName, isSelected && { color: subj.color }]}>
                                {subj.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.headline}>Set Daily Target</Text>
            <Text style={styles.subheadline}>How many minutes do you aim to study each day?</Text>

            <View style={styles.goalDisplay}>
                <Text style={[styles.goalValue, { color: colors.primary }]}>{Math.floor(dailyGoal / 60)}h {dailyGoal % 60}m</Text>
                <Text style={styles.goalLabel}>Daily Study Goal</Text>
            </View>

            <Slider
                style={styles.slider}
                minimumValue={30}
                maximumValue={480}
                step={15}
                value={dailyGoal}
                onValueChange={setDailyGoal}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.backgroundTertiary}
                thumbTintColor={colors.primary}
            />
        </View>
    );

    return (
        <View style={styles.container}>


            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.progressContainer}>
                    {[0, 1, 2, 3].map(i => (
                        <View
                            key={i}
                            style={[
                                styles.progressBar,
                                step >= i && { backgroundColor: colors.primary },
                                { width: (width - spacing.lg * 2) / 4 - 8 }
                            ]}
                        />
                    ))}
                </View>

                {step === 0 && renderIdentity()}
                {step === 1 && renderStep0()}
                {step === 2 && renderStep1()}
                {step === 3 && renderStep2()}
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={step === 3 ? "Get Started" : "Continue"}
                    onPress={handleNext}
                    disabled={
                        (step === 0 && (!fullName || !username)) ||
                        (step === 1 && !examType)
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseColors.background,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingTop: spacing.xxl,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: spacing.xxl,
    },
    progressBar: {
        height: 4,
        backgroundColor: baseColors.backgroundTertiary,
        borderRadius: 2,
    },
    progressBarActive: {
        // Dynamic mapping in JSX
    },
    stepContainer: {
        flex: 1,
    },
    headline: {
        ...typography.h1,
        color: baseColors.text,
        marginBottom: spacing.sm,
    },
    subheadline: {
        ...typography.body,
        color: baseColors.textSecondary,
        marginBottom: spacing.xxl,
    },
    label: {
        ...typography.h3,
        color: baseColors.text,
        marginBottom: spacing.md,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: baseColors.backgroundTertiary,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipActive: {
        // Dynamic mapping in JSX
    },
    chipText: {
        ...typography.body,
        color: baseColors.textSecondary,
    },
    chipTextActive: {
        // Dynamic mapping in JSX
    },
    subjectGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    subjectCard: {
        width: (width - spacing.lg * 2 - spacing.md) / 2,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        backgroundColor: baseColors.backgroundTertiary,
        borderWidth: 1,
        borderColor: 'transparent',
        alignItems: 'center',
    },
    subjectIcon: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    subjectName: {
        ...typography.body,
        color: baseColors.textSecondary,
        fontWeight: '600' as any,
    },
    goalDisplay: {
        alignItems: 'center',
        marginVertical: spacing.xxl,
    },
    goalValue: {
        fontSize: 48,
        fontWeight: '700' as any,
    },
    goalLabel: {
        ...typography.body,
        color: baseColors.textSecondary,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
});
