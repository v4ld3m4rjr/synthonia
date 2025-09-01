// [AI Generated] Data: 19/12/2024
// Descrição: Dashboard principal com navegação entre módulos e design chakra
// Gerado por: Cursor AI
// Versão: React 18.2.0, Framer Motion 10.16.5
// AI_GENERATED_CODE_START
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Heart, 
  Dumbbell, 
  MapPin, 
  Brain, 
  Moon, 
  BarChart3, 
  LogOut, 
  User,
  Sparkles
} from 'lucide-react'

interface ModuleCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  route: string
  chakra: string
}

const modules: ModuleCard[] = [
  {
    id: 'recovery',
    title: 'Recovery',
    description: 'Monitoramento de recuperação e prontidão',
    icon: <Heart className="w-8 h-8" />,
    color: 'from-chakra-heart to-emerald-400',
    route: '/recovery',
    chakra: 'Anahata - Chakra do Coração'
  },
  {
    id: 'training',
    title: 'Treinamento',
    description: 'Sistema de exercícios e progressão',
    icon: <Dumbbell className="w-8 h-8" />,
    color: 'from-chakra-solar to-amber-400',
    route: '/training',
    chakra: 'Manipura - Chakra do Plexo Solar'
  },
  {
    id: 'rehabilitation',
    title: 'Reabilitação',
    description: 'Mapa de dor e exercícios terapêuticos',
    icon: <MapPin className="w-8 h-8" />,
    color: 'from-chakra-root to-red-400',
    route: '/rehabilitation',
    chakra: 'Muladhara - Chakra Raiz'
  },
  {
    id: 'ai-insights',
    title: 'Análise IA',
    description: 'Insights inteligentes e recomendações',
    icon: <Brain className="w-8 h-8" />,
    color: 'from-chakra-third to-indigo-400',
    route: '/ai-insights',
    chakra: 'Ajna - Terceiro Olho'
  },
  {
    id: 'sleep',
    title: 'Sono',
    description: 'Monitoramento e otimização do sono',
    icon: <Moon className="w-8 h-8" />,
    color: 'from-chakra-throat to-cyan-400',
    route: '/sleep',
    chakra: 'Vishuddha - Chakra da Garganta'
  },
  {
    id: 'analytics',
    title: 'Dashboard Analítica',
    description: 'Visualização de dados e métricas',
    icon: <BarChart3 className="w-8 h-8" />,
    color: 'from-chakra-crown to-purple-400',
    route: '/analytics',
    chakra: 'Sahasrara - Chakra da Coroa'
  }
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const getProfileTypeLabel = (type: string) => {
    switch (type) {
      case 'athlete': return 'Atleta'
      case 'trainer': return 'Treinador'
      case 'physiotherapist': return 'Fisioterapeuta'
      default: return type
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 mandala-pattern opacity-20" />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6 glass-effect border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-chakra-crown to-chakra-third flex items-center justify-center"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-chakra-crown to-chakra-third bg-clip-text text-transparent">
                SynthonIA AI
              </h1>
              <p className="text-slate-600 text-sm">
                Bem-vindo, {profile?.full_name || 'Usuário'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-full">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                {getProfileTypeLabel(profile?.profile_type || '')}
              </span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="p-2 text-slate-600 hover:text-red-500 transition-colors duration-200"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Título da seção */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-slate-800 mb-4">
              Seus Módulos de Bem-Estar
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore cada aspecto da sua jornada de saúde e performance através dos nossos módulos especializados, 
              inspirados na energia dos chakras.
            </p>
          </motion.div>

          {/* Grid de módulos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => navigate(module.route)}
              >
                <div className="chakra-card glass-effect h-full">
                  {/* Ícone do módulo */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {module.icon}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-display font-semibold text-slate-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-chakra-crown group-hover:to-chakra-third group-hover:bg-clip-text transition-all duration-300">
                      {module.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {module.description}
                    </p>
                    
                    <div className="pt-2 border-t border-slate-200/50">
                      <p className="text-xs text-slate-500 italic">
                        {module.chakra}
                      </p>
                    </div>
                  </div>

                  {/* Indicador de hover */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Estatísticas rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">Status Geral</h4>
              <p className="text-2xl font-bold text-green-500">Ótimo</p>
            </div>

            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">Dados Coletados</h4>
              <p className="text-2xl font-bold text-blue-500">0</p>
            </div>

            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">Insights IA</h4>
              <p className="text-2xl font-bold text-purple-500">0</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
// AI_GENERATED_CODE_END