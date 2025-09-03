# SynthonIA AI - Documentação Completa do Sistema

## Visão Geral

**SynthonIA AI** é uma plataforma de monitoramento de saúde e performance esportiva que utiliza inteligência artificial para fornecer insights sobre recuperação, treinamento, reabilitação e bem-estar geral. O sistema é inspirado na filosofia dos chakras, criando uma experiência holística e harmoniosa.

---

## 1. Arquitetura Técnica

### 1.1 Stack Tecnológico

**Frontend:**
- React 18.2.0 com TypeScript
- Vite como bundler
- React Router DOM 6.20.1 para roteamento
- Tailwind CSS 3.3.5 para estilização
- Framer Motion 10.16.5 para animações
- React Hook Form 7.48.2 para formulários
- Recharts 2.8.0 para visualizações
- Lucide React 0.294.0 para ícones

**Backend:**
- Supabase (PostgreSQL + Auth + RLS)
- Edge Functions (quando necessário)

**Dependências Auxiliares:**
- date-fns 2.30.0 para manipulação de datas
- clsx 2.0.0 e tailwind-merge 2.0.0 para classes condicionais

### 1.2 Estrutura de Arquivos

```
src/
├── components/
│   ├── Layout.tsx              # Layout principal com navegação
│   └── LoadingSpinner.tsx      # Componente de carregamento
├── contexts/
│   └── AuthContext.tsx         # Context de autenticação
├── lib/
│   └── supabase.ts            # Configuração do Supabase
├── pages/
│   ├── AuthPage.tsx           # Página de login/cadastro
│   ├── Dashboard.tsx          # Dashboard principal
│   ├── RecoveryModule.tsx     # Módulo de recuperação
│   ├── TrainingModule.tsx     # Módulo de treinamento
│   ├── RehabilitationModule.tsx # Módulo de reabilitação
│   ├── SleepModule.tsx        # Módulo de sono
│   ├── AnalyticsModule.tsx    # Dashboard analítico
│   └── AIInsightsModule.tsx   # Módulo de IA
├── utils/
│   └── diagnostics.ts         # Utilitários de diagnóstico
├── App.tsx                    # Componente raiz
├── main.tsx                   # Entry point
└── index.css                  # Estilos globais
```

---

## 2. Banco de Dados (Supabase)

### 2.1 Esquema de Tabelas

#### Tabela: `profiles`
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  profile_type text CHECK (profile_type IN ('athlete', 'trainer', 'physiotherapist')) NOT NULL,
  linked_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Tabela: `recovery_entries`
```sql
CREATE TABLE recovery_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10) NOT NULL,
  fatigue_level integer CHECK (fatigue_level >= 1 AND fatigue_level <= 10) NOT NULL,
  muscle_soreness integer CHECK (muscle_soreness >= 1 AND muscle_soreness <= 10) NOT NULL,
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10) NOT NULL,
  mood_level integer CHECK (mood_level >= 1 AND mood_level <= 10) NOT NULL,
  prs_score numeric(4,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);
```

#### Tabela: `training_sessions`
```sql
CREATE TABLE training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  session_name text NOT NULL,
  duration_minutes integer CHECK (duration_minutes > 0) NOT NULL,
  rpe integer CHECK (rpe >= 1 AND rpe <= 10) NOT NULL,
  exercises jsonb DEFAULT '[]'::jsonb NOT NULL,
  total_tonnage numeric(10,2) DEFAULT 0,
  density numeric(6,2) DEFAULT 0,
  session_load numeric(8,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Tabela: `sleep_entries`
```sql
CREATE TABLE sleep_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  bedtime time NOT NULL,
  wake_time time NOT NULL,
  sleep_duration numeric(4,2) CHECK (sleep_duration > 0) NOT NULL,
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10) NOT NULL,
  sleep_efficiency numeric(5,2) CHECK (sleep_efficiency >= 0 AND sleep_efficiency <= 100),
  deep_sleep_minutes integer CHECK (deep_sleep_minutes >= 0),
  rem_sleep_minutes integer CHECK (rem_sleep_minutes >= 0),
  awakenings integer CHECK (awakenings >= 0),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);
```

#### Tabela: `pain_entries`
```sql
CREATE TABLE pain_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  body_area text NOT NULL,
  pain_intensity integer CHECK (pain_intensity >= 1 AND pain_intensity <= 10) NOT NULL,
  pain_type text NOT NULL,
  description text,
  coordinates_x numeric(5,2) NOT NULL,
  coordinates_y numeric(5,2) NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Tabela: `ai_insights`
```sql
CREATE TABLE ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  insight_type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  data_sources text[] DEFAULT '{}' NOT NULL,
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1) NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 2.2 Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas que permitem:
- Usuários visualizam/editam apenas seus próprios dados
- Treinadores/Fisioterapeutas podem visualizar dados de atletas vinculados a eles

---

## 3. Variáveis de Ambiente

### 3.1 Arquivo `.env`
```env
VITE_SUPABASE_URL=https://sonzywfobxvvomkbbkgo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 3.2 Uso das Variáveis
- **VITE_SUPABASE_URL:** URL do projeto Supabase
- **VITE_SUPABASE_ANON_KEY:** Chave pública para autenticação

---

## 4. Design System e UI/UX

### 4.1 Paleta de Cores

#### Cores dos Chakras (Tema Principal)
```css
chakra: {
  root: '#FF0000',      /* Muladhara - Vermelho */
  sacral: '#FF8C00',    /* Svadhisthana - Laranja */
  solar: '#FFD700',     /* Manipura - Amarelo */
  heart: '#00FF00',     /* Anahata - Verde */
  throat: '#00BFFF',    /* Vishuddha - Azul */
  third: '#4B0082',     /* Ajna - Índigo */
  crown: '#9400D3',     /* Sahasrara - Violeta */
}
```

#### Paletas Auxiliares
```css
primary: {
  50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
  300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9',
  600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e'
}

secondary: {
  50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe',
  300: '#f0abfc', 400: '#e879f9', 500: '#d946ef',
  600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75'
}
```

### 4.2 Tipografia
- **Font Principal:** Inter (sans-serif)
- **Font Display:** Poppins (títulos e elementos destacados)
- **Pesos:** 300, 400, 500, 600, 700, 800

### 4.3 Componentes de UI

#### Glass Effect
```css
.glass-effect {
  backdrop-blur-md bg-white/20 border border-white/30
}
```

#### Chakra Cards
```css
.chakra-card {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s;
  hover:scale-105 hover:shadow-2xl;
}
```

#### Gradientes de Fundo
```css
/* Fundo principal */
bg-gradient-to-br from-slate-50 via-white to-purple-50

/* Gradientes por módulo */
Recovery: from-slate-50 via-white to-green-50
Training: from-slate-50 via-white to-yellow-50
Rehabilitation: from-slate-50 via-white to-red-50
Sleep: from-slate-50 via-white to-blue-50
AI Insights: from-slate-50 via-white to-indigo-50
```

### 4.4 Animações

#### Keyframes Customizadas
```css
@keyframes float {
  0%, 100% { transform: translateY(0px) }
  50% { transform: translateY(-10px) }
}

@keyframes mandala-rotate {
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
}
```

#### Classes de Animação
- `animate-pulse-slow`: Pulse de 3 segundos
- `animate-spin-slow`: Rotação de 8 segundos
- `animate-float`: Flutuação suave de 6 segundos

---

## 5. Estrutura de Componentes

### 5.1 AuthContext
**Responsabilidades:**
- Gerenciamento de estado de autenticação
- Integração com Supabase Auth
- Busca e atualização de perfis de usuário

**Estados:**
- `user`: Objeto do usuário autenticado
- `profile`: Dados do perfil do usuário
- `session`: Sessão ativa
- `loading`: Estado de carregamento

**Métodos:**
- `signUp(email, password, fullName, profileType)`
- `signIn(email, password)`
- `signOut()`
- `updateProfile(updates)`

### 5.2 Layout Principal
**Componentes:**
- Header fixo com navegação
- Logo animado com rotação
- Menu desktop e mobile responsivo
- Informações do usuário
- Botão de logout

**Navegação:**
```javascript
const navigationItems = [
  { id: 'dashboard', title: 'Dashboard', route: '/dashboard' },
  { id: 'recovery', title: 'Recovery', route: '/recovery' },
  { id: 'training', title: 'Treinamento', route: '/training' },
  { id: 'rehabilitation', title: 'Reabilitação', route: '/rehabilitation' },
  { id: 'sleep', title: 'Sono', route: '/sleep' },
  { id: 'ai-insights', title: 'IA', route: '/ai-insights' },
  { id: 'analytics', title: 'Analytics', route: '/analytics' }
]
```

---

## 6. Módulos da Aplicação

### 6.1 Módulo Recovery (Implementado)
**Funcionalidades:**
- Questionário diário de bem-estar (6 métricas)
- Cálculo de índice de prontidão
- Visualização em radar chart
- Gráficos de tendência (14 dias)
- Edição de entradas do dia atual

**Métricas Monitoradas:**
1. **Qualidade do Sono** (1-10)
2. **Nível de Fadiga** (1-10, invertido)
3. **Dor Muscular** (1-10, invertido)
4. **Nível de Estresse** (1-10, invertido)
5. **Humor Geral** (1-10)
6. **PRS - Percepção de Recuperação** (0-10)

**Fórmula do Índice de Prontidão:**
```javascript
const positiveFactors = (sleep_quality + mood_level + prs_score) / 3
const negativeFactors = (fatigue_level + muscle_soreness + stress_level) / 3
const readiness = ((positiveFactors + (10 - negativeFactors)) / 2)
```

### 6.2 Módulo Training (Planejado)
**Funcionalidades Planejadas:**
- Registro de sessões de treino
- Cálculo de tonelagem total
- Métricas de densidade
- Carga da sessão (RPE × Duração)
- ATL/CTL/TSB (Acute/Chronic Training Load)
- Importação de dados de wearables

### 6.3 Módulo Rehabilitation (Planejado)
**Funcionalidades Planejadas:**
- Mapa corporal interativo para registro de dor
- Biblioteca de exercícios terapêuticos
- Acompanhamento de progresso
- Coordenadas X/Y para localização precisa da dor

### 6.4 Módulo Sleep (Planejado)
**Funcionalidades Planejadas:**
- Registro manual de sono
- Integração com wearables
- Análise de padrões de sono
- Recomendações de higiene do sono
- Métricas: duração, eficiência, sono profundo, REM, despertares

### 6.5 Módulo AI Insights (Planejado)
**Funcionalidades Planejadas:**
- Análise de correlações entre dados
- Insights neurofisiológicos
- Recomendações personalizadas
- Chat com IA
- Score de confiança dos insights

### 6.6 Dashboard Analytics (Implementado)
**Funcionalidades:**
- Visualização dinâmica de métricas
- Filtros por categoria e período
- Gráficos de área com gradientes
- Estatísticas (média, mín, máx, tendência)
- Exportação de dados

---

## 7. Sistema de Autenticação

### 7.1 Fluxo de Autenticação
1. **Cadastro:** Email + senha + nome + tipo de perfil
2. **Login:** Email + senha
3. **Perfil:** Criado automaticamente via trigger
4. **Sessão:** Gerenciada pelo Supabase Auth

### 7.2 Tipos de Perfil
- **athlete:** Atleta
- **trainer:** Treinador
- **physiotherapist:** Fisioterapeuta

### 7.3 Sistema de Vinculação
- Atletas podem ser vinculados a treinadores/fisioterapeutas
- Profissionais podem visualizar dados de atletas vinculados

---

## 8. Design e UX

### 8.1 Filosofia de Design
**Inspiração:** Chakras e energia vital
**Estilo:** Minimalista, clean, com elementos de glassmorphism
**Cores:** Vibrantes mas harmoniosas, baseadas nos 7 chakras
**Animações:** Suaves e significativas, sem exageros

### 8.2 Padrões de Interface

#### Botões
```css
/* Botão primário */
bg-gradient-to-r from-chakra-[color] to-[complementary] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200

/* Botão secundário */
text-slate-600 hover:text-slate-800 hover:bg-white/50 transition-colors duration-200
```

#### Cards
```css
/* Card principal */
glass-effect rounded-2xl p-6

/* Card de módulo */
chakra-card glass-effect h-full
```

#### Inputs
```css
w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-chakra-[color] focus:border-transparent transition-all duration-200
```

### 8.3 Responsividade
- **Mobile First:** Design otimizado para dispositivos móveis
- **Breakpoints:** sm, md, lg, xl
- **Menu Mobile:** Hambúrguer com animação
- **Grid Responsivo:** 1 coluna (mobile) → 2-3 colunas (desktop)

### 8.4 Micro-interações
- **Hover States:** Scale 1.05, shadow-lg
- **Tap States:** Scale 0.95-0.98
- **Loading States:** Spinners com cores dos chakras
- **Transitions:** 200ms duration padrão

---

## 9. Configurações Específicas

### 9.1 Vite Config
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

### 9.2 TypeScript Config
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 9.3 React Router Config
```typescript
const router = createBrowserRouter([
  { path: "/auth", element: <AuthPage /> },
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "recovery", element: <RecoveryModule /> },
      // ... outros módulos
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
})
```

---

## 10. Funcionalidades por Módulo

### 10.1 Dashboard Principal
**Elementos:**
- Grid de 6 módulos com cards animados
- Cada card tem ícone, título, descrição e chakra associado
- Estatísticas rápidas (4 cards no rodapé)
- Navegação por clique nos cards

**Cards dos Módulos:**
1. **Recovery** → Chakra do Coração (Verde)
2. **Training** → Chakra do Plexo Solar (Amarelo)
3. **Rehabilitation** → Chakra Raiz (Vermelho)
4. **AI Insights** → Terceiro Olho (Índigo)
5. **Sleep** → Chakra da Garganta (Azul)
6. **Analytics** → Chakra da Coroa (Violeta)

### 10.2 Módulo Recovery (Detalhado)
**Interface do Questionário:**
- 6 sliders com escala 1-10
- Ícones coloridos para cada métrica
- Descrições explicativas
- Campo de notas opcional
- Cálculo em tempo real do índice de prontidão

**Visualizações:**
- Radar chart com 6 eixos
- Line chart com tendências de 14 dias
- Cards de estatísticas rápidas

**Estados:**
- Formulário (novo registro)
- Visualização (dados existentes)
- Edição (modificar registro do dia)

---

## 11. Padrões de Código

### 11.1 Estrutura de Componentes
```typescript
// Imports
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// ... outros imports

// Interfaces
interface ComponentProps {
  // definições
}

// Componente principal
export default function ComponentName() {
  // Estados
  const [state, setState] = useState()
  
  // Hooks
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Effects
  useEffect(() => {
    // lógica
  }, [dependencies])
  
  // Handlers
  const handleAction = async () => {
    // lógica
  }
  
  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[color]-50 p-6">
      {/* Conteúdo */}
    </div>
  )
}
```

### 11.2 Padrões de Animação
```typescript
// Entrada de página
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>

// Botões interativos
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>

// Elementos com delay
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
```

---

## 12. Integração com Supabase

### 12.1 Cliente Supabase
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### 12.2 Padrões de Query
```typescript
// Buscar dados do usuário
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', user.id)
  .order('date', { ascending: false })

// Inserir dados
const { error } = await supabase
  .from('table_name')
  .insert({
    user_id: user.id,
    ...data
  })

// Atualizar dados
const { error } = await supabase
  .from('table_name')
  .update(updates)
  .eq('id', recordId)
```

---

## 13. Funcionalidades Específicas

### 13.1 Sistema de Sliders (Recovery)
```typescript
const wellnessItems = [
  {
    key: 'sleep_quality',
    label: 'Qualidade do Sono',
    icon: <Moon className="w-5 h-5" />,
    color: 'from-blue-500 to-indigo-600',
    description: 'Como você avalia a qualidade do seu sono?'
  },
  // ... outros itens
]
```

### 13.2 Sistema de Métricas (Analytics)
```typescript
const metrics: MetricConfig[] = [
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
  // ... outras métricas
]
```

---

## 14. Estados e Fluxos de Dados

### 14.1 Fluxo de Autenticação
1. **Página Auth** → Formulário de login/cadastro
2. **AuthContext** → Gerencia estado global
3. **App Component** → Verifica autenticação
4. **Layout** → Renderiza interface autenticada

### 14.2 Fluxo de Dados dos Módulos
1. **Busca inicial** → useEffect ao montar componente
2. **Estados locais** → useState para dados específicos
3. **Formulários** → React Hook Form para validação
4. **Persistência** → Supabase para salvar dados
5. **Atualização** → Re-fetch após modificações

---

## 15. Configurações de Desenvolvimento

### 15.1 Scripts NPM
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview"
}
```

### 15.2 Dependências Críticas
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "recharts": "^2.8.0",
  "lucide-react": "^0.294.0",
  "framer-motion": "^10.16.5",
  "react-hook-form": "^7.48.2",
  "date-fns": "^2.30.0"
}
```

---

## 16. Troubleshooting e Diagnósticos

### 16.1 Sistema de Logs
- Logs detalhados em cada etapa crítica
- Diagnóstico automático de variáveis de ambiente
- Teste de conectividade com Supabase
- Timeouts de segurança para detectar travamentos

### 16.2 Problemas Comuns
1. **Loading infinito:** Verificar se `setLoading(false)` é chamado
2. **Erro 500:** Verificar sintaxe dos arquivos TypeScript
3. **Supabase connection:** Verificar variáveis de ambiente
4. **RLS errors:** Verificar políticas de segurança

---

## 17. Próximos Passos de Desenvolvimento

### 17.1 Prioridade Alta
1. **Completar módulo Training**
   - Interface de registro de exercícios
   - Cálculo de métricas avançadas
   - Importação de dados

2. **Implementar módulo Sleep**
   - Formulário de registro manual
   - Integração com APIs de wearables
   - Análise de padrões

### 17.2 Prioridade Média
1. **Módulo Rehabilitation**
   - Mapa corporal SVG interativo
   - Sistema de coordenadas
   - Biblioteca de exercícios

2. **Módulo AI Insights**
   - Integração com APIs de IA
   - Sistema de análise de correlações
   - Chat inteligente

### 17.3 Melhorias Futuras
- PWA (Progressive Web App)
- Notificações push
- Modo offline
- Sincronização com múltiplos dispositivos
- Dashboard para profissionais

---

## 18. Considerações de Performance

### 18.1 Otimizações Implementadas
- Lazy loading de componentes
- Memoização de cálculos pesados
- Debounce em inputs
- Limitação de queries (últimos 30 registros)

### 18.2 Monitoramento
- Console logs estruturados
- Error boundaries (recomendado implementar)
- Performance metrics (recomendado implementar)

---

## 19. Segurança

### 19.1 Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Usuários só acessam seus próprios dados
- Profissionais acessam dados de atletas vinculados

### 19.2 Validação
- Validação client-side com React Hook Form
- Constraints no banco de dados
- Sanitização de inputs

---

## 20. Deploy e Produção

### 20.1 Build
```bash
npm run build
```

### 20.2 Variáveis de Produção
- Configurar variáveis de ambiente no provedor de hosting
- Usar URLs de produção do Supabase
- Configurar domínio customizado

---

Esta documentação contém todas as informações necessárias para recriar o SynthonIA AI com fidelidade total ao design, funcionalidades e arquitetura originais. Use-a como referência completa durante o processo de recriação.