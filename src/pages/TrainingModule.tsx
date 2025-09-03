// [AI Generated] Data: 19/12/2024
// Descrição: Módulo de treinamento com formulário de registro e visualização de dados
// Gerado por: Cursor AI
// Versão: React 18.2.0, TypeScript 5.2.2
// AI_GENERATED_CODE_START
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Dumbbell, 
  Plus, 
  Calendar, 
  Clock, 
  Activity, 
  TrendingUp,
  BarChart3,
  Target,
  Save,
  Edit3
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { calculateSessionLoad, formatDuration } from '../utils/calculations'

interface TrainingSession {
  id: string
  date: string
  session_name: string
  duration_minutes: number
  rpe: number
  total_tonnage?: number
  density?: number
  session_load?: number
  notes?: string
  created_at: string
}

interface TrainingFormData {
  date: string
  session_name: string
  duration_minutes: number
  rpe: number
  notes?: string
}

export default function TrainingModule() {
  const [activeTab, setActiveTab] = useState('register')
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TrainingFormData>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      session_name: '',
      duration_minutes: 60,
      rpe: 5,
      notes: ''
    }
  })

  const tabs = [
    { id: 'register', label: 'Registrar Treino', icon: <Plus className="w-4 h-4" /> },
    { id: 'history', label: 'Histórico', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'analysis', label: 'Análise', icon: <TrendingUp className="w-4 h-4" /> }
  ]

  useEffect(() => {
    if (user) {
      fetchSessions()
    }
  }, [user])

  const fetchSessions = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Erro ao buscar sessões:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: TrainingFormData) => {
    if (!user) return

    setSubmitting(true)
    try {
      const sessionLoad = calculateSessionLoad(data.rpe, data.duration_minutes)
      
      const { error } = await supabase
        .from('training_sessions')
        .insert({
          user_id: user.id,
          date: data.date,
          session_name: data.session_name,
          duration_minutes: data.duration_minutes,
          rpe: data.rpe,
          session_load: sessionLoad,
          notes: data.notes || null
        })

      if (error) throw error

      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        session_name: '',
        duration_minutes: 60,
        rpe: 5,
        notes: ''
      })
      
      await fetchSessions()
      setActiveTab('history')
    } catch (error) {
      console.error('Erro ao salvar sessão:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getChartData = () => {
    return sessions
      .slice(0, 14)
      .reverse()
      .map(session => ({
        date: format(new Date(session.date), 'dd/MM', { locale: ptBR }),
        rpe: session.rpe,
        duration: session.duration_minutes,
        load: session.session_load || 0
      }))
  }

  const getStats = () => {
    if (sessions.length === 0) return { totalSessions: 0, avgRPE: 0, totalLoad: 0, avgDuration: 0 }

    const totalSessions = sessions.length
    const avgRPE = sessions.reduce((sum, s) => sum + s.rpe, 0) / sessions.length
    const totalLoad = sessions.reduce((sum, s) => sum + (s.session_load || 0), 0)
    const avgDuration = sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / sessions.length

    return { totalSessions, avgRPE, totalLoad, avgDuration }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl text-white">
              <Dumbbell className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Módulo de Treinamento</h1>
              <p className="text-slate-600">Registre e analise suas sessões de treino</p>
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
                <Target className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-slate-600">Total de Sessões</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.totalSessions}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-slate-600">RPE Médio</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.avgRPE.toFixed(1)}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-slate-600">Carga Total</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{Math.round(stats.totalLoad)}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-600">Duração Média</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{formatDuration(Math.round(stats.avgDuration))}</p>
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
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
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
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Registrar Nova Sessão</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Data da Sessão
                    </label>
                    <input
                      type="date"
                      {...register('date', { required: 'Data é obrigatória' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nome da Sessão
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Treino de Peito e Tríceps"
                      {...register('session_name', { required: 'Nome da sessão é obrigatório' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.session_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.session_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Duração (minutos)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      {...register('duration_minutes', { 
                        required: 'Duração é obrigatória',
                        min: { value: 1, message: 'Duração deve ser maior que 0' },
                        max: { value: 300, message: 'Duração deve ser menor que 300 minutos' }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.duration_minutes && (
                      <p className="text-red-500 text-sm mt-1">{errors.duration_minutes.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      RPE (Percepção de Esforço) - 1 a 10
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      {...register('rpe', { 
                        required: 'RPE é obrigatório',
                        min: { value: 1, message: 'RPE deve ser entre 1 e 10' },
                        max: { value: 10, message: 'RPE deve ser entre 1 e 10' }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.rpe && (
                      <p className="text-red-500 text-sm mt-1">{errors.rpe.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Observações sobre a sessão..."
                    {...register('notes')}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Sessão
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Histórico de Treinos</h2>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Dumbbell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">Nenhuma sessão registrada ainda</p>
                    <p className="text-slate-400">Registre sua primeira sessão na aba "Registrar Treino"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/50 border border-white/30 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">{session.session_name}</h3>
                            <p className="text-slate-600">
                              {format(new Date(session.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-600">
                              {Math.round(session.session_load || 0)}
                            </div>
                            <div className="text-sm text-slate-500">Carga</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">{formatDuration(session.duration_minutes)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">RPE {session.rpe}/10</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">Load: {Math.round(session.session_load || 0)}</span>
                          </div>
                        </div>

                        {session.notes && (
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-slate-600 text-sm">{session.notes}</p>
                          </div>
                        )}
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
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Análise de Carga de Treino</h2>
                
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">Dados insuficientes para análise</p>
                    <p className="text-slate-400">Registre algumas sessões para ver os gráficos</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Gráfico de Tendências */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Tendências dos Últimos 14 Treinos</h3>
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
                              dataKey="rpe"
                              stroke="#f59e0b"
                              fill="url(#rpeGradient)"
                              strokeWidth={2}
                              name="RPE"
                            />
                            <Area
                              type="monotone"
                              dataKey="load"
                              stroke="#ea580c"
                              fill="url(#loadGradient)"
                              strokeWidth={2}
                              name="Carga"
                            />
                            <defs>
                              <linearGradient id="rpeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Métricas Detalhadas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
                        <h4 className="font-semibold text-slate-800 mb-4">Distribuição de RPE</h4>
                        <div className="space-y-2">
                          {[1,2,3,4,5,6,7,8,9,10].map(rpe => {
                            const count = sessions.filter(s => s.rpe === rpe).length
                            const percentage = sessions.length > 0 ? (count / sessions.length) * 100 : 0
                            return (
                              <div key={rpe} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-600 w-8">RPE {rpe}</span>
                                <div className="flex-1 bg-white/50 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-slate-500 w-8">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
                        <h4 className="font-semibold text-slate-800 mb-4">Resumo Semanal</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Sessões esta semana:</span>
                            <span className="font-semibold text-slate-800">
                              {sessions.filter(s => {
                                const sessionDate = new Date(s.date)
                                const weekAgo = new Date()
                                weekAgo.setDate(weekAgo.getDate() - 7)
                                return sessionDate >= weekAgo
                              }).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Carga semanal:</span>
                            <span className="font-semibold text-slate-800">
                              {Math.round(sessions
                                .filter(s => {
                                  const sessionDate = new Date(s.date)
                                  const weekAgo = new Date()
                                  weekAgo.setDate(weekAgo.getDate() - 7)
                                  return sessionDate >= weekAgo
                                })
                                .reduce((sum, s) => sum + (s.session_load || 0), 0)
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">RPE médio semanal:</span>
                            <span className="font-semibold text-slate-800">
                              {(() => {
                                const weekSessions = sessions.filter(s => {
                                  const sessionDate = new Date(s.date)
                                  const weekAgo = new Date()
                                  weekAgo.setDate(weekAgo.getDate() - 7)
                                  return sessionDate >= weekAgo
                                })
                                return weekSessions.length > 0 
                                  ? (weekSessions.reduce((sum, s) => sum + s.rpe, 0) / weekSessions.length).toFixed(1)
                                  : '0.0'
                              })()}
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