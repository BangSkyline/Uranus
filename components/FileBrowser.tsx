'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';

interface File {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export default function FileBrowser() {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
        setMessage('');
      } else {
        setMessage(`Échec du chargement des fichiers: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      setMessage('Erreur réseau ou serveur lors du chargement des fichiers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    
    // Listen for file upload events to refresh the list
    const handleFileUploaded = () => {
      fetchFiles();
    };
    
    window.addEventListener('fileUploaded', handleFileUploaded);
    return () => window.removeEventListener('fileUploaded', handleFileUploaded);
  }, []);

  const handleDownload = (fileId: string, fileName: string) => {
    window.open(`/api/files/${fileId}/download`, '_blank');
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Fichier supprimé avec succès !');
        fetchFiles(); // Refresh the list
      } else {
        const errorData = await response.json();
        setMessage(`Échec de la suppression: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      setMessage('Erreur réseau ou serveur lors de la suppression.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📄';
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Chargement des fichiers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="w-8 h-8 bg-gradient-to-r from-yellow-300 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-sm">📂</span>
          </span>
          Mes Fichiers ({files.length})
        </h2>
        <Button 
          onClick={fetchFiles} 
          variant="outline"
          className="hover:bg-gray-50 transition-colors duration-200"
        >
          🔄 Rafraîchir
        </Button>
      </div>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('succès') 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}
      
      {files.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-xl font-medium text-gray-600 mb-2">Aucun fichier trouvé</p>
          <p className="text-gray-500">Commencez par uploader votre premier fichier</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{getFileIcon(file.mimeType)}</div>
                <div>
                  <p className="font-semibold text-gray-800">{file.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{new Date(file.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(file.id, file.name)}
                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                >
                  ⬇️ Télécharger
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(file.id)}
                  className="hover:bg-red-600 transition-colors duration-200"
                >
                  🗑️ Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

