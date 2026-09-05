import { X, ExternalLink, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { FileItem, FileType } from '../types';
import { useEffect } from 'react';

interface PreviewModalProps {
  file: FileItem;
  onClose: () => void;
}

const getGradient = (type: FileType) => {
  switch(type) {
    case 'pdf': return 'from-rose-500 to-rose-700';
    case 'html': return 'from-amber-500 to-orange-600';
    case 'md': return 'from-slate-700 to-slate-900';
  }
}

export function PreviewModal({ file, onClose }: PreviewModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
      {/* Blurred Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl shadow-slate-900/50 overflow-hidden flex flex-col h-full max-h-[90vh] ring-1 ring-white/10"
      >
        {/* Header Ribbon */}
        <div className={`h-2 w-full bg-gradient-to-r ${getGradient(file.type)}`} />
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:px-6 md:py-5 border-b border-slate-100 bg-white/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <span className={`px-2.5 py-1 text-xs font-black uppercase tracking-widest text-white rounded-lg bg-gradient-to-br ${getGradient(file.type)} shadow-sm`}>
              {file.type}
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-lg tracking-tight leading-none">
                {file.name}
              </h3>
              <span className="text-xs font-medium text-slate-400 mt-1 block">
                {file.size} &bull; 最后更新于 {file.updatedAt}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Download size={16} />
              下载
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block" />
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 hover:rotate-90 rounded-xl transition-all duration-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 bg-slate-50/50 relative overflow-hidden flex flex-col items-center justify-center p-8">
          {/* Decorative background circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-slate-200/20 rounded-full blur-3xl pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="relative z-10 flex flex-col items-center text-center max-w-sm"
          >
            <div className="w-24 h-24 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 rounded-2xl flex items-center justify-center mb-8 rotate-3">
               <span className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br ${getGradient(file.type)} uppercase`}>
                 {file.type}
               </span>
            </div>
            <h4 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">预览渲染器未挂载</h4>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              当前为 UI 结构展示阶段。实际集成时，此处将直接嵌入真实的 PDF.js、Markdown 转换器或 iframe 以实时渲染文档内容。
            </p>
            
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <ExternalLink size={18} />
              在新窗口打开
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
