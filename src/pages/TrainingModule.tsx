// [AI Generated] Data: 19/12/2024
// Descrição: Módulo de Treinamento com registro de sessões e cálculo de métricas
// Gerado por: Cursor AI
// Versão: React 18.2.0, React Hook Form 7.48.2
// AI_GENERATED_CODE_START
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Dumbbell, Plus, Upload, BarChart3 } from 'lucide-react'

export default function TrainingModule() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('register')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50 p-6">
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
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-chakra-solar to-amber-500 bg-clip-text text-transparent">
                Módulo Treinamento
              </h1>
              <p className="text-slate-600">Sistema de exercícios e progressão</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/50 rounded-xl p-1">
          {[
            { id: 'register', label: 'Registrar Treino', icon: <Plus className="w-4 h-4" /> },
            { id: 'import', label: 'Importar Dados', icon: <Upload className="w-4 h-4" /> },
            { id: 'analytics', label: 'Análise de Carga', icon: <BarChart3 className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-chakra-solar to-amber-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-effect rounded-2xl p-8"
        >
          <div className="text-center py-16">
            <Dumbbell className="w-16 h-16 text-chakra-solar mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold text-slate-800 mb-2">
              Módulo em Desenvolvimento
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Este módulo está sendo desenvolvido e incluirá registro de treinos, 
              cálculo de tonelagem, densidade, ATL/CTL/TSB e outras métricas avançadas.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
// AI_GENERATED_CODE_END