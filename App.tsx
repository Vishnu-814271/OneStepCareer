
import React, { useState, useEffect } from 'react';
import BookAuth from './components/BookAuth';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading for assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f1f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-16 h-16 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
           <p className="text-brand-blue font-bold animate-pulse">Initializing TechNexus Core...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased bg-[#f1f1f2] text-slate-800">
      {!user ? (
        <BookAuth onLogin={handleLogin} />
      ) : user.role === 'ADMIN' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <StudentDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
