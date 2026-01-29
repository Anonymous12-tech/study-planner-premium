import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../constants/theme';
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

const TabBarIcon = ({ focused, icon }: { focused: boolean; icon: string }) => {
    return (
        <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>
            {icon}
        </Text>
    );
};

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);

const MainTabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: colors.backgroundSecondary,
                borderTopColor: colors.border,
                borderTopWidth: 1,
                paddingBottom: spacing.sm,
                paddingTop: spacing.sm,
                height: 70,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600' as '600',
                marginTop: 4,
            },
        }}
    >
        <Tab.Screen
            name="Planner"
            component={PlannerScreen}
            options={{
                tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon="📅" />,
            }}
        />
        <Tab.Screen
            name="Study"
            component={StudyScreen}
            options={{
                tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon="⏱️" />,
            }}
        />
        <Tab.Screen
            name="Subjects"
            component={SubjectsScreen}
            options={{
                tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon="📚" />,
            }}
        />
        <Tab.Screen
            name="Deadlines"
            component={GoalsScreen}
            options={{
                tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon="🎯" />,
            }}
        />
        <Tab.Screen
            name="Stats"
            component={StatsScreen}
            options={{
                tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon="📊" />,
            }}
        />
    </Tab.Navigator>
);

const AppContent = () => {
    const { user, isLoading: authLoading } = useAuth();
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
