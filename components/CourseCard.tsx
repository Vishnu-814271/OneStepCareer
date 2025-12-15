import React from 'react';
import { Course } from '../types';
import { BookOpen, Clock, Signal } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(course)}
      className="group relative bg-[#0f172a]/60 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-500 cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col h-full hover:-translate-y-1"
    >
      <div className="h-48 overflow-hidden relative">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent opacity-90" />
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/20 backdrop-blur-sm shadow-lg">
            {course.level}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col relative z-10">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1 group-hover:text-slate-300 transition-colors">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-slate-500 text-xs mt-auto pt-4 border-t border-slate-800/50">
          <div className="flex items-center gap-1.5 group-hover:text-cyan-500/70 transition-colors">
            <BookOpen size={14} />
            <span>{course.lessons} Lessons</span>
          </div>
          <div className="flex items-center gap-1.5 group-hover:text-cyan-500/70 transition-colors">
            <Clock size={14} />
            <span>{course.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;