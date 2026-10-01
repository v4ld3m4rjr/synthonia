import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, LogOut, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, resetPassword, isSupabaseConfigured } from '../lib/supabase';

export default function Profile() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [nome, setNome] = useState(user?.nome || '');
  const [idade, setIdade] = useState<string>(user?.idade ? String(user.idade) : '');
  const [peso, setPeso] = useState<string>(user?.peso ? String(user.peso) : '');
  const [altura, setAltura] = useState<string>(user?.altura ? String(user.altura) : '');
  const [emailReset, setEmailReset] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const save = async () => {
    setSaving(true);
    await updateProfile({
      nome: nome.trim(),
      idade: idade ? Number(idade) : null,
      peso: peso ? Number(peso.replace(',', '.')) : null,
      altura: altura ? Number(altura.replace(',', '.')) : null,
    });
    setSaving(false);
    toast.success('Perfil atualizado!');
    window.dispatchEvent(new Event('biomech-auth'));
  };

  const doReset = async () => {
    const r = await resetPassword(emailReset.trim().toLowerCase() || user.email);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
  };

  return (
    <div className="min-h-screen pb-16">
      <header className="flex items-center justify-between px-5 sm:px-8 py-4 max-w-3xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium">
          <ChevronLeft size={18} /> Início
        </Link>
        <h1 className="font-black text-white tracking-tight">👤 Meu perfil</h1>
        <span className="w-16" />
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 space-y-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-slate-950 font-black text-xl">
              {user.nome.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-white">{user.nome}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
              <p className="text-[11px] mt-1 inline-block px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 font-semibold uppercase tracking-wide">{user.role}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome"><input value={nome} onChange={(e) => setNome(e.target.value)} className={inp} /></Field>
            <Field label="Idade"><input value={idade} onChange={(e) => setIdade(e.target.value)} inputMode="numeric" placeholder="ex: 28" className={inp} /></Field>
            <Field label="Peso (kg)"><input value={peso} onChange={(e) => setPeso(e.target.value)} inputMode="decimal" placeholder="ex: 72,5" className={inp} /></Field>
            <Field label="Altura (cm)"><input value={altura} onChange={(e) => setAltura(e.target.value)} inputMode="decimal" placeholder="ex: 178" className={inp} /></Field>
          </div>

          <button onClick={save} disabled={saving}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-60">
            <Save size={16} /> {saving ? 'Salvando…' : 'Salvar perfil'}
          </button>
        </div>

        {isSupabaseConfigured && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-1">🔒 Redefinir senha</h3>
            <p className="text-[13px] text-slate-400 mb-4">Enviaremos um link de recuperação para seu e-mail ({user.email}).</p>
            <div className="flex gap-3">
              <input value={emailReset} onChange={(e) => setEmailReset(e.target.value)} placeholder={user.email} className={inp + ' flex-1'} />
              <button onClick={doReset} className="rounded-xl border border-slate-600 hover:border-cyan-400 px-5 font-semibold text-sm text-slate-200 transition shrink-0">Enviar</button>
            </div>
          </div>
        )}

        <button
          onClick={async () => { await logout(); nav('/login'); }}
          className="w-full rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 font-semibold py-3 flex items-center justify-center gap-2 transition">
          <LogOut size={16} /> Sair da conta
        </button>
      </main>
    </div>
  );
}

const inp = 'w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-600 focus:border-cyan-400 outline-none transition';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
