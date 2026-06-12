'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import ListaLogin from '@/app/components/ListaLogin';
import ListaDashboard from '@/app/components/ListaDashboard';

export default function ListaPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const checkAuth = async () => {
    setCheckingAuth(true);
    try {
      const response = await fetch('/api/lista-auth');
      const data = await response.json();
      setAuthenticated(data.authenticated);
    } catch {
      setAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label="Duke u ngarkuar..." size="lg" />
      </div>
    );
  }

  if (!authenticated) {
    return <ListaLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return <ListaDashboard onLogout={() => setAuthenticated(false)} />;
}
