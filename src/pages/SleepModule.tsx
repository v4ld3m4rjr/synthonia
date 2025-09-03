// [AI Generated] Data: 19/12/2024
// Descrição: Módulo de sono com formulário de registro e análise de padrões
// Gerado por: Cursor AI
// Versão: React 18.2.0, TypeScript 5.2.2
// AI_GENERATED_CODE_START
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Moon, 
  Plus, 
  Calendar, 
  Clock, 
  TrendingUp,
  BarChart3,
  Sunrise,
  Sunset,
  Save,
  Activity
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { calculateSleepDuration, calculateSleepEfficiency } from '../utils/calculations'

interface SleepEntry {
  id: string
  date: string
  bedtime: string
  wake_time: string
  sleep_duration: number
  sleep_quality: number
  sleep_efficiency?: number
  deep_sleep_minutes?: number
  rem_sleep_minutes?: number
  awakenings?: number
  created_at: string
}

interface SleepFormData {
  date: string
  bedtime: string
  wake_time: string
  sleep_quality: number
  sleep_efficiency?: number
  deep_sleep_minutes?: number
  rem_sleep_minutes?: number
  awakenings?: number
}

export default function SleepModule() {
  const [activeTab, setActiveTab] = useState('register')
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<SleepFormData>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      bedtime: '22:00',
      wake_time: '07:00',
      sleep_quality: 7,
      sleep_efficiency: undefined,
      deep_sleep_minutes: undefined,
      rem_sleep_minutes: undefined,
      awakenings: undefined
    }
  })

  const watchedBedtime = watch('bedtime')
  const watchedWakeTime = watch('wake_time')

  const tabs = [
    { id: 'register', label: 'Registrar Sono', icon: <Plus className="w-4 h-4" /> },
    { id: 'tracking', label: 'Acompanhamento', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'analysis', label: 'Análise', icon: <TrendingUp className="w-4 h-4" /> }
  ]

  useEffect(() => {
    if (user) {
      fetchEntries()
    }
  }, [user])

  const fetchEntries = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sleep_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Erro ao buscar entradas de sono:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: SleepFormData) => {
    if (!user) return

    setSubmitting(true)
    try {
      const sleepDuration = calculateSleepDuration(data.bedtime, data.wake_time)
      
      const { error } = await supabase
        .from('sleep_entries')
        .insert({
          user_id: user.id,
          date: data.date,
          bedtime: data.bedtime,
          wake_time: data.wake_time,
          sleep_duration: sleepDuration,
          sleep_quality: data.sleep_quality,
          sleep_efficiency: data.sleep_efficiency || null,
          deep_sleep_minutes: data.deep_sleep_minutes || null,
          rem_sleep_minutes: data.rem_sleep_minutes || null,
          awakenings: data.awakenings || null
        })

      if (error) throw error

      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        bedtime: '22:00',
        wake_time: '07:00',
        sleep_quality: 7,
        sleep_efficiency: undefined,
        deep_sleep_minutes: undefined,
        rem_sleep_minutes: undefined,
        awakenings: undefined
      })
      
      await fetchEntries()
      setActiveTab('tracking')
    } catch (error) {
      console.error('Erro ao salvar entrada de sono:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getChartData = () => {
    return entries
      .slice(0, 14)
      .reverse()
      .map(entry => ({
        date: format(new Date(entry.date), 'dd/MM', { locale: ptBR }),
        duration: entry.sleep_duration,
        quality: entry.sleep_quality,
        efficiency: entry.sleep_efficiency || 0
      }))
  }

  const getStats = () => {
    if (entries.length === 0) return { avgDuration: 0, avgQuality: 0, avgEfficiency: 0, totalNights: 0 }

    const totalNights = entries.length
    const avgDuration = entries.reduce((sum, e) => sum + e.sleep_duration, 0) / entries.length
    const avgQuality = entries.reduce((sum, e) => sum + e.sleep_quality, 0) / entries.length
    const avgEfficiency = entries
      .filter(e => e.sleep_efficiency)
      .reduce((sum, e) => sum + (e.sleep_efficiency || 0), 0) / entries.filter(e => e.sleep_efficiency).length || 0

    return { avgDuration, avgQuality, avgEfficiency, totalNights }
  }

  const stats = getStats()
  const calculatedDuration = calculateSleepDuration(watchedBedtime, watchedWakeTime)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
              <Moon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Módulo de Sono</h1>
              <p className="text-slate-600">Monitore e otimize sua qualidade de sono</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-600">Noites Registradas</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.totalNights}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-slate-600">Duração Média</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.avgDuration.toFixed(1)}h</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-slate-600">Qualidade Média</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.avgQuality.toFixed(1)}/10</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-600">Eficiência Média</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.avgEfficiency.toFixed(1)}%</p>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/50 backdrop-blur-md border border-white/30 rounded-xl p-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'register' && (
            <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Registrar Sono</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      {...register('date', { required: 'Data é obrigatória' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Sunset className="w-4 h-4" />
                      Hora de Dormir
                    </label>
                    <input
                      type="time"
                      {...register('bedtime', { required: 'Hora de dormir é obrigatória' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.bedtime && (
                      <p className="text-red-500 text-sm mt-1">{errors.bedtime.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Sunrise className="w-4 h-4" />
                      Hora de Acordar
                    </label>
                    <input
                      type="time"
                      {...register('wake_time', { required: 'Hora de acordar é obrigatória' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.wake_time && (
                      <p className="text-red-500 text-sm mt-1">{errors.wake_time.message}</p>
                    )}
                  </div>
                </div>

                {/* Duração Calculada */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Duração Calculada do Sono</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{calculatedDuration.toFixed(1)} horas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Qualidade do Sono (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      {...register('sleep_quality', { 
                        required: 'Qualidade do sono é obrigatória',
                        min: { value: 1, message: 'Qualidade deve ser entre 1 e 10' },
                        max: { value: 10, message: 'Qualidade deve ser entre 1 e 10' }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.sleep_quality && (
                      <p className="text-red-500 text-sm mt-1">{errors.sleep_quality.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Eficiência do Sono (%) - Opcional
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      {...register('sleep_efficiency', {
                        min: { value: 0, message: 'Eficiência deve ser entre 0 e 100' },
                        max: { value: 100, message: 'Eficiência deve ser entre 0 e 100' }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.sleep_efficiency && (
                      <p className="text-red-500 text-sm mt-1">{errors.sleep_efficiency.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sono Profundo (minutos) - Opcional
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('deep_sleep_minutes', {
                        min: { value: 0, message: 'Deve ser maior ou igual a 0' }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.deep_sleep_minutes && (
                      <p className="text-red-500 text-sm mt-1">{errors.deep_sleep_minutes.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sono REM (minutos) - Opcional
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('rem_sleep_minutes', {
                        min: { value: 0, message: 'Deve ser maior ou igual a 0' }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.rem_sleep_minutes && (
                      <p className="text-red-500 text-sm mt-1">{errors.rem_sleep_minutes.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Número de Despertares - Opcional
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('awakenings', {
                      min: { value: 0, message: 'Deve ser maior ou igual a 0' }
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {errors.awakenings && (
                    <p className="text-red-500 text-sm mt-1">{errors.awakenings.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Registro
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Acompanhamento do Sono</h2>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-12">
                    <Moon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">Nenhum registro de sono ainda</p>
                    <p className="text-slate-400">Registre sua primeira noite na aba "Registrar Sono"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/50 border border-white/30 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">
                              {format(new Date(entry.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </h3>
                            <p className="text-slate-600">
                              {entry.bedtime} - {entry.wake_time}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {entry.sleep_duration.toFixed(1)}h
                            </div>
                            <div className="text-sm text-slate-500">Duração</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">Qualidade: {entry.sleep_quality}/10</span>
                          </div>
                          {entry.sleep_efficiency && (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-slate-500" />
                              <span className="text-slate-600">Eficiência: {entry.sleep_efficiency}%</span>
                            </div>
                          )}
                          {entry.deep_sleep_minutes && (
                            <div className="flex items-center gap-2">
                              <Moon className="w-4 h-4 text-slate-500" />
                              <span className="text-slate-600">Profundo: {entry.deep_sleep_minutes}min</span>
                            </div>
                          )}
                          {entry.awakenings !== null && entry.awakenings !== undefined && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-500" />
                              <span className="text-slate-600">Despertares: {entry.awakenings}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Análise de Padrões de Sono</h2>
                
                {entries.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">Dados insuficientes para análise</p>
                    <p className="text-slate-400">Registre algumas noites para ver os gráficos</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Gráfico de Tendências */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Tendências dos Últimos 14 Dias</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#64748b"
                              fontSize={12}
                            />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="duration"
                              stroke="#3b82f6"
                              fill="url(#durationGradient)"
                              strokeWidth={2}
                              name="Duração (h)"
                            />
                            <Area
                              type="monotone"
                              dataKey="quality"
                              stroke="#6366f1"
                              fill="url(#qualityGradient)"
                              strokeWidth={2}
                              name="Qualidade"
                            />
                            <defs>
                              <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Insights de Sono */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                        <h4 className="font-semibold text-slate-800 mb-4">Padrões de Horário</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Hora média de dormir:</span>
                            <span className="font-semibold text-slate-800">
                              {(() => {
                                const avgBedtime = entries.reduce((sum, e) => {
                                  const [hours, minutes] = e.bedtime.split(':').map(Number)
                                  return sum + hours + minutes / 60
                                }, 0) / entries.length
                                const hours = Math.floor(avgBedtime)
                                const minutes = Math.round((avgBedtime - hours) * 60)
                                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Hora média de acordar:</span>
                            <span className="font-semibold text-slate-800">
                              {(() => {
                                const avgWakeTime = entries.reduce((sum, e) => {
                                  const [hours, minutes] = e.wake_time.split(':').map(Number)
                                  return sum + hours + minutes / 60
                                }, 0) / entries.length
                                const hours = Math.floor(avgWakeTime)
                                const minutes = Math.round((avgWakeTime - hours) * 60)
                                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Consistência:</span>
                            <span className="font-semibold text-green-600">
                              {entries.length >= 7 ? 'Boa' : 'Precisa melhorar'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                        <h4 className="font-semibold text-slate-800 mb-4">Qualidade do Sono</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Qualidade média:</span>
                            <span className="font-semibold text-slate-800">{stats.avgQuality.toFixed(1)}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Melhor noite:</span>
                            <span className="font-semibold text-green-600">
                              {Math.max(...entries.map(e => e.sleep_quality))}/10
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Noites com qualidade ≥8:</span>
                            <span className="font-semibold text-slate-800">
                              {entries.filter(e => e.sleep_quality >= 8).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
// AI_GENERATED_CODE_END