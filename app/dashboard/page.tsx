'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FileBrowser from '@/components/FileBrowser';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  username?: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
      } else {
        console.error('Erreur lors de la déconnexion');
      }
    } catch (error) {
      console.error('Erreur réseau lors de la déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-purple-700 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-xl font-bold">U</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Uranus Drive</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Connecté en tant que <span className="font-medium">{user?.username || user?.email}</span>
                {user?.role === 'ADMIN' && (
                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Admin
                  </span>
                )}
              </span>
              {user?.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button 
                    variant="outline"
                    className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-colors duration-200"
                  >
                    ⚙️ Administration
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors duration-200"
              >
                🚪 Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center py-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Votre Drive personnel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gérez vos fichiers en toute sécurité avec Uranus Drive.
            </p>
          </div>

          {/* File Upload Section */}
          <FileUpload />

          {/* File Browser Section */}
          <FileBrowser />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Cosmos.Corp | Uranus Drive - Votre drive interne sécurisé</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

