import { Link } from 'react-router-dom';
import { Activity, Video, BrainCircuit, Dumbbell, ShieldCheck, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo';

export default function Home() {
  const cards = [
    { icon: <Activity size={22} />, titulo: 'Análise Estática', desc: 'Postura em pé analisada no plano frontal e sagital: alinhamento de pelve, joelhos, tronco e cabeça.', to: '/assess?mode=statico' },
    { icon: <Video size={22} />, titulo: 'Análise Dinâmica (Corrida)', desc: 'Grave sua corrida/marcha e receba cadência, amplitude articular, simetria e padrão de contato do pé.', to: '/assess?mode=dinamico' },
    { icon: <BrainCircuit size={22} />, titulo: 'Relatório com IA', desc: 'A IA explica o que está acontecendo com seu corpo, ponto a ponto, com score biomecânico de 0 a 100.', to: '/history' },
    { icon: <Dumbbell size={22} />, titulo: 'Exercícios Prescritos', desc: 'Cada desvio gera recomendações práticas: mobilidade, força, estabilização e correção de gesto.', to: '/history' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-fuchsia-500/8 blur-3xl pointer-events-none" />

      <header className="flex items-center justify-between px-5 sm:px-10 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <Logo size={38} />
          <span className="font-black text-lg text-white tracking-tight">Biomech<span className="text-cyan-400">AI</span></span>
        </div>
        <Link to="/perfil" className="text-sm text-slate-300 hover:text-cyan-300 font-medium transition">Meu perfil →</Link>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-10 pb-16">
        <section className="py-10 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-cyan-300 bg-cyan-400/10 border border-cyan-400/30 rounded-full px-4 py-1.5 mb-6">
            <ShieldCheck size={14} /> Visão computacional + IA, direto no navegador
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.05]">
            Sua biomecânica<br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">decodificada por IA</span>
          </h1>
          <p className="mt-5 text-slate-400 max-w-xl mx-auto text-[15px] leading-relaxed">
            Grave um vídeo parado e outro correndo. Nossa IA rastreia 33 pontos articulares, calcula ângulos e padrões de marcha,
            explica o que está acontecendo com seu corpo e prescreve os exercícios certos para corrigir.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/assess?mode=statico" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-bold px-7 py-3.5 hover:from-cyan-400 hover:to-sky-500 transition">
              🧍 Analisar postura estática <ArrowRight size={17} />
            </Link>
            <Link to="/assess?mode=dinamico" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold px-7 py-3.5 hover:from-fuchsia-500 hover:to-purple-500 transition">
              🏃 Analisar corrida <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {cards.map((c) => (
            <Link key={c.titulo} to={c.to}
              className="group bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition shadow-lg">
              <div className="w-11 h-11 rounded-xl bg-cyan-400/10 text-cyan-300 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                {c.icon}
              </div>
              <h3 className="font-bold text-white">{c.titulo}</h3>
              <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed">{c.desc}</p>
            </Link>
          ))}
        </section>

        <section className="mt-12 grid md:grid-cols-3 gap-4">
          {[
            { n: '1', t: 'Cadastre-se', d: 'Crie sua conta com e-mail e senha (Supabase).' },
            { n: '2', t: 'Grave o vídeo', d: 'Fique parado 6 s ou corra 10 s na frente da câmera — esqueleto digital aparece ao vivo.' },
            { n: '3', t: 'Receba o laudo', d: 'Score, explicação da IA e treino corretivo personalizado.' },
          ].map((s) => (
            <div key={s.n} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex gap-4">
              <div className="w-9 h-9 shrink-0 rounded-full bg-fuchsia-500/15 text-fuchsia-300 font-black flex items-center justify-center">{s.n}</div>
              <div>
                <h4 className="font-bold text-white text-sm">{s.t}</h4>
                <p className="text-[13px] text-slate-400 mt-1">{s.d}</p>
              </div>
            </div>
          ))}
        </section>

        <footer className="mt-14 text-center text-[12px] text-slate-600">
          BiomechAI é uma ferramenta educacional de triagem e não substitui avaliação clínica presencial de médico ou fisioterapeuta.
        </footer>
      </main>
    </div>
  );
}
