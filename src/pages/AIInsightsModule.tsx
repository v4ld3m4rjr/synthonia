// [AI Generated] Data: 19/12/2024
// Descrição: Módulo de insights de IA com análise de dados e chat interativo
// Gerado por: Cursor AI
// Versão: React 18.2.0, TypeScript 5.2.2
// AI_GENERATED_CODE_START
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Lightbulb, 
  MessageCircle, 
  TrendingUp,
  Activity,
  Moon,
  Dumbbell,
  Heart,
  Send,
  Bot,
  User,
  Sparkles,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AIInsight {
  id: string
  insight_type: string
  title: string
  content: string
  data_sources: string[]
  confidence_score: number
  created_at: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function AIInsightsModule() {
  const [activeTab, setActiveTab] = useState('insights')
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const { user } = useAuth()

  const tabs = [
    { id: 'insights', label: 'Insights', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Recomendações', icon: <Target className="w-4 h-4" /> },
    { id: 'chat', label: 'Chat IA', icon: <MessageCircle className="w-4 h-4" /> }
  ]

  useEffect(() => {
    if (user) {
      fetchInsights()
      generateMockInsights()
    }
  }, [user])

  const fetchInsights = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setInsights(data || [])
    } catch (error) {
      console.error('Erro ao buscar insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockInsights = async () => {
    if (!user) return

    // Gerar alguns insights simulados para demonstração
    const mockInsights = [
      {
        insight_type: 'recovery',
        title: 'Padrão de Recuperação Identificado',
        content: 'Seus dados mostram que você se recupera melhor após treinos de intensidade moderada (RPE 6-7). Considere ajustar a intensidade dos treinos para otimizar a recuperação.',
        data_sources: ['recovery_entries', 'training_sessions'],
        confidence_score: 0.85
      },
      {
        insight_type: 'sleep',
        title: 'Qualidade do Sono vs Performance',
        content: 'Existe uma correlação forte entre sua qualidade de sono e performance nos treinos. Noites com qualidade ≥8 resultam em 23% melhor performance.',
        data_sources: ['sleep_entries', 'training_sessions'],
        confidence_score: 0.92
      },
      {
        insight_type: 'training',
        title: 'Otimização da Carga de Treino',
        content: 'Sua carga de treino semanal está 15% acima do recomendado. Considere reduzir a intensidade ou aumentar os dias de descanso.',
        data_sources: ['training_sessions', 'recovery_entries'],
        confidence_score: 0.78
      }
    ]

    // Verificar se já existem insights para não duplicar
    const { data: existingInsights } = await supabase
      .from('ai_insights')
      .select('insight_type')
      .eq('user_id', user.id)

    const existingTypes = existingInsights?.map(i => i.insight_type) || []

    for (const insight of mockInsights) {
      if (!existingTypes.includes(insight.insight_type)) {
        await supabase
          .from('ai_insights')
          .insert({
            user_id: user.id,
            ...insight
          })
      }
    }

    // Recarregar insights após inserção
    await fetchInsights()
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recovery': return <Activity className="w-5 h-5" />
      case 'sleep': return <Moon className="w-5 h-5" />
      case 'training': return <Dumbbell className="w-5 h-5" />
      case 'rehabilitation': return <Heart className="w-5 h-5" />
      default: return <Brain className="w-5 h-5" />
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'Alta Confiança'
    if (score >= 0.6) return 'Média Confiança'
    return 'Baixa Confiança'
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(chatInput),
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiResponse])
      setChatLoading(false)
    }, 1500)
  }

  const generateAIResponse = (input: string): string => {
    const responses = [
      'Com base nos seus dados de recuperação, recomendo focar em melhorar a qualidade do sono. Isso pode ter um impacto significativo na sua performance geral.',
      'Analisando seus padrões de treino, sugiro implementar periodização para otimizar seus resultados e reduzir o risco de overtraining.',
      'Seus dados mostram uma correlação interessante entre estresse e qualidade do sono. Considere técnicas de relaxamento antes de dormir.',
      'Baseado no histórico de dores, recomendo exercícios específicos de mobilidade para as áreas mais afetadas.',
      'Sua consistência nos registros está excelente! Isso me permite fornecer insights mais precisos sobre seus padrões.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Módulo de IA</h1>
              <p className="text-slate-600">Insights inteligentes sobre sua saúde e performance</p>
            </div>
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
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
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
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Insights Gerados pela IA</h2>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                ) : insights.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">Coletando dados para gerar insights...</p>
                    <p className="text-slate-400">Continue registrando seus dados para receber análises personalizadas</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {insights.map((insight, index) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/50 border border-white/30 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
                            {getInsightIcon(insight.insight_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-semibold text-slate-800">{insight.title}</h3>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(insight.confidence_score)}`}>
                                {getConfidenceLabel(insight.confidence_score)}
                              </div>
                            </div>
                            <p className="text-slate-600 mb-4">{insight.content}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span>
                                Fontes: {insight.data_sources.join(', ')}
                              </span>
                              <span>
                                {format(new Date(insight.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Recomendações Personalizadas</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recomendações de Recuperação */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="w-6 h-6 text-green-600" />
                      <h3 className="text-lg font-semibold text-slate-800">Recuperação</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Melhore a qualidade do sono</p>
                          <p className="text-sm text-slate-600">Estabeleça uma rotina consistente de sono</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Hidratação adequada</p>
                          <p className="text-sm text-slate-600">Beba pelo menos 2L de água por dia</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Técnicas de relaxamento</p>
                          <p className="text-sm text-slate-600">Pratique meditação ou respiração profunda</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Recomendações de Treino */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Dumbbell className="w-6 h-6 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-slate-800">Treinamento</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Periodização inteligente</p>
                          <p className="text-sm text-slate-600">Alterne intensidades para evitar overtraining</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Aquecimento adequado</p>
                          <p className="text-sm text-slate-600">15-20 minutos de aquecimento dinâmico</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Monitoramento do RPE</p>
                          <p className="text-sm text-slate-600">Mantenha RPE entre 6-8 na maioria dos treinos</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Recomendações de Sono */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Moon className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-slate-800">Sono</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Horário consistente</p>
                          <p className="text-sm text-slate-600">Durma e acorde sempre no mesmo horário</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Ambiente otimizado</p>
                          <p className="text-sm text-slate-600">Quarto escuro, silencioso e fresco</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Evite telas antes de dormir</p>
                          <p className="text-sm text-slate-600">Desligue dispositivos 1h antes de deitar</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Recomendações de Reabilitação */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Heart className="w-6 h-6 text-red-600" />
                      <h3 className="text-lg font-semibold text-slate-800">Reabilitação</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Mobilidade diária</p>
                          <p className="text-sm text-slate-600">15 minutos de alongamento por dia</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Fortalecimento preventivo</p>
                          <p className="text-sm text-slate-600">Foque em músculos estabilizadores</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Acompanhamento profissional</p>
                          <p className="text-sm text-slate-600">Consulte um fisioterapeuta regularmente</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Chat com IA</h2>
              
              <div className="bg-white/50 rounded-xl border border-white/30 h-96 flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">Olá! Sou sua IA pessoal de saúde e performance.</p>
                      <p className="text-slate-400 text-sm">Faça uma pergunta sobre seus dados ou peça recomendações!</p>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.type === 'ai' && (
                            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white">
                              <Bot className="w-4 h-4" />
                            </div>
                          )}
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                            message.type === 'user' 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                              : 'bg-white border border-slate-200 text-slate-800'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.type === 'user' ? 'text-indigo-100' : 'text-slate-400'
                            }`}>
                              {format(message.timestamp, 'HH:mm')}
                            </p>
                          </div>
                          {message.type === 'user' && (
                            <div className="p-2 bg-slate-600 rounded-full text-white">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {chatLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3 justify-start"
                        >
                          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Digite sua pergunta..."
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      disabled={chatLoading}
                    />
                    <motion.button
                      type="submit"
                      disabled={chatLoading || !chatInput.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
// AI_GENERATED_CODE_END