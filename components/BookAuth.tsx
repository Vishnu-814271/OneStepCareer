import React from 'react';
import { User } from '../types';
import { dataService } from '../services/dataService';
import { GraduationCap, Shield, Terminal, ArrowRight, Sparkles, BookOpen, Code } from 'lucide-react';

interface BookAuthProps {
  onLogin: (user: User) => void;
}

const BookAuth: React.FC<BookAuthProps> = ({ onLogin }) => {
  const handleSelectRole = (role: 'ADMIN' | 'STUDENT') => {
    const user = dataService.getPortalUser(role);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-green/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-6xl z-10">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-brand-gold text-xs font-black uppercase tracking-[0.3em]">
            <Sparkles size={14} /> Industrial Grade Education
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-black text-white tracking-tighter">
            TECHNEXUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">ACADEMY</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            A unified ecosystem for technical mastery. Choose your path to initialize the core terminal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {/* Student Entry Card */}
          <div 
            onClick={() => handleSelectRole('STUDENT')}
            className="group relative glass-card p-12 rounded-[40px] border border-slate-800 hover:border-brand-blue/50 transition-all duration-500 cursor-pointer overflow-hidden student-theme-gradient"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center text-white mb-8 shadow-xl shadow-brand-blue/20 group-hover:scale-110 transition-transform">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-3xl font-heading font-black text-white mb-4">Learner Portal</h2>
              <p className="text-slate-400 mb-10 leading-relaxed">
                Access interactive coding labs, AI-powered tutoring, and industrial technical tracks in Python, ML, Java, and more.
              </p>
              
              <div className="mt-auto flex items-center justify-between">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-brand-navy-dark bg-slate-800 flex items-center justify-center text-[10px] font-bold">PY</div>
                  <div className="w-10 h-10 rounded-full border-2 border-brand-navy-dark bg-slate-800 flex items-center justify-center text-[10px] font-bold">ML</div>
                  <div className="w-10 h-10 rounded-full border-2 border-brand-navy-dark bg-slate-800 flex items-center justify-center text-[10px] font-bold">AI</div>
                </div>
                <div className="flex items-center gap-2 text-brand-blue font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  Enter Path <ArrowRight size={16} />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BookOpen size={120} />
            </div>
          </div>

          {/* Admin Entry Card */}
          <div 
            onClick={() => handleSelectRole('ADMIN')}
            className="group relative glass-card p-12 rounded-[40px] border border-slate-800 hover:border-brand-green/50 transition-all duration-500 cursor-pointer overflow-hidden admin-theme-gradient"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-brand-green flex items-center justify-center text-white mb-8 shadow-xl shadow-brand-green/20 group-hover:scale-110 transition-transform">
                <Shield size={32} />
              </div>
              <h2 className="text-3xl font-heading font-black text-white mb-4">Instructor Console</h2>
              <p className="text-slate-400 mb-10 leading-relaxed">
                Manage curriculum tracks, deploy new assessment labs, monitor student progress, and oversee the community link.
              </p>
              
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-4 text-slate-500 font-mono text-[10px] uppercase font-bold tracking-widest">
                  <Terminal size={14} /> System v4.5.1
                </div>
                <div className="flex items-center gap-2 text-brand-green font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  Access Core <ArrowRight size={16} />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Code size={120} />
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-slate-600 font-bold uppercase text-[10px] tracking-[0.4em] animate-fade-in delay-300">
          Integrated Development Environment & Education Core
        </div>
      </div>
    </div>
  );
};

export default BookAuth;