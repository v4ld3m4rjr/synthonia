// [AI Generated] Data: 19/12/2024
// Descrição: Módulo de Analytics com dashboard dinâmico de variáveis e visualizações
// Gerado por: Cursor AI
// Versão: React 18.2.0, Recharts 2.8.0
// AI_GENERATED_CODE_START
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Filter,
  Download,
  Heart,
  Moon,
  Zap,
  Brain,
  Smile,
  Activity,
  Clock,
  Target,
  Flame,
  MapPin
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MetricConfig {
  id: string
  label: string
  table: string
  column: string
  icon: React.ReactNode
  color: string
  category: string
  description: string
  unit?: string
  invert?: boolean // Para métricas onde menor é melhor (fadiga, dor, estresse)
}

interface ChartData {
  date: string
  value: number
  formattedDate: string
}

const metrics: MetricConfig[] = [
  // Recovery Module
  {
    id: 'sleep_quality',
    label: 'Qualidade do Sono',
    table: 'recovery_entries',
    column: 'sleep_quality',
    icon: <Moon className="w-4 h-4" />,
    color: '#3b82f6',
    category: 'Recovery',
    description: 'Avaliação subjetiva da qualidade do sono (1-10)',
    unit: '/10'
  },
  {
    id: 'fatigue_level',
    label: 'Nível de Fadiga',
    table: 'recovery_entries',
    column: 'fatigue_level',
    icon: <Zap className="w-4 h-4" />,
    color: '#f59e0b',
    category: 'Recovery',
    description: 'Sensação de cansaço e fadiga (1-10)',
    unit: '/10',
    invert: true
  },
  {
    id: 'muscle_soreness',
    label: 'Dor Muscular',
    table: 'recovery_entries',
    column: 'muscle_soreness',
    icon: <Activity className="w-4 h-4" />,
    color: '#ef4444',
    category: 'Recovery',
    description: 'Nível de dor ou desconforto muscular (1-10)',
    unit: '/10',
    invert: true
  },
  {
    id: 'stress_level',
    label: 'Nível de Estresse',
    table: 'recovery_entries',
    column: 'stress_level',
    icon: <Brain className="w-4 h-4" />,
    color: '#8b5cf6',
    category: 'Recovery',
    description: 'Percepção de estresse mental (1-10)',
    unit: '/10',
    invert: true
  },
  {
    id: 'mood_level',
    label: 'Humor',
    table: 'recovery_entries',
    column: 'mood_level',
    icon: <Smile className="w-4 h-4" />,
    color: '#10b981',
    category: 'Recovery',
    description: 'Estado de humor geral (1-10)',
    unit: '/10'
  },
  {
    id: 'prs_score',
    label: 'PRS (Percepção de Recuperação)',
    table: 'recovery_entries',
    column: 'prs_score',
    icon: <Heart className="w-4 h-4" />,
    color: '#06b6d4',
    category: 'Recovery',
    description: 'Percepção de recuperação subjetiva (0-10)',
    unit: '/10'
  },
  // Training Module
  {
    id: 'session_duration',
    label: 'Duração da Sessão',
    table: 'training_sessions',
    column: 'duration_minutes',
    icon: <Clock className="w-4 h-4" />,
    color: '#f97316',
    category: 'Training',
    description: 'Duração total da sessão de treino',
    unit: ' min'
  },
  {
    id: 'rpe',
    label: 'RPE (Percepção de Esforço)',
    table: 'training_sessions',
    column: 'rpe',
    icon: <Target className="w-4 h-4" />,
    color: '#dc2626',
    category: 'Training',
    description: 'Percepção subjetiva de esforço (1-10)',
    unit: '/10'
  },
  {
    id: 'total_tonnage',
    label: 'Tonelagem Total',
    table: 'training_sessions',
    column: 'total_tonnage',
    icon: <Flame className="w-4 h-4" />,
    color: '#ea580c',
    category: 'Training',
    description: 'Volume total de carga levantada',
    unit: ' kg'
  },
  {
    id: 'session_load',
    label: 'Carga da Sessão',
    table: 'training_sessions',
    column: 'session_load',
    icon: <BarChart3 className="w-4 h-4" />,
    color: '#c2410c',
    category: 'Training',
    description: 'Carga calculada da sessão (RPE × Duração)',
    unit: ' AU'
  },
  // Sleep Module
  {
    id: 'sleep_duration',
    label: 'Duração do Sono',
    table: 'sleep_entries',
    column: 'sleep_duration',
    icon: <Moon className="w-4 h-4" />,
    color: '#1e40af',
    category: 'Sleep',
    description: 'Tempo total de sono',
    unit: ' h'
  },
  {
    id: 'sleep_efficiency',
    label: 'Eficiência do Sono',
    table: 'sleep_entries',
    column: 'sleep_efficiency',
    icon: <TrendingUp className="w-4 h-4" />,
    color: '#1d4ed8',
    category: 'Sleep',
    description: 'Percentual de eficiência do sono',
    unit: '%'
  },
  // Pain Module
  {
    id: 'pain_intensity',
    label: 'Intensidade da Dor',
    table: 'pain_entries',
    column: 'pain_intensity',
    icon: <MapPin className="w-4 h-4" />,
    color: '#dc2626',
    category: 'Pain',
    description: 'Intensidade da dor reportada (1-10)',
    unit: '/10',
    invert: true
  }
]

export default function AnalyticsModule() {
  const { user } = useAuth()
  const [selectedMetric, setSelectedMetric] = useState<MetricConfig>(metrics[0])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState(30)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', 'Recovery', 'Training', 'Sleep', 'Pain']

  useEffect(() => {
    if (selectedMetric && user) {
      fetchMetricData(selectedMetric)
    }
  }, [selectedMetric, user, dateRange])

  const fetchMetricData = async (metric: MetricConfig) => {
    if (!user) return

    setLoading(true)
    try {
      const startDate = format(subDays(new Date(), dateRange), 'yyyy-MM-dd')
      
      const { data, error } = await supabase
        .from(metric.table)
        .select(`date, ${metric.column}`)
        .eq('user_id', user.id)
        .gte('date', startDate)
        .order('date', { ascending: true })

      if (error) throw error

      const formattedData: ChartData[] = (data || []).map(item => ({
        date: item.date,
        value: metric.invert ? (10 - item[metric.column]) : item[metric.column],
        formattedDate: format(new Date(item.date), 'dd/MM', { locale: ptBR })
      }))

      setChartData(formattedData)
    } catch (error) {
      console.error('Erro ao buscar dados da métrica:', error)
      setChartData([])
    } finally {
      setLoading(false)
    }
  }

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory)

  const calculateStats = (data: ChartData[]) => {
    if (data.length === 0) return { avg: 0, min: 0, max: 0, trend: 0 }

    const values = data.map(d => d.value)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // Calcular tendência simples (diferença entre últimos 3 e primeiros 3 valores)
    const firstThree = values.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, values.length)
    const lastThree = values.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, values.length)
    const trend = lastThree - firstThree

    return { avg, min, max, trend }
  }

  const stats = calculateStats(chartData)

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-chakra-crown to-purple-500 bg-clip-text text-transparent">
                Dashboard Analytics
              </h1>
              <p className="text-slate-600">Visualização dinâmica de suas métricas de saúde e performance</p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Filtro de período */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-chakra-crown focus:border-transparent"
              >
                <option value={7}>Últimos 7 dias</option>
                <option value={30}>Últimos 30 dias</option>
                <option value={90}>Últimos 90 dias</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-chakra-crown to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </motion.button>
            </div>
          </div>

          {/* Filtros de categoria */}
          <div className="flex space-x-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-chakra-crown to-purple-500 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                {category === 'all' ? 'Todas' : category}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de Métricas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="w-5 h-5 text-chakra-crown" />
                <h3 className="text-lg font-display font-semibold text-slate-800">
                  Métricas Disponíveis
                </h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMetrics.map((metric) => (
                  <motion.button
                    key={metric.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMetric(metric)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                      selectedMetric.id === metric.id
                        ? 'bg-gradient-to-r from-chakra-crown/10 to-purple-500/10 border-2 border-chakra-crown/30'
                        : 'hover:bg-white/50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg text-white"
                        style={{ backgroundColor: metric.color }}
                      >
                        {metric.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {metric.label}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {metric.category}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Área Principal - Gráfico e Estatísticas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Estatísticas da Métrica Selecionada */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-effect rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-800">
                  {stats.avg.toFixed(1)}{selectedMetric.unit}
                </div>
                <div className="text-sm text-slate-600">Média</div>
              </div>
              
              <div className="glass-effect rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {stats.max.toFixed(1)}{selectedMetric.unit}
                </div>
                <div className="text-sm text-slate-600">Máximo</div>
              </div>
              
              <div className="glass-effect rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-500">
                  {stats.min.toFixed(1)}{selectedMetric.unit}
                </div>
                <div className="text-sm text-slate-600">Mínimo</div>
              </div>
              
              <div className="glass-effect rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${stats.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(1)}{selectedMetric.unit}
                </div>
                <div className="text-sm text-slate-600">Tendência</div>
              </div>
            </div>

            {/* Gráfico Principal */}
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-lg text-white"
                    style={{ backgroundColor: selectedMetric.color }}
                  >
                    {selectedMetric.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-semibold text-slate-800">
                      {selectedMetric.label}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {selectedMetric.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>Últimos {dateRange} dias</span>
                </div>
              </div>

              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border-2 border-chakra-crown border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-600">Carregando dados...</span>
                  </div>
                </div>
              ) : chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedMetric.color} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={selectedMetric.color} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="formattedDate" 
                        stroke="#64748b" 
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: any) => [`${value}${selectedMetric.unit}`, selectedMetric.label]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={selectedMetric.color}
                        strokeWidth={3}
                        fill="url(#colorGradient)"
                        dot={{ fill: selectedMetric.color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: selectedMetric.color, strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-slate-600 mb-2">
                      Nenhum dado encontrado
                    </h4>
                    <p className="text-slate-500">
                      Não há dados para a métrica "{selectedMetric.label}" no período selecionado.
                    </p>
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
// AI_GENERATED_CODE_END