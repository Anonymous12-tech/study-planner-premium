import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card } from './ui/Card';
import { colors, spacing, typography } from '../constants/theme';
import { DailyStats } from '../types';
import { getWeekDateStrings } from '../utils/calculations';

interface StatisticsChartProps {
    dailyStats: DailyStats[];
}

export const StatisticsChart: React.FC<StatisticsChartProps> = ({ dailyStats }) => {
    const screenWidth = Dimensions.get('window').width;
    const weekDates = getWeekDateStrings();

    // Prepare data for the last 7 days
    const chartData = (weekDates || []).map(date => {
        const stat = dailyStats.find(s => s.date === date);
        return stat ? stat.totalStudyTime / 3600 : 0; // Convert to hours
    });

    const labels = (weekDates || []).map(date => {
        const d = new Date(date);
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    });

    const data = {
        labels,
        datasets: [
            {
                data: chartData.length > 0 ? chartData : [0],
                color: (opacity = 1) => colors.primary,
                strokeWidth: 3,
            },
        ],
    };

    const chartConfig = {
        backgroundColor: colors.backgroundSecondary,
        backgroundGradientFrom: colors.backgroundSecondary,
        backgroundGradientTo: colors.backgroundTertiary,
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        labelColor: (opacity = 1) => colors.textSecondary,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: colors.primary,
            fill: colors.background,
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: colors.border,
            strokeWidth: 1,
        },
    };

    return (
        <Card style={styles.card}>
            <Text style={styles.title}>Weekly Study Time</Text>
            <LineChart
                data={data}
                width={screenWidth - spacing.lg * 4}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero
            />
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.md,
    },
    chart: {
        marginVertical: spacing.sm,
        borderRadius: 16,
    },
});
