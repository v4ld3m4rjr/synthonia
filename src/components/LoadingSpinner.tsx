// [AI Generated] Data: 19/12/2024
// Descrição: Componente de loading com animação de mandala inspirada nos chakras
// Gerado por: Cursor AI
// Versão: React 18.2.0, Framer Motion 10.16.5
// AI_GENERATED_CODE_START
import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function LoadingSpinner() {
  console.log('⏳ LoadingSpinner: Componente renderizado')
  
  // Adicionar timeout de segurança para detectar travamentos
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('⚠️ LoadingSpinner: Componente ativo por mais de 10 segundos - possível travamento!')
      console.warn('⚠️ Verifique as variáveis de ambiente e a conexão com o Supabase')
    }, 10000)
    
    return () => clearTimeout(timeout)
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="relative">
        {/* Mandala externa */}
        <motion.div
          className="w-32 h-32 rounded-full border-4 border-transparent"
          style={{
            background: 'conic-gradient(from 0deg, #FF0000, #FF8C00, #FFD700, #00FF00, #00BFFF, #4B0082, #9400D3, #FF0000)',
            padding: '4px',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            {/* Mandala interna */}
            <motion.div
              className="w-16 h-16 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(148,0,211,0.3) 0%, rgba(75,0,130,0.2) 50%, transparent 100%)',
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </motion.div>
        
        {/* Texto de carregamento */}
        <motion.div
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg font-display font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            SynthonIA AI
          </p>
          <motion.div
            className="flex justify-center mt-2 space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
// AI_GENERATED_CODE_END