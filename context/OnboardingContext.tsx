import React, { createContext, useContext, useState, ReactNode } from 'react';

export type StudyProblem = {
    id: string;
    label: string;
    solution: string;
    description: string;
};

export const STUDY_PROBLEMS: StudyProblem[] = [
    {
        id: 'focus',
        label: "I can't focus for more than 10 minutes",
        solution: "The Focus Reset System",
        description: "We'll implement a progressive focus training method that rebuilds your attention span from the ground up."
    },
    {
        id: 'procrastination',
        label: "I procrastinate until the last minute",
        solution: "Momentum Builder",
        description: "Our system uses micro-commitments to bypass the brain's resistance to starting complex tasks."
    },
    {
        id: 'overwhelmed',
        label: "I feel overwhelmed by my study load",
        solution: "Complexity Reducer",
        description: "We automatically break down your massive projects into bite-sized, manageable daily targets."
    },
    {
        id: 'forgetfulness',
        label: "I study hard but forget everything",
        solution: "Active Recall Booster",
        description: "Integrated spaced-repetition logic ensures you review material exactly when your brain is about to forget it."
    },
    {
        id: 'routine',
        label: "I lack a consistent study routine",
        solution: "Atomic Routine Creator",
        description: "We build high-performance habits by anchoring study sessions to your existing daily behaviors."
    },
    {
        id: 'distractions',
        label: "I get distracted by my phone/social media",
        solution: "Deep Work Shield",
        description: "Our dedicated focus mode creates a digital sanctuary, neutralizing the dopamine loops of social media."
    }
];

interface OnboardingContextType {
    step: number;
    selectedProblems: string[];
    setStep: (step: number) => void;
    toggleProblem: (problemId: string) => void;
    resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
    const [step, setStep] = useState(1);
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);

    const toggleProblem = (problemId: string) => {
        setSelectedProblems(prev => {
            if (prev.includes(problemId)) {
                return prev.filter(id => id !== problemId);
            }
            if (prev.length < 2) {
                return [...prev, problemId];
            }
            return [prev[0], problemId]; // Replace the last one if maxed
        });
    };

    const resetOnboarding = () => {
        setStep(1);
        setSelectedProblems([]);
    };

    return (
        <OnboardingContext.Provider value={{ step, selectedProblems, setStep, toggleProblem, resetOnboarding }}>
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};
