// [AI Generated] Data: 19/12/2024
// Descrição: Página de autenticação com design inspirado nos chakras
// Gerado por: Cursor AI
// Versão: React 18.2.0, React Hook Form 7.48.2
// AI_GENERATED_CODE_START
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, User, Mail, Lock, Sparkles } from 'lucide-react'

interface AuthFormData {
  email: string
  password: string
  fullName?: string
  profileType?: 'athlete' | 'trainer' | 'physiotherapist'
}

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signUp } = useAuth()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthFormData>()

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true)
    setError('')
    
    try {
      if (isSignUp) {
        await signUp(data.email, data.password, data.fullName!, data.profileType!)
      } else {
        await signIn(data.email, data.password)
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background com padrão de mandala */}
      <div className="absolute inset-0 mandala-pattern opacity-30" />
      
      {/* Elementos decorativos flutuantes */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-chakra-heart/20 to-chakra-throat/20 blur-xl animate-float" />
      <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-gradient-to-br from-chakra-crown/20 to-chakra-third/20 blur-xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-10 w-24 h-24 rounded-full bg-gradient-to-br from-chakra-solar/20 to-chakra-sacral/20 blur-xl animate-float" style={{ animationDelay: '4s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-effect rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-chakra-crown to-chakra-third flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-chakra-crown to-chakra-third bg-clip-text text-transparent mb-2">
              SynthonIA AI
            </h1>
            <p className="text-slate-600">
              {isSignUp ? 'Crie sua conta para começar' : 'Entre na sua conta'}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      {...register('fullName', { required: isSignUp ? 'Nome é obrigatório' : false })}
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-chakra-throat focus:border-transparent transition-all duration-200"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Perfil
                  </label>
                  <select
                    {...register('profileType', { required: isSignUp ? 'Selecione um tipo de perfil' : false })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-chakra-throat focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Selecione...</option>
                    <option value="athlete">Atleta</option>
                    <option value="trainer">Treinador</option>
                    <option value="physiotherapist">Fisioterapeuta</option>
                  </select>
                  {errors.profileType && (
                    <p className="text-red-500 text-sm mt-1">{errors.profileType.message}</p>
                  )}
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('email', { 
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-chakra-throat focus:border-transparent transition-all duration-200"
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('password', { 
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-chakra-throat focus:border-transparent transition-all duration-200"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-chakra-crown to-chakra-third text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processando...
                </div>
              ) : (
                isSignUp ? 'Criar Conta' : 'Entrar'
              )}
            </motion.button>
          </form>

          {/* Toggle entre login e cadastro */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-chakra-throat hover:text-chakra-third transition-colors duration-200 font-medium"
            >
              {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
// AI_GENERATED_CODE_END