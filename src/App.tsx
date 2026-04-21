import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { SessionPage } from './pages/SessionPage';
import { Analytics } from './pages/Analytics';
import { Psychology } from './pages/Psychology';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

function App() {
  const { user, loading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'session':
        return <SessionPage />;
      case 'analytics':
        return <Analytics />;
      case 'psychology':
        return <Psychology />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onSignOut={signOut}
      />

      <main className="ml-64 p-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
