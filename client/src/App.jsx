import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TopicPage from './pages/TopicPage';
import Original369Page from './pages/Original369Page';
import { Toaster } from 'react-hot-toast';
import { syncUser, setAuthTokenGetter } from './api/client';

function App() {
  const { isSignedIn, isLoaded, getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(getToken);
    if (isLoaded && isSignedIn) {
      syncUser().catch(console.error);
    }
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Loading MyDSA Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="original-369" element={<Original369Page />} />
          <Route path="topic/:slug" element={<TopicPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
