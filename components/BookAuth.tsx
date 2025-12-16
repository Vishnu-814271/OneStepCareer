import React, { useState } from 'react';
import { User, Role } from '../types';
import { dataService } from '../services/dataService';
import PaymentGateway from './PaymentGateway';
import { 
  Terminal, Shield, ChevronRight, X, 
  Users, Mail, KeyRound, CheckCircle, Facebook, Globe, Lock, ArrowLeft
} from 'lucide-react';

interface BookAuthProps {
  onLogin: (user: User) => void;
}

const BookAuth: React.FC<BookAuthProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Auth Form State
  const [role, setRole] = useState<Role>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  // Verification & Reset State
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false); 
  const [verificationCode, setVerificationCode] = useState('');
  const [userEnteredCode, setUserEnteredCode] = useState('');
  const [tempSignupData, setTempSignupData] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const validatePassword = (pwd: string) => {
    // 8+ chars, alphanumeric
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9\W]{8,}$/;
    return regex.test(pwd);
  };

  // --- LOGIN ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    const result = dataService.loginUser(email, password);

    if (result.success && result.user) {
      if (result.user.role !== role) {
        setError(`This email is registered as ${result.user.role}. Please switch roles.`);
        return;
      }
      // CHECK PAYMENT STATUS
      if (result.user.role === 'STUDENT' && !result.user.isPaid) {
        // Even if status is PENDING_APPROVAL, we show the payment gateway (which has a "Waiting" screen)
        setPendingUser(result.user);
      } else {
        onLogin(result.user);
      }
    } else {
      setError(result.message);
    }
  };

  // --- SIGNUP ---
  const handleSignupInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) { setError("Name is required."); return; }
    if (!validateEmail(email)) { setError("Invalid email address."); return; }
    if (!validatePassword(password)) { 
      setError("Password must be 8+ chars with letters & numbers."); 
      return; 
    }

    const users = dataService.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError("Email already registered. Please Login.");
      return;
    }

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(generatedCode);
    
    setTempSignupData({
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      email: email,
      password: password,
      role: role,
      isPaid: false
    });
    
    setIsVerifying(true);
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEnteredCode === verificationCode && tempSignupData) {
      dataService.registerUser(tempSignupData);
      setIsVerifying(false);
      setAuthMode('login');
      setSuccessMsg("Account verified successfully! Please log in.");
      setUserEnteredCode('');
      setTempSignupData(null);
      setPassword(''); 
    } else {
      setError("Invalid code. Please match the demo code displayed.");
    }
  };

  const handleForgotInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const users = dataService.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!existing) {
      setError("No account found with this email. Please Sign Up.");
      return;
    }

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(generatedCode);
    setIsResetting(true);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (userEnteredCode === verificationCode) {
       if (!validatePassword(newPassword)) {
         setError("New password must be 8+ chars with letters & numbers.");
         return;
       }
       
       dataService.resetPassword(email, newPassword);
       setIsResetting(false);
       setAuthMode('login');
       setSuccessMsg("Password reset successfully. Please Login.");
       setUserEnteredCode('');
       setNewPassword('');
       setPassword('');
     } else {
       setError("Invalid verification code.");
     }
  };

  const handleSocialLogin = (provider: string) => {
    const mockEmail = `user@${provider.toLowerCase()}.com`;
    const users = dataService.getUsers();
    const existing = users.find(u => u.email === mockEmail);
    
    if (existing) {
       if (existing.role === 'STUDENT' && !existing.isPaid) setPendingUser(existing);
       else onLogin(existing);
    } else {
       const newUser = {
         id: Math.random().toString(36).substr(2, 9),
         name: `${provider} User`,
         email: mockEmail,
         password: 'SocialLoginPass123',
         role: 'STUDENT' as Role,
         isPaid: false
       };
       dataService.registerUser(newUser);
       setPendingUser(newUser);
    }
  };

  if (pendingUser) {
    return (
      <PaymentGateway 
        user={pendingUser} 
        onPaymentComplete={(updatedUser) => { 
          // CRITICAL FIX: Only login if paid/approved. Otherwise stay pending.
          if (updatedUser.isPaid) {
            setPendingUser(null);
            onLogin(updatedUser);
          } else {
            setPendingUser(updatedUser); // Force re-render of PaymentGateway to show "Pending" screen
          }
        }}
        onLogout={() => setPendingUser(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-5xl h-auto md:h-[650px] bg-[#0a0f1c] rounded-2xl shadow-2xl border border-slate-800 flex overflow-hidden relative z-10">
        
        {/* Left Side: Brand & Visuals */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#0f172a] to-[#020617] relative flex-col p-12 justify-between border-r border-slate-800">
           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                 <Terminal size={24} />
               </div>
               <span className="text-2xl font-bold text-white tracking-tight">TechNexus</span>
             </div>
             <p className="text-slate-400 text-sm">Professional Coding Academy</p>
           </div>

           <div className="relative z-10 space-y-6">
              <h1 className="text-4xl font-extrabold text-white leading-tight">
                Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Algorithms</span> <br/>
                & Data Structures
              </h1>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-slate-300">
                    <div className="p-2 bg-slate-800 rounded-lg text-cyan-400"><Shield size={18} /></div>
                    <span className="text-sm font-medium">Enterprise Grade Security</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-300">
                    <div className="p-2 bg-slate-800 rounded-lg text-cyan-400"><Users size={18} /></div>
                    <span className="text-sm font-medium">Global Student Community</span>
                 </div>
              </div>
           </div>

           <div className="text-xs text-slate-600">
             © 2024 TechNexus Academy. All rights reserved.
           </div>

           <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="w-full md:w-1/2 bg-[#0a0f1c] p-8 md:p-12 flex flex-col justify-center relative">
          
          <div className="absolute top-6 right-6 flex gap-2">
            {!isVerifying && !isResetting && (
              <>
                <button 
                  onClick={() => { setAuthMode('login'); setError(null); setSuccessMsg(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'login' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => { setAuthMode('signup'); setError(null); setSuccessMsg(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  Register
                </button>
              </>
            )}
          </div>

          <div className="max-w-sm mx-auto w-full mt-8 md:mt-0">
            {isVerifying || isResetting ? (
               <div>
                 <h2 className="text-2xl font-bold text-white mb-1">
                   {isResetting ? 'Reset Password' : 'Verify Email'}
                 </h2>
                 <p className="text-slate-400 text-sm mb-6">
                   Code sent to {email}
                 </p>
                 
                 <form onSubmit={isResetting ? handleResetSubmit : handleVerificationSubmit} className="space-y-5">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 text-center">
                        <p className="text-xs text-cyan-500 font-bold uppercase tracking-wider mb-2">Demo Code</p>
                        <div className="text-3xl font-mono font-bold text-white tracking-[0.5em] cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => setUserEnteredCode(verificationCode)} title="Click to Auto-fill">
                          {verificationCode}
                        </div>
                    </div>
                    
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit Code"
                      maxLength={6}
                      className="w-full bg-[#161b2e] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors text-center text-xl tracking-widest font-mono"
                      value={userEnteredCode}
                      onChange={(e) => setUserEnteredCode(e.target.value.replace(/\D/g, ''))}
                      required
                    />

                    {isResetting && (
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        <input 
                          type="password" placeholder="New Password"
                          className="w-full bg-[#161b2e] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                          value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                        />
                      </div>
                    )}

                    {error && <p className="text-red-400 text-xs flex items-center gap-2"><X size={12} /> {error}</p>}
                    
                    <button type="submit" className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all">
                       {isResetting ? 'Update Password' : 'Verify & Register'}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => { setIsVerifying(false); setIsResetting(false); setAuthMode('login'); }} 
                      className="w-full text-sm text-slate-500 mt-2 flex items-center justify-center gap-1 hover:text-white"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                 </form>
               </div>
            ) : authMode === 'forgot' ? (
               <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Forgot Password?</h2>
                  <p className="text-slate-400 text-sm mb-8">Enter your email to receive a reset code.</p>
                  
                  <form onSubmit={handleForgotInitiate} className="space-y-4">
                     <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        <input 
                          type="text" placeholder="Email Address"
                          className="w-full bg-[#161b2e] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                          value={email} onChange={e => setEmail(e.target.value)} required
                        />
                     </div>
                     {error && <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs flex items-center gap-2"><X size={14} />{error}</div>}
                     
                     <button type="submit" className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all">
                       Send Verification Code
                     </button>
                     
                     <button type="button" onClick={() => setAuthMode('login')} className="w-full text-sm text-slate-500 mt-2 hover:text-white">
                        Cancel
                     </button>
                  </form>
               </div>
            ) : (
               <div>
                 <h2 className="text-2xl font-bold text-white mb-1">
                   {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                 </h2>
                 <p className="text-slate-400 text-sm mb-6">
                   {authMode === 'login' ? 'Enter your credentials to access.' : 'Start your journey today.'}
                 </p>

                 <form onSubmit={authMode === 'login' ? handleLoginSubmit : handleSignupInitiate} className="space-y-4">
                    <div className="flex p-1 bg-[#161b2e] rounded-lg mb-6">
                       <button type="button" onClick={() => setRole('STUDENT')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${role === 'STUDENT' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>STUDENT</button>
                       <button type="button" onClick={() => setRole('ADMIN')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${role === 'ADMIN' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>ADMIN</button>
                    </div>

                    {authMode === 'signup' && (
                      <div className="relative">
                        <Users className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        <input 
                          type="text" placeholder="Full Name"
                          className="w-full bg-[#161b2e] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                          value={name} onChange={e => setName(e.target.value)} required
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                      <input 
                        type="text" placeholder="Email Address"
                        className="w-full bg-[#161b2e] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                        value={email} onChange={e => setEmail(e.target.value)} required
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                      <input 
                        type="password" placeholder="Password"
                        className="w-full bg-[#161b2e] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                        value={password} onChange={e => setPassword(e.target.value)} required
                      />
                    </div>

                    {authMode === 'login' && (
                      <div className="flex justify-end">
                        <button type="button" onClick={() => setAuthMode('forgot')} className="text-xs text-cyan-400 hover:text-cyan-300">Forgot Password?</button>
                      </div>
                    )}

                    {error && <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs flex items-center gap-2"><X size={14} />{error}</div>}
                    {successMsg && <div className="p-3 bg-emerald-900/20 border border-emerald-900/50 rounded-lg text-emerald-400 text-xs flex items-center gap-2"><CheckCircle size={14} />{successMsg}</div>}

                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all text-sm flex items-center justify-center gap-2">
                      {authMode === 'login' ? 'Access Account' : 'Create Account'} <ChevronRight size={16} />
                    </button>
                 </form>

                 <div className="mt-8">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="h-px bg-slate-800 flex-1"></div>
                       <span className="text-[10px] uppercase text-slate-600 font-bold">Or connect with</span>
                       <div className="h-px bg-slate-800 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => handleSocialLogin('Google')} className="py-2.5 rounded-xl border border-slate-700 bg-[#161b2e] text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2">
                          <Globe size={14} /> Google
                       </button>
                       <button onClick={() => handleSocialLogin('Facebook')} className="py-2.5 rounded-xl border border-slate-700 bg-[#161b2e] text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2">
                          <Facebook size={14} /> Facebook
                       </button>
                    </div>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAuth;