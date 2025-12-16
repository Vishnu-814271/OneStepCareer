import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { dataService } from '../services/dataService';
import PaymentGateway from './PaymentGateway';
import { 
  ArrowRight, Terminal, Code2, Cpu, Globe, 
  Zap, Shield, ChevronRight, Play, X, 
  Layout, BookOpen, Users, Lock, Sparkles, Brain, Database, Coffee, Mail, KeyRound, CheckCircle, Facebook
} from 'lucide-react';

interface BookAuthProps {
  onLogin: (user: User) => void;
}

const BookAuth: React.FC<BookAuthProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Auth Form State
  const [role, setRole] = useState<Role>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [userEnteredCode, setUserEnteredCode] = useState('');
  const [tempSignupData, setTempSignupData] = useState<User | null>(null);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePassword = (pwd: string) => {
    // At least 8 characters, must be alphanumeric (contain letters and numbers)
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9\W]{8,}$/;
    return regex.test(pwd);
  };

  // --- Auth Handlers ---

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    const users = dataService.getUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);

    if (existingUser) {
      finalizeLogin(existingUser);
    } else {
      setError("Invalid credentials or account does not exist. Please Sign Up.");
    }
  };

  const handleSignupInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // 1. Validation
    if (!name.trim()) { setError("Name is required."); return; }
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    if (!validatePassword(password)) { 
      setError("Password must be at least 8 characters long and contain both letters and numbers."); 
      return; 
    }

    const users = dataService.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError("This email is already registered. Please Log In.");
      return;
    }

    // 2. Simulate Sending Email Logic
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(generatedCode);
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      email: email,
      role: role,
      isPaid: false
    };
    
    setTempSignupData(newUser);
    setIsVerifying(true);
    
    // We display the code in the UI now, so no alert needed, but logging it as backup
    console.log("Verification Code:", generatedCode);
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEnteredCode === verificationCode && tempSignupData) {
      // 3. Register User
      const success = dataService.registerUser(tempSignupData);
      if (success) {
        setIsVerifying(false);
        setAuthMode('login');
        setSuccessMsg("Account verified successfully! Please log in with your credentials.");
        // Clear fields
        setUserEnteredCode('');
        setVerificationCode('');
        setTempSignupData(null);
        setPassword(''); 
        setEmail('');
      } else {
        setError("Error creating account.");
      }
    } else {
      setError("Invalid verification code. Please check the code displayed above.");
    }
  };

  const finalizeLogin = (user: User) => {
    if (user.role === 'STUDENT' && !user.isPaid) {
      setPendingUser(user);
    } else {
      onLogin(user);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // 1. Check if user exists
    const mockEmail = `user@${provider.toLowerCase()}.com`;
    const existing = dataService.getUsers().find(u => u.email === mockEmail);
    
    if (existing) {
       finalizeLogin(existing);
    } else {
       // 2. Auto-register (Verification is implied by the social provider)
       const mockUser: User = {
         id: Math.random().toString(36).substr(2, 9),
         name: `${provider} User`,
         email: mockEmail,
         role: 'STUDENT',
         isPaid: false // They still need to pay if they are new
       };
       dataService.registerUser(mockUser);
       finalizeLogin(mockUser);
    }
  };

  if (pendingUser) {
    return (
      <PaymentGateway 
        user={pendingUser} 
        onPaymentComplete={(paidUser) => { setPendingUser(null); onLogin(paidUser); }}
        onLogout={() => setPendingUser(null)} 
      />
    );
  }

  // --- Render Landing Page ---

  return (
    <div className="min-h-screen bg-[#020617] font-sans selection:bg-cyan-500/30 text-slate-200 overflow-x-hidden relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[100px]" />
         <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#020617]/80 backdrop-blur-lg border-slate-800 py-3' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Terminal className="text-white" size={20} />
            </div>
            <span className="font-heading font-bold text-2xl text-white tracking-tight">TechNexus</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#courses" className="hover:text-cyan-400 transition-colors">Courses</a>
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={() => { setAuthMode('login'); setIsVerifying(false); setIsAuthOpen(true); setError(null); setSuccessMsg(null); }}
               className="text-sm font-bold text-white hover:text-cyan-400 transition-colors"
             >
               Log In
             </button>
             <button 
               onClick={() => { setAuthMode('signup'); setIsVerifying(false); setIsAuthOpen(true); setError(null); setSuccessMsg(null); }}
               className="px-5 py-2.5 bg-white text-slate-900 rounded-full text-sm font-bold hover:bg-cyan-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10 hidden sm:block"
             >
               Get Started
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 z-10 max-w-7xl mx-auto">
         <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-cyan-400 text-xs font-bold mb-8 animate-fade-in-up">
              <Sparkles size={12} />
              <span>Next Gen Learning Platform</span>
            </div>
            
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight max-w-4xl tracking-tight">
              Master the Art of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-glow">
                Technical Innovation
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
              Dive into comprehensive courses on Python, AI, Machine Learning, and more. 
              Interactive labs, AI mentorship, and industry-standard certification.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <button 
                 onClick={() => { setAuthMode('signup'); setIsVerifying(false); setIsAuthOpen(true); }}
                 className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full font-bold text-lg transition-all hover:-translate-y-1 shadow-[0_10px_40px_-10px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2"
               >
                 Start Learning Now
                 <ArrowRight size={20} />
               </button>
               <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold text-lg transition-all border border-slate-700 flex items-center justify-center gap-2 group">
                 <Play size={20} className="fill-current group-hover:text-cyan-400 transition-colors" />
                 Watch Demo
               </button>
            </div>
         </div>
      </section>

      {/* Courses Marquee */}
      <div id="courses" className="border-y border-slate-800 bg-[#020617]/50 backdrop-blur-sm overflow-hidden py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Available Tracks</h3>
        </div>
        <div className="flex gap-6 justify-center flex-wrap max-w-6xl mx-auto px-6">
           <CoursePill icon={Code2} label="Python" color="text-yellow-400" bg="bg-yellow-400/10" border="border-yellow-400/20" />
           <CoursePill icon={Brain} label="Machine Learning" color="text-cyan-400" bg="bg-cyan-400/10" border="border-cyan-400/20" />
           <CoursePill icon={Sparkles} label="Artificial Intelligence" color="text-violet-400" bg="bg-violet-400/10" border="border-violet-400/20" />
           <CoursePill icon={Coffee} label="Java" color="text-red-400" bg="bg-red-400/10" border="border-red-400/20" />
           <CoursePill icon={Cpu} label="C / C++" color="text-blue-400" bg="bg-blue-400/10" border="border-blue-400/20" />
           <CoursePill icon={Database} label="Data Structures" color="text-emerald-400" bg="bg-emerald-400/10" border="border-emerald-400/20" />
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <FeatureCard 
             icon={Terminal} 
             title="Interactive Code Labs" 
             desc="Write, run, and debug code directly in your browser with our advanced IDE environment." 
           />
           <FeatureCard 
             icon={Zap} 
             title="AI-Powered Tutor" 
             desc="Get instant help, code explanations, and personalized debugging assistance 24/7." 
           />
           <FeatureCard 
             icon={Shield} 
             title="Enterprise Security" 
             desc="Secure authentication and payment processing ensuring your data is always safe." 
           />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-[#020617] relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-2 opacity-50">
             <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center">
                <Terminal size={16} className="text-white" />
             </div>
             <span className="font-heading font-bold text-white">TechNexus Academy</span>
           </div>
           <p className="text-slate-600 text-sm">© 2024 TechNexus. All rights reserved.</p>
        </div>
      </footer>

      {/* --- AUTH MODAL --- */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm transition-opacity" 
             onClick={() => setIsAuthOpen(false)}
           />

           {/* Modal Card */}
           <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up">
              {/* Close Button */}
              <button 
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors z-20"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="p-8 pb-0 text-center relative z-10">
                 <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                    {isVerifying ? <Mail className="text-white" size={32} /> : <Layout className="text-white" size={32} />}
                 </div>
                 <h2 className="font-heading text-2xl font-bold text-white mb-2">
                   {isVerifying ? 'Verify Email' : authMode === 'login' ? 'Welcome Back' : 'Join TechNexus'}
                 </h2>
                 <p className="text-slate-400 text-sm mb-6">
                   {isVerifying 
                     ? `We've generated a secure code for ${email}.` 
                     : authMode === 'login' 
                       ? 'Enter your details to access your dashboard.' 
                       : 'Start your coding journey today.'}
                 </p>
              </div>

              {/* Form Body */}
              <div className="px-8 pb-8">
                 
                 {isVerifying ? (
                    // --- VERIFICATION FORM ---
                    <form onSubmit={handleVerificationSubmit} className="space-y-4 mt-4">
                       
                       {/* DEMO CODE DISPLAY - SOLVES "DIDN'T RECEIVE MAIL" */}
                       <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-6 text-center animate-pulse">
                          <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">Demo Verification Code</p>
                          <div className="text-3xl font-mono font-bold text-white tracking-[0.5em] select-all cursor-copy" onClick={() => setUserEnteredCode(verificationCode)} title="Click to autofill">
                            {verificationCode}
                          </div>
                          <p className="text-slate-500 text-[10px] mt-2">In a real app, this code is sent to your email.</p>
                       </div>

                       <div>
                         <input 
                           type="text" 
                           placeholder="Enter 6-digit Code"
                           maxLength={6}
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors text-center text-2xl tracking-widest font-mono"
                           value={userEnteredCode}
                           onChange={(e) => setUserEnteredCode(e.target.value.replace(/\D/g, ''))} // Only numbers
                           required
                         />
                       </div>

                       {error && (
                         <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                            <X size={14} />
                            {error}
                         </div>
                       )}

                       <button 
                         type="submit"
                         className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                       >
                         Verify Account
                         <CheckCircle size={18} />
                       </button>
                       
                       <button 
                         type="button" 
                         onClick={() => { setIsVerifying(false); setError(null); }}
                         className="w-full text-sm text-slate-500 hover:text-white py-2"
                       >
                         Back to Signup
                       </button>
                    </form>
                 ) : (
                    // --- LOGIN / SIGNUP FORM ---
                    <>
                       <div className="flex p-1 bg-slate-900 rounded-xl mb-6 border border-slate-800">
                          <button 
                            onClick={() => { setAuthMode('login'); setError(null); setSuccessMsg(null); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                            Log In
                          </button>
                          <button 
                            onClick={() => { setAuthMode('signup'); setError(null); setSuccessMsg(null); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'signup' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                            Sign Up
                          </button>
                       </div>

                       <form onSubmit={authMode === 'login' ? handleLoginSubmit : handleSignupInitiate} className="space-y-4">
                          {/* Role Selector */}
                          <div className="grid grid-cols-2 gap-3 mb-2">
                             <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${role === 'STUDENT' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600'}`}>
                                <input type="radio" name="role" className="hidden" checked={role === 'STUDENT'} onChange={() => setRole('STUDENT')} />
                                <Users size={20} />
                                <span className="text-xs font-bold uppercase">Student</span>
                             </label>
                             <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${role === 'ADMIN' ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600'}`}>
                                <input type="radio" name="role" className="hidden" checked={role === 'ADMIN'} onChange={() => setRole('ADMIN')} />
                                <Shield size={20} />
                                <span className="text-xs font-bold uppercase">Admin</span>
                             </label>
                          </div>

                          {authMode === 'signup' && (
                            <div>
                              <input 
                                type="text" 
                                placeholder="Full Name"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                              />
                            </div>
                          )}
                          
                          <div>
                            <input 
                              type="text" 
                              placeholder="Email Address"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="relative">
                            <input 
                              type="password" 
                              placeholder="Password"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                            />
                            {authMode === 'signup' && (
                               <p className="text-[10px] text-slate-500 mt-1 ml-1 flex items-center gap-1">
                                 <KeyRound size={10} /> 8+ chars, letters & numbers required.
                               </p>
                            )}
                          </div>

                          {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                               <X size={14} />
                               {error}
                            </div>
                          )}
                          
                          {successMsg && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                               <CheckCircle size={14} />
                               {successMsg}
                            </div>
                          )}

                          <button 
                            type="submit"
                            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                          >
                            {authMode === 'login' ? 'Access Portal' : 'Register Account'}
                            <ChevronRight size={18} />
                          </button>
                       </form>

                       <div className="mt-6 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                             <div className="h-px flex-1 bg-slate-800"></div>
                             <span className="text-xs text-slate-500 uppercase">Or continue with</span>
                             <div className="h-px flex-1 bg-slate-800"></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                             <button type="button" onClick={() => handleSocialLogin('Google')} className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2 group">
                                <Globe size={16} className="text-white group-hover:text-cyan-400" />
                                Google
                             </button>
                             <button type="button" onClick={() => handleSocialLogin('Facebook')} className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2 group">
                                <Facebook size={16} className="text-white group-hover:text-blue-500" />
                                Facebook
                             </button>
                          </div>
                       </div>
                    </>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

// Sub-components for Landing Page
const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="group glass-panel p-8 rounded-2xl hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-2">
     <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-cyan-500/30">
        <Icon className="text-cyan-400" size={28} />
     </div>
     <h3 className="text-xl font-bold text-white mb-3 font-heading">{title}</h3>
     <p className="text-slate-400 leading-relaxed text-sm">
       {desc}
     </p>
  </div>
);

const CoursePill = ({ icon: Icon, label, color, bg, border }: any) => (
  <div className={`flex items-center gap-3 px-6 py-4 rounded-xl border ${bg} ${border} backdrop-blur-md transition-all hover:scale-105 cursor-default`}>
     <Icon className={color} size={24} />
     <span className="font-bold text-white text-sm tracking-wide">{label}</span>
  </div>
);

export default BookAuth;