'use client';

import React, { useState, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setMessage('');
    } else {
      setSelectedFile(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Veuillez sélectionner un fichier à uploader.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('Fichier uploadé avec succès !');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Trigger a custom event to refresh file list
        window.dispatchEvent(new CustomEvent('fileUploaded'));
      } else {
        const errorData = await response.json();
        setMessage(`Échec de l'upload: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setMessage('Erreur réseau ou serveur.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mb-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="w-8 h-8 bg-gradient-to-r from-yellow-300 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white text-sm">📁</span>
        </span>
        Uploader un fichier
      </h2>
      
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-4xl">📤</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Glissez-déposez votre fichier ici
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ou cliquez pour sélectionner
            </p>
          </div>
          
          <Input 
            ref={fileInputRef}
            type="file" 
            onChange={handleFileChange} 
            className="max-w-xs mx-auto cursor-pointer"
          />
          
          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="font-medium text-gray-800">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div className="text-green-500 text-xl">✓</div>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            {isUploading ? 'Upload en cours...' : 'Uploader le fichier'}
          </Button>
        </div>
      </div>
      
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          message.includes('succès') 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}
    </div>
  );
}

