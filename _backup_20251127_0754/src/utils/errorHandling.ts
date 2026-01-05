// =====================================================
// Synthonia - Error Handling Utilities
// Versão: 2.0
// =====================================================

import type { Error as AppError } from '../types';

// =====================================================
// ERROR TYPES
// =====================================================

export enum ErrorType {
    VALIDATION = 'VALIDATION_ERROR',
    AUTHENTICATION = 'AUTH_ERROR',
    AUTHORIZATION = 'AUTHORIZATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    DATABASE = 'DATABASE_ERROR',
    NETWORK = 'NETWORK_ERROR',
    UNKNOWN = 'UNKNOWN_ERROR'
}

// =====================================================
// ERROR MESSAGES
// =====================================================

export const errorMessages = {
    // Authentication errors
    INVALID_CREDENTIALS: 'Email ou senha incorretos',
    USER_NOT_FOUND: 'Usuário não encontrado',
    EMAIL_IN_USE: 'Este email já está em uso',
    WEAK_PASSWORD: 'Senha muito fraca. Use pelo menos 6 caracteres',
    SESSION_EXPIRED: 'Sessão expirada. Faça login novamente',

    // Database errors
    CONNECTION_FAILED: 'Erro ao conectar com o banco de dados',
    QUERY_FAILED: 'Erro ao executar consulta',
    DUPLICATE_ENTRY: 'Já existe um registro para esta data',
    FOREIGN_KEY_VIOLATION: 'Referência inválida',

    // Validation errors
    REQUIRED_FIELD: 'Este campo é obrigatório',
    INVALID_FORMAT: 'Formato inválido',
    OUT_OF_RANGE: 'Valor fora do intervalo permitido',

    // Network errors
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
    TIMEOUT: 'Tempo limite excedido',

    // Generic errors
    UNKNOWN_ERROR: 'Ocorreu um erro inesperado',
    TRY_AGAIN: 'Tente novamente mais tarde'
} as const;

// =====================================================
// ERROR PARSING
// =====================================================

/**
 * Extrai mensagem de erro amigável de um erro do Supabase
 */
export function parseSupabaseError(error: any): AppError {
    const message = error?.message || '';
    const code = error?.code || '';

    // Authentication errors
    if (message.includes('Invalid login credentials') || code === 'invalid_credentials') {
        return {
            message: errorMessages.INVALID_CREDENTIALS,
            code: ErrorType.AUTHENTICATION
        };
    }

    if (message.includes('User not found') || code === 'user_not_found') {
        return {
            message: errorMessages.USER_NOT_FOUND,
            code: ErrorType.AUTHENTICATION
        };
    }

    if (message.includes('Email already exists') || message.includes('duplicate key')) {
        return {
            message: errorMessages.EMAIL_IN_USE,
            code: ErrorType.VALIDATION
        };
    }

    if (message.includes('Password should be at least')) {
        return {
            message: errorMessages.WEAK_PASSWORD,
            code: ErrorType.VALIDATION
        };
    }

    // Database errors
    if (message.includes('unique constraint') || message.includes('UNIQUE')) {
        return {
            message: errorMessages.DUPLICATE_ENTRY,
            code: ErrorType.DATABASE
        };
    }

    if (message.includes('foreign key') || message.includes('FOREIGN KEY')) {
        return {
            message: errorMessages.FOREIGN_KEY_VIOLATION,
            code: ErrorType.DATABASE
        };
    }

    if (message.includes('relation') && message.includes('does not exist')) {
        return {
            message: 'Tabela não encontrada. Execute as migrações do banco de dados.',
            code: ErrorType.DATABASE
        };
    }

    if (message.includes('column') && message.includes('does not exist')) {
        return {
            message: 'Coluna não encontrada. Verifique o schema do banco de dados.',
            code: ErrorType.DATABASE
        };
    }

    // RLS errors
    if (message.includes('row-level security') || message.includes('RLS')) {
        return {
            message: 'Você não tem permissão para acessar este recurso.',
            code: ErrorType.AUTHORIZATION
        };
    }

    // Network errors
    if (message.includes('Failed to fetch') || message.includes('Network')) {
        return {
            message: errorMessages.NETWORK_ERROR,
            code: ErrorType.NETWORK
        };
    }

    if (message.includes('timeout') || message.includes('TIMEOUT')) {
        return {
            message: errorMessages.TIMEOUT,
            code: ErrorType.NETWORK
        };
    }

    // Default
    return {
        message: message || errorMessages.UNKNOWN_ERROR,
        code: ErrorType.UNKNOWN,
        details: error
    };
}

/**
 * Formata erro para exibição ao usuário
 */
export function formatErrorMessage(error: any): string {
    if (typeof error === 'string') {
        return error;
    }

    if (error?.message) {
        return error.message;
    }

    return errorMessages.UNKNOWN_ERROR;
}

// =====================================================
// ERROR LOGGING
// =====================================================

/**
 * Loga erro no console (desenvolvimento) ou serviço de logging (produção)
 */
export function logError(error: any, context?: string): void {
    if (import.meta.env.DEV) {
        console.error(`[${context || 'Error'}]`, error);
    } else {
        // TODO: Enviar para serviço de logging (Sentry, LogRocket, etc)
        console.error(`[${context || 'Error'}]`, {
            message: formatErrorMessage(error),
            timestamp: new Date().toISOString()
        });
    }
}

// =====================================================
// ERROR HANDLING HELPERS
// =====================================================

/**
 * Wrapper para executar funções com tratamento de erro
 */
export async function withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: string
): Promise<{ data: T | null; error: AppError | null }> {
    try {
        const data = await fn();
        return { data, error: null };
    } catch (err) {
        const error = parseSupabaseError(err);
        logError(err, context);
        return { data: null, error };
    }
}

/**
 * Verifica se é um erro de rede
 */
export function isNetworkError(error: any): boolean {
    const message = error?.message || '';
    return (
        message.includes('Failed to fetch') ||
        message.includes('Network') ||
        message.includes('timeout') ||
        error?.code === ErrorType.NETWORK
    );
}

/**
 * Verifica se é um erro de autenticação
 */
export function isAuthError(error: any): boolean {
    const message = error?.message || '';
    return (
        message.includes('Invalid login') ||
        message.includes('User not found') ||
        message.includes('Session') ||
        error?.code === ErrorType.AUTHENTICATION
    );
}

/**
 * Verifica se é um erro de validação
 */
export function isValidationError(error: any): boolean {
    const message = error?.message || '';
    return (
        message.includes('constraint') ||
        message.includes('validation') ||
        message.includes('invalid') ||
        error?.code === ErrorType.VALIDATION
    );
}

// =====================================================
// RETRY LOGIC
// =====================================================

/**
 * Tenta executar uma função com retry em caso de erro de rede
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Só faz retry em erros de rede
            if (!isNetworkError(error)) {
                throw error;
            }

            // Aguarda antes de tentar novamente
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }

    throw lastError;
}
