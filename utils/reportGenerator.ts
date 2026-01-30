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
    // User "Goals" = StudyTodos (from "Add Goal" button)
    // User "Tasks" = StudyTasks (from "Add Task" button)
    const goalsCompleted = todos.filter(t => t.isCompleted).length;
    const tasksCompleted = tasks.filter(t => t.isCompleted).length;

    // Prepare SVG Donut Data (Period Specific)
    const subjectPeriodTotals: Record<string, number> = {};
    sessions.forEach(session => {
        subjectPeriodTotals[session.subjectId] = (subjectPeriodTotals[session.subjectId] || 0) + session.duration;
    });

    const validSubjects = subjects
        .map(s => ({ ...s, periodTime: subjectPeriodTotals[s.id] || 0 }))
        .filter(s => s.periodTime > 0);

    const totalPeriodTime = validSubjects.reduce((acc, s) => acc + s.periodTime, 0);

    let currentOffset = 0;
    const donutSegments = validSubjects.map(s => {
        const percentage = (s.periodTime / totalPeriodTime) * 100;
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
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
        
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            /* height: 100%; */ /* Removed for single page */
            background-color: #030014 !important; /* Total Void Black */
        }

        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #FFFFFF; /* Brighter for print */
            overflow: hidden;
        }

        /* Page Containers */
        /* .page {
            width: 100%;
            height: 296mm; 
            position: relative;
            padding: 40px;
            background-color: #030014;
            overflow: hidden; 
            page-break-after: always;
        }

        .page:last-child {
            page-break-after: auto;
        } */

        .container {
            width: 100%;
            height: 297mm;
            position: relative;
            padding: 30px; /* Compact padding */
            display: flex;
            flex-direction: column;
            z-index: 1;
        }

        .glow-1 {
            position: absolute;
            top: -100px;
            left: -100px;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
            z-index: -1;
        }
        .glow-2 {
            position: absolute;
            bottom: -100px;
            right: -100px;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(217, 70, 239, 0.1) 0%, transparent 70%);
            z-index: -1;
        }

        /* Header - Compact */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            border-left: 4px solid #06B6D4;
            padding-left: 15px;
            flex-shrink: 0;
        }

        .brand-name {
            font-size: 28px;
            font-weight: 900;
            color: #FFFFFF;
            letter-spacing: -1px;
            text-transform: uppercase;
        }
        .accent-text { color: #06B6D4; font-weight: 800; letter-spacing: 2px; }

        /* Stats - Compact */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 25px;
            flex-shrink: 0;
        }

        .stat-box {
            background: #0B0E23;
            border: 1px solid #1E293B;
            border-radius: 16px;
            padding: 15px;
            text-align: center;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .stat-box::after {
            content: "";
            position: absolute;
            bottom: 0; left: 20%; right: 20%; height: 2px;
            background: linear-gradient(to right, transparent, #06B6D4, transparent);
        }
        .stat-val { font-size: 32px; font-weight: 900; color: #FFFFFF; display: block; margin-bottom: 2px; }
        .stat-label { font-size: 9px; font-weight: 700; color: #E2E8F0; text-transform: uppercase; letter-spacing: 1.5px; }

        /* Visuals - Compact */
        .visuals {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 15px;
            margin-bottom: 25px;
            flex-shrink: 0;
        }

        .chart-box, .badges-box {
            background: #0B0E23;
            border-radius: 20px;
            padding: 20px;
            border: 1px solid #1E293B;
        }
        .chart-box { display: flex; align-items: center; justify-content: center; gap: 15px; }
        .badges-box { background: rgba(11, 14, 35, 0.8); border: 1px dashed #334155; }

        .donut-wrap { position: relative; width: 120px; height: 120px; }
        .donut-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .donut-inner { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 18px; }

        .legend { flex: 1; }
        .leg-item { display: flex; align-items: center; margin-bottom: 8px; font-size: 11px; font-weight: 600; }
        .leg-cap { width: 8px; height: 8px; border-radius: 2px; margin-right: 8px; }

        .badge-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 10px; }
        .b-mini { background: #161B33; border: 1px solid #2D3748; border-radius: 12px; padding: 10px; text-align: center; }
        .b-icon { font-size: 18px; margin-bottom: 2px; }
        .b-name { font-size: 8px; font-weight: 800; color: #CBD5E1; text-transform: uppercase; }

        /* Checklists - Flex Fill but Constrained */
        .checklist-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            flex-grow: 1; 
            margin-bottom: 20px;
            overflow: hidden;
        }

        .checklist-box {
            background: #0B0E23; border: 1px solid #1E293B; border-radius: 20px; padding: 20px;
            display: flex; flex-direction: column;
        }
        
        .box-title {
            font-size: 9px; font-weight: 800; color: #E2E8F0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;
            border-bottom: 1px solid #1E293B; padding-bottom: 5px;
            flex-shrink: 0;
        }

        .list-content {
            flex-grow: 1;
            /* No scroll, just cut off if too many */
            display: flex; flex-direction: column; gap: 8px;
        }

        .check-item { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #FFFFFF; }
        .check-item.done { text-decoration: line-through; color: #94A3B8; }
        .check-icon { font-size: 11px; }

        /* Footer Quote */
        .footer-quote-box {
            margin-top: auto; /* Push to bottom */
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #1E293B;
        }

        .big-quote {
            font-size: 20px;
            font-weight: 900;
            background: linear-gradient(to right, #ffffff, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            margin-bottom: 5px;
        }

        .brand-tiny {
            font-size: 10px; font-weight: 700; color: #94A3B8; letter-spacing: 2px; text-transform: uppercase;
        }

        /* Page 2 Specifics */
        /* .page-2-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }

        .mega-quote {
            font-size: 56px;
            font-weight: 900;
            line-height: 1.1;
            background: linear-gradient(to right, #ffffff, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            max-width: 90%;
            text-transform: uppercase;
            margin-bottom: 100px; 
        }

        .brand-bottom {
            position: absolute;
            bottom: 60px;
            left: 0;
            right: 0;
            text-align: center;
        } */

    </style>
</head>
<body style="margin: 0; padding: 0; overflow-y: hidden;">
    <!-- PAGE 1: DATA & STATS -->
    <div class="container">
        <div class="glow-1"></div>
        <div class="glow-2"></div>

        <!-- HEADER -->
        <div class="header">
            <div>
                <div class="brand-name">Focus<span class="accent-text">Flow</span></div>
                <div style="font-size: 9px; font-weight: 700; color: #E2E8F0; letter-spacing: 3px; margin-top: 2px; text-transform: uppercase;">
                    Performance Report // ${period}
                </div>
            </div>
            <div style="text-align: right">
                <div style="font-size: 11px; font-weight: 900; color: #FFFFFF;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div style="font-size: 8px; font-weight: 800; color: #06B6D4; margin-top: 2px; letter-spacing: 1px;">ID: ${new Date().getTime().toString().slice(-6)}</div>
            </div>
        </div>

        <!-- STATS -->
        <div class="stats-grid">
            <div class="stat-box">
                <span class="stat-val">${Math.floor(totalMinutes)}</span>
                <span class="stat-label">Min Focus</span>
            </div>
            <div class="stat-box">
                <span class="stat-val" style="color: #A855F7;">${goalsCompleted}</span>
                <span class="stat-label">Goals Done</span>
            </div>
            <div class="stat-box">
                <span class="stat-val" style="color: #D946EF;">${tasksCompleted}</span>
                <span class="stat-label">Sessions</span>
            </div>
        </div>

        <!-- VISUALS -->
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
                    <div style="font-size: 9px; font-weight: 800; color: #E2E8F0; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Resource Allocation</div>
                    ${validSubjects.slice(0, 4).map((s: any) => `
                        <div class="leg-item">
                            <div class="leg-cap" style="background-color: ${s.color};"></div>
                            <div style="flex: 1">${s.name}</div>
                            <div style="color: #94A3B8">${Math.floor(s.periodTime / 60)}m</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="badges-box">
                <div style="font-size: 9px; font-weight: 800; color: #E2E8F0; text-transform: uppercase; letter-spacing: 1px;">Achievements</div>
                <div class="badge-grid">
                    ${unlockedBadges.slice(0, 4).map(b => `
                        <div class="b-mini">
                            <div class="b-icon">${b.icon}</div>
                            <div class="b-name">${b.title}</div>
                        </div>
                    `).join('')}
                    ${unlockedBadges.length === 0 ? '<div style="grid-column: span 2; padding: 15px; color: #94A3B8; text-align: center; font-size: 9px;">No Activations</div>' : ''}
                </div>
            </div>
        </div>

        <!-- CHECKLISTS (LIMITED TO 6 ITEMS EACH TO FIT) -->
        <div class="checklist-grid">
            <div class="checklist-box">
                <div class="box-title">Goals Checklist</div>
                <div class="list-content">
                ${todos.length > 0 ? todos.slice(0, 6).map(t => `
                    <div class="check-item ${t.isCompleted ? 'done' : ''}">
                        <span class="check-icon">${t.isCompleted ? '☑' : '☐'}</span>
                        <span>${t.text}</span>
                    </div>
                `).join('') : '<div style="font-size: 10px; color: #CBD5E1; font-style: italic;">No goals recorded.</div>'}
                </div>
            </div>

            <div class="checklist-box">
                <div class="box-title">Study Tasks</div>
                <div class="list-content">
                ${tasks.length > 0 ? tasks.slice(0, 6).map(t => {
        const subject = subjects.find(sub => sub.id === t.subjectId);
        return `
                    <div class="check-item ${t.isCompleted ? 'done' : ''}">
                        <span class="check-icon">${t.isCompleted ? '☑' : '☐'}</span>
                        <span style="font-weight: 600; color: ${subject?.color || '#94A3B8'}">[${subject?.name || 'GEN'}]</span>
                        <span>${t.topic}</span>
                    </div>`;
    }).join('') : '<div style="font-size: 10px; color: #94A3B8; font-style: italic;">No sessions recorded.</div>'}
                </div>
            </div>
        </div>

        <!-- FOOTER QUOTE -->
        <div class="footer-quote-box">
            <div class="big-quote">"THE ONLY BAD WORKOUT IS THE ONE THAT DIDN'T HAPPEN."</div>
            <div class="brand-tiny">FOCUSFLOW PREMIUM REPORT</div>
        </div>
    </div>
</body>
</html>
    `;
};
