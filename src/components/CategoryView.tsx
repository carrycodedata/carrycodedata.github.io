import { ArrowLeft, Filter, FolderOpen, Upload, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Category, LessonGroup } from '../types';

interface CategoryViewProps {
  category: Category;
  lessonGroups: LessonGroup[];
  onBack: () => void;
  onSelectCourse: (courseId: string) => void;
}

export function CategoryView({ category, lessonGroups, onBack, onSelectCourse }: CategoryViewProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    [lessonGroups[0]?.id]: true
  });

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="max-w-5xl mx-auto pt-12 pb-24">
      {/* Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors"
          >
            <div className="p-1 rounded-md bg-slate-100 group-hover:bg-slate-200 transition-colors">
              <ArrowLeft size={16} />
            </div>
            返回工作台
          </button>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight flex items-center gap-3">
            {category.title}
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider align-middle">
              {lessonGroups.length} 单元
            </span>
          </h1>
          <p className="text-slate-500 text-lg">{category.description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold bg-white rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
            <Filter size={16} /> 筛选器
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5">
            <Upload size={16} /> 上传资产
          </button>
        </div>
      </div>

      {/* Accordion Layout */}
      <div className="space-y-4">
        {lessonGroups.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200/60 rounded-3xl border-dashed">
            <Layers className="w-12 h-12 mb-4 text-slate-300" />
            <p className="font-medium text-lg text-slate-500">暂无课程资料</p>
            <p className="text-sm mt-1">此分类下尚未添加任何课程组</p>
          </div>
        ) : (
          lessonGroups.map((group) => {
            const isExpanded = expandedGroups[group.id];
            return (
              <motion.div 
                layout
                initial={{ borderRadius: 24 }}
                key={group.id} 
                className={`bg-white border transition-all duration-500 overflow-hidden ${
                  isExpanded ? 'border-blue-200 shadow-xl shadow-blue-900/5 ring-4 ring-blue-50/50' : 'border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleGroup(group.id)}
                  className="relative flex items-center justify-between p-6 md:p-8 cursor-pointer group/header"
                >
                  <div className="flex items-start md:items-center gap-5 relative z-10">
                    <div className={`p-3 rounded-xl flex-shrink-0 transition-colors duration-500 ${
                      isExpanded ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'bg-slate-100 text-slate-500 group-hover/header:bg-slate-200'
                    }`}>
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{group.title}</h2>
                      {group.description && <p className="text-slate-500 mt-1.5 font-medium">{group.description}</p>}
                    </div>
                  </div>
                  
                  <motion.div 
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`p-2 rounded-full flex-shrink-0 relative z-10 transition-colors ${
                      isExpanded ? 'bg-blue-50 text-blue-600' : 'text-slate-400 group-hover/header:bg-slate-100 group-hover/header:text-slate-900'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </motion.div>

                  {/* Absolute active indicator */}
                  {isExpanded && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600"
                    />
                  )}
                </div>
                
                {/* Accordion Body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2">
                        <div className="flex flex-col gap-2">
                          {group.courses.map((course) => (
                            <motion.div 
                              whileHover={{ scale: 1.005, x: 4 }}
                              whileTap={{ scale: 0.995 }}
                              key={course.id}
                              onClick={() => onSelectCourse(course.id)}
                              className="group/item flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-sm"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white border border-slate-200/60 rounded-lg text-slate-400 group-hover/item:text-blue-600 group-hover/item:border-blue-200 shadow-sm transition-colors">
                                  <FolderOpen size={18} />
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                  <span className="font-mono text-xs font-semibold text-slate-400 px-2 py-0.5 bg-slate-200/50 rounded inline-block w-fit">
                                    {course.id}
                                  </span>
                                  <span className="font-semibold text-slate-700 group-hover/item:text-slate-900 transition-colors">
                                    {course.title}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-sm font-bold text-blue-600 opacity-0 group-hover/item:opacity-100 transition-all duration-300 translate-x-2 group-hover/item:translate-x-0">
                                查看资料
                                <ChevronRight size={16} />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
