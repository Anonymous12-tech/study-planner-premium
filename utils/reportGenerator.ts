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

        /* Cyberpunk Glows */
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
            margin-bottom: 60px;
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

        .accent-text {
            color: #06B6D4; /* Cyan */
            font-weight: 800;
            letter-spacing: 2px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 50px;
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
            font-size: 48px;
            font-weight: 900;
            color: #F8FAFC;
            display: block;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 11px;
            font-weight: 700;
            color: #94A3B8;
            text-transform: uppercase;
            letter-spacing: 2.5px;
        }

        .visuals {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 30px;
            margin-bottom: 50px;
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
            position: absolute;
            top: 50%; left: 50%; transform: translate(-50%, -50%);
            font-size: 24px; font-weight: 800; color: #06B6D4;
        }

        .legend { flex: 1; }
        .leg-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 13px;
            font-weight: 600;
        }
        .leg-cap {
            width: 8px; height: 8px; border-radius: 2px; margin-right: 12px;
        }

        .badges-box {
            background: rgba(11, 14, 35, 0.8);
            border-radius: 30px;
            padding: 30px;
            border: 1px dashed #334155;
        }

        .badge-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 20px;
        }

        .b-mini {
            background: #161B33;
            border: 1px solid #2D3748;
            border-radius: 16px;
            padding: 15px;
            text-align: center;
        }

        .b-icon { font-size: 24px; margin-bottom: 5px; }
        .b-name { font-size: 10px; font-weight: 800; color: #CBD5E1; text-transform: uppercase; }

        .log-section {
            background: #0B0E23;
            border-radius: 24px;
            padding: 30px;
            border: 1px solid #1E293B;
        }

        .log-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px solid #1E293B;
        }
        .log-row:last-child { border-bottom: 0; }
        .log-subj { font-weight: 800; color: #F1F5F9; font-size: 16px; }
        .log-dur { color: #06B6D4; font-weight: 900; }

        .footer-banner {
            margin-top: 60px;
            padding: 40px;
            background: linear-gradient(135deg, #0B0E23 0%, #030014 100%);
            border: 1px solid #06B6D4;
            border-radius: 30px;
            text-align: center;
        }

        .quote {
            font-size: 20px;
            font-weight: 700;
            color: #FFFFFF;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        
    </style>
</head>
<body>
    <div class="container">
        <div class="glow-1"></div>
        <div class="glow-2"></div>

        <div class="header">
            <div>
                <div class="brand-name">Focus<span class="accent-text">Vault</span></div>
                <div style="font-size: 12px; font-weight: 700; color: #94A3B8; letter-spacing: 3px; margin-top: 5px; text-transform: uppercase;">
                    System Intelligence // ${period}
                </div>
            </div>
            <div style="text-align: right">
                <div style="font-size: 14px; font-weight: 900; color: #FFFFFF;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div style="font-size: 10px; font-weight: 800; color: #06B6D4; margin-top: 4px; letter-spacing: 1px;">ENCRYPTED_LOGS: ${new Date().getTime().toString().slice(-6)}</div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-box">
                <span class="stat-val">${Math.floor(totalMinutes)}</span>
                <span class="stat-label">Min Focus</span>
            </div>
            <div class="stat-box">
                <span class="stat-val">${sessions.length}</span>
                <span class="stat-label">Tasks Done</span>
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
                <div style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">Combat Achievements</div>
                <div class="badge-grid">
                    ${unlockedBadges.slice(0, 4).map(b => `
                        <div class="b-mini">
                            <div class="b-icon">${b.icon}</div>
                            <div class="b-name">${b.title}</div>
                        </div>
                    `).join('')}
                    ${unlockedBadges.length === 0 ? '<div style="grid-column: span 2; padding: 20px; color: #475569; text-align: center; font-size: 12px;">NO DATA COLLECTED</div>' : ''}
                </div>
            </div>
        </div>

        <div style="font-size: 12px; font-weight: 800; color: #94A3B8; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Recent Neural Sessions</div>
        <div class="log-section">
            ${sessions.slice(-4).reverse().map(s => {
        const subject = subjects.find(sub => sub.id === s.subjectId);
        return `
                    <div class="log-row">
                        <div class="log-subj">${subject?.icon || '🧠'} ${subject?.name || 'Academic Uplink'}</div>
                        <div class="log-dur">+${Math.floor(s.duration / 60)}m</div>
                    </div>
                `;
    }).join('')}
        </div>

        <div class="footer-banner">
            <div class="quote">STAY HUNGRY. STAY FOCUSED.</div>
            <div style="color: #64748B; font-weight: 700; font-size: 12px; letter-spacing: 1px;">GEN_V2 // STUDYFLOW_CORE</div>
        </div>
    </div>
</body>
</html>
    `;
};
