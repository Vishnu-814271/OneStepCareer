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

  const loadMessages = () => {
    setMessages(dataService.getCommunityMessages());
  };

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    dataService.postCommunityMessage(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      newMessage
    );
    setNewMessage('');
    loadMessages();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#0a101f] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
               <UserIcon size={20} />
            </div>
            <div>
               <h3 className="font-bold text-white">Student Community & Support</h3>
               <p className="text-xs text-slate-400">Ask questions, report issues, or chat with admins.</p>
            </div>
         </div>
         <button onClick={loadMessages} className="p-2 text-slate-500 hover:text-white transition-colors">
            <RefreshCw size={18} />
         </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20">
         {messages.length === 0 && (
            <div className="text-center text-slate-500 mt-20">
               <p>No messages yet. Start the conversation!</p>
            </div>
         )}
         
         {messages.map((msg) => {
            const isMe = msg.userId === currentUser.id;
            const isAdmin = msg.userRole === 'ADMIN';

            return (
               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                     <div className="flex items-center gap-2 mb-1 px-1">
                        <span className={`text-xs font-bold ${isAdmin ? 'text-violet-400' : 'text-slate-400'}`}>
                           {msg.userName}
                        </span>
                        {isAdmin && <Shield size={10} className="text-violet-400" />}
                        <span className="text-[10px] text-slate-600">
                           {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                     <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isMe 
                           ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-lg shadow-cyan-900/20' 
                           : isAdmin 
                              ? 'bg-violet-900/40 border border-violet-500/30 text-violet-100 rounded-tl-none'
                              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                     }`}>
                        {msg.text}
                     </div>
                  </div>
               </div>
            );
         })}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-slate-900/80 border-t border-slate-800">
         <div className="flex gap-3">
            <input 
               type="text"
               value={newMessage}
               onChange={(e) => setNewMessage(e.target.value)}
               placeholder="Type your message here..."
               className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button 
               type="submit"
               disabled={!newMessage.trim()}
               className="px-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
               <Send size={18} />
               <span className="hidden md:inline">Send</span>
            </button>
         </div>
      </form>
    </div>
  );
};

export default CommunityChat;