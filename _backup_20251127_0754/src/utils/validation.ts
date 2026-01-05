// =====================================================
// Synthonia - Validation Utilities
// Versão: 2.0
// =====================================================

import type { ValidationRule, ValidationSchema, FormErrors } from '../types';

// =====================================================
// VALIDATION RULES
// =====================================================

export const validationRules = {
    // User validation
    email: [
        {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Email inválido'
        }
    ],
    name: [
        {
            required: true,
            message: 'Nome é obrigatório'
        },
        {
            min: 2,
            message: 'Nome deve ter pelo menos 2 caracteres'
        }
    ],
    password: [
        {
            required: true,
            message: 'Senha é obrigatória'
        },
        {
            min: 6,
            message: 'Senha deve ter pelo menos 6 caracteres'
        }
    ],

    // Daily data validation
    sleep_quality: [
        {
            min: 1,
            max: 10,
            message: 'Qualidade do sono deve estar entre 1 e 10'
        }
    ],
    sleep_duration: [
        {
            min: 0,
            max: 24,
            message: 'Duração do sono deve estar entre 0 e 24 horas'
        }
    ],
    sleep_regularity: [
        {
            min: 1,
            max: 10,
            message: 'Regularidade do sono deve estar entre 1 e 10'
        }
    ],
    fatigue_level: [
        {
            min: 1,
            max: 10,
            message: 'Nível de fadiga deve estar entre 1 e 10'
        }
    ],
    exhaustion: [
        {
            min: 1,
            max: 10,
            message: 'Nível de exaustão deve estar entre 1 e 10'
        }
    ],
    mood: [
        {
            min: 1,
            max: 10,
            message: 'Humor deve estar entre 1 e 10'
        }
    ],
    muscle_soreness: [
        {
            min: 1,
            max: 10,
            message: 'Dor muscular deve estar entre 1 e 10'
        }
    ],
    stress_level: [
        {
            min: 1,
            max: 10,
            message: 'Nível de estresse deve estar entre 1 e 10'
        }
    ],
    tqr: [
        {
            min: 0,
            max: 20,
            message: 'TQR deve estar entre 0 e 20'
        }
    ],
    psr: [
        {
            min: 0,
            max: 100,
            message: 'PSR deve estar entre 0 e 100'
        }
    ],
    resting_hr: [
        {
            min: 30,
            max: 200,
            message: 'Frequência cardíaca deve estar entre 30 e 200 bpm'
        }
    ],
    hrv: [
        {
            min: 0,
            max: 300,
            message: 'HRV deve estar entre 0 e 300 ms'
        }
    ],

    // Training session validation
    duration: [
        {
            required: true,
            message: 'Duração é obrigatória'
        },
        {
            min: 1,
            max: 1440,
            message: 'Duração deve estar entre 1 e 1440 minutos (24h)'
        }
    ],
    rpe: [
        {
            required: true,
            message: 'RPE é obrigatório'
        },
        {
            min: 1,
            max: 10,
            message: 'RPE deve estar entre 1 e 10'
        }
    ],
    training_type: [
        {
            required: true,
            message: 'Tipo de treino é obrigatório'
        }
    ],
    volume: [
        {
            min: 0,
            message: 'Volume deve ser maior que 0'
        }
    ],
    intensity: [
        {
            min: 0,
            max: 10,
            message: 'Intensidade deve estar entre 0 e 10'
        }
    ]
} as const;

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

/**
 * Valida um único campo
 */
export function validateField(
    fieldName: string,
    value: any,
    rules: ValidationRule[]
): string | null {
    for (const rule of rules) {
        // Required validation
        if (rule.required && (value === undefined || value === null || value === '')) {
            return rule.message;
        }

        // Skip other validations if value is empty and not required
        if (!rule.required && (value === undefined || value === null || value === '')) {
            continue;
        }

        // Min validation
        if (rule.min !== undefined && Number(value) < rule.min) {
            return rule.message;
        }

        // Max validation
        if (rule.max !== undefined && Number(value) > rule.max) {
            return rule.message;
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(String(value))) {
            return rule.message;
        }

        // Custom validation
        if (rule.custom && !rule.custom(value)) {
            return rule.message;
        }
    }

    return null;
}

/**
 * Valida um formulário completo
 */
export function validateForm(
    data: Record<string, any>,
    schema: ValidationSchema
): FormErrors {
    const errors: FormErrors = {};

    for (const [fieldName, rules] of Object.entries(schema)) {
        const error = validateField(fieldName, data[fieldName], rules);
        if (error) {
            errors[fieldName] = error;
        }
    }

    return errors;
}

/**
 * Verifica se há erros no formulário
 */
export function hasErrors(errors: FormErrors): boolean {
    return Object.keys(errors).length > 0;
}

/**
 * Limpa erros de um campo específico
 */
export function clearFieldError(
    errors: FormErrors,
    fieldName: string
): FormErrors {
    const newErrors = { ...errors };
    delete newErrors[fieldName];
    return newErrors;
}

// =====================================================
// SANITIZATION FUNCTIONS
// =====================================================

/**
 * Sanitiza um número
 */
export function sanitizeNumber(
    value: any,
    min?: number,
    max?: number
): number | null {
    const num = Number(value);

    if (isNaN(num)) {
        return null;
    }

    if (min !== undefined && num < min) {
        return min;
    }

    if (max !== undefined && num > max) {
        return max;
    }

    return num;
}

/**
 * Sanitiza uma string
 */
export function sanitizeString(value: any, maxLength?: number): string {
    const str = String(value || '').trim();

    if (maxLength && str.length > maxLength) {
        return str.substring(0, maxLength);
    }

    return str;
}

/**
 * Sanitiza uma data
 */
export function sanitizeDate(value: any): string | null {
    if (!value) return null;

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString().split('T')[0];
}

// =====================================================
// SCHEMA PRESETS
// =====================================================

export const dailyDataSchema: ValidationSchema = {
    sleep_quality: validationRules.sleep_quality,
    sleep_duration: validationRules.sleep_duration,
    sleep_regularity: validationRules.sleep_regularity,
    fatigue_level: validationRules.fatigue_level,
    exhaustion: validationRules.exhaustion,
    mood: validationRules.mood,
    muscle_soreness: validationRules.muscle_soreness,
    stress_level: validationRules.stress_level,
    tqr: validationRules.tqr,
    psr: validationRules.psr,
    resting_hr: validationRules.resting_hr,
    hrv: validationRules.hrv
};

export const trainingSessionSchema: ValidationSchema = {
    duration: validationRules.duration,
    rpe: validationRules.rpe,
    training_type: validationRules.training_type,
    volume: validationRules.volume,
    intensity: validationRules.intensity
};

export const authSchema: ValidationSchema = {
    email: validationRules.email,
    name: validationRules.name,
    password: validationRules.password
};
