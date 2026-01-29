import { Statistics, Subject, StudySession } from '../types';
import { AchievementBadge } from './calculations';

export const generateReportHTML = (
    period: string,
    stats: Statistics,
    subjects: Subject[],
    sessions: StudySession[],
    achievements: AchievementBadge[]
): string => {
    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0) / 60;
    const unlockedBadges = achievements.filter(a => a.unlocked);

    // Prepare SVG Donut Data
    const validSubjects = subjects.filter(s => s.totalStudyTime > 0);
    const totalSubjectTime = validSubjects.reduce((acc, s) => acc + s.totalStudyTime, 0);

    let currentOffset = 0;
    const donutSegments = validSubjects.map(s => {
        const percentage = (s.totalStudyTime / totalSubjectTime) * 100;
        const dashArray = `${percentage} ${100 - percentage}`;
        const dashOffset = -currentOffset;
        currentOffset += percentage;
        return `<circle cx="21" cy="21" r="15.915" fill="transparent" stroke="${s.color}" stroke-width="3" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}"></circle>`;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 0; }
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: #020617; /* Deepest Indigo-Black */
            color: #F8FAFC;
            margin: 0;
            padding: 60px;
            min-height: 100vh;
        }
        .bg-glow {
            position: fixed;
            top: -100px;
            right: -100px;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
            z-index: -1;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 50px;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .logo-box {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #6366F1, #A855F7);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
        }
        .app-title {
            font-size: 32px;
            font-weight: 900;
            background: linear-gradient(to right, #F8FAFC, #94A3B8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -1.5px;
        }
        .period-label {
            font-size: 14px;
            font-weight: 800;
            color: #6366F1;
            text-transform: uppercase;
            letter-spacing: 4px;
            margin-top: 5px;
        }
        .main-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 25px;
            margin-bottom: 50px;
        }
        .stat-card {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 24px;
            padding: 30px;
            position: relative;
            overflow: hidden;
        }
        .stat-card::after {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(to right, transparent, rgba(99, 102, 241, 0.3), transparent);
        }
        .stat-value {
            font-size: 42px;
            font-weight: 800;
            color: #F8FAFC;
            margin-bottom: 5px;
            text-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
        }
        .stat-label {
            font-size: 12px;
            font-weight: 700;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .visual-section {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 40px;
            margin-bottom: 50px;
        }
        .chart-container {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 32px;
            padding: 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .donut-svg {
            width: 180px;
            height: 180px;
            transform: rotate(-90deg);
        }
        .legend {
            flex: 1;
            margin-left: 40px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 14px;
            font-weight: 600;
        }
        .legend-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 12px;
        }
        .badge-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .badge-mini {
            background: #1E293B;
            border-radius: 16px;
            padding: 15px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.03);
        }
        .badge-mini-icon { font-size: 24px; margin-bottom: 8px; }
        .badge-mini-title { font-size: 11px; font-weight: 800; color: #94A3B8; text-transform: uppercase; }

        .session-log {
            margin-top: 40px;
            background: rgba(30, 41, 59, 0.3);
            border-radius: 24px;
            padding: 30px;
        }
        .log-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .log-item:last-child { border-bottom: 0; }
        .log-subject { font-weight: 700; font-size: 16px; }
        .log-duration { color: #6366F1; font-weight: 800; }

        .quote-banner {
            margin-top: 60px;
            padding: 40px;
            background: linear-gradient(135deg, #1E1B4B 0%, #020617 100%);
            border-radius: 32px;
            text-align: center;
            border: 1px solid #312E81;
        }
        .quote-text {
            font-size: 18px;
            font-style: italic;
            color: #C7D2FE;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="bg-glow"></div>
    
    <div class="header">
        <div>
            <div class="brand">
                <div class="logo-box">⚡</div>
                <div>
                    <div class="app-title">FocusFlow</div>
                    <div class="period-label">${period} Intelligence Report</div>
                </div>
            </div>
        </div>
        <div style="text-align: right">
            <div style="font-size: 12px; color: #64748B; font-weight: 700; letter-spacing: 1px;">ISSUE NO. ${new Date().getTime().toString().slice(-6)}</div>
            <div style="font-size: 14px; font-weight: 800; color: #F8FAFC; margin-top: 5px;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
    </div>

    <div class="main-stats">
        <div class="stat-card">
            <div class="stat-value">${Math.floor(totalMinutes)}<span style="font-size: 18px; color: #6366F1">Min</span></div>
            <div class="stat-label">Total Immersion</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${sessions.length}<span style="font-size: 18px; color: #A855F7">Hit</span></div>
            <div class="stat-label">Goals Accomplished</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.currentStreak}<span style="font-size: 18px; color: #F43F5E">Day</span></div>
            <div class="stat-label">Persistence Streak</div>
        </div>
    </div>

    <div class="visual-section">
        <div class="chart-container">
            <div>
                <svg class="donut-svg" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1E293B" stroke-width="3"></circle>
                    ${donutSegments}
                </svg>
            </div>
            <div class="legend">
                <div style="font-size: 12px; font-weight: 800; color: #64748B; margin-bottom: 20px; text-transform: uppercase;">Focus Allocation</div>
                ${validSubjects.slice(0, 5).map(s => `
                    <div class="legend-item">
                        <div class="legend-dot" style="background-color: ${s.color}; box-shadow: 0 0 10px ${s.color}66;"></div>
                        <div style="flex: 1">${s.name}</div>
                        <div style="color: #94A3B8">${Math.floor(s.totalStudyTime / 60)}m</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div>
            <div style="font-size: 12px; font-weight: 800; color: #64748B; margin-bottom: 20px; text-transform: uppercase;">Aura Badges</div>
            <div class="badge-grid">
                ${unlockedBadges.slice(0, 4).map(b => `
                    <div class="badge-mini">
                        <div class="badge-mini-icon">${b.icon}</div>
                        <div class="badge-mini-title">${b.title}</div>
                    </div>
                `).join('')}
                ${unlockedBadges.length === 0 ? '<div class="badge-mini" style="grid-column: span 2; color: #475569;">No Trophies Yet</div>' : ''}
            </div>
        </div>
    </div>

    <div class="section-title">Peak Performance Log</div>
    <div class="session-log">
        ${sessions.slice(-4).reverse().map(s => {
        const subject = subjects.find(sub => sub.id === s.subjectId);
        return `
                <div class="log-item">
                    <div class="log-subject">${subject?.icon || '📚'} ${subject?.name || 'Academic Session'}</div>
                    <div class="log-duration">+${Math.floor(s.duration / 60)}m</div>
                </div>
            `;
    }).join('')}
    </div>

    <div class="quote-banner">
        <div class="quote-text">"The only way to do great work is to love what you do. Stay consistent, stay focused."</div>
        <div style="color: #6366F1; font-weight: 800; font-size: 14px;">TEAM FOCUSFLOW</div>
    </div>

    <div style="text-align: center; margin-top: 40px; font-size: 11px; color: #334155; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
        End of Intelligence Report | Confidential to Student
    </div>
</body>
</html>
    `;
};
