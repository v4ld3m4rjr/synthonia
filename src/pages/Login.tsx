import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { Logo } from '../components/Logo';
import { signIn, isSupabaseConfigured } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) return toast.error('Preencha e-mail e senha.');
    setLoading(true);
    const r = await signIn(email.trim().toLowerCase(), senha);
    setLoading(false);
    if (r.ok) {
      toast.success('Bem-vindo(a) de volta!');
      nav('/');
    } else {
      toast.error(r.message || 'Falha no login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="flex items-center gap-3 justify-center mb-8">
          <Logo size={48} />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">
              Biomech<span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Análise biomecânica com IA + vídeo</p>
          </div>
        </div>

        <div className="bg-slate-900/70 backdrop-blur border border-slate-800 rounded-2xl p-7 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">Entrar</h2>
          <p className="text-sm text-slate-400 mb-6">Acesse sua conta para analisar sua postura e corrida.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 pr-11 text-white placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition"
                />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold py-3 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? 'Entrando…' : <><Sparkles size={17} /> Entrar</>}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-400">
            Não tem conta?{' '}
            <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
              Criar cadastro
            </Link>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <p className="mt-4 text-center text-[12px] text-amber-400/80">
            ⚠️ Modo demonstração: Supabase não configurado — contas salvas localmente neste navegador.
          </p>
        )}
      </div>
    </div>
  );
}
