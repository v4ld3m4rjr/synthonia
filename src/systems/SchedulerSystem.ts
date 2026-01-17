import { differenceInDays, isSameDay } from 'date-fns';
import { questionnaires } from '../data/questionnaires';

export interface ScheduledTask {
    id: string;
    type: 'questionnaire' | 'metric';
    title: string;
    questionnaireId?: string;
    priority: 'high' | 'medium' | 'low';
    dueDate: Date;
}

export const SCHEDULE_RULES: Record<string, { frequencyDays: number; preferredDayOfWeek?: number }> = {
    'PHQ9': { frequencyDays: 14 }, // Every 2 weeks
    'GAD7': { frequencyDays: 7 },  // Weekly
    'YMRS': { frequencyDays: 7 },  // Weekly
    'DAILY_PHYSICAL': { frequencyDays: 1 }, // Daily
    'DAILY_MENTAL': { frequencyDays: 1 },   // Daily
};

export class SchedulerSystem {
    static getPendingTasks(lastCompletions: Record<string, Date>): ScheduledTask[] {
        const tasks: ScheduledTask[] = [];
        const today = new Date();

        // Check Daily Metrics
        const lastDailyPhysical = lastCompletions['DAILY_PHYSICAL'];
        if (!lastDailyPhysical || !isSameDay(lastDailyPhysical, today)) {
            tasks.push({
                id: 'daily-physical',
                type: 'metric',
                title: 'Monitoramento Físico Diário',
                priority: 'high',
                dueDate: today
            });
        }

        const lastDailyMental = lastCompletions['DAILY_MENTAL'];
        if (!lastDailyMental || !isSameDay(lastDailyMental, today)) {
            tasks.push({
                id: 'daily-mental',
                type: 'metric',
                title: 'Monitoramento Mental Diário',
                priority: 'high',
                dueDate: today
            });
        }

        // Check Questionnaires
        questionnaires.forEach(q => {
            const rule = SCHEDULE_RULES[q.id];
            if (!rule) return;

            const lastCompleted = lastCompletions[q.id];
            const daysSince = lastCompleted
                ? differenceInDays(today, lastCompleted)
                : Infinity;

            if (daysSince >= rule.frequencyDays) {
                tasks.push({
                    id: `q-${q.id}`,
                    type: 'questionnaire',
                    title: q.title,
                    questionnaireId: q.id,
                    priority: 'medium',
                    dueDate: today
                });
            }
        });

        return tasks.sort((a, b) => (a.priority === 'high' ? -1 : 1));
    }
}
