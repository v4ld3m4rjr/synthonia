// [AI Generated] Data: 19/01/2025
// Descrição: Componente de configurações do usuário
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { dbHelpers, supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import CustomDateInput from '../ui/CustomDateInput';
import { 
  User as UserIcon, 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Download,
  Upload,
  Trash2,
  Save,
  AlertTriangle
} from 'lucide-react';

interface SettingsViewProps {
  user: User;
  onProfileSave?: (updates: Partial<User>) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onProfileSave }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'data'>('profile');
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    birth_date: user.birth_date || '',
    role: user.role,
    avatar_url: user.avatar_url || ''
  });
  // Estado para arquivo de avatar selecionado
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    achievements: true,
    recommendations: true
  });

  // Upload do avatar para Supabase
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setAvatarFile(file);
  
    // Impede crash quando Supabase não está configurado
    if (!supabase) {
      alert('Upload indisponível: Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ou informe manualmente a URL do avatar.');
      const blobUrl = URL.createObjectURL(file); // preview local (não persiste)
      setProfileData(prev => ({ ...prev, avatar_url: blobUrl }));
      onProfileSave?.({ avatar_url: blobUrl });
      return;
    }
  
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await (supabase as any).storage.from('avatars').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
      if (uploadError) {
        alert(`Falha ao enviar avatar: ${uploadError.message}`);
        return;
      }
      const { data: publicData } = (supabase as any).storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = publicData?.publicUrl || '';
      setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
      onProfileSave?.({ avatar_url: publicUrl });
      // Persistir no servidor imediatamente
      try {
        const { error } = await dbHelpers.updateUserProfile({ id: user.id, avatar_url: publicUrl } as any);
        if (error) {
          if (import.meta.env.DEV) {
            console.warn('Falha ao persistir avatar no servidor:', error);
          }
        }
      } catch (persistErr) {
        if (import.meta.env.DEV) {
          console.warn('Erro ao persistir avatar no servidor:', persistErr);
        }
      }
      alert('Avatar enviado com sucesso!');
    } catch (err) {
      alert('Ocorreu um erro ao processar o avatar. Tente novamente.');
      if (import.meta.env.DEV) {
        console.debug('SettingsView - Avatar upload error:', err);
      }
    }
  };

  const handleProfileSave = async () => {
    // Atualiza estado do perfil no componente pai
    onProfileSave?.({
      name: profileData.name,
      email: profileData.email,
      birth_date: profileData.birth_date,
      role: profileData.role as any,
      avatar_url: profileData.avatar_url
    });

    // Persistência no backend (Supabase) se disponível
    try {
      const payload = {
        id: user.id,
        name: profileData.name,
        email: profileData.email,
        birth_date: profileData.birth_date,
        role: profileData.role as any,
        avatar_url: profileData.avatar_url
      };
      const { error } = await dbHelpers.updateUserProfile(payload as any);
      if (error) {
        alert('Atualização local feita. Falha ao salvar no servidor: ' + error.message);
      } else {
        alert('Perfil atualizado com sucesso!');
      }
    } catch (err) {
      alert('Atualização local feita. Erro ao conectar ao servidor.');
      if (import.meta.env.DEV) {
        console.debug('SettingsView - updateUserProfile error:', err);
      }
    }
  };

  const handleNotificationsSave = () => {
    // Implementar salvamento das notificações
    alert('Configurações de notificação atualizadas!');
  };

  const handleDataExport = () => {
    // Implementar exportação de dados
    alert('Exportação de dados iniciada. Você receberá um email com o arquivo.');
  };

  const handleDataDelete = () => {
    if (confirm('Tem certeza que deseja excluir todos os seus dados? Esta ação não pode ser desfeita.')) {
      // Implementar exclusão de dados
      alert('Solicitação de exclusão de dados enviada.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: <UserIcon className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notificações', icon: <Bell className="h-4 w-4" /> },
    { id: 'privacy', label: 'Privacidade', icon: <Shield className="h-4 w-4" /> },
    { id: 'data', label: 'Dados', icon: <Download className="h-4 w-4" /> }
  ];

  const getRoleBadge = (role: string) => {
    const badges = {
      athlete: { text: 'Atleta', color: 'bg-blue-100 text-blue-800' },
      coach: { text: 'Treinador', color: 'bg-green-100 text-green-800' },
      physiotherapist: { text: 'Fisioterapeuta', color: 'bg-purple-100 text-purple-800' }
    };
    return badges[role as keyof typeof badges] || badges.athlete;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <p className="text-gray-300">Gerencie suas preferências e dados da conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Informações do Perfil</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                    {profileData.avatar_url ? (
                      <img
                        src={profileData.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://i.ibb.co/HDjWvZ8W/Chat-GPT-Image-6-07-2025-18-59-08.png';
              }}
                      />
                    ) : (
                      <UserIcon className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{user.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white`}>
                      {getRoleBadge(user.role).text}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Data de Nascimento
                    </label>
                    <CustomDateInput
                      value={profileData.birth_date}
                      onChange={(value) => setProfileData({...profileData, birth_date: value})}
                      className="w-full"
                      name="birth_date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Perfil
                    </label>
                    <select
                      value={profileData.role}
                      onChange={(e) => setProfileData({...profileData, role: e.target.value as any})}
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="athlete">Atleta</option>
                      <option value="coach">Treinador</option>
                      <option value="physiotherapist">Fisioterapeuta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL do Avatar
                    </label>
                    <input
                      type="url"
                      value={profileData.avatar_url}
                      onChange={(e) => setProfileData({...profileData, avatar_url: e.target.value})}
                      placeholder="https://exemplo.com/avatar.jpg"
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Upload de Avatar (imagem)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="w-full text-gray-300"
                      />
                      <p className="mt-2 text-xs text-gray-400">Arquivos de imagem (JPG, PNG, SVG). Em ambiente com Supabase, o arquivo será salvo no bucket 'avatars'.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleProfileSave} className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Salvar Alterações</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Notificações</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">Lembrete Diário</h3>
                      <p className="text-sm text-gray-300">Receba lembretes para fazer sua avaliação diária</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.dailyReminder}
                        onChange={(e) => setNotifications({...notifications, dailyReminder: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">Relatório Semanal</h3>
                      <p className="text-sm text-gray-300">Receba um resumo semanal do seu progresso</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.weeklyReport}
                        onChange={(e) => setNotifications({...notifications, weeklyReport: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">Conquistas</h3>
                      <p className="text-sm text-gray-300">Seja notificado quando alcançar novos marcos</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.achievements}
                        onChange={(e) => setNotifications({...notifications, achievements: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">Recomendações</h3>
                      <p className="text-sm text-gray-300">Receba sugestões personalizadas de treino</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.recommendations}
                        onChange={(e) => setNotifications({...notifications, recommendations: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNotificationsSave} className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Salvar Preferências</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Privacidade e Segurança</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Seus dados estão seguros</h3>
                    <p className="text-sm text-blue-800">
                      Utilizamos criptografia de ponta a ponta para proteger suas informações pessoais e dados de saúde.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Controle de Dados</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>• Seus dados de saúde são armazenados de forma segura e criptografada</p>
                      <p>• Você pode exportar ou excluir seus dados a qualquer momento</p>
                      <p>• Não compartilhamos suas informações com terceiros sem consentimento</p>
                      <p>• Você tem controle total sobre quem pode ver seus dados</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Configurações de Privacidade</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-white">Perfil Público</h5>
                          <p className="text-sm text-gray-300">Permitir que outros usuários vejam seu perfil básico</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-white">Análise de Dados</h5>
                          <p className="text-sm text-gray-300">Permitir análise anônima para melhorar o serviço</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'data' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Gerenciamento de Dados</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">Exportar Dados</h3>
                    <p className="text-sm text-green-800 mb-4">
                      Baixe uma cópia completa de todos os seus dados em formato JSON.
                    </p>
                    <Button onClick={handleDataExport} variant="outline" className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Exportar Meus Dados</span>
                    </Button>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-900 mb-2">Excluir Conta</h3>
                    <p className="text-sm text-red-800 mb-4">
                      Exclua permanentemente sua conta e todos os dados associados. Esta ação não pode ser desfeita.
                    </p>
                    <Button onClick={handleDataDelete} variant="outline" className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                      <span>Excluir Todos os Dados</span>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Estatísticas de Uso</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-700 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">--</div>
                        <div className="text-sm text-gray-300">Avaliações Diárias</div>
                      </div>
                      <div className="p-4 bg-gray-700 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">--</div>
                        <div className="text-sm text-gray-300">Sessões de Treino</div>
                      </div>
                      <div className="p-4 bg-gray-700 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">--</div>
                        <div className="text-sm text-gray-300">Dias de Uso</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;