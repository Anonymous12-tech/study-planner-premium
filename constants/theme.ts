export interface Aura {
    id: string;
    name: string;
    primary: string;
    secondary: string;
    gradients: [string, string];
    unlockCriteria: {
        type: 'streak' | 'hours' | 'sessions';
        value: number;
    };
    description: string;
    isPremium?: boolean;
}

export const AURAS: Aura[] = [
    {
        id: 'default',
        name: 'Cyan Focus',
        primary: '#22D3EE',
        secondary: '#818CF8',
        gradients: ['#22D3EE', '#0891B2'],
        unlockCriteria: { type: 'streak', value: 0 },
        description: 'The classic focus aesthetic.',
    },
    {
        id: 'golden',
        name: 'Golden Focus',
        primary: '#F59E0B', // Amber 500
        secondary: '#D97706', // Amber 600
        gradients: ['#FCD34D', '#F59E0B'],
        unlockCriteria: { type: 'streak', value: 7 },
        description: 'Unlocks after a 7-day streak.',
    },
    {
        id: 'emerald',
        name: 'Emerald Deep Work',
        primary: '#10B981', // Emerald 500
        secondary: '#059669', // Emerald 600
        gradients: ['#34D399', '#10B981'],
        unlockCriteria: { type: 'hours', value: 50 },
        description: 'Unlocks after 50 hours of study.',
    },
    {
        id: 'ruby',
        name: 'Ruby Intensity',
        primary: '#EF4444', // Red 500
        secondary: '#B91C1C', // Red 700
        gradients: ['#F87171', '#EF4444'],
        unlockCriteria: { type: 'sessions', value: 100 },
        description: 'Unlocks after 100 study sessions.',
    },
    {
        id: 'midnight',
        name: 'Midnight Bloom',
        primary: '#C084FC', // Purple 400
        secondary: '#818CF8', // Indigo 400
        gradients: ['#E879F9', '#A855F7'],
        unlockCriteria: { type: 'streak', value: 14 },
        description: 'Unlocks after a 14-day streak.',
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk Edge',
        primary: '#F0ABFC', // Fuchsia 300
        secondary: '#A21CAF', // Fuchsia 700
        gradients: ['#F0ABFC', '#A21CAF'],
        unlockCriteria: { type: 'hours', value: 0 },
        description: 'Premium neon aesthetic for night owls.',
        isPremium: true,
    },
    {
        id: 'sakura',
        name: 'Sakura Zen',
        primary: '#FDA4AF', // Rose 300
        secondary: '#E11D48', // Rose 600
        gradients: ['#FECDD3', '#FDA4AF'],
        unlockCriteria: { type: 'streak', value: 0 },
        description: 'Calm and minimalist premium theme.',
        isPremium: true,
    },
    {
        id: 'oceanic',
        name: 'Oceanic Depth',
        primary: '#38BDF8', // Sky 400
        secondary: '#1E40AF', // Blue 800
        gradients: ['#7DD3FC', '#38BDF8'],
        unlockCriteria: { type: 'sessions', value: 0 },
        description: 'Deep blue immersion for focused work.',
        isPremium: true,
    },
];

export const colors = {
    // Dark theme base
    background: '#020617', // Deep near-black
    backgroundSecondary: '#0F172A', // Slate 900
    backgroundTertiary: '#1E293B', // Slate 800

    // Vibrant accents (Cyan/Violet as requested)
    primary: '#22D3EE', // Cyan
    primaryLight: '#67E8F9',
    primaryDark: '#0891B2',

    secondary: '#818CF8', // Violet/Indigo
    secondaryLight: '#A5B4FC',

    accent: '#F472B6', // Pink accent for variety
    accentLight: '#FB923C',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    // Text colors
    text: '#F8FAFC', // Slate 50
    textSecondary: '#CBD5E1', // Slate 300
    textTertiary: '#94A3B8', // Slate 400
    textMuted: '#64748B', // Slate 500

    // UI elements
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.05)',

    // Glass effect
    glass: 'rgba(255, 255, 255, 0.05)',
    glassStrong: 'rgba(255, 255, 255, 0.1)',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Subject colors
    subjectColors: [
        '#6366F1', // Indigo
        '#EC4899', // Pink
        '#14B8A6', // Teal
        '#F59E0B', // Amber
        '#8B5CF6', // Purple
        '#10B981', // Emerald
        '#F97316', // Orange
        '#06B6D4', // Cyan
        '#EF4444', // Red
        '#84CC16', // Lime
    ],
};

export const spacing = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: '700' as const,
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
    },
    bodyLarge: {
        fontSize: 18,
        fontWeight: '400' as const,
        lineHeight: 28,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    small: {
        fontSize: 12,
        fontWeight: '500' as any,
        lineHeight: 18,
    },
    tiny: {
        fontSize: 10,
        fontWeight: '600' as any,
        lineHeight: 14,
    },
};

export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
};

export const glassmorphism = {
    light: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
    },
    medium: {
        backgroundColor: colors.glassStrong,
        borderWidth: 1,
        borderColor: colors.border,
    },
};

export const gradients = {
    primary: ['#22D3EE', '#0891B2'],
    secondary: ['#818CF8', '#4F46E5'],
    accent: ['#F472B6', '#EC4899'],
    dark: ['#020617', '#0F172A'],
};

export default {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
    glassmorphism,
    gradients,
};
