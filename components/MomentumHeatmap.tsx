import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

interface MomentumHeatmapProps {
    data: { date: string; count: number }[]; // count is duration in seconds
    color?: string;
}

const SQUARE_SIZE = 12;
const SQUARE_GUTTER = 4;
const COLUMN_WIDTH = SQUARE_SIZE + SQUARE_GUTTER;
const WEEKS_TO_SHOW = 18; // Roughly 4-5 months

export const MomentumHeatmap = ({ data, color = colors.primary }: MomentumHeatmapProps) => {
    const heatmapData = useMemo(() => {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);

        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (WEEKS_TO_SHOW * 7));
        startDate.setHours(0, 0, 0, 0);

        // Map data for quick lookup
        const dataMap = new Map();
        data.forEach(d => {
            dataMap.set(d.date, d.count);
        });

        const weeks = [];
        let currentDay = new Date(startDate);

        // Align to start of week (Sunday)
        const dayOfWeek = currentDay.getDay();
        currentDay.setDate(currentDay.getDate() - dayOfWeek);

        for (let w = 0; w <= WEEKS_TO_SHOW; w++) {
            const daysInWeek = [];
            for (let d = 0; d < 7; d++) {
                const dateStr = currentDay.toISOString().split('T')[0];
                const value = dataMap.get(dateStr) || 0;

                daysInWeek.push({
                    date: dateStr,
                    value,
                    intensity: getIntensity(value)
                });

                currentDay.setDate(currentDay.getDate() + 1);
            }
            weeks.push(daysInWeek);
        }
        return weeks;
    }, [data]);

    function getIntensity(seconds: number) {
        if (seconds === 0) return 0;
        if (seconds < 1800) return 0.2; // < 30m
        if (seconds < 3600) return 0.4; // < 1h
        if (seconds < 7200) return 0.6; // < 2h
        if (seconds < 14400) return 0.8; // < 4h
        return 1; // 4h+
    }

    const months = useMemo(() => {
        const monthLabels: { label: string; x: number }[] = [];
        let lastMonth = -1;

        heatmapData.forEach((week, weekIndex) => {
            const midDate = new Date(week[0].date);
            const month = midDate.getMonth();
            if (month !== lastMonth) {
                monthLabels.push({
                    label: midDate.toLocaleString('default', { month: 'short' }),
                    x: weekIndex * COLUMN_WIDTH
                });
                lastMonth = month;
            }
        });
        return monthLabels;
    }, [heatmapData]);

    const totalWidth = (WEEKS_TO_SHOW + 1) * COLUMN_WIDTH;
    const totalHeight = 7 * COLUMN_WIDTH + 20; // +20 for month labels

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Study Momentum</Text>
                <View style={styles.legend}>
                    <Text style={styles.legendText}>Less</Text>
                    {[0, 0.2, 0.5, 0.8, 1].map((lvl, i) => (
                        <View
                            key={i}
                            style={[
                                styles.legendBox,
                                { backgroundColor: color, opacity: lvl === 0 ? 0.05 : lvl }
                            ]}
                        />
                    ))}
                    <Text style={styles.legendText}>More</Text>
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Svg width={totalWidth} height={totalHeight}>
                    {/* Month Labels */}
                    {months.map((m, i) => (
                        <SvgText
                            key={i}
                            x={m.x}
                            y={10}
                            fontSize="9"
                            fill={colors.textTertiary}
                            fontWeight="600"
                        >
                            {m.label}
                        </SvgText>
                    ))}

                    {/* Grid */}
                    <G y={20}>
                        {heatmapData.map((week, weekIndex) => (
                            <G key={weekIndex} x={weekIndex * COLUMN_WIDTH}>
                                {week.map((day, dayIndex) => (
                                    <Rect
                                        key={dayIndex}
                                        y={dayIndex * COLUMN_WIDTH}
                                        width={SQUARE_SIZE}
                                        height={SQUARE_SIZE}
                                        rx={2}
                                        ry={2}
                                        fill={color}
                                        fillOpacity={day.intensity === 0 ? 0.05 : day.intensity}
                                    />
                                ))}
                            </G>
                        ))}
                    </G>
                </Svg>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginVertical: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h3,
        color: colors.text,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendBox: {
        width: 8,
        height: 8,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 9,
        color: colors.textSecondary,
        marginHorizontal: 2,
    },
    scrollContent: {
        paddingRight: spacing.lg,
    }
});
