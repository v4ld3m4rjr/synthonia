// [AI Generated] Data: 19/01/2025
// Descrição: Header da aplicação com navegação e perfil
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React, { useState } from 'react';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { User as UserIcon, Settings, LogOut, Menu, X } from 'lucide-react';
import SynthoniaLogo from '../ui/SynthoniaLogo';
import ProfilePhoto from '../ui/ProfilePhoto';
import { curriculum as profileCurriculum } from '../ui/ProfileCard';

interface HeaderProps {
  user: User;
  onSignOut: () => void;
  currentView?: string;
  setCurrentView?: (view: 'overview' | 'assessment' | 'analytics' | 'history' | 'settings' | 'sleep' | 'results') => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut, currentView, setCurrentView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    const badges = {
      athlete: { text: 'Atleta', color: 'bg-blue-100 text-blue-800' },
      coach: { text: 'Treinador', color: 'bg-green-100 text-green-800' },
      physiotherapist: { text: 'Fisioterapeuta', color: 'bg-purple-100 text-purple-800' }
    };
    return badges[role as keyof typeof badges] || badges.athlete;
  };

  const badge = getRoleBadge(user.role);
  const initial = (user.name?.trim()?.charAt(0) || '?').toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-gray-700 shadow-sm border-b border-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <SynthoniaLogo className="h-8 w-8" size={40} />
            <div>
              <h1 className="text-xl font-bold text-white">
                SynthonIA AI
              </h1>
              <p className="text-xs text-gray-300 hidden sm:block">Recovery and Training System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <button 
              onClick={() => setCurrentView?.('overview')}
              className={`px-3 py-2 rounded-md font-medium text-sm transition-colors flex items-center ${
                currentView === 'overview' 
                ? 'bg-gray-600/30 text-white border-b-2 border-blue-500' 
                : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setCurrentView?.('sleep')}
              className={`px-3 py-2 rounded-md font-medium text-sm transition-colors flex items-center ${
                currentView === 'sleep' 
                ? 'bg-gray-600/30 text-white border-b-2 border-blue-500' 
                : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
              }`}
            >
              Sono
            </button>
            <button 
              onClick={() => setCurrentView?.('analytics')}
              className={`px-3 py-2 rounded-md font-medium text-sm transition-colors flex items-center ${
                currentView === 'analytics' 
                ? 'bg-gray-600/30 text-white border-b-2 border-blue-500' 
                : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
              }`}
            >
              Análises
            </button>
            <button 
              onClick={() => setCurrentView?.('history')}
              className={`px-3 py-2 rounded-md font-medium text-sm transition-colors flex items-center ${
                currentView === 'history' 
                ? 'bg-gray-600/30 text-white border-b-2 border-blue-500' 
                : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
              }`}
            >
              Histórico
            </button>
            <button 
              onClick={() => setCurrentView?.('settings')}
              className={`px-3 py-2 rounded-md font-medium text-sm transition-colors flex items-center ${
                currentView === 'settings' 
                ? 'bg-gray-600/30 text-white border-b-2 border-blue-500' 
                : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
              }`}
            >
              Configurações
            </button>
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            
            {/* Profile Photo */}
            <ProfilePhoto 
              size={40}
              avatarUrl={user.avatar_url || 'https://i.ibb.co/HDjWvZ8W/Chat-GPT-Image-6-07-2025-18-59-08.png'}
              name={'Valdemar Junior'}
              title={user.title || 'Gestor de Dados Humanos'}
              curriculumText={profileCurriculum}
            />
            
            {/* User Info - Hidden on small screens */}
            <div className="hidden lg:block text-right">
              <p className="font-semibold text-white">{user.name}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.text}
              </span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-600">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold">{initial}</span>
                  </div>
                </div>
              </button>
                  
                              {profileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-600 py-2 z-50">
                                  <div className="px-4 py-2 border-b border-gray-600 lg:hidden">
                                    <p className="font-semibold text-white">{user.name}</p>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                      {badge.text}
                                    </span>
                                  </div>
                                  
                                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors">
                                    <Settings className="h-4 w-4" />
                                    <span onClick={() => setCurrentView?.('settings')}>Configurações</span>
                                  </button>
                                  
                                  <button 
                                    onClick={onSignOut}
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sair</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Mobile menu button */}
                            <button
                              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                              className="md:hidden p-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              {mobileMenuOpen ? (
                                <X className="h-5 w-5 text-gray-300" />
                              ) : (
                                <Menu className="h-5 w-5 text-gray-300" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Mobile Navigation */}
                        {mobileMenuOpen && (
                          <div className="md:hidden border-t border-gray-600 py-4">
                            <nav className="space-y-2">
                              <button 
                                onClick={() => setCurrentView?.('overview')}
                                className={`block w-full text-left px-4 py-2 rounded-md font-medium transition-colors ${
                                  currentView === 'overview' 
                                  ? 'bg-gray-600/30 text-white border-l-4 border-blue-500' 
                                  : 'text-gray-300 hover:bg-gray-700/30 hover:text-white border-l-4 border-transparent'
                                }`}
                              >
                                Dashboard
                              </button>
                              <button 
                                onClick={() => setCurrentView?.('sleep')}
                                className={`block w-full text-left px-4 py-2 rounded-md font-medium transition-colors ${
                                  currentView === 'sleep' 
                                  ? 'bg-gray-600/30 text-white border-l-4 border-blue-500' 
                                  : 'text-gray-300 hover:bg-gray-700/30 hover:text-white border-l-4 border-transparent'
                                }`}
                              >
                                Sono
                              </button>
                              <button 
                                onClick={() => setCurrentView?.('analytics')}
                                className={`block w-full text-left px-4 py-2 rounded-md font-medium transition-colors ${
                                  currentView === 'analytics' 
                                  ? 'bg-gray-600/30 text-white border-l-4 border-blue-500' 
                                  : 'text-gray-300 hover:bg-gray-700/30 hover:text-white border-l-4 border-transparent'
                                }`}
                              >
                                Análises
                              </button>
                              <button 
                                onClick={() => setCurrentView?.('history')}
                                className={`block w-full text-left px-4 py-2 rounded-md font-medium transition-colors ${
                                  currentView === 'history' 
                                  ? 'bg-gray-600/30 text-white border-l-4 border-blue-500' 
                                  : 'text-gray-300 hover:bg-gray-700/30 hover:text-white border-l-4 border-transparent'
                                }`}
                              >
                                Histórico
                              </button>
                              <button 
                                onClick={() => setCurrentView?.('settings')}
                                className={`block w-full text-left px-4 py-2 rounded-md font-medium transition-colors ${
                                  currentView === 'settings' 
                                  ? 'bg-gray-600/30 text-white border-l-4 border-blue-500' 
                                  : 'text-gray-300 hover:bg-gray-700/30 hover:text-white border-l-4 border-transparent'
                                }`}
                              >
                                Configurações
                              </button>
                            </nav>
                          </div>
                        )}
                      </div>
                      
                      {/* Click outside handler for profile menu */}
                      {profileMenuOpen && (
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setProfileMenuOpen(false)}
                        />
                      )}
                    </header>
                  );
                };
                
                export default Header;
                // AI_GENERATED_CODE_END