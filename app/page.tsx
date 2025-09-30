'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Uranus Drive</h1>
        <p className="text-gray-600">Connexion au Cosmos...   Téléchargements des assets...   Redirection en cours...</p>
      </div>
    </div>
  );
}

