import { ArrowLeft, Code, FileText, Upload, Download, Eye, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Category, Course, FileItem, FileType } from '../types';

interface CourseViewProps {
  category: Category;
  course: Course;
  files: FileItem[];
  onBack: () => void;
  onPreview: (file: FileItem) => void;
}

const FileIcon = ({ type }: { type: FileType }) => {
  switch (type) {
    case 'pdf':
      return <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl border border-rose-100"><FileText size={20} /></div>;
    case 'md':
      return <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl border border-slate-200"><FileText size={20} /></div>;
    case 'html':
      return <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl border border-amber-100"><Code size={20} /></div>;
  }
};

const FileBadge = ({ type }: { type: FileType }) => {
  switch (type) {
    case 'pdf':
      return <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded-md tracking-wider">PDF</span>;
    case 'md':
      return <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold uppercase rounded-md tracking-wider">MD</span>;
    case 'html':
      return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-md tracking-wider">HTML</span>;
  }
};

export function CourseView({ category, course, files, onBack, onPreview }: CourseViewProps) {
  return (
    <div className="max-w-5xl mx-auto pt-12 pb-24">
      {/* Navigation */}
      <button 
        onClick={onBack}
        className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors w-fit"
      >
        <div className="p-1 rounded-md bg-slate-100 group-hover:bg-slate-200 transition-colors">
          <ArrowLeft size={16} />
        </div>
        返回 {category.title}
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
              {course.id}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            {course.title}
          </h1>
          {course.description && (
            <p className="text-slate-500 text-lg">{course.description}</p>
          )}
        </div>
        
        <div className="relative z-10 flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5">
            <Upload size={16} /> 新增数据
          </button>
        </div>
      </div>

      {/* Files Table View */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="w-1/2">资源名称</div>
          <div className="w-1/4 hidden md:block">更新时间</div>
          <div className="w-1/4 text-right">操作</div>
        </div>
        
        <div className="grid grid-cols-1 divide-y divide-slate-100">
          {files.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                <FileText size={24} className="text-slate-300" />
              </div>
              <p className="font-medium">该课程暂无原始数据文件</p>
            </div>
          ) : (
            files.map((file, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={file.id}
                className="group flex flex-col md:flex-row md:items-center justify-between p-4 md:px-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 w-full md:w-1/2 mb-4 md:mb-0">
                  <FileIcon type={file.type} />
                  <div>
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      {file.name}
                      <FileBadge type={file.type} />
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{file.size}</span>
                    </div>
                  </div>
                </div>
                
                <div className="hidden md:flex items-center gap-2 w-1/4 text-sm text-slate-500 font-medium">
                  <Clock size={14} className="text-slate-400" />
                  {file.updatedAt}
                </div>

                <div className="flex items-center justify-end gap-2 w-full md:w-1/4">
                   <button 
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
                    title="下载"
                  >
                    <Download size={18} />
                  </button>
                  <button 
                    onClick={() => onPreview(file)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Eye size={16} />
                    在线预览
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
