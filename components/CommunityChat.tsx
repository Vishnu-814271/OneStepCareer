
import React, { useState, useEffect, useRef } from 'react';
import { User, CommunityMessage } from '../types';
import { dataService } from '../services/dataService';
import { Send, User as UserIcon, Shield, RefreshCw } from 'lucide-react';

interface CommunityChatProps {
  currentUser: User;
}

const CommunityChat: React.FC<CommunityChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = () => setMessages(dataService.getCommunityMessages());

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;
    dataService.postCommunityMessage(currentUser.id, currentUser.name, currentUser.role, newMessage);
    setNewMessage('');
    loadMessages();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
      <div className={`p-6 border-b border-slate-100 flex items-center justify-between ${currentUser.role === 'ADMIN' ? 'bg-brand-blue' : 'bg-brand-cyan'} text-white`}>
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
               <UserIcon size={24} />
            </div>
            <div>
               <h3 className="font-heading font-black text-base uppercase tracking-tight">Nexus Network Link</h3>
               <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Operator Comms Encrypted</p>
            </div>
         </div>
         <button onClick={loadMessages} title="Refresh Stream" className="p-2 text-white/50 hover:text-white transition-colors"><RefreshCw size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-grid-pattern">
         {messages.map((msg) => {
            const isMe = msg.userId === currentUser.id;
            const isAdmin = msg.userRole === 'ADMIN';
            return (
               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                     <div className="flex items-center gap-2 mb-2 px-1">
                        <span className={`text-[10px] font-black tracking-widest uppercase ${isAdmin ? 'text-brand-orange' : 'text-slate-400'}`}>{msg.userName}</span>
                        {isAdmin && <Shield size={10} className="text-brand-orange" />}
                     </div>
                     <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed border shadow-sm ${
                        isMe ? 'bg-brand-blue border-brand-blue text-white rounded-tr-none' : 
                        isAdmin ? 'bg-orange-50 border-brand-orange/30 text-brand-orange rounded-tl-none font-medium' : 
                        'bg-slate-50 border-slate-200 text-slate-700 rounded-tl-none'
                     }`}>
                        {msg.text}
                     </div>
                  </div>
               </div>
            );
         })}
         <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-6 bg-slate-50 border-t border-slate-100">
         <div className="flex gap-4">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type signal for transmission..." className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm text-slate-800 focus:border-brand-cyan outline-none shadow-sm transition-all" />
            <button type="submit" disabled={!newMessage.trim()} className="px-8 bg-brand-blue hover:bg-brand-cyan text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-50 flex items-center gap-2"><Send size={16} /> Transmit</button>
         </div>
      </form>
    </div>
  );
};

export default CommunityChat;
