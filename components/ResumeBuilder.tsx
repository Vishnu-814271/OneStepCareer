
import React, { useState, useRef, useEffect } from 'react';
import { User, ResumeData } from '../types';
import { generateATSResume } from '../services/geminiService';
import { FileText, Briefcase, Sparkles, Download, PenTool, Layout, Printer, Loader2, Palette, ChevronDown, ChevronUp, Plus, Trash2, Save, User as UserIcon, GraduationCap, Code2, FolderGit2 } from 'lucide-react';

interface ResumeBuilderProps {
  currentUser: User;
}

type TemplateType = 'MODERN' | 'CLASSIC' | 'MINIMAL';
type SectionType = 'PERSONAL' | 'SUMMARY' | 'EXPERIENCE' | 'EDUCATION' | 'SKILLS' | 'PROJECTS';

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
      role: 'Software Engineer'
    },
    summary: 'Motivated software engineer with a passion for building scalable web applications. Experienced in modern JavaScript frameworks and cloud infrastructure.',
    skills: {
      technical: ['React', 'TypeScript', 'Node.js', 'Python'],
      soft: ['Communication', 'Leadership', 'Problem Solving'],
      tools: ['Git', 'Docker', 'VS Code']
    },
    experience: [
      {
        id: 1,
        role: 'Frontend Developer',
        company: 'TechCorp',
        date: '2023 - Present',
        bullets: ['Developed responsive user interfaces using React.', 'Improved site performance by 25%.']
      }
    ],
    education: [
      {
        id: 1,
        degree: 'B.Tech Computer Science',
        school: 'TechNexus University',
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
      ? { id: newId, role: 'New Role', company: 'Company', date: 'Date', bullets: ['Achievement 1'] }
      : section === 'education'
      ? { id: newId, degree: 'Degree', school: 'School', date: 'Date' }
      : { id: newId, name: 'Project Name', description: 'Description', techStack: 'Tech Stack' };

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
      skills: { ...prev.skills, [category]: value.split(',').map(s => s.trim()) }
    }));
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      alert("Please paste a Job Description first to optimize your resume.");
      return;
    }
    setIsGenerating(true);
    // Send current manual data as the "profile" to be optimized
    const currentProfileString = JSON.stringify(resumeData);
    const optimizedData = await generateATSResume(currentProfileString, jobDescription);
    
    if (optimizedData) {
        setResumeData(optimizedData);
    } else {
        alert("Failed to optimize resume. Please try again.");
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
            <title>Resume - ${resumeData.personalInfo.fullName}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&display=swap" rel="stylesheet">
            <style>
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Inter', sans-serif; }
              .serif { font-family: 'Merriweather', serif; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  // --- COMPONENTS ---

  const AccordionHeader = ({ title, section, icon: Icon }: { title: string, section: SectionType, icon: any }) => (
    <button 
      onClick={() => setActiveSection(activeSection === section ? 'PERSONAL' : section)}
      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${activeSection === section ? 'bg-[#0f172a] text-white border-[#0f172a]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={activeSection === section ? 'text-brand-cyan' : 'text-slate-400'} />
        <span className="font-bold text-xs uppercase tracking-widest">{title}</span>
      </div>
      {activeSection === section ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  );

  // --- TEMPLATES ---

  const ModernTemplate = ({ data }: { data: ResumeData }) => (
    <div className="w-[210mm] min-h-[297mm] bg-white text-slate-800 flex shadow-2xl mx-auto overflow-hidden text-sm leading-relaxed">
      {/* Sidebar */}
      <div className="w-[32%] bg-[#1e293b] text-white p-8 flex flex-col gap-8 pt-12">
         <div className="space-y-6">
            <div className="w-24 h-24 bg-brand-cyan rounded-full flex items-center justify-center text-3xl font-black text-[#1e293b] mx-auto shadow-lg shadow-brand-cyan/20">
               {data.personalInfo.fullName.charAt(0)}
            </div>
            <div className="text-center space-y-1 border-b border-white/10 pb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
               {data.personalInfo.email && <div className="break-all"><span className="opacity-50 block text-[10px] uppercase">Email</span>{data.personalInfo.email}</div>}
               {data.personalInfo.phone && <div><span className="opacity-50 block text-[10px] uppercase">Phone</span>{data.personalInfo.phone}</div>}
               {data.personalInfo.location && <div><span className="opacity-50 block text-[10px] uppercase">Location</span>{data.personalInfo.location}</div>}
               {data.personalInfo.linkedin && <div className="break-all"><span className="opacity-50 block text-[10px] uppercase">LinkedIn</span>{data.personalInfo.linkedin}</div>}
            </div>
         </div>

         <div>
            <h3 className="text-xs font-bold text-brand-cyan uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Education</h3>
            <div className="space-y-5">
               {data.education.map((edu, i) => (
                  <div key={i}>
                     <p className="font-bold text-white text-sm">{edu.degree}</p>
                     <p className="text-xs text-slate-400 mt-1">{edu.school}</p>
                     <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{edu.date}</p>
                  </div>
               ))}
            </div>
         </div>

         <div>
            <h3 className="text-xs font-bold text-brand-cyan uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
               {[...data.skills.technical, ...data.skills.tools].map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white/10 rounded-md text-[10px] font-medium text-slate-200">{skill}</span>
               ))}
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 bg-white pt-12">
         <div className="mb-10 border-b border-slate-100 pb-8">
            <h1 className="text-5xl font-black text-[#1e293b] uppercase tracking-tight leading-none mb-2">{data.personalInfo.fullName}</h1>
            <p className="text-xl text-brand-cyan font-bold tracking-widest uppercase">{data.personalInfo.role}</p>
         </div>

         <div className="mb-10">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Professional Summary</h3>
            <p className="text-sm text-slate-600 leading-7">{data.summary}</p>
         </div>

         <div className="mb-10">
            <h3 className="text-sm font-black text-[#1e293b] uppercase tracking-widest border-b-2 border-[#1e293b] pb-2 mb-6 flex items-center gap-2">
               Experience
            </h3>
            <div className="space-y-8">
               {data.experience.map((exp, i) => (
                  <div key={i}>
                     <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-lg text-slate-900">{exp.role}</h4>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{exp.date}</span>
                     </div>
                     <p className="text-brand-blue font-bold text-xs uppercase tracking-wide mb-3">{exp.company}</p>
                     <ul className="space-y-2">
                        {exp.bullets.map((bullet, j) => (
                           <li key={j} className="text-slate-600 text-sm pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-brand-cyan">{bullet}</li>
                        ))}
                     </ul>
                  </div>
               ))}
            </div>
         </div>

         <div className="mb-8">
            <h3 className="text-sm font-black text-[#1e293b] uppercase tracking-widest border-b-2 border-[#1e293b] pb-2 mb-6">Key Projects</h3>
            <div className="grid grid-cols-1 gap-5">
               {data.projects.map((proj, i) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-slate-900 text-sm">{proj.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono bg-white border px-2 py-0.5 rounded">{proj.techStack}</span>
                     </div>
                     <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );

  const ClassicTemplate = ({ data }: { data: ResumeData }) => (
    <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 px-20 py-16 mx-auto shadow-2xl serif">
       <header className="text-center border-b-2 border-slate-800 pb-8 mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-widest mb-4 text-slate-900">{data.personalInfo.fullName}</h1>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600 italic font-medium">
             <span>{data.personalInfo.email}</span>
             {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
             {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
             {data.personalInfo.linkedin && <span>• {data.personalInfo.linkedin}</span>}
          </div>
       </header>

       <section className="mb-8">
          <h3 className="font-bold text-lg uppercase border-b border-slate-300 mb-4 pb-1">Professional Summary</h3>
          <p className="text-sm leading-7 text-justify text-slate-700">{data.summary}</p>
       </section>

       <section className="mb-8">
          <h3 className="font-bold text-lg uppercase border-b border-slate-300 mb-6 pb-1">Experience</h3>
          <div className="space-y-6">
             {data.experience.map((exp, i) => (
                <div key={i}>
                   <div className="flex justify-between items-end mb-1">
                      <div className="font-bold text-base text-slate-900">{exp.company}</div>
                      <div className="text-sm font-bold text-slate-600">{exp.date}</div>
                   </div>
                   <div className="italic text-sm mb-2 text-slate-700 font-medium">{exp.role}</div>
                   <ul className="list-disc pl-5 space-y-1.5">
                      {exp.bullets.map((b, j) => (
                         <li key={j} className="text-sm text-slate-700 leading-6">{b}</li>
                      ))}
                   </ul>
                </div>
             ))}
          </div>
       </section>

       <section className="mb-8">
          <h3 className="font-bold text-lg uppercase border-b border-slate-300 mb-6 pb-1">Education</h3>
          {data.education.map((edu, i) => (
             <div key={i} className="flex justify-between mb-3">
                <div>
                   <div className="font-bold text-sm text-slate-900">{edu.school}</div>
                   <div className="text-sm italic text-slate-700">{edu.degree}</div>
                </div>
                <div className="text-sm font-bold text-slate-600">{edu.date}</div>
             </div>
          ))}
       </section>

       <section>
          <h3 className="font-bold text-lg uppercase border-b border-slate-300 mb-4 pb-1">Technical Skills</h3>
          <div className="text-sm leading-7 text-slate-700">
             <div><span className="font-bold text-slate-900">Core Technologies: </span> {data.skills.technical.join(', ')}</div>
             <div><span className="font-bold text-slate-900">Tools & Platforms: </span> {data.skills.tools.join(', ')}</div>
          </div>
       </section>
    </div>
  );

  const MinimalTemplate = ({ data }: { data: ResumeData }) => (
    <div className="w-[210mm] min-h-[297mm] bg-white text-slate-800 p-16 mx-auto shadow-2xl font-sans">
       <header className="mb-16">
          <h1 className="text-6xl font-light tracking-tight text-slate-900 mb-4">{data.personalInfo.fullName}</h1>
          <p className="text-2xl text-slate-400 mb-8 font-light">{data.personalInfo.role}</p>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-500 font-medium">
             <span>{data.personalInfo.email}</span>
             {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
             {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          </div>
       </header>

       <div className="grid grid-cols-12 gap-12">
          <div className="col-span-4 space-y-10">
             <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 border-t-2 border-slate-900 pt-2">Skills</h3>
                <div className="flex flex-col gap-3">
                   {data.skills.technical.map((skill, i) => (
                      <span key={i} className="text-sm text-slate-600">{skill}</span>
                   ))}
                </div>
             </div>
             
             <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 border-t-2 border-slate-900 pt-2">Education</h3>
                {data.education.map((edu, i) => (
                   <div key={i} className="mb-6">
                      <div className="text-sm font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-xs text-slate-500 mt-1">{edu.school}</div>
                      <div className="text-xs text-slate-400 mt-1">{edu.date}</div>
                   </div>
                ))}
             </div>
          </div>

          <div className="col-span-8 space-y-12">
             <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 border-t-2 border-slate-900 pt-2">Profile</h3>
                <p className="text-sm text-slate-600 leading-8 font-light">{data.summary}</p>
             </div>

             <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 border-t-2 border-slate-900 pt-2">Experience</h3>
                <div className="space-y-10">
                   {data.experience.map((exp, i) => (
                      <div key={i}>
                         <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-slate-900 text-lg">{exp.role}</h4>
                            <span className="text-xs text-slate-400 font-medium">{exp.date}</span>
                         </div>
                         <p className="text-sm text-slate-500 mb-4">{exp.company}</p>
                         <ul className="space-y-2">
                            {exp.bullets.map((b, j) => (
                               <li key={j} className="text-sm text-slate-600 leading-7 relative pl-4 before:content-['-'] before:absolute before:left-0 before:text-slate-300">{b}</li>
                            ))}
                         </ul>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-8 animate-fade-in pb-12">
      {/* LEFT PANEL: Form Builder */}
      <div className="w-full lg:w-[450px] flex flex-col gap-6 h-full shrink-0">
        <div className="space-y-2 px-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 text-brand-cyan rounded-full text-[9px] font-black uppercase tracking-widest">
              <Sparkles size={12}/> AI Powered
           </div>
           <h1 className="text-3xl font-heading font-black text-[#0f172a] uppercase tracking-tighter">Resume <span className="text-brand-cyan">Builder</span></h1>
           <p className="text-slate-500 font-medium text-xs">Fill in your details below or let AI optimize them for you.</p>
        </div>

        <div className="flex-1 bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* AI Optimizer Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
             <div className="flex items-center gap-2 text-brand-blue">
                <Briefcase size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Target Job Description (Optional)</span>
             </div>
             <textarea 
               value={jobDescription}
               onChange={(e) => setJobDescription(e.target.value)}
               placeholder="Paste Job Description here to auto-tailor your resume..."
               className="w-full h-20 bg-white border border-slate-200 rounded-xl p-3 text-xs focus:border-brand-cyan outline-none transition-all resize-none mb-2"
             />
             <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-brand-blue hover:bg-brand-cyan text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
             >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isGenerating ? 'Optimizing...' : 'Optimize with AI'}
             </button>
          </div>

          {/* Manual Entry Form */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
             {/* Personal Info */}
             <div className="space-y-2">
                <AccordionHeader title="Personal Details" section="PERSONAL" icon={UserIcon} />
                {activeSection === 'PERSONAL' && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 animate-in slide-in-from-top-2">
                     <input type="text" placeholder="Full Name" value={resumeData.personalInfo.fullName} onChange={(e) => handlePersonalChange('fullName', e.target.value)} className="w-full p-3 rounded-lg border text-xs" />
                     <input type="text" placeholder="Role Title (e.g. Software Engineer)" value={resumeData.personalInfo.role} onChange={(e) => handlePersonalChange('role', e.target.value)} className="w-full p-3 rounded-lg border text-xs" />
                     <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Email" value={resumeData.personalInfo.email} onChange={(e) => handlePersonalChange('email', e.target.value)} className="w-full p-3 rounded-lg border text-xs" />
                        <input type="text" placeholder="Phone" value={resumeData.personalInfo.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} className="w-full p-3 rounded-lg border text-xs" />
                     </div>
                     <input type="text" placeholder="Location" value={resumeData.personalInfo.location} onChange={(e) => handlePersonalChange('location', e.target.value)} className="w-full p-3 rounded-lg border text-xs" />
                     <input type="text" placeholder="LinkedIn URL" value={resumeData.personalInfo.linkedin} onChange={(e) => handlePersonalChange('linkedin', e.target.value)} className="w-full p-3 rounded-lg border text-xs" />
                  </div>
                )}
             </div>

             {/* Summary */}
             <div className="space-y-2">
                <AccordionHeader title="Summary" section="SUMMARY" icon={FileText} />
                {activeSection === 'SUMMARY' && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl animate-in slide-in-from-top-2">
                     <textarea 
                        value={resumeData.summary} 
                        onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
                        className="w-full h-32 p-3 rounded-lg border text-xs resize-none"
                        placeholder="Write a brief professional summary..."
                     />
                  </div>
                )}
             </div>

             {/* Experience */}
             <div className="space-y-2">
                <AccordionHeader title="Experience" section="EXPERIENCE" icon={Briefcase} />
                {activeSection === 'EXPERIENCE' && (
                   <div className="space-y-4 animate-in slide-in-from-top-2">
                      {resumeData.experience.map((exp, idx) => (
                         <div key={exp.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 relative group">
                            <button onClick={() => removeItem('experience', exp.id)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                            <input type="text" placeholder="Job Title" value={exp.role} onChange={(e) => handleArrayChange('experience', exp.id, 'role', e.target.value)} className="w-full p-2 rounded border text-xs font-bold" />
                            <div className="grid grid-cols-2 gap-2">
                               <input type="text" placeholder="Company" value={exp.company} onChange={(e) => handleArrayChange('experience', exp.id, 'company', e.target.value)} className="w-full p-2 rounded border text-xs" />
                               <input type="text" placeholder="Date Range" value={exp.date} onChange={(e) => handleArrayChange('experience', exp.id, 'date', e.target.value)} className="w-full p-2 rounded border text-xs" />
                            </div>
                            <textarea 
                               placeholder="Bullet points (one per line)" 
                               value={exp.bullets.join('\n')} 
                               onChange={(e) => handleArrayChange('experience', exp.id, 'bullets', e.target.value.split('\n'))}
                               className="w-full h-24 p-2 rounded border text-xs resize-none"
                            />
                         </div>
                      ))}
                      <button onClick={() => addItem('experience')} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold uppercase hover:border-brand-cyan hover:text-brand-cyan transition-colors flex items-center justify-center gap-2">
                         <Plus size={14} /> Add Job
                      </button>
                   </div>
                )}
             </div>

             {/* Education */}
             <div className="space-y-2">
                <AccordionHeader title="Education" section="EDUCATION" icon={GraduationCap} />
                {activeSection === 'EDUCATION' && (
                   <div className="space-y-4 animate-in slide-in-from-top-2">
                      {resumeData.education.map((edu) => (
                         <div key={edu.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 relative group">
                            <button onClick={() => removeItem('education', edu.id)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                            <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => handleArrayChange('education', edu.id, 'degree', e.target.value)} className="w-full p-2 rounded border text-xs font-bold" />
                            <div className="grid grid-cols-2 gap-2">
                               <input type="text" placeholder="School/University" value={edu.school} onChange={(e) => handleArrayChange('education', edu.id, 'school', e.target.value)} className="w-full p-2 rounded border text-xs" />
                               <input type="text" placeholder="Year" value={edu.date} onChange={(e) => handleArrayChange('education', edu.id, 'date', e.target.value)} className="w-full p-2 rounded border text-xs" />
                            </div>
                         </div>
                      ))}
                      <button onClick={() => addItem('education')} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold uppercase hover:border-brand-cyan hover:text-brand-cyan transition-colors flex items-center justify-center gap-2">
                         <Plus size={14} /> Add Education
                      </button>
                   </div>
                )}
             </div>

             {/* Skills */}
             <div className="space-y-2">
                <AccordionHeader title="Skills" section="SKILLS" icon={Code2} />
                {activeSection === 'SKILLS' && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4 animate-in slide-in-from-top-2">
                     <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Technical (Comma separated)</label>
                        <textarea value={resumeData.skills.technical.join(', ')} onChange={(e) => handleSkillsChange('technical', e.target.value)} className="w-full h-16 p-2 rounded border text-xs resize-none" />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tools</label>
                        <input type="text" value={resumeData.skills.tools.join(', ')} onChange={(e) => handleSkillsChange('tools', e.target.value)} className="w-full p-2 rounded border text-xs" />
                     </div>
                  </div>
                )}
             </div>
             
             {/* Projects */}
             <div className="space-y-2">
                <AccordionHeader title="Projects" section="PROJECTS" icon={FolderGit2} />
                {activeSection === 'PROJECTS' && (
                   <div className="space-y-4 animate-in slide-in-from-top-2">
                      {resumeData.projects.map((proj) => (
                         <div key={proj.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 relative group">
                            <button onClick={() => removeItem('projects', proj.id)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                            <input type="text" placeholder="Project Name" value={proj.name} onChange={(e) => handleArrayChange('projects', proj.id, 'name', e.target.value)} className="w-full p-2 rounded border text-xs font-bold" />
                            <input type="text" placeholder="Tech Stack" value={proj.techStack} onChange={(e) => handleArrayChange('projects', proj.id, 'techStack', e.target.value)} className="w-full p-2 rounded border text-xs italic" />
                            <textarea placeholder="Description" value={proj.description} onChange={(e) => handleArrayChange('projects', proj.id, 'description', e.target.value)} className="w-full h-16 p-2 rounded border text-xs resize-none" />
                         </div>
                      ))}
                      <button onClick={() => addItem('projects')} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold uppercase hover:border-brand-cyan hover:text-brand-cyan transition-colors flex items-center justify-center gap-2">
                         <Plus size={14} /> Add Project
                      </button>
                   </div>
                )}
             </div>

          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Preview Area */}
      <div className="flex-1 bg-slate-200/50 rounded-[32px] border border-slate-200 flex flex-col overflow-hidden relative">
         {/* Toolbar */}
         <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Palette size={14}/> Style
               </span>
               <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setSelectedTemplate('MODERN')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${selectedTemplate === 'MODERN' ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}>Modern</button>
                  <button onClick={() => setSelectedTemplate('CLASSIC')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${selectedTemplate === 'CLASSIC' ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}>Classic</button>
                  <button onClick={() => setSelectedTemplate('MINIMAL')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${selectedTemplate === 'MINIMAL' ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}>Minimal</button>
               </div>
            </div>

            <button 
               onClick={handlePrint}
               className="flex items-center gap-2 px-6 py-2 bg-[#0f172a] hover:bg-brand-cyan text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-105"
            >
               <Printer size={16} /> Save as PDF
            </button>
         </div>

         {/* Document Viewport */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-12 flex justify-center bg-slate-200/50">
            <div ref={printRef} className="origin-top transition-transform duration-300 scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.85] xl:scale-[0.9] shadow-2xl">
               {selectedTemplate === 'MODERN' && <ModernTemplate data={resumeData} />}
               {selectedTemplate === 'CLASSIC' && <ClassicTemplate data={resumeData} />}
               {selectedTemplate === 'MINIMAL' && <MinimalTemplate data={resumeData} />}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
