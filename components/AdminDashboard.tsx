
import React, { useState, useEffect } from 'react';
import { User, GlobalSettings } from '../types';
/* Added Clock to the lucide-react imports */
import { LogOut, Users, BarChart3, ShieldCheck, Settings, Save, Lock, Smartphone, LayoutGrid, MessageSquare, AlertCircle, ShieldAlert, Clock } from 'lucide-react';
import { dataService } from '../services/dataService';
import CommunityChat from './CommunityChat';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'security' | 'personnel' | 'community'>('telemetry');
  const [settings, setSettings] = useState<GlobalSettings>(dataService.getSettings());
  const [saveStatus, setSaveStatus] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.updateSettings(settings);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <nav className="h-20 bg-brand-blue border-b border-white/10 flex items-center justify-between px-10 text-white shrink-0 z-20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center font-black shadow-inner">NC</div>
          <h1 className="font-heading font-black text-2xl tracking-tighter uppercase">Nexus <span className="text-brand-cyan">Command</span></h1>
        </div>
        <div className="flex items-center gap-6">
           <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              System Online
           </div>
           <button onClick={onLogout} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all shadow-lg"><LogOut size={20}/></button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-slate-200 bg-white p-10 space-y-4 shrink-0 overflow-y-auto">
          <div className="mb-10">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Navigation Console</span>
             <div className="space-y-2">
                <button onClick={() => setActiveTab('telemetry')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'telemetry' ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-slate-400 hover:bg-slate-50'}`}>
                  <BarChart3 size={20} /> <span className="text-xs font-black uppercase tracking-widest">Telemetry</span>
                </button>
                <button onClick={() => setActiveTab('security')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'security' ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-slate-400 hover:bg-slate-50'}`}>
                  <ShieldCheck size={20} /> <span className="text-xs font-black uppercase tracking-widest">Protocols</span>
                </button>
                <button onClick={() => setActiveTab('personnel')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'personnel' ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-slate-400 hover:bg-slate-50'}`}>
                  <Users size={20} /> <span className="text-xs font-black uppercase tracking-widest">Personnel</span>
                </button>
                <button onClick={() => setActiveTab('community')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'community' ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-slate-400 hover:bg-slate-50'}`}>
                  <MessageSquare size={20} /> <span className="text-xs font-black uppercase tracking-widest">Comms</span>
                </button>
             </div>
          </div>
        </aside>

        <main className="flex-1 p-16 overflow-y-auto custom-scrollbar bg-slate-50">
          {activeTab === 'security' && (
            <div className="max-w-4xl animate-fade-in space-y-16">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-[9px] font-black uppercase tracking-widest">
                    <ShieldAlert size={12}/> Security Infrastructure
                  </div>
                  <h2 className="text-5xl font-heading font-black text-brand-blue uppercase tracking-tighter">Integrity <span className="text-brand-cyan">Protocols</span></h2>
                  <p className="text-slate-500 font-medium max-w-xl">Configure system-wide behavioral heuristics and automated proctoring termination thresholds for all technical assessments.</p>
               </div>

               <form onSubmit={handleSaveSettings} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-4 text-brand-blue">
                           <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-brand-orange">
                             <Lock size={24} />
                           </div>
                           <h3 className="font-black text-xs uppercase tracking-widest">Anti-Cheat Engine</h3>
                        </div>
                        <div className="space-y-6">
                           <label className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 cursor-pointer hover:border-brand-cyan transition-all group">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">Allow Code Migration</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enable Copy-Paste Logic</span>
                              </div>
                              <input 
                                 type="checkbox" 
                                 checked={settings.allowCopyPaste} 
                                 onChange={e => setSettings({...settings, allowCopyPaste: e.target.checked})}
                                 className="w-6 h-6 accent-brand-cyan"
                              />
                           </label>
                           <div className="space-y-3">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><AlertCircle size={12}/> Tab Switch Threshold</span>
                              <input 
                                 type="number" 
                                 value={settings.tabSwitchLimit} 
                                 min="1"
                                 max="10"
                                 onChange={e => setSettings({...settings, tabSwitchLimit: Number(e.target.value)})}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-8 py-5 text-lg font-black text-brand-blue focus:border-brand-cyan outline-none transition-all shadow-inner"
                              />
                              <p className="text-[9px] text-slate-400 font-bold px-1 uppercase tracking-widest italic">User will be automatically terminated after reaching this infraction count.</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-4 text-brand-blue">
                           <div className="w-12 h-12 bg-brand-cyan/10 rounded-2xl flex items-center justify-center text-brand-cyan">
                             <Clock size={24} />
                           </div>
                           <h3 className="font-black text-xs uppercase tracking-widest">Chrono Configuration</h3>
                        </div>
                        <div className="space-y-3">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Smartphone size={12}/> Standard Unit Duration</span>
                           <input 
                              type="number" 
                              value={settings.standardTimeLimit} 
                              onChange={e => setSettings({...settings, standardTimeLimit: Number(e.target.value)})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-8 py-5 text-lg font-black text-brand-blue focus:border-brand-cyan outline-none transition-all shadow-inner"
                           />
                           <div className="flex items-center justify-between px-2 pt-2">
                              <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.2em]">{Math.floor(settings.standardTimeLimit / 60)} minutes total</span>
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Target: 90min</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <button type="submit" className="w-full py-6 btn-orange text-white rounded-[32px] font-black text-sm uppercase tracking-[0.3em] shadow-3xl flex items-center justify-center gap-5 hover:scale-[1.02] active:scale-95 transition-all">
                    {saveStatus ? <><ShieldCheck size={24}/> Protocols Synchronized</> : <><Save size={24}/> Update Security Registry</>}
                  </button>
               </form>
            </div>
          )}
          
          {activeTab === 'telemetry' && (
            <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-30 animate-pulse">
               <div className="w-20 h-20 bg-brand-blue rounded-3xl flex items-center justify-center text-white">
                  <BarChart3 size={40} />
               </div>
               <span className="text-[11px] font-black uppercase tracking-[1em] text-brand-blue">Telemetry Stream Initializing...</span>
            </div>
          )}
          
          {activeTab === 'personnel' && (
            <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-30 animate-pulse">
               <div className="w-20 h-20 bg-brand-cyan rounded-3xl flex items-center justify-center text-white">
                  <Users size={40} />
               </div>
               <span className="text-[11px] font-black uppercase tracking-[1em] text-brand-cyan">Registry Loading...</span>
            </div>
          )}
          
          {activeTab === 'community' && <CommunityChat currentUser={user} />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
