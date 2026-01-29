import { Statistics, Subject, StudySession, StudyTask, StudyTodo } from '../types';
import { AchievementBadge } from './calculations';

const isWithinPeriod = (dateStr: string, period: string): boolean => {
    // Parse YYYY-MM-DD manually to create local date at 00:00:00
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'day') {
        return date.getTime() === today.getTime();
    }

    if (period === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        // Include future dates if they exist (e.g. planner items)
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return date >= weekAgo && date <= nextWeek;
    }

    if (period === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return date >= monthStart && date <= monthEnd;
    }

    return false;
};

export const generateReportHTML = (
    period: string,
    stats: Statistics,
    subjects: Subject[],
    sessions: StudySession[],
    achievements: AchievementBadge[],
    allTasks: StudyTask[],
    allTodos: StudyTodo[]
): string => {
    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0) / 60;
    const unlockedBadges = achievements.filter(a => a.unlocked);

    // Filter Items by Period
    const tasks = allTasks.filter(t => isWithinPeriod(t.date, period));
    const todos = allTodos.filter(t => isWithinPeriod(t.date, period));

    // Calculate Completion for Stats
    const goalsCompleted = tasks.filter(t => t.isCompleted).length;

    // Prepare SVG Donut Data
    const validSubjects = subjects.filter(s => s.totalStudyTime > 0);
    const totalSubjectTime = validSubjects.reduce((acc, s) => acc + s.totalStudyTime, 0);

    let currentOffset = 0;
    const donutSegments = validSubjects.map(s => {
        const percentage = (s.totalStudyTime / totalSubjectTime) * 100;
        const dashArray = `${percentage} ${100 - percentage}`;
        const dashOffset = -currentOffset;
        currentOffset += percentage;
        return `<circle cx="21" cy="21" r="15.915" fill="transparent" stroke="${s.color}" stroke-width="4" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}"></circle>`;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A4; margin: 0; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: #030014 !important; /* Total Void Black */
            color: #E2E8F0;
            margin: 0;
            padding: 50px;
            min-height: 297mm;
            box-sizing: border-box;
        }

        .container {
            position: relative;
            z-index: 1;
        }

        .glow-1 {
            position: fixed;
            top: -100px;
            left: -100px;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
            z-index: -1;
        }
        .glow-2 {
            position: fixed;
            bottom: -100px;
            right: -100px;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(217, 70, 239, 0.1) 0%, transparent 70%);
            z-index: -1;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 50px;
            border-left: 4px solid #06B6D4;
            padding-left: 20px;
        }

        .brand-name {
            font-size: 38px;
            font-weight: 900;
            color: #FFFFFF;
            letter-spacing: -2px;
            text-transform: uppercase;
        }

        .accent-text { color: #06B6D4; font-weight: 800; letter-spacing: 2px; }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-box {
            background: #0B0E23;
            border: 1px solid #1E293B;
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .stat-box::after {
            content: "";
            position: absolute;
            bottom: 0; left: 10%; right: 10%; height: 2px;
            background: linear-gradient(to right, transparent, #06B6D4, transparent);
        }

        .stat-val {
            font-size: 48px; font-weight: 900; color: #F8FAFC; display: block; margin-bottom: 5px;
        }

        .stat-label {
            font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 2.5px;
        }

        .visuals {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 30px;
            margin-bottom: 40px;
        }

        .chart-box {
            background: #0B0E23;
            border-radius: 30px;
            padding: 40px;
            border: 1px solid #1E293B;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 30px;
        }

        .donut-wrap { position: relative; width: 160px; height: 160px; }
        .donut-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .donut-inner {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            font-size: 24px; font-weight: 800; color: #06B6D4;
        }

        .legend { flex: 1; }
        .leg-item { display: flex; align-items: center; margin-bottom: 12px; font-size: 13px; font-weight: 600; }
        .leg-cap { width: 8px; height: 8px; border-radius: 2px; margin-right: 12px; }

        .badges-box {
            background: rgba(11, 14, 35, 0.8);
            border-radius: 30px;
            padding: 30px;
            border: 1px dashed #334155;
        }

        .badge-grid {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;
        }

        .b-mini {
            background: #161B33; border: 1px solid #2D3748; border-radius: 16px; padding: 15px; text-align: center;
        }
        .b-icon { font-size: 24px; margin-bottom: 5px; }
        .b-name { font-size: 10px; font-weight: 800; color: #CBD5E1; text-transform: uppercase; }

        .checklist-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        .checklist-box {
            background: #0B0E23; border: 1px solid #1E293B; border-radius: 24px; padding: 25px;
        }
        
        .box-title {
            font-size: 11px; font-weight: 800; color: #94A3B8; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;
            border-bottom: 1px solid #1E293B; padding-bottom: 10px;
        }

        .check-item {
            display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 13px; color: #E2E8F0;
        }
        .check-item.done { text-decoration: line-through; color: #475569; }
        .check-icon { font-size: 14px; }
        
        .footer-banner {
            margin-top: 50px; padding: 30px; background: linear-gradient(135deg, #0B0E23 0%, #030014 100%);
            border: 1px solid #06B6D4; border-radius: 30px; text-align: center;
        }
        .quote { font-size: 18px; font-weight: 700; color: #FFFFFF; margin-bottom: 10px; letter-spacing: -0.5px; }

    </style>
</head>
<body>
    <div class="container">
        <div class="glow-1"></div>
        <div class="glow-2"></div>

        <div class="header">
            <div>
                <div class="brand-name">Focus<span class="accent-text">Flow</span></div>
                <div style="font-size: 12px; font-weight: 700; color: #94A3B8; letter-spacing: 3px; margin-top: 5px; text-transform: uppercase;">
                    Performance Report // ${period}
                </div>
            </div>
            <div style="text-align: right">
                <div style="font-size: 14px; font-weight: 900; color: #FFFFFF;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div style="font-size: 10px; font-weight: 800; color: #06B6D4; margin-top: 4px; letter-spacing: 1px;">REPORT ID: ${new Date().getTime().toString().slice(-6)}</div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-box">
                <span class="stat-val">${Math.floor(totalMinutes)}</span>
                <span class="stat-label">Min Focus</span>
            </div>
            <div class="stat-box">
                <span class="stat-val" style="color: #A855F7;">${goalsCompleted}</span>
                <span class="stat-label">Goals Completed</span>
            </div>
            <div class="stat-box">
                <span class="stat-val" style="color: #D946EF;">${stats.currentStreak}</span>
                <span class="stat-label">Day Streak</span>
            </div>
        </div>

        <div class="visuals">
            <div class="chart-box">
                <div class="donut-wrap">
                    <svg class="donut-svg" viewBox="0 0 42 42">
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#121826" stroke-width="4"></circle>
                        ${donutSegments}
                    </svg>
                    <div class="donut-inner">⚡</div>
                </div>
                <div class="legend">
                    <div style="font-size: 10px; font-weight: 800; color: #94A3B8; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Resource Allocation</div>
                    ${validSubjects.slice(0, 4).map(s => `
                        <div class="leg-item">
                            <div class="leg-cap" style="background-color: ${s.color};"></div>
                            <div style="flex: 1">${s.name}</div>
                            <div style="color: #64748B">${Math.floor(s.totalStudyTime / 60)}m</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="badges-box">
                <div style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">Achievements Unlocked</div>
                <div class="badge-grid">
                    ${unlockedBadges.slice(0, 4).map(b => `
                        <div class="b-mini">
                            <div class="b-icon">${b.icon}</div>
                            <div class="b-name">${b.title}</div>
                        </div>
                    `).join('')}
                    ${unlockedBadges.length === 0 ? '<div style="grid-column: span 2; padding: 20px; color: #475569; text-align: center; font-size: 12px;">No Achievements Yet</div>' : ''}
                </div>
            </div>
        </div>

        <div class="checklist-grid">
            <div class="checklist-box">
                <div class="box-title">Goals Checklist</div>
                ${tasks.length > 0 ? tasks.map(t => {
        const subject = subjects.find(sub => sub.id === t.subjectId);
        return `
                    <div class="check-item ${t.isCompleted ? 'done' : ''}">
                        <span class="check-icon">${t.isCompleted ? '☑' : '☐'}</span>
                        <span style="font-weight: 600; color: ${subject?.color || '#94A3B8'}">[${subject?.name || 'GEN'}]</span>
                        <span>${t.topic}</span>
                    </div>`;
    }).join('') : '<div style="font-size: 12px; color: #475569; font-style: italic;">No goals set for this period.</div>'}
            </div>

            <div class="checklist-box">
                <div class="box-title">Tasks Checklist</div>
                ${todos.length > 0 ? todos.map(t => `
                    <div class="check-item ${t.isCompleted ? 'done' : ''}">
                        <span class="check-icon">${t.isCompleted ? '☑' : '☐'}</span>
                        <span>${t.text}</span>
                    </div>
                `).join('') : '<div style="font-size: 12px; color: #475569; font-style: italic;">No tasks recorded.</div>'}
            </div>
        </div>

        <div class="footer-banner">
            <div class="quote">STAY HUNGRY. STAY FOCUSED.</div>
            <div style="color: #64748B; font-weight: 700; font-size: 12px; letter-spacing: 1px;">FOCUSFLOW PREMIUM REPORT</div>
        </div>
    </div>
</body>
</html>
    `;
};
