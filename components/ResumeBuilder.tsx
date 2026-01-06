
import React, { useState, useRef, useEffect } from 'react';
import { User, ResumeData } from '../types';
import { generateATSResume } from '../services/geminiService';
import { 
  FileText, Briefcase, Sparkles, Printer, 
  Loader2, Plus, Trash2, 
  User as UserIcon, GraduationCap, Code2, FolderGit2, Award, 
  Mail, Phone, MapPin, Linkedin, Info, Target, MousePointer2,
  Terminal, ShieldCheck, ChevronRight
} from 'lucide-react';

interface ResumeBuilderProps {
  currentUser: User;
}

type TemplateType = 'MODERN' | 'CLASSIC' | 'MINIMAL';
type SectionType = 'PERSONAL' | 'SUMMARY' | 'EXPERIENCE' | 'EDUCATION' | 'SKILLS' | 'PROJECTS' | 'ACHIEVEMENTS';

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ currentUser }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('MODERN');
  const printRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: currentUser.name,
      email: currentUser.email,
      phone: '',
      location: '',
      linkedin: '',
      role: 'Full Stack Engineer'
    },
    summary: 'High-performing engineering student with expertise in full-stack development. Proven ability to architect scalable solutions and optimize system performance.',
    achievements: [
        'Recipient of TechNexus Innovation Grant 2024',
        'Top 1% in National Engineering Logic Olympiad'
    ],
    skills: {
      technical: ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'AWS'],
      soft: ['Agile Leadership', 'Technical Communication'],
      tools: ['Git', 'Docker', 'Kubernetes']
    },
    experience: [
      {
        id: 1,
        role: 'Technical Intern',
        company: 'Nexus Systems Lab',
        date: '2024 - Present',
        bullets: ['Developed robust microservices using Node.js.', 'Reduced API latency by 40%.']
      }
    ],
    education: [
      {
        id: 1,
        degree: 'B.Tech in Computer Science',
        school: 'TechNexus Academy',
        date: '2021 - 2025'
      }
    ],
    projects: [
      {
        id: 1,
        name: 'Nexus ERP',
        description: 'Scalable enterprise resource planning system with real-time analytics.',
        techStack: 'React, Node.js, PostgreSQL'
      }
    ]
  });

  const handlePersonalChange = (field: keyof ResumeData['personalInfo'], value: string) => {
    setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  };

  const handleArrayChange = (section: 'experience' | 'education' | 'projects', id: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = (section: 'experience' | 'education' | 'projects') => {
    const newId = Date.now();
    const newItem = section === 'experience' 
      ? { id: newId, role: '', company: '', date: '', bullets: [''] }
      : section === 'education'
      ? { id: newId, degree: '', school: '', date: '' }
      : { id: newId, name: '', description: '', techStack: '' };
    setResumeData(prev => ({ ...prev, [section]: [...prev[section], newItem] }));
  };

  const removeItem = (section: 'experience' | 'education' | 'projects', id: number) => {
    setResumeData(prev => ({ ...prev, [section]: prev[section].filter((item: any) => item.id !== id) }));
  };

  const handleSkillsChange = (category: 'technical' | 'soft' | 'tools', value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: { ...prev.skills, [category]: value.split(',').map(s => s.trim()).filter(s => s !== "") }
    }));
  };

  const handleAchievementsChange = (value: string) => {
    setResumeData(prev => ({ ...prev, achievements: value.split('\n').filter(a => a.trim() !== "") }));
  };

  const scrollToSection = (id: SectionType) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      alert("Please provide a Job Description to enable AI optimization.");
      return;
    }
    setIsGenerating(true);
    const optimizedData = await generateATSResume(JSON.stringify(resumeData), jobDescription);
    if (optimizedData) setResumeData(optimizedData);
    setIsGenerating(false);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ATS Resume - ${resumeData.personalInfo.fullName}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
            <style>
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
              .heading-font { font-family: 'Outfit', sans-serif; }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 700);
    }
  };

  const inputClass = "w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all shadow-sm placeholder:text-slate-300";
  const textAreaClass = "w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none resize-none transition-all shadow-sm placeholder:text-slate-300";

  const navigationSections = [
    { id: 'PERSONAL', label: 'Identity Matrix', icon: UserIcon },
    { id: 'SUMMARY', label: 'Summary', icon: FileText },
    { id: 'EXPERIENCE', label: 'Experience', icon: ShieldCheck },
    { id: 'EDUCATION', label: 'Education', icon: GraduationCap },
    { id: 'SKILLS', label: 'Expertise', icon: Code2 },
    { id: 'PROJECTS', label: 'Projects', icon: FolderGit2 },
    { id: 'ACHIEVEMENTS', label: 'Honors', icon: Award },
  ];

  // Template Components (Modern, Classic, Minimal)
  const ModernTemplate = ({ data }: { data: ResumeData }) => (
    <div className="w-[210mm] min-h-[297mm] bg-white text-slate-800 flex flex-col mx-auto overflow-hidden shadow-2xl relative">
       <div className="h-2 bg-cyan-500 w-full shrink-0"></div>
       <div className="flex-1 flex">
          <div className="w-[30%] bg-[#0f172a] text-white p-10 flex flex-col gap-10">
             <div className="space-y-8">
                <div className="w-20 h-20 rounded-2xl bg-cyan-500 flex items-center justify-center text-4xl font-black text-white">{data.personalInfo.fullName.charAt(0)}</div>
                <div className="space-y-4 text-xs">
                   <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2">Contact Link</h3>
                   <div className="space-y-3">
                      <p className="flex flex-col"><span className="opacity-40 text-[8px] uppercase font-bold mb-1">Email</span>{data.personalInfo.email}</p>
                      {data.personalInfo.phone && <p className="flex flex-col"><span className="opacity-40 text-[8px] uppercase font-bold mb-1">Phone</span>{data.personalInfo.phone}</p>}
                      {data.personalInfo.location && <p className="flex flex-col"><span className="opacity-40 text-[8px] uppercase font-bold mb-1">Location</span>{data.personalInfo.location}</p>}
                      {data.personalInfo.linkedin && <p className="flex flex-col"><span className="opacity-40 text-[8px] uppercase font-bold mb-1">LinkedIn</span><span className="break-all">{data.personalInfo.linkedin}</span></p>}
                   </div>
                </div>
                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2">Technical expertise</h3>
                   <div className="flex flex-wrap gap-2">
                      {data.skills.technical.slice(0, 10).map((s, i) => <span key={i} className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold tracking-tight">{s}</span>)}
                   </div>
                </div>
                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2">Education</h3>
                   <div className="space-y-5">
                      {data.education.map((edu, i) => (
                         <div key={i} className="space-y-1">
                            <p className="font-bold text-[11px] leading-tight text-white">{edu.degree}</p>
                            <p className="text-[9px] text-white/50">{edu.school}</p>
                            <p className="text-[8px] font-black uppercase text-cyan-400/80 tracking-widest">{edu.date}</p>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
          <div className="flex-1 p-12 space-y-12">
             <header className="border-b border-slate-100 pb-10">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">{data.personalInfo.fullName}</h1>
                <h2 className="text-xl font-bold text-cyan-500 uppercase tracking-[0.2em]">{data.personalInfo.role}</h2>
             </header>
             <section className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Expertise Summary</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{data.summary}</p>
             </section>
             <section className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Operational History</h3>
                <div className="space-y-10">
                   {data.experience.map((exp, i) => (
                      <div key={i} className="space-y-3 relative pl-6 border-l-2 border-slate-50">
                         <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-cyan-500"></div>
                         <div className="flex justify-between items-baseline"><h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{exp.role}</h4><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{exp.date}</span></div>
                         <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest">{exp.company}</p>
                         <ul className="space-y-1.5">{exp.bullets.map((b, j) => <li key={j} className="text-sm text-slate-500 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-cyan-400">{b}</li>)}</ul>
                      </div>
                   ))}
                </div>
             </section>
             {data.projects.length > 0 && (
               <section className="space-y-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Deployed Projects</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {data.projects.map((proj, i) => (
                      <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                         <div className="flex justify-between items-center mb-2">
                            <h4 className="font-black text-slate-900 text-sm uppercase">{proj.name}</h4>
                            <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">{proj.techStack}</span>
                         </div>
                         <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
               </section>
             )}
          </div>
       </div>
    </div>
  );

  // Added missing ClassicTemplate
  const ClassicTemplate = ({ data }: { data: ResumeData }) => (
    <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-16 flex flex-col mx-auto shadow-2xl">
       <header className="text-center border-b-2 border-slate-900 pb-8 mb-8">
          <h1 className="text-4xl font-serif font-bold uppercase mb-2">{data.personalInfo.fullName}</h1>
          <div className="flex justify-center gap-4 text-xs font-medium text-slate-600">
             <span>{data.personalInfo.email}</span>
             {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
             {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
          </div>
       </header>
       <div className="space-y-8">
          <section>
             <h3 className="text-sm font-bold uppercase border-b border-slate-300 mb-3">Professional Summary</h3>
             <p className="text-sm leading-relaxed">{data.summary}</p>
          </section>
          <section>
             <h3 className="text-sm font-bold uppercase border-b border-slate-300 mb-3">Experience</h3>
             <div className="space-y-6">
                {data.experience.map((exp, i) => (
                   <div key={i} className="space-y-1">
                      <div className="flex justify-between font-bold text-sm">
                         <span>{exp.role}</span>
                         <span>{exp.date}</span>
                      </div>
                      <div className="italic text-sm text-slate-700">{exp.company}</div>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 mt-2">
                         {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                      </ul>
                   </div>
                ))}
             </div>
          </section>
          <section>
             <h3 className="text-sm font-bold uppercase border-b border-slate-300 mb-3">Education</h3>
             <div className="space-y-4">
                {data.education.map((edu, i) => (
                   <div key={i} className="flex justify-between text-sm">
                      <div>
                         <span className="font-bold">{edu.degree}</span>, <span>{edu.school}</span>
                      </div>
                      <span className="text-slate-500">{edu.date}</span>
                   </div>
                ))}
             </div>
          </section>
          <section>
             <h3 className="text-sm font-bold uppercase border-b border-slate-300 mb-3">Skills</h3>
             <p className="text-sm"><span className="font-bold">Technical:</span> {data.skills.technical.join(', ')}</p>
             <p className="text-sm"><span className="font-bold">Tools:</span> {data.skills.tools.join(', ')}</p>
          </section>
       </div>
    </div>
  );

  // Added missing MinimalTemplate
  const MinimalTemplate = ({ data }: { data: ResumeData }) => (
    <div className="w-[210mm] min-h-[297mm] bg-white text-slate-700 p-20 flex flex-col mx-auto shadow-2xl">
       <header className="mb-12">
          <h1 className="text-3xl font-light tracking-widest uppercase mb-1">{data.personalInfo.fullName}</h1>
          <p className="text-sm tracking-[0.3em] text-slate-400 uppercase">{data.personalInfo.role}</p>
       </header>
       <div className="grid grid-cols-12 gap-12">
          <aside className="col-span-4 space-y-10">
             <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Contact</h3>
                <div className="text-[11px] space-y-2">
                   <p>{data.personalInfo.email}</p>
                   {data.personalInfo.phone && <p>{data.personalInfo.phone}</p>}
                   {data.personalInfo.linkedin && <p className="truncate">{data.personalInfo.linkedin}</p>}
                </div>
             </section>
             <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Expertise</h3>
                <ul className="text-[11px] space-y-1">
                   {data.skills.technical.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
             </section>
          </aside>
          <main className="col-span-8 space-y-12">
             <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Background</h3>
                <p className="text-sm leading-loose">{data.summary}</p>
             </section>
             <section className="space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Experience</h3>
                {data.experience.map((exp, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                         <h4 className="text-sm font-bold">{exp.role}</h4>
                         <span className="text-[10px] text-slate-400">{exp.date}</span>
                      </div>
                      <p className="text-[11px] italic text-slate-500">{exp.company}</p>
                      <ul className="space-y-1">
                         {exp.bullets.map((b, j) => <li key={j} className="text-[11px] leading-relaxed">— {b}</li>)}
                      </ul>
                   </div>
                ))}
             </section>
          </main>
       </div>
    </div>
  );

  return (
    <div className="h-full flex gap-0 font-sans overflow-hidden bg-white">
      
      {/* LEFT: Master Navigation Deck */}
      <div className="w-64 shrink-0 flex flex-col gap-4 bg-slate-50 border-r border-slate-200 p-6 h-full overflow-y-auto custom-scrollbar">
         <div className="space-y-6">
            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Builder Deck</h3>
               <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Global Protocol v2.5</p>
            </div>
            <nav className="space-y-1">
               {navigationSections.map((section) => {
                  const Icon = section.icon;
                  return (
                     <button 
                        key={section.id} 
                        onClick={() => scrollToSection(section.id as SectionType)}
                        className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-slate-500 hover:bg-white hover:shadow-sm hover:text-cyan-500 group"
                     >
                        <div className="flex items-center gap-3">
                           <Icon size={16} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">{section.label}</span>
                        </div>
                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                     </button>
                  );
               })}
            </nav>
         </div>

         {/* AI Job Tunneler - Floating Style */}
         <div className="mt-auto pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500"><Target size={18} /></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">AI Tunneler</span>
            </div>
            <textarea 
               value={jobDescription}
               onChange={(e) => setJobDescription(e.target.value)}
               placeholder="Paste target Job Description here for AI optimization..."
               className="w-full h-24 bg-white border border-slate-200 rounded-xl p-3 text-[10px] text-slate-600 outline-none focus:border-cyan-500 resize-none transition-all shadow-inner placeholder:italic"
            />
            <button 
               onClick={handleGenerate}
               disabled={isGenerating}
               className="w-full py-3 bg-[#1e293b] hover:bg-cyan-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50"
            >
               {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
               Tuning Profile
            </button>
         </div>
      </div>

      {/* CENTER: Unified Scrollable Editor */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white" ref={formRef}>
         <div className="max-w-3xl mx-auto py-16 px-10 space-y-24">
            
            {/* 1. IDENTITY SECTION */}
            <div id="section-PERSONAL" className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200"><UserIcon size={20}/></div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Identity Matrix</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Candidate Registry</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Full Name</label>
                     <input type="text" placeholder="John Doe" value={resumeData.personalInfo.fullName} onChange={(e) => handlePersonalChange('fullName', e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Role</label>
                     <input type="text" placeholder="Systems Architect" value={resumeData.personalInfo.role} onChange={(e) => handlePersonalChange('role', e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Email</label>
                     <div className="relative">
                        <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="email" placeholder="nexus@lab.com" value={resumeData.personalInfo.email} onChange={(e) => handlePersonalChange('email', e.target.value)} className={`${inputClass} pl-12`} />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voice Terminal (Phone)</label>
                     <div className="relative">
                        <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="tel" placeholder="+91 XXXX XXXX XX" value={resumeData.personalInfo.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} className={`${inputClass} pl-12`} />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Geo-Coordinates (Location)</label>
                     <div className="relative">
                        <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="text" placeholder="San Francisco, CA" value={resumeData.personalInfo.location} onChange={(e) => handlePersonalChange('location', e.target.value)} className={`${inputClass} pl-12`} />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nexus Link (LinkedIn)</label>
                     <div className="relative">
                        <Linkedin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="text" placeholder="linkedin.com/in/username" value={resumeData.personalInfo.linkedin} onChange={(e) => handlePersonalChange('linkedin', e.target.value)} className={`${inputClass} pl-12`} />
                     </div>
                  </div>
               </div>
            </div>

            {/* 2. SUMMARY SECTION */}
            <div id="section-SUMMARY" className="space-y-10 border-t border-slate-100 pt-16">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200"><FileText size={20}/></div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Summary Protocol</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategic Professional Baseline</p>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Summary (Max 3-4 Sentences)</label>
                  <textarea value={resumeData.summary} onChange={(e) => setResumeData({...resumeData, summary: e.target.value})} className={textAreaClass} style={{ height: '12rem' }} placeholder="Articulate your value proposition concisely..." />
               </div>
            </div>

            {/* 3. EXPERIENCE SECTION */}
            <div id="section-EXPERIENCE" className="space-y-10 border-t border-slate-100 pt-16">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200"><ShieldCheck size={20}/></div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Operational History</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Professional Log</p>
                    </div>
                  </div>
                  <button onClick={() => addItem('experience')} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-500 transition-all"><Plus size={14}/> Add Unit</button>
               </div>
               <div className="space-y-8">
                  {resumeData.experience.map((exp) => (
                     <div key={exp.id} className="p-8 bg-slate-50 border border-slate-200 rounded-[32px] relative group space-y-6 shadow-sm">
                        <button onClick={() => removeItem('experience', exp.id)} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-2 gap-4">
                           <input type="text" placeholder="Designation / Role" value={exp.role} onChange={(e) => handleArrayChange('experience', exp.id, 'role', e.target.value)} className={inputClass} />
                           <input type="text" placeholder="Entity (Company)" value={exp.company} onChange={(e) => handleArrayChange('experience', exp.id, 'company', e.target.value)} className={inputClass} />
                        </div>
                        <input type="text" placeholder="Temporal Scope (e.g. 2024 - Present)" value={exp.date} onChange={(e) => handleArrayChange('experience', exp.id, 'date', e.target.value)} className={inputClass} />
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Contributions (One per line)</label>
                           <textarea placeholder="Document major achievements using action verbs..." value={exp.bullets.join('\n')} onChange={(e) => handleArrayChange('experience', exp.id, 'bullets', e.target.value.split('\n'))} className={textAreaClass} style={{ height: '10rem' }} />
                        </div>
                     </div>
                   ))}
               </div>
            </div>

            {/* 4. EDUCATION SECTION */}
            <div id="section-EDUCATION" className="space-y-10 border-t border-slate-100 pt-16">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200"><GraduationCap size={20}/></div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Academic Registry</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Formal Certification Log</p>
                    </div>
                  </div>
                  <button onClick={() => addItem('education')} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-500 transition-all"><Plus size={14}/> Link Node</button>
               </div>
               <div className="space-y-8">
                  {resumeData.education.map((edu) => (
                     <div key={edu.id} className="p-8 bg-slate-50 border border-slate-200 rounded-[32px] relative group space-y-4 shadow-sm">
                        <button onClick={() => removeItem('education', edu.id)} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                        <input type="text" placeholder="Academic Degree / Tier" value={edu.degree} onChange={(e) => handleArrayChange('education', edu.id, 'degree', e.target.value)} className={inputClass} />
                        <div className="grid grid-cols-2 gap-4">
                           <input type="text" placeholder="Academy (University)" value={edu.school} onChange={(e) => handleArrayChange('education', edu.id, 'school', e.target.value)} className={inputClass} />
                           <input type="text" placeholder="Registry Year" value={edu.date} onChange={(e) => handleArrayChange('education', edu.id, 'date', e.target.value)} className={inputClass} />
                        </div>
                     </div>
                   ))}
               </div>
            </div>

            {/* 5. SKILLS SECTION */}
            <div id="section-SKILLS" className="space-y-10 border-t border-slate-100 pt-16">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200"><Code2 size={20}/></div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Skill Matrix</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technical Capability Cluster</p>
                  </div>
               </div>
               <div className="space-y-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tech Stack Cluster (Comma Separated)</label>
                     <textarea value={resumeData.skills.technical.join(', ')} onChange={(e) => handleSkillsChange('technical', e.target.value)} className={textAreaClass} style={{ height: '6rem' }} placeholder="React, Python, AWS, Docker..." />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Tools & Infrastructure</label>
                     <input type="text" value={resumeData.skills.tools.join(', ')} onChange={(e) => handleSkillsChange('tools', e.target.value)} className={inputClass} placeholder="Git, VS Code, CI/CD..." />
                  </div>
               </div>
            </div>

            {/* 6. PROJECTS SECTION */}
            <div id="section-PROJECTS" className="space-y-10 border-t border-slate-100 pt-16">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200"><FolderGit2 size={20}/></div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Active Deployments</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Independent Technical Projects</p>
                    </div>
                  </div>
                  <button onClick={() => addItem('projects')} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-500 transition-all"><Plus size={14}/> Deploy New</button>
               </div>
               <div className="space-y-8">
                  {resumeData.projects.map((proj) => (
                     <div key={proj.id} className="p-8 bg-slate-50 border border-slate-200 rounded-[32px] relative group space-y-4 shadow-sm">
                        <button onClick={() => removeItem('projects', proj.id)} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                        <input type="text" placeholder="Project Primary Identifier" value={proj.name} onChange={(e) => handleArrayChange('projects', proj.id, 'name', e.target.value)} className={inputClass} />
                        <input type="text" placeholder="Applied Tech Stack" value={proj.techStack} onChange={(e) => handleArrayChange('projects', proj.id, 'techStack', e.target.value)} className={inputClass} />
                        <textarea placeholder="Deployment Mission Objectives & Features..." value={proj.description} onChange={(e) => handleArrayChange('projects', proj.id, 'description', e.target.value)} className={textAreaClass} style={{ height: '8rem' }} />
                     </div>
                   ))}
               </div>
            </div>

            {/* 7. ACHIEVEMENTS SECTION */}
            <div id="section-ACHIEVEMENTS" className="space-y-10 border-t border-slate-100 pt-16 pb-20">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200"><Award size={20}/></div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Honor Registry</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distinguished Technical Honors</p>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awards & Global Distinctions (One per line)</label>
                  <textarea value={resumeData.achievements.join('\n')} onChange={(e) => handleAchievementsChange(e.target.value)} className={textAreaClass} style={{ height: '14rem' }} placeholder="List top-tier academic or professional honors..." />
               </div>
            </div>

         </div>
      </div>

      {/* RIGHT: Visual Terminal & Export Engine */}
      <div className="w-[45%] flex flex-col bg-slate-100 p-8 h-full">
         <div className="bg-[#1e293b] rounded-3xl p-5 border border-slate-800 shadow-2xl flex items-center justify-between mb-8">
            <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700">
               {(['MODERN', 'CLASSIC', 'MINIMAL'] as TemplateType[]).map((t) => (
                  <button key={t} onClick={() => setSelectedTemplate(t)} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedTemplate === t ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
               ))}
            </div>
            <button onClick={handlePrint} className="px-6 py-3 bg-white text-[#1e293b] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
               <Printer size={18} /> Export PDF
            </button>
         </div>

         {/* Sticky Preview Container */}
         <div className="flex-1 bg-white/40 rounded-[40px] border border-slate-200/60 shadow-inner overflow-hidden flex justify-center p-8 relative">
            <div className="absolute top-4 right-8 flex items-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">
               <Info size={12}/> Live Registry Preview
            </div>
            <div className="overflow-y-auto w-full custom-scrollbar flex justify-center">
               <div ref={printRef} className="origin-top transform scale-[0.4] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.75] xl:scale-[0.8] bg-white shadow-2xl h-fit rounded-sm transition-all duration-700 border border-slate-100">
                  {selectedTemplate === 'MODERN' && <ModernTemplate data={resumeData} />}
                  {selectedTemplate === 'CLASSIC' && <ClassicTemplate data={resumeData} />}
                  {selectedTemplate === 'MINIMAL' && <MinimalTemplate data={resumeData} />}
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default ResumeBuilder;
