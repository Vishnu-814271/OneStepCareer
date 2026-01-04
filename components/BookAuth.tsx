
import React from 'react';
import { User } from '../types';
import { dataService } from '../services/dataService';
import { 
  GraduationCap, 
  Terminal, 
  ArrowRight, 
  Cpu, 
  Layers, 
  Binary, 
  BrainCircuit, 
  Fingerprint,
  Code2,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';

interface BookAuthProps {
  onLogin: (user: User) => void;
}

const BookAuth: React.FC<BookAuthProps> = ({ onLogin }) => {
  const handleSelectRole = (role: 'ADMIN' | 'STUDENT') => {
    const user = dataService.getPortalUser(role);
    onLogin(user);
  };

  const tracks = [
    { name: 'Python', icon: <Terminal size={20} />, color: 'text-brand-cyan' },
    { name: 'ML', icon: <BrainCircuit size={20} />, color: 'text-brand-orange' },
    { name: 'AI', icon: <Cpu size={20} />, color: 'text-brand-blue' },
    { name: 'Java', icon: <Layers size={20} />, color: 'text-brand-cyan' },
    { name: 'C Language', icon: <Binary size={20} />, color: 'text-brand-orange' },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center relative overflow-hidden font-sans">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03]"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-7xl z-10 px-6 py-12 flex flex-col items-center">
        {/* Top Branding */}
        <div className="w-full flex justify-between items-center mb-20 animate-in fade-in duration-700">
          <div className="flex items-center gap-3">
            <div className="bg-brand-cyan/10 p-2.5 rounded-xl border border-brand-cyan/20">
              <Code2 size={24} className="text-brand-cyan" />
            </div>
            <span className="font-heading font-black text-2xl text-white tracking-tighter uppercase">Tech<span className="text-brand-cyan">Nexus</span></span>
          </div>
          <button 
            onClick={() => handleSelectRole('ADMIN')}
            className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-brand-orange transition-colors"
          >
            Admin Access
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-8 mb-24 max-w-4xl animate-in slide-in-from-top-10 duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-brand-orange text-[10px] font-black uppercase tracking-[0.4em]">
            <Fingerprint size={14} className="animate-pulse" /> Student Verified Platform
          </div>
          <h1 className="text-7xl md:text-9xl font-heading font-black text-white tracking-tighter leading-none">
            ENGINEER YOUR <span className="text-brand-cyan italic">FUTURE.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto italic">
            "Where technical mastery meets industrial opportunity." The most advanced learning environment designed specifically for students.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
            <button 
              onClick={() => handleSelectRole('STUDENT')}
              className="px-14 py-6 btn-orange text-white rounded-[28px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
            >
              Start Learning <ArrowRight size={20} />
            </button>
            <div className="flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-widest">
              <Zap size={14} className="text-brand-cyan" /> 14.2k Active Students
            </div>
          </div>
        </div>

        {/* Technical Tracks Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-4 animate-in slide-in-from-bottom-10 duration-1000 delay-200">
          {tracks.map((track, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex flex-col items-center group hover:bg-white/10 hover:border-brand-cyan/40 transition-all cursor-default">
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${track.color}`}>
                {track.icon}
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{track.name}</span>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full">
          <div className="bg-white/5 rounded-[40px] p-10 border border-white/5 hover:border-brand-cyan/20 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan mb-8">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">AI Tutor Assistance</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Personalized technical guidance available 24/7 for all course tracks to help you solve problems.</p>
          </div>
          <div className="bg-white/5 rounded-[40px] p-10 border border-white/5 hover:border-brand-orange/20 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-8">
              <GraduationCap size={28} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Student Certification</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Earn verified credentials recognized by global technical leaders to boost your student profile.</p>
          </div>
          <div className="bg-white/5 rounded-[40px] p-10 border border-white/5 hover:border-brand-blue/20 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-8">
              <Globe size={28} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Global Student Network</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Connect, chat, and collaborate with thousands of other engineering students worldwide.</p>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-32 pt-12 border-t border-white/5 w-full flex flex-col md:flex-row items-center justify-between gap-6 opacity-30">
          <span className="text-[9px] font-black text-white uppercase tracking-[0.5em]">© 2025 TechNexus Academy // Student Edition</span>
          <div className="flex gap-8 text-[9px] font-black text-white uppercase tracking-widest">
            <span>Student Privacy</span>
            <span>Academic Standards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAuth;
