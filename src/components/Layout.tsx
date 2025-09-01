// [AI Generated] Data: 19/12/2024
// Descrição: Layout global com navegação superior e design responsivo
// Gerado por: Cursor AI
// Versão: React 18.2.0, Framer Motion 10.16.5
// AI_GENERATED_CODE_START
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
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
  Sparkles,
  Home
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
    route: '/dashboard',
    color: 'from-slate-500 to-slate-600'
  },
  {
    id: 'recovery',
    title: 'Recovery',
    icon: <Heart className="w-5 h-5" />,
    route: '/recovery',
    color: 'from-chakra-heart to-emerald-400'
  },
  {
    id: 'training',
    title: 'Treinamento',
    icon: <Dumbbell className="w-5 h-5" />,
    route: '/training',
    color: 'from-chakra-solar to-amber-400'
  },
  {
    id: 'rehabilitation',
    title: 'Reabilitação',
    icon: <MapPin className="w-5 h-5" />,
    route: '/rehabilitation',
    color: 'from-chakra-root to-red-400'
  },
  {
    id: 'sleep',
    title: 'Sono',
    icon: <Moon className="w-5 h-5" />,
    route: '/sleep',
    color: 'from-chakra-throat to-cyan-400'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    route: '/analytics',
    color: 'from-chakra-crown to-purple-400'
  },
  {
    id: 'ai-insights',
    title: 'IA',
    icon: <Brain className="w-5 h-5" />,
    route: '/ai-insights',
    color: 'from-chakra-third to-indigo-400'
  }
]

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
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

  const isActiveRoute = (route: string) => {
    return location.pathname === route
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 mandala-pattern opacity-20" />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-effect border-b border-white/20 sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo e Título */}
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-chakra-crown to-chakra-third flex items-center justify-center cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-display font-bold bg-gradient-to-r from-chakra-crown to-chakra-third bg-clip-text text-transparent">
                  SynthonIA AI
                </h1>
                <p className="text-slate-600 text-xs">
                  {profile?.full_name || 'Usuário'}
                </p>
              </div>
            </div>

            {/* Navegação Central */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.route)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActiveRoute(item.route)
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                  title={item.title}
                >
                  {item.icon}
                  <span className="hidden xl:inline text-sm">{item.title}</span>
                </motion.button>
              ))}
            </nav>

            {/* Navegação Mobile */}
            <nav className="flex lg:hidden items-center space-x-1">
              {navigationItems.slice(0, 4).map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.route)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isActiveRoute(item.route)
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                  title={item.title}
                >
                  {item.icon}
                </motion.button>
              ))}
            </nav>

            {/* Informações do Usuário e Logout */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-white/50 rounded-full">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  {getProfileTypeLabel(profile?.profile_type || '')}
                </span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="p-2 text-slate-600 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-white/50"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
}
// AI_GENERATED_CODE_END