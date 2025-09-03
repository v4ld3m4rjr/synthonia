// [AI Generated] Data: 19/12/2024
// Descrição: Módulo de reabilitação com registro de dor e acompanhamento
// Gerado por: Cursor AI
// Versão: React 18.2.0, TypeScript 5.2.2
// AI_GENERATED_CODE_START
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Plus, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Save,
  Activity
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getPainColor, getPainLabel } from '../utils/calculations'

interface PainEntry {
  id: string
  date: string
  body_area: string
  pain_intensity: number
  pain_type: string
  description?: string
  coordinates_x: number
  coordinates_y: number
  created_at: string
}

interface PainFormData {
  date: string
  body_area: string
  pain_intensity: number
  pain_type: string
  description?: string
  coordinates_x: number
  coordinates_y: number
}

const bodyAreas = [
  'Cabeça', 'Pescoço', 'Ombro Direito', 'Ombro Esquerdo',
  'Braço Direito', 'Braço Esquerdo', 'Cotovelo Direito', 'Cotovelo Esquerdo',
  'Punho Direito', 'Punho Esquerdo', 'Peito', 'Costas Superior',
  'Costas Inferior', 'Abdômen', 'Quadril', 'Coxa Direita', 'Coxa Esquerda',
  'Joelho Direito', 'Joelho Esquerdo', 'Panturrilha Direita', 'Panturrilha Esquerda',
  'Tornozelo Direito', 'Tornozelo Esquerdo', 'Pé Direito', 'Pé Esquerdo'
]

const painTypes = [
  'Aguda', 'Crônica', 'Muscular', 'Articular', 'Neuropática',
  'Inflamatória', 'Tensional', 'Latejante', 'Queimação', 'Formigamento'
]

export default function RehabilitationModule() {
  const [activeTab, setActiveTab] = useState('register')
  const [entries, setEntries] = useState<PainEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PainFormData>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      body_area: '',
      pain_intensity: 5,
      pain_type: '',
      description: '',
      coordinates_x: 50,
      coordinates_y: 50
    }
  })

  const tabs = [
    { id: 'register', label: 'Registrar Dor', icon: <Plus className="w-4 h-4" /> },
    { id: 'map', label: 'Mapa de Dor', icon: <MapPin className="w-4 h-4" /> },
    { id: 'progress', label: 'Progresso', icon: <TrendingUp className="w-4 h-4" /> }
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
        .from('pain_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Erro ao buscar entradas de dor:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PainFormData) => {
    if (!user) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('pain_entries')
        .insert({
          user_id: user.id,
          date: data.date,
          body_area: data.body_area,
          pain_intensity: data.pain_intensity,
          pain_type: data.pain_type,
          description: data.description || null,
          coordinates_x: data.coordinates_x,
          coordinates_y: data.coordinates_y
        })

      if (error) throw error

      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        body_area: '',
        pain_intensity: 5,
        pain_type: '',
        description: '',
        coordinates_x: 50,
        coordinates_y: 50
      })
      
      await fetchEntries()
      setActiveTab('map')
    } catch (error) {
      console.error('Erro ao salvar entrada de dor:', error)
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
        intensity: entry.pain_intensity
      }))
  }

  const getStats = () => {
    if (entries.length === 0) return { totalEntries: 0, avgIntensity: 0, mostAffectedArea: '', highPainDays: 0 }

    const totalEntries = entries.length
    const avgIntensity = entries.reduce((sum, e) => sum + e.pain_intensity, 0) / entries.length
    const highPainDays = entries.filter(e => e.pain_intensity >= 7).length
    
    // Área mais afetada
    const areaCount = entries.reduce((acc, entry) => {
      acc[entry.body_area] = (acc[entry.body_area] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostAffectedArea = Object.entries(areaCount).reduce((a, b) => 
      areaCount[a[0]] > areaCount[b[0]] ? a : b
    )?.[0] || ''

    return { totalEntries, avgIntensity, mostAffectedArea, highPainDays }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Módulo de Reabilitação</h1>
              <p className="text-slate-600">Monitore dores e acompanhe sua recuperação</p>
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
                <Calendar className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-slate-600">Registros de Dor</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.totalEntries}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-slate-600">Intensidade Média</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.avgIntensity.toFixed(1)}/10</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-pink-600" />
                <span className="text-sm font-medium text-slate-600">Área Mais Afetada</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{stats.mostAffectedArea || 'N/A'}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-slate-600">Dias de Dor Alta</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.highPainDays}</p>
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
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
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
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Registrar Dor</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      {...register('date', { required: 'Data é obrigatória' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Área do Corpo
                    </label>
                    <select
                      {...register('body_area', { required: 'Área do corpo é obrigatória' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Selecione uma área</option>
                      {bodyAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    {errors.body_area && (
                      <p className="text-red-500 text-sm mt-1">{errors.body_area.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Intensidade da Dor (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      {...register('pain_intensity', { 
                        required: 'Intensidade é obrigatória',
                        min: { value: 1, message: 'Intensidade deve ser entre 1 e 10' },
                        max: { value: 10, message: 'Intensidade deve ser entre 1 e 10' }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.pain_intensity && (
                      <p className="text-red-500 text-sm mt-1">{errors.pain_intensity.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Dor
                    </label>
                    <select
                      {...register('pain_type', { required: 'Tipo de dor é obrigatório' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Selecione o tipo</option>
                      {painTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.pain_type && (
                      <p className="text-red-500 text-sm mt-1">{errors.pain_type.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Coordenada X (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      {...register('coordinates_x', { 
                        required: 'Coordenada X é obrigatória',
                        min: { value: 0, message: 'Coordenada deve ser entre 0 e 100' },
                        max: { value: 100, message: 'Coordenada deve ser entre 0 e 100' }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.coordinates_x && (
                      <p className="text-red-500 text-sm mt-1">{errors.coordinates_x.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Coordenada Y (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      {...register('coordinates_y', { 
                        required: 'Coordenada Y é obrigatória',
                        min: { value: 0, message: 'Coordenada deve ser entre 0 e 100' },
                        max: { value: 100, message: 'Coordenada deve ser entre 0 e 100' }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.coordinates_y && (
                      <p className="text-red-500 text-sm mt-1">{errors.coordinates_y.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descreva a dor, quando começou, o que a agrava ou alivia..."
                    {...register('description')}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          {activeTab === 'map' && (
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Mapa de Dor</h2>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                  </div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">Nenhum registro de dor ainda</p>
                    <p className="text-slate-400">Registre sua primeira entrada na aba "Registrar Dor"</p>
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
                            <h3 className="text-lg font-semibold text-slate-800">{entry.body_area}</h3>
                            <p className="text-slate-600">
                              {format(new Date(entry.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getPainColor(entry.pain_intensity)}`}>
                              {entry.pain_intensity}/10
                            </div>
                            <div className={`text-sm ${getPainColor(entry.pain_intensity)}`}>
                              {getPainLabel(entry.pain_intensity)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">Tipo: {entry.pain_type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">
                              Posição: ({entry.coordinates_x.toFixed(1)}, {entry.coordinates_y.toFixed(1)})
                            </span>
                          </div>
                        </div>

                        {entry.description && (
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-slate-600 text-sm">{entry.description}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Progresso da Recuperação</h2>
                
                {entries.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">Dados insuficientes para análise</p>
                    <p className="text-slate-400">Registre algumas entradas para ver o progresso</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Gráfico de Intensidade da Dor */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Intensidade da Dor - Últimos 14 Registros</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#64748b"
                              fontSize={12}
                            />
                            <YAxis 
                              stroke="#64748b" 
                              fontSize={12}
                              domain={[0, 10]}
                            />
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
                              dataKey="intensity"
                              stroke="#ef4444"
                              fill="url(#painGradient)"
                              strokeWidth={2}
                              name="Intensidade da Dor"
                            />
                            <defs>
                              <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Análise por Área Corporal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6">
                        <h4 className="font-semibold text-slate-800 mb-4">Distribuição por Área</h4>
                        <div className="space-y-2">
                          {(() => {
                            const areaCount = entries.reduce((acc, entry) => {
                              acc[entry.body_area] = (acc[entry.body_area] || 0) + 1
                              return acc
                            }, {} as Record<string, number>)
                            
                            return Object.entries(areaCount)
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 5)
                              .map(([area, count]) => {
                                const percentage = (count / entries.length) * 100
                                return (
                                  <div key={area} className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-600 w-20 truncate">{area}</span>
                                    <div className="flex-1 bg-white/50 rounded-full h-2">
                                      <div 
                                        className="bg-gradient-to-r from-red-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-slate-500 w-8">{count}</span>
                                  </div>
                                )
                              })
                          })()}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
                        <h4 className="font-semibold text-slate-800 mb-4">Análise de Tendência</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Registros esta semana:</span>
                            <span className="font-semibold text-slate-800">
                              {entries.filter(e => {
                                const entryDate = new Date(e.date)
                                const weekAgo = new Date()
                                weekAgo.setDate(weekAgo.getDate() - 7)
                                return entryDate >= weekAgo
                              }).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Intensidade máxima:</span>
                            <span className={`font-semibold ${getPainColor(Math.max(...entries.map(e => e.pain_intensity)))}`}>
                              {Math.max(...entries.map(e => e.pain_intensity))}/10
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Tipo mais comum:</span>
                            <span className="font-semibold text-slate-800">
                              {(() => {
                                const typeCount = entries.reduce((acc, entry) => {
                                  acc[entry.pain_type] = (acc[entry.pain_type] || 0) + 1
                                  return acc
                                }, {} as Record<string, number>)
                                
                                return Object.entries(typeCount).reduce((a, b) => 
                                  typeCount[a[0]] > typeCount[b[0]] ? a : b
                                )?.[0] || 'N/A'
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