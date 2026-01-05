// =====================================================
// Synthonia - Authentication Screen
// Versão: 2.0 - Rebuilt with robust validation
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { authHelpers, supabase, ensureSupabaseConfigured } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import {
  Activity, Target, Users, Award, TrendingUp, Brain,
  Mail, Lock, User as UserIcon, Calendar, Shield
} from 'lucide-react';
import SynthoniaLogo from '../ui/SynthoniaLogo';
import CustomDateInputLight from '../ui/CustomDateInputLight';
import type { User, UserMetadata } from '../../types';
import { validateForm, authSchema, validationRules, validateField as validateSingleField } from '../../utils/validation';
import { parseSupabaseError, formatErrorMessage, logError } from '../../utils/errorHandling';
import type { FormErrors } from '../../types';

// =====================================================
// TYPES
// =====================================================

interface Coach {
  id: string;
  name: string;
  email: string;
}

interface AuthFormData {
  email: string;
  password: string;
  name: string;
  birth_date: string;
  role: 'athlete' | 'coach' | 'physiotherapist';
  coach_id: string;
}

// =====================================================
// FEATURE CARD COMPONENT
// =====================================================

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="group bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-xl p-6 text-center space-y-3 hover:from-gray-700/80 hover:to-gray-800/80 transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1">
    <div className="flex justify-center transform group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="font-semibold text-base text-white">{title}</h3>
    <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
  </div>
);

// =====================================================
// MAIN COMPONENT
// =====================================================

const AuthScreen: React.FC = () => {
  // ===== State =====
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    birth_date: '',
    role: 'athlete',
    coach_id: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachLoading, setCoachLoading] = useState(false);
  const [signupEmailSent, setSignupEmailSent] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(!!supabase);

  // Refs
  const coachSelectRef = useRef<HTMLSelectElement | null>(null);

  // ===== Computed Values =====
  const redirectHint = import.meta.env.VITE_AUTH_REDIRECT_URL ||
    (typeof window !== 'undefined' ? `${window.location.origin}/` : '');

  // ===== Effects =====

  // Check Supabase configuration
  useEffect(() => {
    ensureSupabaseConfigured()
      .then((client) => setSupabaseReady(!!client))
      .catch(() => setSupabaseReady(false));
  }, []);

  // Load coaches when role is athlete
  useEffect(() => {
    if (!isLogin && formData.role === 'athlete' && supabaseReady) {
      loadCoaches();
    }
  }, [isLogin, formData.role, supabaseReady]);

  // ===== Handlers =====

  /**
   * Load available coaches
   */
  const loadCoaches = async () => {
    setCoachLoading(true);
    try {
      const { data, error } = await supabase!
        .from('users')
        .select('id, name, email')
        .eq('role', 'coach')
        .order('name');

      if (error) {
        logError(error, 'Load Coaches');
        setCoaches([]);
      } else {
        setCoaches(data || []);
      }
    } catch (err) {
      logError(err, 'Load Coaches');
      setCoaches([]);
    } finally {
      setCoachLoading(false);
    }
  };

  /**
   * Validate a single field
   */
  const validateField = (fieldName: keyof AuthFormData) => {
    const value = formData[fieldName];
    let fieldRules = validationRules[fieldName as keyof typeof validationRules];

    // Special case: coach_id only required for athletes
    if (fieldName === 'coach_id' && formData.role === 'athlete') {
      fieldRules = [
        {
          required: true,
          message: 'Selecione um coach'
        }
      ];
    }

    if (!fieldRules) return;

    const error = validateSingleField(fieldName, value, fieldRules);

    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  };

  /**
   * Handle input change
   */
  const handleChange = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabaseReady) {
      alert('⚠️ Supabase não está configurado. Configure primeiro.');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        // ===== LOGIN =====
        const loginErrors = validateForm(
          { email: formData.email, password: formData.password },
          { email: authSchema.email, password: authSchema.password }
        );

        if (Object.keys(loginErrors).length > 0) {
          setErrors(loginErrors);
          setLoading(false);
          return;
        }

        const { error } = await authHelpers.signIn(formData.email, formData.password);

        if (error) {
          const parsedError = parseSupabaseError(error);
          logError(error, 'Login');
          alert(`❌ ${parsedError.message}`);
        }
      } else {
        // ===== SIGNUP =====
        const signupData: Record<string, any> = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          birth_date: formData.birth_date
        };

        // Add coach_id for athletes
        if (formData.role === 'athlete') {
          signupData.coach_id = formData.coach_id;
        }

        const signupErrors = validateForm(signupData, {
          email: authSchema.email,
          password: authSchema.password,
          name: authSchema.name,
          birth_date: [
            {
              required: true,
              message: 'Data de nascimento é obrigatória'
            }
          ],
          ...(formData.role === 'athlete' && {
            coach_id: [
              {
                required: true,
                message: 'Selecione um coach'
              }
            ]
          })
        });

        if (Object.keys(signupErrors).length > 0) {
          setErrors(signupErrors);
          setLoading(false);

          // Focus on first error field
          const firstErrorKey = Object.keys(signupErrors)[0];
          if (firstErrorKey === 'coach_id' && coachSelectRef.current) {
            coachSelectRef.current.focus();
          }
          return;
        }

        const userData: UserMetadata = {
          name: formData.name,
          role: formData.role,
          birth_date: formData.birth_date,
          ...(formData.coach_id && { coach_id: formData.coach_id })
        };

        const { error } = await authHelpers.signUp(
          formData.email,
          formData.password,
          userData
        );

        if (error) {
          const parsedError = parseSupabaseError(error);
          logError(error, 'Signup');
          alert(`❌ ${parsedError.message}`);
        } else {
          setSignupEmailSent(true);
          alert(`✅ Conta criada com sucesso!\\n\\nVerifique seu email para confirmar o cadastro.\\n\\n📧 Email: ${formData.email}`);
        }
      }
    } catch (err) {
      logError(err, 'Auth Submit');
      alert(`❌ ${formatErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend confirmation email
   */
  const handleResend = async () => {
    if (!formData.email) {
      alert('⚠️ Informe seu email para reenviar a confirmação.');
      return;
    }

    try {
      const { error } = await authHelpers.resendSignupEmail(formData.email);

      if (error) {
        const parsedError = parseSupabaseError(error);
        alert(`❌ ${parsedError.message}`);
      } else {
        alert('✅ Email de confirmação reenviado!\\n\\nVerifique sua caixa de entrada e spam.');
      }
    } catch (err) {
      logError(err, 'Resend Email');
      alert(`❌ ${formatErrorMessage(err)}`);
    }
  };

  /**
   * Toggle between login and signup
   */
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setSignupEmailSent(false);
  };

  // ===== Render =====

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-center md:justify-start mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <SynthoniaLogo />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Synthonia
              </h1>
              <p className="text-xs md:text-sm text-gray-300">Treinamento inteligente e bem-estar integrado</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Features Section */}
          <div className="space-y-6 order-2 lg:order-1">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Otimize seu desempenho
              </h2>
              <p className="text-gray-300 text-sm md:text-base">
                Monitore treinos, recuperação e bem-estar em uma plataforma integrada
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Activity className="h-8 w-8 text-blue-400" />}
                title="Monitoramento Diário"
                description="Acompanhe sono, fadiga, humor e recuperação"
              />
              <FeatureCard
                icon={<Target className="h-8 w-8 text-purple-400" />}
                title="Análise de Treinos"
                description="TSS, RPE, TRIMP e métricas avançadas"
              />
              <FeatureCard
                icon={<TrendingUp className="h-8 w-8 text-green-400" />}
                title="Insights Inteligentes"
                description="Recomendações baseadas em dados"
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-yellow-400" />}
                title="Coach & Atleta"
                description="Acompanhamento profissional integrado"
              />
            </div>
          </div>

          {/* Auth Form */}
          <Card className="shadow-2xl border-gray-700/50 order-1 lg:order-2">
            <CardHeader>
              <h2 className="text-xl md:text-2xl font-bold text-white text-center">
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </h2>
              <p className="text-sm text-gray-400 text-center mt-2">
                {isLogin
                  ? 'Acesse sua conta para continuar'
                  : 'Comece sua jornada de otimização'}
              </p>
            </CardHeader>

            <CardContent className="p-6">
              {signupEmailSent ? (
                // Email sent confirmation
                <div className="space-y-4 text-center">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <Mail className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Email Enviado!
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Enviamos um link de confirmação para:
                    </p>
                    <p className="text-blue-400 font-medium mb-4">
                      {formData.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      Verifique sua caixa de entrada e spam
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleResend}
                      variant="outline"
                      className="w-full"
                    >
                      Reenviar Email
                    </Button>
                    <Button
                      onClick={toggleMode}
                      variant="ghost"
                      className="w-full"
                    >
                      Voltar para Login
                    </Button>
                  </div>
                </div>
              ) : (
                // Auth form
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="inline h-4 w-4 mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => validateField('email')}
                      className={`w-full px-4 py-3 bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'
                        } rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="seu@email.com"
                      disabled={loading}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Lock className="inline h-4 w-4 mr-2" />
                      Senha
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onBlur={() => validateField('password')}
                      className={`w-full px-4 py-3 bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-gray-700'
                        } rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Signup fields */}
                  {!isLogin && (
                    <>
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <UserIcon className="inline h-4 w-4 mr-2" />
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          onBlur={() => validateField('name')}
                          className={`w-full px-4 py-3 bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'
                            } rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          placeholder="João Silva"
                          disabled={loading}
                        />
                        {errors.name && (
                          <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                        )}
                      </div>

                      {/* Birth Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Calendar className="inline h-4 w-4 mr-2" />
                          Data de Nascimento
                        </label>
                        <CustomDateInputLight
                          value={formData.birth_date}
                          onChange={(value) => handleChange('birth_date', value)}
                          onBlur={() => validateField('birth_date')}
                          error={errors.birth_date}
                          disabled={loading}
                        />
                        {errors.birth_date && (
                          <p className="text-red-400 text-xs mt-1">{errors.birth_date}</p>
                        )}
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Shield className="inline h-4 w-4 mr-2" />
                          Tipo de Conta
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) => handleChange('role', e.target.value as any)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          disabled={loading}
                        >
                          <option value="athlete">Atleta</option>
                          <option value="coach">Coach</option>
                          <option value="physiotherapist">Fisioterapeuta</option>
                        </select>
                      </div>

                      {/* Coach selection for athletes */}
                      {formData.role === 'athlete' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Users className="inline h-4 w-4 mr-2" />
                            Selecione seu Coach
                          </label>
                          <select
                            ref={coachSelectRef}
                            value={formData.coach_id}
                            onChange={(e) => handleChange('coach_id', e.target.value)}
                            onBlur={() => validateField('coach_id')}
                            className={`w-full px-4 py-3 bg-gray-800 border ${errors.coach_id ? 'border-red-500' : 'border-gray-700'
                              } rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            disabled={loading || coachLoading}
                          >
                            <option value="">Selecione um coach...</option>
                            {coaches.map(coach => (
                              <option key={coach.id} value={coach.id}>
                                {coach.name} ({coach.email})
                              </option>
                            ))}
                          </select>
                          {errors.coach_id && (
                            <p className="text-red-400 text-xs mt-1">{errors.coach_id}</p>
                          )}
                          {coachLoading && (
                            <p className="text-gray-400 text-xs mt-1">Carregando coaches...</p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Submit button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading || !supabaseReady}
                  >
                    {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                  </Button>

                  {/* Toggle mode */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      disabled={loading}
                    >
                      {isLogin
                        ? 'Não tem conta? Criar uma agora'
                        : 'Já tem conta? Fazer login'}
                    </button>
                  </div>

                  {/* Redirect hint */}
                  {!isLogin && redirectHint && (
                    <p className="text-xs text-gray-500 text-center mt-4">
                      Após confirmar o email, você será redirecionado para: {redirectHint}
                    </p>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;