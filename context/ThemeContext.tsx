import React, { createContext, useContext, useState, useEffect } from 'react';
import { colors as baseColors, gradients as baseGradients, AURAS, Aura } from '../constants/theme';
import { getUserPreferences, saveUserPreferences } from '../utils/storage';
import { UserPreferences } from '../types';

interface ThemeContextType {
    colors: typeof baseColors;
    gradients: typeof baseGradients & { aura: string[] };
    activeAura: Aura;
    setAura: (auraId: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeAura, setActiveAura] = useState<Aura>(AURAS[0]);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);

    useEffect(() => {
        const loadPrefs = async () => {
            const prefs = await getUserPreferences();
            setPreferences(prefs);
            if (prefs?.activeThemeId) {
                const aura = AURAS.find(a => a.id === prefs.activeThemeId);
                if (aura) setActiveAura(aura);
            }
        };
        loadPrefs();
    }, []);

    const setAura = async (auraId: string) => {
        const aura = AURAS.find(a => a.id === auraId);
        if (aura) {
            setActiveAura(aura);
            if (preferences) {
                const updatedPrefs = { ...preferences, activeThemeId: auraId };
                setPreferences(updatedPrefs);
                await saveUserPreferences(updatedPrefs);
            }
        }
    };

    // Derived theme objects
    const themeColors = {
        ...baseColors,
        primary: activeAura.primary,
        secondary: activeAura.secondary,
        // Update primary shades if needed
        primaryLight: activeAura.primary + '30',
        primaryDark: activeAura.primary,
    };

    const themeGradients = {
        ...baseGradients,
        primary: activeAura.gradients,
        aura: [activeAura.primary + '15', '#000000'], // Adds an ambient thematic background
    };

    return (
        <ThemeContext.Provider value={{ colors: themeColors, gradients: themeGradients, activeAura, setAura }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
