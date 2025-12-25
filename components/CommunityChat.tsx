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
    <div className="flex flex-col h-full bg-[#0a101f] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className={`p-4 border-b border-slate-800 flex items-center justify-between ${currentUser.role === 'ADMIN' ? 'bg-brand-deep-green/20' : 'bg-brand-deep-blue/20'}`}>
         <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentUser.role === 'ADMIN' ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-blue/20 text-brand-blue'}`}>
               <UserIcon size={20} />
            </div>
            <div>
               <h3 className="font-bold text-white text-sm">Global Comm-Link</h3>
               <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">End-to-end encrypted</p>
            </div>
         </div>
         <button onClick={loadMessages} className="p-2 text-slate-500 hover:text-brand-gold"><RefreshCw size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-grid-pattern opacity-90">
         {messages.map((msg) => {
            const isMe = msg.userId === currentUser.id;
            const isAdmin = msg.userRole === 'ADMIN';
            return (
               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                     <div className="flex items-center gap-2 mb-1 px-1">
                        <span className={`text-[10px] font-black tracking-widest uppercase ${isAdmin ? 'text-brand-gold' : 'text-slate-500'}`}>{msg.userName}</span>
                        {isAdmin && <Shield size={10} className="text-brand-gold" />}
                     </div>
                     <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed border ${
                        isMe ? 'bg-brand-blue border-brand-blue/30 text-white rounded-tr-none' : 
                        isAdmin ? 'bg-brand-deep-green border-brand-green/30 text-brand-gold rounded-tl-none' : 
                        'bg-slate-800 border-slate-700 text-slate-300 rounded-tl-none'
                     }`}>
                        {msg.text}
                     </div>
                  </div>
               </div>
            );
         })}
         <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-900/80 border-t border-slate-800">
         <div className="flex gap-2">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Enter message..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-gold outline-none" />
            <button type="submit" disabled={!newMessage.trim()} className="px-5 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"><Send size={16} /></button>
         </div>
      </form>
    </div>
  );
};

export default CommunityChat;