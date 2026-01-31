import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as baseColors, spacing, borderRadius } from '../constants/theme'; // Renamed to avoid conflict
import { useTheme } from '../context/ThemeContext'; // Added useTheme import
import { HomeScreen } from '../screens/HomeScreen';
import { StudyScreen } from '../screens/StudyScreen';
import { SubjectsScreen } from '../screens/SubjectsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PlannerScreen } from '../screens/PlannerScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { getUserPreferences } from '../utils/storage';
import { RootStackParamList } from '../types';
import { AuthProvider, useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabBarIcon = ({ focused, name, color }: { focused: boolean; name: any; color: string }) => {
    const { colors } = useTheme(); // Use theme colors
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {focused && (
                <View
                    style={{
                        position: 'absolute',
                        top: -10,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: colors.primary // Use theme primary color
                    }}
                />
            )}
            <Ionicons
                name={focused ? name : `${name}-outline`}
                size={22}
                color={color}
                style={{ opacity: focused ? 1 : 0.8 }}
            />
        </View>
    );
};

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);

const MainTabs = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', // Slightly translucent backgroundSecondary
                    borderTopColor: 'rgba(255, 255, 255, 0.05)',
                    borderTopWidth: 1,
                    paddingBottom: spacing.sm,
                    paddingTop: spacing.sm,
                    height: Platform.OS === 'ios' ? 88 : 70,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textTertiary,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '700',
                    marginTop: 2,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                },
            }}
        >
            <Tab.Screen
                name="Planner"
                component={PlannerScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon focused={focused} name="calendar" color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Study"
                component={StudyScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon focused={focused} name="timer" color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Subjects"
                component={SubjectsScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon focused={focused} name="library" color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Deadlines"
                component={GoalsScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon focused={focused} name="flag" color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Stats"
                component={StatsScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon focused={focused} name="stats-chart" color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const AppContent = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { colors } = useTheme();
    const [isConfigLoading, setIsConfigLoading] = useState(true);
    const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Login');

    useEffect(() => {
        const checkPrefs = async () => {
            const prefs = await getUserPreferences();
            if (prefs?.onboardingComplete) {
                setInitialRoute('Home');
            } else {
                setInitialRoute('Onboarding');
            }
            setIsConfigLoading(false);
        };
        checkPrefs();
    }, [user]);

    if (authLoading || isConfigLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <Stack.Screen name="Login" component={AuthStack} />
                ) : (
                    <>
                        {initialRoute === 'Onboarding' && (
                            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        )}
                        <Stack.Screen name="Home" component={MainTabs} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export const AppNavigator = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);
