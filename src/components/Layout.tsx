// [AI Generated] Data: 19/12/2024
// Descrição: Módulo de Recovery com questionário de bem-estar e visualização de dados
// Gerado por: Cursor AI
// Versão: React 18.2.0, React Hook Form 7.48.2, Recharts 2.8.0
// AI_GENERATED_CODE_START
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Heart, Moon, Zap, Brain, Smile, Activity, Save, TrendingUp, ArrowLeft } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface WellnessFormData {
  sleep_quality: number
  fatigue_level: number
  muscle_soreness: number
  stress_level: number
  mood_level: number
  prs_score: number
  notes?: string
}

interface RecoveryEntry {
  id: string
  date: string
  sleep_quality: number
  fatigue_level: number
  muscle_soreness: number
  stress_level: number
  mood_level: number
  prs_score: number
  notes: string | null
}

const wellnessItems = [
  {
    key: 'sleep_quality' as keyof WellnessFormData,
    label: 'Qualidade do Sono',
    icon: <Moon className="w-5 h-5" />,
    color: 'from-blue-500 to-indigo-600',
    description: 'Como você avalia a qualidade do seu sono?'
  },
  {
    key: 'fatigue_level' as keyof WellnessFormData,
    label: 'Nível de Fadiga',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-yellow-500 to-orange-600',
    description: 'Quão cansado você se sente?'
  },
  {
    key: 'muscle_soreness' as keyof WellnessFormData,
    label: 'Dor Muscular',
    icon: <Activity className="w-5 h-5" />,
    color: 'from-red-500 to-pink-600',
    description: 'Nível de dor ou desconforto muscular'
  },
  {
    key: 'stress_level' as keyof WellnessFormData,
    label: 'Nível de Estresse',
    icon: <Brain className="w-5 h-5" />,
    color: 'from-purple-500 to-violet-600',
    description: 'Quão estressado você se sente?'
  },
  {
    key: 'mood_level' as keyof WellnessFormData,
    label: 'Humor Geral',
    icon: <Smile className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-600',
    description: 'Como está seu humor hoje?'
  },
  {
    key: 'prs_score' as keyof WellnessFormData,
    label: 'Percepção de Recuperação (PRS)',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-chakra-heart to-emerald-500',
    description: 'O quão recuperado você se sente? (0-10)'
  }
]

export default function RecoveryModule() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<RecoveryEntry[]>([])
  const [showForm, setShowForm] = useState(true)
  const [todayEntry, setTodayEntry] = useState<RecoveryEntry | null>(null)

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<WellnessFormData>({
    defaultValues: {
      sleep_quality: 5,
      fatigue_level: 5,
      muscle_soreness: 5,
      stress_level: 5,
      mood_level: 5,
      prs_score: 5
    }
  })

  const watchedValues = watch()

  useEffect(() => {
    if (user) {
      fetchRecoveryEntries()
      checkTodayEntry()
    }
  }, [user])

  const fetchRecoveryEntries = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('recovery_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Erro ao buscar entradas de recuperação:', error)
    }
  }

  const checkTodayEntry = async () => {
    if (!user) return

    const today = format(new Date(), 'yyyy-MM-dd')
    
    try {
      const { data, error } = await supabase
        .from('recovery_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (data) {
        setTodayEntry(data)
        setShowForm(false)
        // Preencher o formulário com os dados existentes
        reset(data)
      }
    } catch (error) {
      // Não há entrada para hoje, mostrar formulário
      setShowForm(true)
    }
  }

  const onSubmit = async (data: WellnessFormData) => {
    if (!user) return

    setLoading(true)
    const today = format(new Date(), 'yyyy-MM-dd')

    try {
      if (todayEntry) {
        // Atualizar entrada existente
        const { error } = await supabase
          .from('recovery_entries')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', todayEntry.id)

        if (error) throw error
      } else {
        // Criar nova entrada
        const { error } = await supabase
          .from('recovery_entries')
          .insert({
            user_id: user.id,
            date: today,
            ...data
          })

        if (error) throw error
      }

      await fetchRecoveryEntries()
      await checkTodayEntry()
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao salvar entrada de recuperação:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateReadinessScore = () => {
    const values = watchedValues
    // Fórmula simples: média ponderada onde valores altos de sono, humor e PRS são bons
    // e valores altos de fadiga, dor e estresse são ruins
    const positiveFactors = (values.sleep_quality + values.mood_level + values.prs_score) / 3
    const negativeFactors = (values.fatigue_level + values.muscle_soreness + values.stress_level) / 3
    const readiness = ((positiveFactors + (10 - negativeFactors)) / 2)
    return Math.round(readiness * 10) / 10
  }

  const getReadinessColor = (score: number) => {
    if (score >= 7) return 'text-green-500'
    if (score >= 5) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getReadinessLabel = (score: number) => {
    if (score >= 7) return 'Excelente'
    if (score >= 5) return 'Moderada'
    return 'Baixa'
  }

  // Preparar dados para gráficos
  const chartData = entries.slice(0, 14).reverse().map(entry => ({
    date: format(new Date(entry.date), 'dd/MM', { locale: ptBR }),
    sono: entry.sleep_quality,
    fadiga: 10 - entry.fatigue_level, // Inverter para que maior seja melhor
    dor: 10 - entry.muscle_soreness,
    estresse: 10 - entry.stress_level,
    humor: entry.mood_level,
    prs: entry.prs_score
  }))

  const radarData = todayEntry ? [
    { subject: 'Sono', A: todayEntry.sleep_quality, fullMark: 10 },
    { subject: 'Energia', A: 10 - todayEntry.fatigue_level, fullMark: 10 },
    { subject: 'Músculos', A: 10 - todayEntry.muscle_soreness, fullMark: 10 },
    { subject: 'Calma', A: 10 - todayEntry.stress_level, fullMark: 10 },
    { subject: 'Humor', A: todayEntry.mood_level, fullMark: 10 },
    { subject: 'Recuperação', A: todayEntry.prs_score, fullMark: 10 }
  ] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </motion.button>
            
            <div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-chakra-heart to-emerald-500 bg-clip-text text-transparent">
                Módulo Recovery
              </h1>
              <p className="text-slate-600">Monitoramento de recuperação e prontidão</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!showForm && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-chakra-heart to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              >
                {todayEntry ? 'Editar Hoje' : 'Registrar Hoje'}
              </motion.button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Bem-estar */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="glass-effect rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-semibold text-slate-800">
                    Questionário de Bem-estar Diário
                  </h2>
                  <div className="text-sm text-slate-500">
                    {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {wellnessItems.map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white`}>
                          {item.icon}
                        </div>
                        <div>
                          <label className="block font-medium text-slate-800">
                            {item.label}
                          </label>
                          <p className="text-sm text-slate-600">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <input
                          {...register(item.key, { 
                            required: true,
                            min: 1,
                            max: 10
                          })}
                          type="range"
                          min="1"
                          max="10"
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="w-12 text-center font-semibold text-lg">
                          {watchedValues[item.key]}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="space-y-3">
                    <label className="block font-medium text-slate-800">
                      Observações (opcional)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chakra-heart focus:border-transparent resize-none"
                      placeholder="Adicione qualquer observação sobre seu estado hoje..."
                    />
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-1">Prontidão Estimada</div>
                      <div className={`text-2xl font-bold ${getReadinessColor(calculateReadinessScore())}`}>
                        {calculateReadinessScore()}/10
                      </div>
                      <div className={`text-sm font-medium ${getReadinessColor(calculateReadinessScore())}`}>
                        {getReadinessLabel(calculateReadinessScore())}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(false)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancelar
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-chakra-heart to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{loading ? 'Salvando...' : 'Salvar'}</span>
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Painel de Prontidão */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={showForm ? "lg:col-span-1" : "lg:col-span-3"}
          >
            <div className="space-y-6">
              {/* Score de Hoje */}
              {todayEntry && (
                <div className="glass-effect rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-display font-semibold text-slate-800">
                      Prontidão de Hoje
                    </h3>
                    <TrendingUp className="w-5 h-5 text-chakra-heart" />
                  </div>

                  <div className="text-center mb-6">
                    <div className={`text-4xl font-bold mb-2 ${getReadinessColor(calculateReadinessScore())}`}>
                      {calculateReadinessScore()}/10
                    </div>
                    <div className={`text-lg font-medium ${getReadinessColor(calculateReadinessScore())}`}>
                      {getReadinessLabel(calculateReadinessScore())}
                    </div>
                  </div>

                  {/* Radar Chart */}
                  {radarData.length > 0 && (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={90} domain={[0, 10]} />
                          <Radar
                            name="Hoje"
                            dataKey="A"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Gráfico de Tendências */}
              {chartData.length > 0 && (
                <div className="glass-effect rounded-2xl p-6">
                  <h3 className="text-lg font-display font-semibold text-slate-800 mb-4">
                    Tendências (14 dias)
                  </h3>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="prs" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="sono" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="humor" stroke="#22c55e" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}