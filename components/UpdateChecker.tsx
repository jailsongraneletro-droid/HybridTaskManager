import React, { useState, useEffect } from 'react';
import { X, Download, AlertCircle } from 'lucide-react';
import { checkForUpdates, downloadAndInstallUpdate, AppVersion } from '../services/updateService';

interface UpdateBannerProps {
  onClose?: () => void;
}

export const UpdateBanner: React.FC<UpdateBannerProps> = ({ onClose }) => {
  const [updateInfo, setUpdateInfo] = useState<AppVersion | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkUpdate();
  }, []);

  const checkUpdate = async () => {
    const result = await checkForUpdates();
    if (result.hasUpdate && result.version) {
      setUpdateInfo(result.version);
      setIsVisible(true);
    }
  };

  const handleDownload = async () => {
    if (!updateInfo) return;

    try {
      setIsDownloading(true);
      await downloadAndInstallUpdate(updateInfo.downloadUrl);
    } catch (error) {
      alert('Erro ao baixar atualização. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    if (updateInfo?.mandatory) {
      alert('Esta atualização é obrigatória para continuar usando o app.');
      return;
    }
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible || !updateInfo) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${
      updateInfo.mandatory ? 'bg-red-600' : 'bg-blue-600'
    } text-white shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {updateInfo.mandatory && (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base">
                {updateInfo.mandatory 
                  ? '⚠️ Atualização Obrigatória Disponível' 
                  : '🎉 Nova Versão Disponível'}
              </p>
              <p className="text-xs sm:text-sm opacity-90 truncate">
                Versão {updateInfo.version} - {updateInfo.releaseNotes}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Baixando...' : 'Atualizar'}
            </button>

            {!updateInfo.mandatory && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal de atualização (alternativa ao banner)
 */
export const UpdateModal: React.FC<{ version: AppVersion; onClose: () => void }> = ({
  version,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadAndInstallUpdate(version.downloadUrl);
    } catch (error) {
      alert('Erro ao baixar atualização. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    if (version.mandatory) {
      alert('Esta atualização é obrigatória para continuar usando o app.');
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${version.mandatory ? 'bg-red-600' : 'bg-blue-600'} text-white`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {version.mandatory ? '⚠️ Atualização Obrigatória' : '🎉 Nova Versão'}
            </h2>
            {!version.mandatory && (
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="mt-2 text-sm opacity-90">Versão {version.version}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            O que há de novo:
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
            {version.releaseNotes}
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Publicado em: {new Date(version.releaseDate).toLocaleDateString('pt-BR')}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex-1 py-3 rounded-lg font-semibold text-white transition disabled:opacity-50 ${
              version.mandatory ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isDownloading ? 'Baixando...' : 'Baixar e Instalar'}
          </button>

          {!version.mandatory && (
            <button
              onClick={handleClose}
              className="px-6 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Agora Não
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
