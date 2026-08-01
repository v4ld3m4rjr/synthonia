import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Brain } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
});

const signupSchema = z.object({
    email: z.string().email('Email inválido'),
    confirmEmail: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    fullName: z.string().min(2, 'Nome é obrigatório'),
    age: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
    trainingExperience: z.enum(['iniciante', 'intermediario', 'avancado']).optional(),
}).refine((data) => data.email === data.confirmEmail, {
    message: "Os emails não coincidem",
    path: ["confirmEmail"],
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type AuthFormData = z.infer<typeof signupSchema>;

export function RecoveryAuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCurriculo, setShowCurriculo] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<any>({
        resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    });

    const onSubmit = async (data: AuthFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password,
                });
                if (error) throw error;
                navigate('/recovery-dashboard');
            } else {
                const { error } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                    options: {
                        data: {
                            full_name: data.fullName,
                            role: 'subject',
                            age: data.age ? parseInt(data.age) : null,
                            weight: data.weight ? parseFloat(data.weight) : null,
                            height: data.height ? parseFloat(data.height) : null,
                            training_experience: data.trainingExperience || 'intermediario'
                        },
                    },
                });
                if (error) throw error;
                alert('Cadastro realizado! Verifique seu email se necessário.');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            
            <div className="w-full max-w-2xl relative z-10">
                {/* Logo and Profile Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-6 mb-6">
                        {/* Logo */}
                        <div className="relative group">
                            <img 
                                src="/logo.png" 
                                alt="Logo" 
                                className="w-24 h-24 object-contain drop-shadow-2xl transition-transform group-hover:scale-105"
                            />
                        </div>
                        
                        {/* Profile Photo with Curriculum Modal */}
                        <div className="relative">
                            <button
                                onClick={() => setShowCurriculo(true)}
                                className="relative w-20 h-20 rounded-full border-4 border-purple-400/50 overflow-hidden hover:border-purple-300 transition-all hover:scale-105 shadow-xl shadow-purple-500/20"
                            >
                                <img 
                                    src="/foto-perfil.png" 
                                    alt="Perfil" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                            </button>
                            <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1.5">
                                <Brain className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isLogin ? 'Bem-vindo ao Recovery Pro' : 'Crie sua Conta'}
                    </h1>
                    <p className="text-purple-200 text-center max-w-md">
                        Monitoramento científico de recuperação muscular e prontidão para o exercício
                    </p>
                </div>

                {/* Auth Form Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {!isLogin && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-purple-200">
                                        Nome Completo
                                    </label>
                                    <Input
                                        {...register('fullName')}
                                        placeholder="Seu nome completo"
                                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                    />
                                    {errors.fullName && <p className="text-xs text-red-400">{String(errors.fullName.message)}</p>}
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-purple-200">
                                            Idade
                                        </label>
                                        <Input
                                            {...register('age')}
                                            type="number"
                                            placeholder="Anos"
                                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-purple-200">
                                            Peso (kg)
                                        </label>
                                        <Input
                                            {...register('weight')}
                                            type="number"
                                            step="0.1"
                                            placeholder="Kg"
                                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-purple-200">
                                            Altura (m)
                                        </label>
                                        <Input
                                            {...register('height')}
                                            type="number"
                                            step="0.01"
                                            placeholder="Metros"
                                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-purple-200">
                                        Experiência de Treino
                                    </label>
                                    <select
                                        {...register('trainingExperience')}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
                                    >
                                        <option value="" className="bg-slate-800">Selecione...</option>
                                        <option value="iniciante" className="bg-slate-800">Iniciante (&lt;1 ano)</option>
                                        <option value="intermediario" className="bg-slate-800">Intermediário (1-3 anos)</option>
                                        <option value="avancado" className="bg-slate-800">Avançado (&gt;3 anos)</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-purple-200 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email
                            </label>
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="seu@email.com"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                            {errors.email && <p className="text-xs text-red-400">{String(errors.email.message)}</p>}
                        </div>

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-purple-200">
                                    Confirmar Email
                                </label>
                                <Input
                                    {...register('confirmEmail')}
                                    type="email"
                                    placeholder="Confirme seu email"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                                {errors.confirmEmail && <p className="text-xs text-red-400">{String(errors.confirmEmail.message)}</p>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-purple-200 flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Senha
                            </label>
                            <Input
                                {...register('password')}
                                type="password"
                                placeholder="••••••"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                            {errors.password && <p className="text-xs text-red-400">{String(errors.password.message)}</p>}
                        </div>

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-purple-200">
                                    Confirmar Senha
                                </label>
                                <Input
                                    {...register('confirmPassword')}
                                    type="password"
                                    placeholder="••••••"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                                {errors.confirmPassword && <p className="text-xs text-red-400">{String(errors.confirmPassword.message)}</p>}
                            </div>
                        )}

                        {error && (
                            <div className="p-3 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3" 
                            isLoading={isLoading}
                        >
                            {isLogin ? 'Entrar' : 'Cadastrar'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-purple-200 hover:text-white transition-colors"
                        >
                            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Curriculum Modal */}
            {showCurriculo && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCurriculo(false)}>
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-bold text-slate-800">Currículo</h3>
                            <button
                                onClick={() => setShowCurriculo(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <iframe 
                            src="/curriculo.pdf" 
                            className="w-full h-[70vh]"
                            title="Currículo"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
