import React, { useState } from 'react';
import { X, MapPin, Phone, Mail, Linkedin, Github, Calendar, Award, Briefcase, GraduationCap } from 'lucide-react';
import { curriculum as profileCurriculum } from './ProfileCard';

interface ProfilePhotoProps {
  size?: number;
  className?: string;
  avatarUrl?: string;
  name?: string;
  title?: string;
  curriculumText?: string;
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({ 
  size = 40, 
  className = "", 
  avatarUrl = 'https://i.ibb.co/HDjWvZ8W/Chat-GPT-Image-6-07-2025-18-59-08.png',
  name = 'Valdemar Junior',
  title = 'Gestor de Dados Humanos',
  curriculumText
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const defaultCloudUrl = 'https://i.ibb.co/HDjWvZ8W/Chat-GPT-Image-6-07-2025-18-59-08.png';
  const isAlbumLink = /imgur\.com\/a\//i.test(avatarUrl || '');
  const isIbbPageLink = /https?:\/\/(www\.)?ibb\.co\//i.test(avatarUrl || '');
  const hasImageExt = /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(avatarUrl || '');
  const effectiveAvatar = (!avatarUrl || isAlbumLink || isIbbPageLink || !hasImageExt) ? defaultCloudUrl : avatarUrl;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Foto Circular Clicável */}
      <div 
        className={`relative cursor-pointer transition-transform hover:scale-105 ${className}`}
        onClick={openModal}
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
          <img 
            src={effectiveAvatar}
            alt={name}
            className="w-full h-full rounded-full object-cover"
            onLoad={() => {/* sucesso silencioso */}}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Primeiro fallback: ImgBB direto
              target.src = 'https://i.ibb.co/HDjWvZ8W/Chat-GPT-Image-6-07-2025-18-59-08.png';
              (target as any).onerror = () => {
                // Segundo fallback: imagem local SVG
                target.src = '/valdemar-photo.svg';
                (target as any).onerror = () => {
                  // Se a imagem local também falhar, mostrar iniciais
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">VJ</div>';
                  }
                };
              };
            }}
          />
        </div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      </div>

      {/* Modal do Currículo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b1b3a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-[#0b1b3a] border-b border-blue-900 p-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                  <img
                    src={effectiveAvatar}
                    alt={name}
                    className="w-full h-full rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Primeiro fallback: ImgBB direto
                      target.src = 'https://i.ibb.co/HDjWvZ8W/Chat-GPT-Image-6-07-2025-18-59-08.png';
                      (target as any).onerror = () => {
                        // Segundo fallback: imagem local SVG
                        target.src = '/valdemar-photo.svg';
                        (target as any).onerror = () => {
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-lg">VJ</div>';
                          }
                        };
                      };
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{name}</h2>
                  <p className="text-lg text-gray-200">{title}</p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-300" />
              </button>
            </div>

            {/* Conteúdo do Currículo */}
            <div className="p-6 space-y-8 text-gray-200">
              {/* Informações de Contato */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-200">Salvador</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-200">(71) 99202-1874</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-200">valdemarjunior@gmail.com</span>
                </div>
              </div>

              {/* Currículo Completo (texto atualizado) */}
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <Briefcase className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-white">Currículo Profissional</span>
                </h3>
                <pre className="whitespace-pre-wrap text-gray-200 leading-relaxed">{curriculumText ?? profileCurriculum}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
   </>
 );
};

export default ProfilePhoto;