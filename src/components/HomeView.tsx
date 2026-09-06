import { FileText, MonitorPlay, PieChart, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { categories, getResourcesForCase } from '../data';
import { categoryPath } from '../lib/urls';

const iconMap: Record<string, React.ReactNode> = {
  admin: <MonitorPlay className="w-7 h-7 text-indigo-500" />,
  marketing: <PieChart className="w-7 h-7 text-fuchsia-500" />,
  sales: <FileText className="w-7 h-7 text-emerald-500" />,
};

const bgMap: Record<string, string> = {
  admin: 'bg-indigo-50',
  marketing: 'bg-fuchsia-50',
  sales: 'bg-emerald-50',
};

const borderMap: Record<string, string> = {
  admin: 'group-hover:border-indigo-200',
  marketing: 'group-hover:border-fuchsia-200',
  sales: 'group-hover:border-emerald-200',
};

export function HomeView() {
  return (
    <div className="max-w-6xl mx-auto pt-14 sm:pt-24 pb-12">
      {/* Hero Section */}
      <div className="text-center mb-14 sm:mb-20 relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 text-slate-600 text-sm font-medium mb-8 border border-slate-900/10"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          从课程到案例，找到所需资料
        </motion.div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-600 tracking-tight mb-6 leading-tight">
          Carrycode Codex 资料库
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
          按业务方向选择课程，查看案例原始资料、训练网页与复用模板。
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: idx * 0.1,
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            <Link
              to={categoryPath(cat.id)}
              className={`group relative flex flex-col w-full h-full p-8 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-[2rem] text-left cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 overflow-hidden ${borderMap[cat.id]}`}
            >
              {/* Subtle hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50 opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
              <div className={`absolute inset-0 bg-gradient-to-br from-white via-white ${bgMap[cat.id]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  {iconMap[cat.id]}
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{cat.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">
                  {cat.description}
                </p>
                <p className="mb-5 text-xs font-medium text-slate-500">
                  {cat.lessons.length} 次课 · {cat.lessons.reduce((sum, lesson) => sum + lesson.cases.length, 0)} 个案例 / 任务
                  <span className="mt-1 block">{cat.lessons.flatMap(lesson => lesson.cases).filter(item => getResourcesForCase(item.id).length > 0).length} 个案例已发布资料</span>
                </p>
                
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mt-auto">
                  <span>查看课程</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
