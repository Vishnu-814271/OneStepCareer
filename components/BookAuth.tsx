import React, { useState } from 'react';
import { User, Role } from '../types';
import { Lock, User as UserIcon, Book, ArrowRight, ShieldCheck, AlertCircle, Globe } from 'lucide-react';
import { dataService } from '../services/dataService';
import PaymentGateway from './PaymentGateway';

interface BookAuthProps {
  onLogin: (user: User) => void;
}

const BookAuth: React.FC<BookAuthProps> = ({ onLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<Role>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Payment State
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    // Only close if clicking the background, not the book
    if (e.target === e.currentTarget && !pendingUser) {
      setIsOpen(false);
    }
  };

  const finalizeLogin = (user: User) => {
    // Check if user needs to pay (only for students)
    if (user.role === 'STUDENT' && !user.isPaid) {
      setPendingUser(user);
    } else {
      onLogin(user);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Mock Social Login
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
      role: 'STUDENT',
      isPaid: false
    };
    
    // Check if user exists, else register
    const existing = dataService.getUsers().find(u => u.email === mockUser.email);
    if (existing) {
      finalizeLogin(existing);
    } else {
      dataService.registerUser(mockUser);
      finalizeLogin(mockUser);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const users = dataService.getUsers();

    if (activeTab === 'login') {
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
      
      // Simulating password check (allow any password for demo if user exists)
      if (existingUser) {
        finalizeLogin(existingUser);
      } else {
        setError("Invalid credentials or user does not exist.");
      }
    } else {
      // Signup
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        role: role,
        isPaid: false
      };

      const success = dataService.registerUser(newUser);
      if (success) {
        finalizeLogin(newUser);
      } else {
        setError("This email ID is already registered. Please choose a unique ID.");
      }
    }
  };

  if (pendingUser) {
    return (
      <PaymentGateway 
        user={pendingUser} 
        onPaymentComplete={(paidUser) => {
           setPendingUser(null);
           onLogin(paidUser);
        }} 
      />
    );
  }

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-[#050b14] p-4 perspective-2000 overflow-hidden relative"
      onClick={handleClose}
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),rgba(5,11,20,0))] pointer-events-none"></div>

      {/* Helper Text */}
      {!isOpen && (
        <div className="absolute bottom-20 animate-bounce text-cyan-400/70 flex flex-col items-center gap-2 pointer-events-none">
          <span className="text-sm tracking-[0.2em] uppercase font-bold text-shadow-glow">Tap to Open</span>
          <ArrowRight className="rotate-90" />
        </div>
      )}

      {/* The 3D Book Container */}
      <div 
        className={`relative w-[320px] md:w-[400px] h-[500px] md:h-[650px] transition-transform duration-1000 ease-in-out transform-style-3d ${isOpen ? 'translate-x-[50%] md:translate-x-[50%]' : ''}`}
      >
        {/* BOOK FRONT COVER (Rotates open) */}
        <div 
          className={`absolute inset-0 z-20 transition-all duration-1000 ease-in-out transform-style-3d origin-left cursor-pointer ${isOpen ? 'rotate-y-180' : ''}`}
          onClick={!isOpen ? handleOpen : undefined}
        >
          {/* Front of Front Cover */}
          <div className="absolute inset-0 bg-[#0f172a] rounded-r-lg rounded-l-sm shadow-2xl border-l-4 border-cyan-900 flex flex-col items-center justify-center p-8 backface-hidden ring-1 ring-cyan-500/20">
            <div className="w-full h-full border-2 border-cyan-500/20 rounded-lg flex flex-col items-center justify-between p-8 bg-gradient-to-br from-[#0f172a] to-[#1e293b] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl"></div>
              <div className="text-cyan-400 font-mono text-xs tracking-widest opacity-70">EST. 2024</div>
              <div className="flex flex-col items-center text-center z-10">
                <div className="p-4 bg-cyan-500/10 rounded-full mb-6 ring-1 ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <Book size={64} className="text-cyan-400" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">TechNexus</h1>
                <p className="text-cyan-200 uppercase tracking-[0.3em] text-xs">Academy</p>
              </div>
              <div className="text-[10px] text-cyan-400/60 uppercase tracking-widest border border-cyan-500/20 px-3 py-1 rounded-full">Click to Enter</div>
            </div>
            
            {/* Spine Highlight */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/5 to-transparent opacity-50"></div>
          </div>

          {/* Back of Front Cover (Inside Left) */}
          <div className="absolute inset-0 bg-[#1e293b] rounded-l-lg rounded-r-sm shadow-xl transform rotate-y-180 backface-hidden flex flex-col p-8 text-slate-200 border border-slate-700">
             <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                <h2 className="text-2xl font-bold text-cyan-400">Welcome Back</h2>
                <p className="text-slate-400 italic font-light">
                  "The future belongs to those who learn more skills and combine them in creative ways."
                </p>
                <div className="w-16 h-1 bg-cyan-500/30 rounded-full"></div>
                <div className="text-sm text-slate-500">
                  Join thousands of developers mastering Python, AI, and Machine Learning.
                </div>
             </div>
             <div className="text-center text-xs text-slate-500 mt-auto">
               TechNexus Academy &copy; 2024
             </div>
          </div>
        </div>

        {/* BOOK BACK COVER / RIGHT PAGE (Static base) */}
        <div className="absolute inset-0 z-10 bg-[#0f172a] rounded-r-lg rounded-l-sm shadow-[20px_20px_50px_rgba(0,0,0,0.5)] flex flex-col border border-slate-800">
          {/* Login/Signup Form Content */}
          <div className="relative z-10 flex-1 p-8 flex flex-col">
            
            {/* Tabs */}
            <div className="flex w-full mb-6 border-b border-slate-700">
              <button 
                onClick={() => { setActiveTab('login'); setError(null); }}
                className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'login' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Login
              </button>
              <button 
                onClick={() => { setActiveTab('signup'); setError(null); }}
                className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'signup' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
              
              {/* Role Selection */}
              <div className="flex gap-2 mb-1 p-1 bg-slate-900 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${role === 'STUDENT' ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-400'}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${role === 'ADMIN' ? 'bg-slate-800 text-violet-400 shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-400'}`}
                >
                  Admin
                </button>
              </div>

              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm placeholder-slate-600 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm placeholder-slate-600 transition-all"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm placeholder-slate-600 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <button 
                type="submit"
                className="mt-1 w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                {activeTab === 'login' ? 'Enter Portal' : 'Create Account'}
                <ArrowRight size={16} />
              </button>

              {/* Social Login Buttons */}
              <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-700"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase">Or continue with</span>
                  <div className="flex-grow border-t border-slate-700"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button type="button" onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs font-bold transition-all">
                    <span className="text-red-500 font-black">G</span> Google
                 </button>
                 <button type="button" onClick={() => handleSocialLogin('Facebook')} className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs font-bold transition-all">
                    <span className="text-blue-500 font-black">f</span> Facebook
                 </button>
              </div>

            </form>

            {role === 'ADMIN' && (
               <div className="mt-4 flex items-center justify-center gap-1 text-xs text-violet-400/80 bg-violet-900/10 p-2 rounded border border-violet-500/20">
                 <ShieldCheck size={12} />
                 <span>Secure Admin Environment</span>
               </div>
            )}
          </div>
        </div>

        {/* Decorative Pages Effect (Right Side) */}
        <div className="absolute right-0 top-1 bottom-1 w-2 bg-slate-800 rounded-r-md z-0 transform translate-x-1 border-r border-slate-700"></div>
        <div className="absolute right-0 top-2 bottom-2 w-2 bg-slate-800 rounded-r-md z-0 transform translate-x-2 border-r border-slate-700"></div>
      </div>
    </div>
  );
};

export default BookAuth;