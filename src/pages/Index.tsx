
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from './AuthPage';
import PracticePage from './PracticePage';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-blue-200">
        <p className="text-xl text-blue-800">Loading...</p>
      </div>
    );
  }

  // Render AuthPage if not logged in, otherwise render PracticePage
  return user ? <PracticePage /> : <AuthPage />;
};

export default Index;
