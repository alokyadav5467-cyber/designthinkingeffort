import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { SessionPage } from './pages/SessionPage';
import { Analytics } from './pages/Analytics';
import { Psychology } from './pages/Psychology';
import { Settings } from './pages/Settings';

function App() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="ml-64 p-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
