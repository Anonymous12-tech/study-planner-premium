import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, spacing, typography } from '../constants/theme';

interface DonutData {
    name: string;
    population: number;
    color: string;
}

interface DonutChartProps {
    data: DonutData[];
    size?: number;
    strokeWidth?: number;
    centerLabel?: string;
    centerValue?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
    data,
    size = 200,
    strokeWidth = 20,
    centerLabel = 'Total',
    centerValue = '0h',
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = data.reduce((acc, item) => acc + item.population, 0);

    let currentOffset = 0;

    return (
        <View style={styles.container}>
            <View style={styles.chartWrapper}>
                <Svg width={size} height={size}>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        {/* Background circle */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={colors.backgroundTertiary}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        {/* Data segments */}
                        {data.map((item, index) => {
                            const percentage = (item.population / total) * 100;
                            const strokeDashoffset = circumference - (circumference * percentage) / 100;
                            const rotation = (currentOffset / total) * 360;
                            currentOffset += item.population;

                            return (
                                <Circle
                                    key={index}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke={item.color}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    transform={`rotate(${rotation}, ${size / 2}, ${size / 2})`}
                                />
                            );
                        })}
                    </G>
                </Svg>
                <View style={[styles.centerText, { width: size - strokeWidth * 2, height: size - strokeWidth * 2, borderRadius: (size - strokeWidth * 2) / 2 }]}>
                    <Text style={styles.centerValue}>{centerValue}</Text>
                    <Text style={styles.centerLabel}>{centerLabel}</Text>
                </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                {data.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: item.color }]} />
                        <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.legendValue}>{item.population}m</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        width: '100%',
    },
    chartWrapper: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerText: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerValue: {
        ...typography.h3,
        color: colors.text,
        fontSize: 24,
        fontWeight: '800' as any,
    },
    centerLabel: {
        ...typography.tiny,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    legend: {
        flex: 1,
        marginLeft: spacing.lg,
        gap: spacing.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendName: {
        ...typography.caption,
        color: colors.textSecondary,
        flex: 1,
    },
    legendValue: {
        ...typography.caption,
        color: colors.text,
        fontWeight: '700' as any,
    },
});
