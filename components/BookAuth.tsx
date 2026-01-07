
import React, { useState } from 'react';
import { User } from '../types';
import { dataService } from '../services/dataService';
import { 
  Code2,
  Lock,
  Mail,
  User as UserIcon,
  Loader2,
  Building2,
  CheckCircle,
  Globe,
  Award,
  Users
} from 'lucide-react';

interface BookAuthProps {
  onLogin: (user: User) => void;
}

const BookAuth: React.FC<BookAuthProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'FACULTY' | 'ADMIN'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(() => {
        const user = dataService.authenticateUser(email, password);
        if (user) {
            // Verify role match
            if ((activeTab === 'STUDENT' && user.role === 'STUDENT') ||
                (activeTab === 'FACULTY' && user.role === 'FACULTY') ||
                (activeTab === 'ADMIN' && user.role === 'ADMIN')) {
                 onLogin(user);
            } else {
                 setError(`Access Denied. Not a ${activeTab} account.`);
                 setLoading(false);
            }
        } else {
            setError("Invalid credentials. Please checking your entry.");
            setLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      
      {/* LEFT SIDE: COMPANY INFO & MARKETING */}
      <div className="w-full md:w-[60%] bg-[#0f172a] text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
         {/* Background Elements */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
               <div className="bg-orange-600 p-2.5 rounded-xl">
                 <Code2 size={24} className="text-white" />
               </div>
               <span className="font-heading font-black text-2xl tracking-tighter uppercase">Tech<span className="text-orange-500">Nexus</span></span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
               Bridging the Gap Between <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Education & Industry</span>
            </h1>
            
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-12">
               TechNexus Academy provides an enterprise-grade learning ecosystem for colleges. 
               We empower students with AI-driven mentorship, industrial simulations, and globally recognized certifications.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-cyan-400"><Globe size={20}/></div>
                  <div>
                     <h3 className="font-bold text-white mb-1">Standardized Curriculum</h3>
                     <p className="text-sm text-slate-400">Unified learning path for Python, Java, AI across all semesters.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-orange-400"><Users size={20}/></div>
                  <div>
                     <h3 className="font-bold text-white mb-1">Faculty Dashboard</h3>
                     <p className="text-sm text-slate-400">Real-time performance tracking and centralized student management.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-emerald-400"><Award size={20}/></div>
                  <div>
                     <h3 className="font-bold text-white mb-1">Skill Certification</h3>
                     <p className="text-sm text-slate-400">Automated evaluation and instant certification generation.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-violet-400"><Code2 size={20}/></div>
                  <div>
                     <h3 className="font-bold text-white mb-1">Interactive CodeLabs</h3>
                     <p className="text-sm text-slate-400">Zero-setup browser based coding environments.</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="relative z-10 pt-12 border-t border-white/10 mt-12 flex items-center justify-between text-xs text-slate-500 uppercase tracking-widest">
            <span>© 2025 TechNexus Corp.</span>
            <span>Enterprise Solution v4.0</span>
         </div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="w-full md:w-[40%] bg-slate-50 flex items-center justify-center p-6 md:p-12">
         <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <div className="text-center mb-8">
               <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">Portal Access</h2>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select your operational role</p>
            </div>

            {/* Role Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
               <button 
                  onClick={() => setActiveTab('STUDENT')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'STUDENT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  Student
               </button>
               <button 
                  onClick={() => setActiveTab('FACULTY')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'FACULTY' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  Faculty
               </button>
               <button 
                  onClick={() => setActiveTab('ADMIN')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'ADMIN' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  Admin
               </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                     Email Identifier
                     {activeTab === 'FACULTY' && <span className="text-orange-500 text-[9px] flex items-center gap-1"><Building2 size={10}/> College Domain</span>}
                  </label>
                  <div className="relative">
                     <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" 
                        placeholder={activeTab === 'STUDENT' ? "student@college.edu" : activeTab === 'FACULTY' ? "faculty@college.edu" : "admin@technexus.com"}
                     />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Password</label>
                  <div className="relative">
                     <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                        type="password" 
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" 
                        placeholder="••••••••"
                     />
                  </div>
               </div>

               {error && (
                  <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-lg text-center animate-shake flex items-center justify-center gap-2">
                     <Lock size={12} /> {error}
                  </div>
               )}

               <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-2 text-white mt-4 ${
                     activeTab === 'STUDENT' ? 'bg-slate-900 hover:bg-slate-800' :
                     activeTab === 'FACULTY' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/20' :
                     'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20'
                  }`}
               >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Authenticate Access'}
               </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
               <p className="text-xs text-slate-400 font-medium">
                  Having trouble? <a href="#" className="text-slate-800 font-bold hover:underline">Contact System Admin</a>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BookAuth;
