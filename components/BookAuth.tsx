
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
    <div className="min-h-screen bg-[#f1f1f2] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-cyan/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-6xl z-10">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-slate-200 text-brand-orange text-xs font-black uppercase tracking-[0.3em] shadow-sm">
            <Sparkles size={14} /> Industrial Grade Education
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-black text-brand-blue tracking-tighter">
            TECHNEXUS <span className="text-brand-cyan">ACADEMY</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            Unified ecosystem for technical mastery. Access the core terminal to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {/* Student Entry Card */}
          <div 
            onClick={() => handleSelectRole('STUDENT')}
            className="group relative glass-card p-12 rounded-[40px] border-2 border-transparent hover:border-brand-cyan/30 transition-all duration-500 cursor-pointer overflow-hidden student-theme-gradient"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-brand-cyan flex items-center justify-center text-white mb-8 shadow-xl shadow-brand-cyan/20 group-hover:scale-110 transition-transform">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-3xl font-heading font-black text-brand-blue mb-4">Learner Portal</h2>
              <p className="text-slate-600 mb-10 leading-relaxed">
                Access interactive coding labs, AI tutoring, and industrial tracks in Python, ML, Java, and C tracks.
              </p>
              
              <div className="mt-auto flex items-center justify-between">
                <div className="flex -space-x-3">
                  {['PY', 'ML', 'AI'].map(txt => (
                    <div key={txt} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-brand-blue">{txt}</div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-brand-cyan font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  Enter Path <ArrowRight size={16} />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 text-brand-cyan/5">
              <BookOpen size={160} />
            </div>
          </div>

          {/* Admin Entry Card */}
          <div 
            onClick={() => handleSelectRole('ADMIN')}
            className="group relative glass-card p-12 rounded-[40px] border-2 border-transparent hover:border-brand-blue/30 transition-all duration-500 cursor-pointer overflow-hidden admin-theme-gradient"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center text-white mb-8 shadow-xl shadow-brand-blue/20 group-hover:scale-110 transition-transform">
                <Shield size={32} />
              </div>
              <h2 className="text-3xl font-heading font-black text-brand-blue mb-4">Instructor Console</h2>
              <p className="text-slate-600 mb-10 leading-relaxed">
                Manage curriculum, deploy new labs, monitor progress, and oversee the communication link.
              </p>
              
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-4 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-widest">
                  <Terminal size={14} /> System v4.5.2
                </div>
                <div className="flex items-center gap-2 text-brand-blue font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  Access Core <ArrowRight size={16} />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 text-brand-blue/5">
              <Code size={160} />
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] animate-fade-in">
          Integrated Development & Education Core
        </div>
      </div>
    </div>
  );
};

export default BookAuth;
