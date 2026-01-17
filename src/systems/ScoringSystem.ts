


export class ScoringSystem {

    /**
     * Calculates the total score for a simple additive questionnaire.
     * @param answers Record<questionId, value>
     */
    static calculateAdditiveScore(answers: Record<string, any>): number {
        let total = 0;
        Object.values(answers).forEach(val => {
            const num = Number(val);
            if (!isNaN(num)) total += num;
        });
        return total;
    }

    /**
     * Calculates Training Stress Score (TSS) (Estimated)
     * Formula: (Duration_min * RPE * constant) / arbitrary_scale
     * Using Foster's Method: Session RPE * Duration
     */
    static calculateSessionLoad(durationMin: number, rpe: number): number {
        return durationMin * rpe;
    }

    /**
     * Calculates Monotony
     * Mean Daily Load / Standard Deviation of Load (over 7 days)
     */
    static calculateMonotony(dailyLoads: number[]): number {
        if (dailyLoads.length < 2) return 0;

        const mean = dailyLoads.reduce((a, b) => a + b, 0) / dailyLoads.length;
        const variance = dailyLoads.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dailyLoads.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev === 0) return 0;
        return mean / stdDev;
    }

    /**
     * Calculates Strain
     * Daily Load * Monotony
     */
    static calculateStrain(dailyLoad: number, monotony: number): number {
        return dailyLoad * monotony;
    }

    /**
     * Calculates Acute Training Load (ATL) - Fatigue
     * EWMA with 7-day time constant
     */
    static calculateATL(todayLoad: number, prevATL: number): number {
        const timeConstant = 7;
        return (todayLoad * (2 / (timeConstant + 1))) + (prevATL * (1 - (2 / (timeConstant + 1))));
    }

    /**
     * Calculates Chronic Training Load (CTL) - Fitness
     * EWMA with 42-day time constant
     */
    static calculateCTL(todayLoad: number, prevCTL: number): number {
        const timeConstant = 42;
        return (todayLoad * (2 / (timeConstant + 1))) + (prevCTL * (1 - (2 / (timeConstant + 1))));
    }

    /**
     * Calculates Training Stress Balance (TSB) - Form
     * CTL - ATL
     */
    static calculateTSB(ctl: number, atl: number): number {
        return ctl - atl;
    }
}
