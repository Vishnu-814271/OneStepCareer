
import React, { useState, useRef, useEffect } from 'react';
import { User, ResumeData } from '../types';
import { generateATSResume } from '../services/geminiService';
import { 
  FileText, Briefcase, Sparkles, Download, PenTool, Layout, Printer, 
  Loader2, Palette, ChevronDown, ChevronUp, Plus, Trash2, Save, 
  User as UserIcon, GraduationCap, Code2, FolderGit2, Award, 
  Mail, Phone, MapPin, Linkedin, Link, Info, Target, MousePointer2,
  Terminal, ShieldCheck
} from 'lucide-react';

interface ResumeBuilderProps {
  currentUser: User;
}

type TemplateType = 'MODERN' | 'CLASSIC' | 'MINIMAL';
type SectionType = 'PERSONAL' | 'SUMMARY' | 'ACHIEVEMENTS' | 'EXPERIENCE' | 'EDUCATION' | 'SKILLS' | 'PROJECTS';

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ currentUser }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [activeSection, setActiveSection] = useState<SectionType>('PERSONAL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('MODERN');
  const printRef = useRef<HTMLDivElement>(null);

  // Initial Data State
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
        'Top 1% in National Engineering Logic Olympiad',
        'Certified Cloud Solutions Architect Associate'
    ],
    skills: {
      technical: ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'AWS'],
      soft: ['Agile Leadership', 'Technical Communication', 'Problem Solving'],
      tools: ['Git', 'Docker', 'Kubernetes', 'CI/CD Pipelines']
    },
    experience: [
      {
        id: 1,
        role: 'Technical Intern',
        company: 'Nexus Systems Lab',
        date: 'June 2024 - Present',
        bullets: [
          'Developed robust microservices using Node.js and TypeScript.',
          'Reduced API latency by 40% through strategic caching implementations.',
          'Collaborated with senior engineers on architectural system design.'
        ]
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
    projects: []
  });

  // --- FORM HANDLERS ---

  const handlePersonalChange = (field: keyof ResumeData['personalInfo'], value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const handleArrayChange = (
    section: 'experience' | 'education' | 'projects', 
    id: number, 
    field: string, 
    value: any
  ) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].map((item: any) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = (section: 'experience' | 'education' | 'projects') => {
    const newId = Date.now();
    const newItem = section === 'experience' 
      ? { id: newId, role: '', company: '', date: '', bullets: [''] }
      : section === 'education'
      ? { id: newId, degree: '', school: '', date: '' }
      : { id: newId, name: '', description: '', techStack: '' };

    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const removeItem = (section: 'experience' | 'education' | 'projects', id: number) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((item: any) => item.id !== id)
    }));
  };

  const handleSkillsChange = (category: 'technical' | 'soft' | 'tools', value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: { ...prev.skills, [category]: value.split(',').map(s => s.trim()).filter(s => s !== "") }
    }));
  };

  const handleAchievementsChange = (value: string) => {
      setResumeData(prev => ({
          ...prev,
          achievements: value.split('\n').filter(a => a.trim() !== "")
      }));
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      alert("Please provide a Job Description to enable AI optimization.");
      return;
    }
    setIsGenerating(true);
    const currentProfileString = JSON.stringify(resumeData);
    const optimizedData = await generateATSResume(currentProfileString, jobDescription);
    
    if (optimizedData) {
        setResumeData(optimizedData);
    } else {
        alert("Optimization failed. Re-connecting to Nexus AI...");
    }
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
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Inter', sans-serif; }
              .heading-font { font-family: 'Outfit', sans-serif; }
            </style>
          </head>
          <body class="bg-white">
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 700);
    }
  };

  // --- UI COMPONENTS ---

  const SectionHeader = ({ title, section, icon: Icon }: { title: string, section: SectionType, icon: any }) => (
    <button 
      onClick={() => setActiveSection(activeSection === section ? 'PERSONAL' : section)}
      className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border ${
        activeSection === section 
          ? 'bg-[#1e293b] text-white border-[#0ea5e9] shadow-lg shadow-cyan-500/10' 
          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${activeSection === section ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-100 text-slate-400'}`}>
           <Icon size={18} />
        </div>
        <span className="font-bold text-xs uppercase tracking-widest">{title}</span>
      </div>
      {activeSection === section ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  );

  const EditorField = ({ label, icon: Icon, children }: { label: string, icon?: any, children: React.ReactNode }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        {Icon && <Icon size={12} className="text-slate-400" />}
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      </div>
      {children}
    </div>
  );

  const inputClass = "w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium placeholder:text-slate-300 focus:border-[#0ea5e9] focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all shadow-sm";
  const textAreaClass = "w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium placeholder:text-slate-300 focus:border-[#0ea5e9] focus:ring-4 focus:ring-cyan-500/10 outline-none resize-none transition-all shadow-sm";

  // --- TEMPLATES ---

  const ModernTemplate = ({ data }: { data: ResumeData }) => (
    <div className="w-[210mm] min-h-[297mm] bg-white text-slate-800 flex flex-col mx-auto overflow-hidden shadow-2xl relative">
       {/* Accented Border Top */}
       <div className="h-2 bg-[#0ea5e9] w-full shrink-0"></div>
       
       <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-[30%] bg-[#0f172a] text-white p-10 flex flex-col gap-10">
             <div className="space-y-8">
                <div className="w-24 h-24 rounded-3xl bg-[#0ea5e9] flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-cyan-500/20">
                   {data.personalInfo.fullName.charAt(0)}
                </div>
                
                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] border-b border-white/10 pb-2">Contact Link</h3>
                   <div className="space-y-4 text-xs">
                      {data.personalInfo.email && (
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Email</span>
                           <span className="text-white/80 break-all">{data.personalInfo.email}</span>
                        </div>
                      )}
                      {data.personalInfo.phone && (
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Phone</span>
                           <span className="text-white/80">{data.personalInfo.phone}</span>
                        </div>
                      )}
                      {data.personalInfo.location && (
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Location</span>
                           <span className="text-white/80">{data.personalInfo.location}</span>
                        </div>
                      )}
                      {data.personalInfo.linkedin && (
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">LinkedIn</span>
                           <span className="text-white/80 break-all">{data.personalInfo.linkedin}</span>
                        </div>
                      )}
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] border-b border-white/10 pb-2">Core Skills</h3>
                   <div className="flex flex-wrap gap-2">
                      {data.skills.technical.map((s, i) => (
                         <span key={i} className="px-2 py-1 bg-white/10 rounded-md text-[9px] font-bold text-white/80 tracking-wide">{s}</span>
                      ))}
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] border-b border-white/10 pb-2">Education</h3>
                   <div className="space-y-6">
                      {data.education.map((edu, i) => (
                         <div key={i} className="space-y-1">
                            <p className="font-bold text-sm leading-tight text-white">{edu.degree}</p>
                            <p className="text-[10px] text-white/50">{edu.school}</p>
                            <p className="text-[9px] text-cyan-400/80 font-black uppercase tracking-widest">{edu.date}</p>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 p-12 flex flex-col gap-12">
             <header className="space-y-2 border-b border-slate-100 pb-10">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">{data.personalInfo.fullName}</h1>
                <h2 className="text-xl font-bold text-cyan-500 uppercase tracking-widest">{data.personalInfo.role}</h2>
             </header>

             <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Expertise Summary</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{data.summary}</p>
             </section>

             <section className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Career Milestones</h3>
                <div className="space-y-10">
                   {data.experience.map((exp, i) => (
                      <div key={i} className="relative pl-6 border-l-2 border-slate-100">
                         <div className="absolute top-0 -left-1.5 w-3 h-3 bg-cyan-500 rounded-full border-2 border-white shadow-sm"></div>
                         <div className="flex justify-between items-baseline mb-4">
                            <div>
                               <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">{exp.role}</h4>
                               <p className="text-xs font-bold text-cyan-600 mt-1 uppercase tracking-widest">{exp.company}</p>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full">{exp.date}</span>
                         </div>
                         <ul className="space-y-2">
                            {exp.bullets.map((b, j) => (
                               <li key={j} className="text-sm text-slate-500 leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-cyan-200 before:rounded-full">{b}</li>
                            ))}
                         </ul>
                      </div>
                   ))}
                </div>
             </section>

             {data.achievements.length > 0 && (
                <section className="space-y-6">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Distinguished Honors</h3>
                   <div className="grid grid-cols-1 gap-3">
                      {data.achievements.map((a, i) => (
                         <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <Award size={18} className="text-cyan-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-700">{a}</span>
                         </div>
                      ))}
                   </div>
                </section>
             )}
          </div>
       </div>
    </div>
  );

  const ClassicTemplate = ({ data }: { data: ResumeData }) => (
    <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-20 mx-auto shadow-2xl serif flex flex-col gap-12 font-sans">
       <header className="text-center border-b-2 border-slate-900 pb-10">
          <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">{data.personalInfo.fullName}</h1>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
             <span className="flex items-center gap-2"><Mail size={12} className="text-cyan-500"/> {data.personalInfo.email}</span>
             {data.personalInfo.phone && <span className="flex items-center gap-2"><Phone size={12} className="text-cyan-500"/> {data.personalInfo.phone}</span>}
             {data.personalInfo.location && <span className="flex items-center gap-2"><MapPin size={12} className="text-cyan-500"/> {data.personalInfo.location}</span>}
             {data.personalInfo.linkedin && <span className="flex items-center gap-2"><Linkedin size={12} className="text-cyan-500"/> {data.personalInfo.linkedin}</span>}
          </div>
       </header>

       <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-200 pb-2">Profile Matrix</h3>
          <p className="text-sm text-slate-700 leading-8 text-justify">{data.summary}</p>
       </section>

       <section className="space-y-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-200 pb-2">Operational History</h3>
          <div className="space-y-12">
             {data.experience.map((exp, i) => (
                <div key={i} className="space-y-4">
                   <div className="flex justify-between items-baseline">
                      <div>
                         <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{exp.role}</h4>
                         <p className="text-sm font-bold text-cyan-600 mt-1">{exp.company}</p>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exp.date}</span>
                   </div>
                   <ul className="list-disc pl-5 space-y-2">
                      {exp.bullets.map((b, j) => (
                         <li key={j} className="text-sm text-slate-700 leading-relaxed pl-2">{b}</li>
                      ))}
                   </ul>
                </div>
             ))}
          </div>
       </section>

       <div className="grid grid-cols-2 gap-12">
          <section className="space-y-4">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-200 pb-2">Education</h3>
             <div className="space-y-6">
                {data.education.map((edu, i) => (
                   <div key={i} className="space-y-1">
                      <p className="font-black text-sm text-slate-900 uppercase">{edu.degree}</p>
                      <p className="text-xs text-slate-500 italic">{edu.school}</p>
                      <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">{edu.date}</p>
                   </div>
                ))}
             </div>
          </section>
          
          <section className="space-y-4">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-200 pb-2">Skill Cluster</h3>
             <div className="space-y-4">
                <div className="space-y-1">
                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Technologies</span>
                   <p className="text-xs font-bold text-slate-700 leading-relaxed">{data.skills.technical.join(', ')}</p>
                </div>
                <div className="space-y-1">
                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Operations</span>
                   <p className="text-xs font-bold text-slate-700 leading-relaxed">{data.skills.tools.join(', ')}</p>
                </div>
             </div>
          </section>
       </div>
    </div>
  );

  const MinimalTemplate = ({ data }: { data: ResumeData }) => (
    <div className="w-[210mm] min-h-[297mm] bg-[#f9fafb] text-slate-800 p-16 mx-auto shadow-2xl flex flex-col gap-20">
       <header className="space-y-6">
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">{data.personalInfo.fullName}</h1>
          <div className="flex items-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
             <span>{data.personalInfo.role}</span>
             <div className="h-px w-20 bg-slate-200"></div>
             <span>{data.personalInfo.location}</span>
          </div>
       </header>

       <div className="grid grid-cols-12 gap-16">
          <div className="col-span-8 space-y-16">
             <section className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-4">
                   <div className="h-px w-8 bg-slate-900"></div> Profile
                </h3>
                <p className="text-lg text-slate-600 font-light leading-relaxed">{data.summary}</p>
             </section>

             <section className="space-y-10">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-4">
                   <div className="h-px w-8 bg-slate-900"></div> Experience
                </h3>
                <div className="space-y-12">
                   {data.experience.map((exp, i) => (
                      <div key={i} className="space-y-4">
                         <div className="flex justify-between items-baseline">
                            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{exp.role}</h4>
                            <span className="text-[10px] font-bold text-slate-400">{exp.date}</span>
                         </div>
                         <p className="text-sm font-black text-cyan-600 uppercase tracking-widest">{exp.company}</p>
                         <ul className="space-y-4 pt-2">
                            {exp.bullets.map((b, j) => (
                               <li key={j} className="text-sm text-slate-500 leading-relaxed pl-6 relative before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-slate-300 before:rounded-full">{b}</li>
                            ))}
                         </ul>
                      </div>
                   ))}
                </div>
             </section>
          </div>

          <div className="col-span-4 space-y-16 border-l border-slate-200 pl-12">
             <section className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Contact</h3>
                <div className="space-y-4 text-xs font-bold text-slate-500">
                   <div className="space-y-1">
                      <span className="text-[9px] text-slate-300 uppercase">Email</span>
                      <p className="break-all">{data.personalInfo.email}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[9px] text-slate-300 uppercase">Phone</span>
                      <p>{data.personalInfo.phone}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[9px] text-slate-300 uppercase">LinkedIn</span>
                      <p className="break-all">{data.personalInfo.linkedin}</p>
                   </div>
                </div>
             </section>

             <section className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Tech Set</h3>
                <div className="flex flex-wrap gap-2">
                   {data.skills.technical.map((s, i) => (
                      <span key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block w-full">{s}</span>
                   ))}
                </div>
             </section>

             <section className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Academic</h3>
                <div className="space-y-6">
                   {data.education.map((edu, i) => (
                      <div key={i} className="space-y-1">
                         <p className="text-sm font-black text-slate-900 uppercase">{edu.degree}</p>
                         <p className="text-[10px] font-bold text-slate-400">{edu.school}</p>
                         <p className="text-[9px] text-slate-300 uppercase tracking-widest">{edu.date}</p>
                      </div>
                   ))}
                </div>
             </section>
          </div>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto min-h-screen pb-20 flex flex-col lg:flex-row gap-10 px-4 md:px-10 pt-6 font-sans">
      
      {/* LEFT: Editor Flow (Sticky on large) */}
      <div className="w-full lg:w-5/12 flex flex-col gap-8">
         
         <div className="space-y-4">
             <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900/5 text-slate-600 rounded-2xl border border-slate-200">
                <Target size={14} className="text-[#0ea5e9] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Industrial Resume Engine v2.5</span>
             </div>
             <h1 className="text-4xl font-black text-[#1e293b] tracking-tighter uppercase leading-none">
                ATS <span className="text-[#0ea5e9]">Optimizer</span>
             </h1>
             <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                Engineered for maximum keyword compatibility. Refine your professional profile for industrial verification.
             </p>
         </div>

         {/* Job Context Integration */}
         <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-all duration-700"></div>
             
             <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500">
                       <Briefcase size={18} />
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Target Job Context</h3>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Paste Description for AI Tuning</p>
                    </div>
                 </div>
                 
                 <textarea 
                   value={jobDescription}
                   onChange={(e) => setJobDescription(e.target.value)}
                   placeholder="Paste the target Job Description (JD) here to trigger ATS keyword matching..."
                   className={textAreaClass}
                   style={{ height: '8rem' }}
                 />
                 
                 <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-4 bg-[#1e293b] hover:bg-[#0ea5e9] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                 >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isGenerating ? 'Analyzing System Requirements...' : 'Optimize Personal Protocol'}
                 </button>
             </div>
         </div>

         {/* Section Accordions */}
         <div className="space-y-3">
             
             {/* Section: PERSONAL */}
             <div className={`transition-all duration-300 ${activeSection === 'PERSONAL' ? 'scale-[1.02]' : ''}`}>
                <SectionHeader title="Identification Matrix" section="PERSONAL" icon={UserIcon} />
                {activeSection === 'PERSONAL' && (
                  <div className="p-8 bg-white border-x border-b border-slate-200 rounded-b-[24px] space-y-8 animate-in slide-in-from-top-4 duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EditorField label="Full Identification" icon={UserIcon}>
                           <input type="text" placeholder="Nexus Operator 01" value={resumeData.personalInfo.fullName} onChange={(e) => handlePersonalChange('fullName', e.target.value)} className={inputClass} />
                        </EditorField>
                        <EditorField label="Operational Tier" icon={Target}>
                           <input type="text" placeholder="Senior Systems Architect" value={resumeData.personalInfo.role} onChange={(e) => handlePersonalChange('role', e.target.value)} className={inputClass} />
                        </EditorField>
                        <EditorField label="Email Link" icon={Mail}>
                           <input type="email" placeholder="operator@nexus.lab" value={resumeData.personalInfo.email} onChange={(e) => handlePersonalChange('email', e.target.value)} className={inputClass} />
                        </EditorField>
                        <EditorField label="Voice Comms" icon={Phone}>
                           <input type="tel" placeholder="+91 XXXX XXXX XX" value={resumeData.personalInfo.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} className={inputClass} />
                        </EditorField>
                        <EditorField label="Geo Coordinates" icon={MapPin}>
                           <input type="text" placeholder="Bangalore, IN" value={resumeData.personalInfo.location} onChange={(e) => handlePersonalChange('location', e.target.value)} className={inputClass} />
                        </EditorField>
                        <EditorField label="Nexus Profile (LinkedIn)" icon={Linkedin}>
                           <input type="text" placeholder="linkedin.com/in/nexus-link" value={resumeData.personalInfo.linkedin} onChange={(e) => handlePersonalChange('linkedin', e.target.value)} className={inputClass} />
                        </EditorField>
                     </div>
                  </div>
                )}
             </div>

             {/* Section: SUMMARY */}
             <div>
                <SectionHeader title="System Summary" section="SUMMARY" icon={FileText} />
                {activeSection === 'SUMMARY' && (
                  <div className="p-8 bg-white border-x border-b border-slate-200 rounded-b-[24px] animate-in slide-in-from-top-4 duration-300">
                     <EditorField label="Professional Protocol Summary">
                        <textarea 
                           value={resumeData.summary} 
                           onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
                           className={textAreaClass}
                           style={{ height: '10rem' }}
                           placeholder="Describe your technical core in 3-4 impactful sentences..."
                        />
                     </EditorField>
                  </div>
                )}
             </div>

             {/* Section: SKILLS */}
             <div>
                <SectionHeader title="Capability Cluster" section="SKILLS" icon={Code2} />
                {activeSection === 'SKILLS' && (
                  <div className="p-8 bg-white border-x border-b border-slate-200 rounded-b-[24px] space-y-6 animate-in slide-in-from-top-4 duration-300">
                     <EditorField label="Technical Stack (Comma Separated)" icon={Terminal}>
                        <textarea 
                           value={resumeData.skills.technical.join(', ')} 
                           onChange={(e) => handleSkillsChange('technical', e.target.value)} 
                           className={textAreaClass} 
                           style={{ height: '5rem' }} 
                        />
                     </EditorField>
                     <EditorField label="Operational Tools" icon={MousePointer2}>
                        <input 
                           type="text" 
                           value={resumeData.skills.tools.join(', ')} 
                           onChange={(e) => handleSkillsChange('tools', e.target.value)} 
                           className={inputClass} 
                           placeholder="Git, Docker, VS Code..."
                        />
                     </EditorField>
                  </div>
                )}
             </div>

             {/* Section: EXPERIENCE */}
             <div>
                <SectionHeader title="Operational History" section="EXPERIENCE" icon={ShieldCheck} />
                {activeSection === 'EXPERIENCE' && (
                   <div className="p-8 bg-white border-x border-b border-slate-200 rounded-b-[24px] space-y-8 animate-in slide-in-from-top-4 duration-300">
                      {resumeData.experience.map((exp, idx) => (
                         <div key={exp.id} className="p-6 bg-slate-50 border border-slate-200 rounded-[24px] space-y-6 relative group">
                            <button onClick={() => removeItem('experience', exp.id)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <EditorField label="Role Position">
                                  <input type="text" placeholder="Lead Architect" value={exp.role} onChange={(e) => handleArrayChange('experience', exp.id, 'role', e.target.value)} className={inputClass} />
                               </EditorField>
                               <EditorField label="Nexus Entity (Company)">
                                  <input type="text" placeholder="Global Tech Lab" value={exp.company} onChange={(e) => handleArrayChange('experience', exp.id, 'company', e.target.value)} className={inputClass} />
                               </EditorField>
                            </div>
                            <EditorField label="Registry Period (Date)">
                               <input type="text" placeholder="2023 - Present" value={exp.date} onChange={(e) => handleArrayChange('experience', exp.id, 'date', e.target.value)} className={inputClass} />
                            </EditorField>
                            <EditorField label="Execution Details (One per line)">
                               <textarea 
                                  placeholder="Document your achievements..." 
                                  value={exp.bullets.join('\n')} 
                                  onChange={(e) => handleArrayChange('experience', exp.id, 'bullets', e.target.value.split('\n'))}
                                  className={textAreaClass}
                                  style={{ height: '8rem' }}
                               />
                            </EditorField>
                         </div>
                      ))}
                      <button onClick={() => addItem('experience')} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-cyan-500 hover:text-cyan-500 transition-all flex items-center justify-center gap-3">
                         <Plus size={16} /> Log Additional Session
                      </button>
                   </div>
                )}
             </div>

             {/* Section: EDUCATION */}
             <div>
                <SectionHeader title="Academic Registry" section="EDUCATION" icon={GraduationCap} />
                {activeSection === 'EDUCATION' && (
                   <div className="p-8 bg-white border-x border-b border-slate-200 rounded-b-[24px] space-y-6 animate-in slide-in-from-top-4 duration-300">
                      {resumeData.education.map((edu) => (
                         <div key={edu.id} className="p-6 bg-slate-50 border border-slate-200 rounded-[24px] space-y-4 relative group">
                            <button onClick={() => removeItem('education', edu.id)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                            <EditorField label="Academic Tier (Degree)">
                               <input type="text" placeholder="B.Tech Computer Science" value={edu.degree} onChange={(e) => handleArrayChange('education', edu.id, 'degree', e.target.value)} className={inputClass} />
                            </EditorField>
                            <div className="grid grid-cols-2 gap-4">
                               <EditorField label="Academy Name">
                                  <input type="text" placeholder="TechNexus Univ" value={edu.school} onChange={(e) => handleArrayChange('education', edu.id, 'school', e.target.value)} className={inputClass} />
                               </EditorField>
                               <EditorField label="Registry Date">
                                  <input type="text" placeholder="2021-2025" value={edu.date} onChange={(e) => handleArrayChange('education', edu.id, 'date', e.target.value)} className={inputClass} />
                               </EditorField>
                            </div>
                         </div>
                      ))}
                      <button onClick={() => addItem('education')} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-cyan-500 hover:text-cyan-500 transition-all flex items-center justify-center gap-3">
                         <Plus size={16} /> Link Academic Node
                      </button>
                   </div>
                )}
             </div>

             {/* Section: ACHIEVEMENTS */}
             <div>
                <SectionHeader title="Honor Registry" section="ACHIEVEMENTS" icon={Award} />
                {activeSection === 'ACHIEVEMENTS' && (
                  <div className="p-8 bg-white border-x border-b border-slate-200 rounded-b-[24px] animate-in slide-in-from-top-4 duration-300">
                     <EditorField label="Global Distinctions (One per line)">
                        <textarea 
                           value={resumeData.achievements.join('\n')} 
                           onChange={(e) => handleAchievementsChange(e.target.value)}
                           className={textAreaClass}
                           style={{ height: '8rem' }}
                           placeholder="List top-tier awards and certifications..."
                        />
                     </EditorField>
                  </div>
                )}
             </div>

         </div>
      </div>

      {/* RIGHT: Visual Terminal (Sticky) */}
      <div className="w-full lg:w-7/12 relative">
          <div className="sticky top-10 space-y-8">
              
              {/* Toolbar Console */}
              <div className="bg-[#1e293b] rounded-3xl p-5 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-6 z-20">
                  <div className="flex items-center gap-6">
                     <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                        {(['MODERN', 'CLASSIC', 'MINIMAL'] as TemplateType[]).map((type) => (
                           <button 
                             key={type}
                             onClick={() => setSelectedTemplate(type)} 
                             className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                               selectedTemplate === type 
                                 ? 'bg-[#0ea5e9] text-white shadow-lg' 
                                 : 'text-slate-500 hover:text-slate-300'
                             }`}
                           >
                              {type}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="flex items-center gap-4">
                     <div className="hidden sm:flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        <Info size={14} /> System Ready
                     </div>
                     <button 
                        onClick={handlePrint}
                        className="flex items-center gap-3 px-8 py-3 bg-white hover:bg-cyan-500 hover:text-white text-[#1e293b] rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-[1.05] active:scale-95"
                     >
                        <Printer size={18} /> Export PDF
                     </button>
                  </div>
              </div>

              {/* Viewport Frame */}
              <div className="bg-slate-200/40 rounded-[40px] p-4 sm:p-10 border border-slate-200/60 shadow-inner flex justify-center min-h-[600px] lg:h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
                  <div ref={printRef} className="origin-top transition-all duration-700 transform scale-[0.4] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.82] xl:scale-[0.9] shadow-[0_40px_100px_rgba(0,0,0,0.1)] bg-white h-fit rounded-sm">
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
