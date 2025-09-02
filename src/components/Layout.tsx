// [AI Generated] Data: 19/12/2024
// Descrição: Layout principal com navegação superior e wrapper para páginas
// Gerado por: Cursor AI
// Versão: React 18.2.0, Framer Motion 10.16.5
// AI_GENERATED_CODE_START
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Heart, 
  Dumbbell, 
  MapPin, 
  Brain, 
  Moon, 
  BarChart3, 
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
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
    color: 'from-chakra-heart to-emerald-500'
  },
  {
    id: 'training',
    title: 'Treinamento',
    icon: <Dumbbell className="w-5 h-5" />,
    route: '/training',
    color: 'from-chakra-solar to-amber-500'
  },
  {
    id: 'rehabilitation',
    title: 'Reabilitação',
    icon: <MapPin className="w-5 h-5" />,
    route: '/rehabilitation',
    color: 'from-chakra-root to-red-500'
  },
  {
    id: 'sleep',
    title: 'Sono',
    icon: <Moon className="w-5 h-5" />,
    route: '/sleep',
    color: 'from-chakra-throat to-cyan-500'
  },
  {
    id: 'ai-insights',
    title: 'IA',
    icon: <Brain className="w-5 h-5" />,
    route: '/ai-insights',
    color: 'from-chakra-third to-indigo-500'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    route: '/analytics',
    color: 'from-chakra-crown to-purple-500'
  }
]

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const isActiveRoute = (route: string) => {
    return location.pathname === route
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 glass-effect border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chakra-crown to-chakra-third flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-display font-bold bg-gradient-to-r from-chakra-crown to-chakra-third bg-clip-text text-transparent">
                  SynthonIA AI
                </h1>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.route)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActiveRoute(item.route)
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm">{item.title}</span>
                </motion.button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-800">
                    {profile?.full_name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {profile?.profile_type || 'Usuário'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chakra-heart to-chakra-throat flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-white/50 transition-colors duration-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/20"
            >
              <div className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      navigate(item.route)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActiveRoute(item.route)
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
// AI_GENERATED_CODE_END