
import React, { useState, useEffect } from 'react';
import { User, GlobalSettings } from '../types';
import { LogOut, Users, BarChart3, ShieldCheck, Settings, Save, Lock, Smartphone, LayoutGrid, MessageSquare } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f1f1f2] flex flex-col">
      <nav className="h-20 bg-brand-blue border-b border-white/10 flex items-center justify-between px-10 text-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black">TC</div>
          <h1 className="font-heading font-black text-xl tracking-tighter uppercase">Nexus <span className="text-brand-cyan">Command</span></h1>
        </div>
        <button onClick={onLogout} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><LogOut size={20}/></button>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 border-r border-slate-200 bg-white p-8 space-y-4 shrink-0 overflow-y-auto">
          <button onClick={() => setActiveTab('telemetry')} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'telemetry' ? 'bg-brand-blue text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
            <BarChart3 size={20} /> <span className="text-xs font-black uppercase tracking-widest">Telemetry</span>
          </button>
          <button onClick={() => setActiveTab('security')} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'security' ? 'bg-brand-blue text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
            <ShieldCheck size={20} /> <span className="text-xs font-black uppercase tracking-widest">Protocols</span>
          </button>
          <button onClick={() => setActiveTab('personnel')} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'personnel' ? 'bg-brand-blue text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Users size={20} /> <span className="text-xs font-black uppercase tracking-widest">Personnel</span>
          </button>
          <button onClick={() => setActiveTab('community')} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'community' ? 'bg-brand-blue text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
            <MessageSquare size={20} /> <span className="text-xs font-black uppercase tracking-widest">Comms</span>
          </button>
        </aside>

        <main className="flex-1 p-12 overflow-y-auto custom-scrollbar">
          {activeTab === 'security' && (
            <div className="max-w-3xl animate-fade-in space-y-12">
               <div>
                  <h2 className="text-4xl font-heading font-black text-brand-blue uppercase tracking-tighter">Integrity Protocols</h2>
                  <p className="text-slate-500 mt-2">Configure system-wide academic honesty and proctoring parameters.</p>
               </div>

               <form onSubmit={handleSaveSettings} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="glass-card p-10 rounded-[40px] space-y-6">
                        <div className="flex items-center gap-4 text-brand-blue mb-4">
                           <Lock size={24} className="text-brand-orange" />
                           <h3 className="font-black text-xs uppercase tracking-widest">Cheat Prevention</h3>
                        </div>
                        <div className="space-y-4">
                           <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                              <span className="text-sm font-bold text-slate-700">Allow Copy-Paste</span>
                              <input 
                                 type="checkbox" 
                                 checked={settings.allowCopyPaste} 
                                 onChange={e => setSettings({...settings, allowCopyPaste: e.target.checked})}
                                 className="w-5 h-5 accent-brand-cyan"
                              />
                           </label>
                           <div className="space-y-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tab-Switch Threshold</span>
                              <input 
                                 type="number" 
                                 value={settings.tabSwitchLimit} 
                                 onChange={e => setSettings({...settings, tabSwitchLimit: Number(e.target.value)})}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-brand-blue focus:border-brand-cyan outline-none"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="glass-card p-10 rounded-[40px] space-y-6">
                        <div className="flex items-center gap-4 text-brand-blue mb-4">
                           <Settings size={24} className="text-brand-cyan" />
                           <h3 className="font-black text-xs uppercase tracking-widest">Session Logic</h3>
                        </div>
                        <div className="space-y-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Duration (Seconds)</span>
                           <input 
                              type="number" 
                              value={settings.standardTimeLimit} 
                              onChange={e => setSettings({...settings, standardTimeLimit: Number(e.target.value)})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-brand-blue focus:border-brand-cyan outline-none"
                           />
                           <p className="text-[10px] text-slate-400 font-bold ml-1 uppercase">{Math.floor(settings.standardTimeLimit / 60)} minutes total</p>
                        </div>
                     </div>
                  </div>

                  <button type="submit" className="w-full py-5 btn-orange text-white rounded-[30px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4">
                    {saveStatus ? <><ShieldCheck size={20}/> Protocols Synchronized</> : <><Save size={20}/> Update Security Registry</>}
                  </button>
               </form>
            </div>
          )}
          
          {activeTab === 'telemetry' && <div className="text-center py-20 text-slate-300 font-black uppercase tracking-widest animate-pulse">Telemetry Stream Active...</div>}
          {activeTab === 'personnel' && <div className="text-center py-20 text-slate-300 font-black uppercase tracking-widest animate-pulse">Candidate Directory Loading...</div>}
          {activeTab === 'community' && <CommunityChat currentUser={user} />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
