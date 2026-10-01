import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Logo } from '../components/Logo';
import { signUp, signIn, isSupabaseConfigured } from '../lib/supabase';
import type { Role } from '../lib/types';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<Role>('atleta');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return toast.error('Informe seu nome.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error('E-mail inválido.');
    if (senha.length < 6) return toast.error('A senha deve ter ao menos 6 caracteres.');
    if (senha !== confirm) return toast.error('As senhas não conferem.');

    setLoading(true);
    const r = await signUp(nome.trim(), email.trim().toLowerCase(), senha, role);
    if (!r.ok) {
      setLoading(false);
      return toast.error(r.message);
    }
    toast.success(r.message);
    // Em modo demo entra direto; com Supabase tenta login automático (se confirmação desligada)
    const lg = await signIn(email.trim().toLowerCase(), senha);
    setLoading(false);
    if (lg.ok) nav('/');
    else nav('/login');
  };

  const roles: { v: Role; label: string }[] = [
    { v: 'atleta', label: '🏃 Atleta / Corredor' },
    { v: 'treinador', label: '🏋️ Treinador' },
    { v: 'fisioterapeuta', label: '🩺 Fisioterapeuta' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="flex items-center gap-3 justify-center mb-8">
          <Logo size={48} />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">
              Biomech<span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Crie sua conta grátis</p>
          </div>
        </div>

        <div className="bg-slate-900/70 backdrop-blur border border-slate-800 rounded-2xl p-7 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6">Cadastro</h2>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nome completo</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Maria Silva"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-600 focus:border-cyan-400 outline-none transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Perfil</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button key={r.v} type="button" onClick={() => setRole(r.v)}
                    className={`rounded-xl border px-2 py-2.5 text-[12px] font-semibold transition ${
                      role === r.v ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500'
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-600 focus:border-cyan-400 outline-none transition" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Senha</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="mín. 6"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 pr-10 text-white placeholder:text-slate-600 focus:border-cyan-400 outline-none transition" />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Confirmar</label>
                <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="repetir"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-600 focus:border-cyan-400 outline-none transition" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-400 hover:to-cyan-400 text-slate-950 font-bold py-3 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? 'Criando conta…' : <><UserPlus size={17} /> Criar conta</>}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-400">
            Já tem conta?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">Entrar</Link>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <p className="mt-4 text-center text-[12px] text-amber-400/80">
            ⚠️ Modo demonstração: configure VITE_SUPABASE_URL no .env para cadastro real via Supabase.
          </p>
        )}
      </div>
    </div>
  );
}
