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

    // Preparation for Chart.js
    const subjectLabels = JSON.stringify(subjects.filter(s => s.totalStudyTime > 0).map(s => s.name));
    const subjectData = JSON.stringify(subjects.filter(s => s.totalStudyTime > 0).map(s => Math.floor(s.totalStudyTime / 60)));
    const subjectColors = JSON.stringify(subjects.filter(s => s.totalStudyTime > 0).map(s => s.color));

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #0F172A;
            color: #F8FAFC;
            margin: 0;
            padding: 40px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #1E293B;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .app-name {
            font-size: 28px;
            font-weight: 800;
            color: #6366F1;
            letter-spacing: -1px;
        }
        .report-type {
            font-size: 14px;
            font-weight: 600;
            color: #94A3B8;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 40px;
        }
        .card {
            background-color: #1E293B;
            border-radius: 16px;
            padding: 24px;
            border: 1px solid #334155;
            text-align: center;
        }
        .card-value {
            font-size: 32px;
            font-weight: 800;
            color: #F8FAFC;
            margin-bottom: 4px;
        }
        .card-label {
            font-size: 12px;
            color: #94A3B8;
            font-weight: 600;
            text-transform: uppercase;
        }
        .section-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 20px;
            color: #F8FAFC;
            display: flex;
            align-items: center;
        }
        .section-title::before {
            content: "";
            display: inline-block;
            width: 4px;
            height: 20px;
            background-color: #6366F1;
            margin-right: 12px;
            border-radius: 2px;
        }
        .charts-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }
        .badges-list {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 40px;
        }
        .badge-pill {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
            border: 1px solid rgba(99, 102, 241, 0.3);
            padding: 10px 18px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .badge-icon { font-size: 18px; }
        .footer {
            margin-top: 60px;
            text-align: center;
            color: #64748B;
            font-size: 12px;
            border-top: 1px solid #1E293B;
            padding-top: 30px;
        }
        canvas {
            max-width: 100%;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="app-name">FocusFlow Premium</div>
            <div class="report-type">Study Performance Report</div>
        </div>
        <div style="text-align: right">
            <div style="font-size: 20px; font-weight: 700;">${period.toUpperCase()} RECAP</div>
            <div style="color: #64748B; font-size: 12px;">Generated on ${new Date().toLocaleDateString()}</div>
        </div>
    </div>

    <div class="summary-grid">
        <div class="card">
            <div class="card-value">${Math.floor(totalMinutes)}m</div>
            <div class="card-label">Focus Time</div>
        </div>
        <div class="card">
            <div class="card-value">${sessions.length}</div>
            <div class="card-label">Goals Crushed</div>
        </div>
        <div class="card">
            <div class="card-value">${stats.currentStreak} 🔥</div>
            <div class="card-label">Day Streak</div>
        </div>
    </div>

    <div class="charts-container">
        <div>
            <div class="section-title">Focus Distribution</div>
            <canvas id="subjectChart"></canvas>
        </div>
        <div>
            <div class="section-title">Achievements Unlocked</div>
            <div class="badges-list">
                ${unlockedBadges.length > 0
            ? unlockedBadges.map(b => `
                        <div class="badge-pill">
                            <span class="badge-icon">${b.icon}</span>
                            <span>${b.title}</span>
                        </div>
                    `).join('')
            : '<div style="color: #64748B">Start studying to unlock achievements!</div>'
        }
            </div>
        </div>
    </div>

    <div class="section-title">Final Motivation</div>
    <div style="background-color: #1E293B; padding: 30px; border-radius: 16px; border: 1px dashed #475569; text-align: center; color: #94A3B8; font-style: italic;">
        "Success is the sum of small efforts, repeated day in and day out."
    </div>

    <div class="footer">
        Powered by StudyPlanner Premium ⚡ | Stay Focused. Stay Great.
    </div>

    <script>
        const ctx = document.getElementById('subjectChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ${subjectLabels},
                datasets: [{
                    data: ${subjectData},
                    backgroundColor: ${subjectColors},
                    borderColor: '#0F172A',
                    borderWidth: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#94A3B8', font: { size: 12, weight: '600' } }
                    }
                },
                cutout: '70%'
            }
        });
    </script>
</body>
</html>
    `;
};
