
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { dataService } from '../services/dataService';
import { 
  LogOut, 
  Users, 
  Search, 
  BarChart3, 
  Lock, 
  RefreshCw,
  TrendingUp,
  Award,
  AlertCircle,
  Building2,
  CheckCircle
} from 'lucide-react';

interface FacultyDashboardProps {
  user: User;
  onLogout: () => void;
}

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ user, onLogout }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Password Reset State
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  useEffect(() => {
    loadData();
  }, [user.college]);

  const loadData = () => {
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
        if (user.college) {
            const collegeStudents = dataService.getStudentsByCollege(user.college);
            setStudents(collegeStudents);
        }
        setLoading(false);
    }, 600);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (dataService.resetUserPassword(resetEmail, newPassword)) {
        setResetStatus('SUCCESS');
        setResetEmail('');
        setNewPassword('');
        setTimeout(() => setResetStatus('IDLE'), 3000);
    } else {
        setResetStatus('ERROR');
    }
  };

  // Top Performers
  const topPerformers = [...students].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);

  const filteredStudents = students.filter(s => 
     s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
       {/* Header */}
       <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Building2 size={20} />
             </div>
             <div>
                <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">Faculty Dashboard</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.college} Campus Incharge</p>
             </div>
          </div>
          <button 
             onClick={onLogout}
             className="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
          >
             <LogOut size={14} /> Logout
          </button>
       </header>

       <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Top Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                   <Users size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Students</p>
                   <h3 className="text-3xl font-black text-slate-800">{students.length}</h3>
                </div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                   <Award size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Score</p>
                   <h3 className="text-3xl font-black text-slate-800">
                      {students.length > 0 ? Math.floor(students.reduce((acc, s) => acc + (s.score || 0), 0) / students.length) : 0} XP
                   </h3>
                </div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                   <TrendingUp size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Performer</p>
                   <h3 className="text-lg font-black text-slate-800 truncate max-w-[150px]">{topPerformers[0]?.name || 'N/A'}</h3>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Left Column: Student List */}
             <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Users size={18} className="text-slate-400" /> Student Registry
                   </h3>
                   <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                         type="text" 
                         placeholder="Search name or email..." 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none focus:border-orange-500 w-64"
                      />
                   </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                   {loading ? (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Registry...</div>
                   ) : filteredStudents.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold uppercase tracking-widest">No Students Found</div>
                   ) : (
                      <table className="w-full text-left">
                         <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                               <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate Name</th>
                               <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email ID</th>
                               <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Performance (XP)</th>
                               <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {filteredStudents.map(student => (
                               <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-4 text-sm font-bold text-slate-700">{student.name}</td>
                                  <td className="p-4 text-xs font-medium text-slate-500 font-mono">{student.email}</td>
                                  <td className="p-4 text-sm font-black text-slate-800 text-right">{student.score || 0}</td>
                                  <td className="p-4 text-right">
                                     <button 
                                        onClick={() => setResetEmail(student.email)}
                                        className="text-[10px] font-bold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded transition-colors"
                                     >
                                        Reset Pass
                                     </button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   )}
                </div>
             </div>

             {/* Right Column: Analytics & Tools */}
             <div className="space-y-6">
                
                {/* Visual Performance Chart (Top 5) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <BarChart3 size={18} className="text-slate-400" /> Top Performers
                   </h3>
                   <div className="space-y-4">
                      {topPerformers.map((student, i) => (
                         <div key={student.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                               <span>{i+1}. {student.name}</span>
                               <span>{student.score} XP</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                               <div 
                                  className={`h-full rounded-full ${i===0 ? 'bg-orange-500' : 'bg-slate-400'}`} 
                                  style={{ width: `${Math.min(((student.score || 0)/500)*100, 100)}%` }}
                               ></div>
                            </div>
                         </div>
                      ))}
                      {topPerformers.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No data available</p>}
                   </div>
                </div>

                {/* Password Reset Tool */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Lock size={18} className="text-slate-400" /> Credential Manager
                   </h3>
                   <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Student Email</label>
                         <input 
                            type="email" 
                            required 
                            value={resetEmail}
                            onChange={e => setResetEmail(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-orange-500"
                            placeholder="student@college.edu"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">New Password</label>
                         <input 
                            type="text" 
                            required 
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-orange-500"
                            placeholder="Set new credentials"
                         />
                      </div>
                      
                      {resetStatus === 'SUCCESS' && (
                         <div className="p-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded flex items-center gap-2">
                            <CheckCircle size={12}/> Password Updated Successfully
                         </div>
                      )}
                      {resetStatus === 'ERROR' && (
                         <div className="p-2 bg-red-50 text-red-500 text-xs font-bold rounded flex items-center gap-2">
                            <AlertCircle size={12}/> User not found
                         </div>
                      )}

                      <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                         <RefreshCw size={14}/> Update Credentials
                      </button>
                   </form>
                </div>

             </div>
          </div>
       </main>
    </div>
  );
};

export default FacultyDashboard;
