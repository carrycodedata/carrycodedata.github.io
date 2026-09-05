import { useState } from 'react';
import { CategoryView } from './components/CategoryView';
import { CourseView } from './components/CourseView';
import { HomeView } from './components/HomeView';
import { PreviewModal } from './components/PreviewModal';
import { categories, getFilesForCourse, mockLessonGroups } from './data';
import { FileItem, ViewState } from './types';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setCurrentView('category');
  };

  const handleSelectCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    setCurrentView('course');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setActiveCategoryId(null);
  };

  const handleBackToCategory = () => {
    setCurrentView('category');
    setActiveCourseId(null);
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const lessonGroupsForCategory = activeCategoryId ? mockLessonGroups[activeCategoryId] || [] : [];
  
  const activeCourse = lessonGroupsForCategory
    .flatMap(g => g.courses)
    .find(c => c.id === activeCourseId);

  const filesForCourse = activeCourseId ? getFilesForCourse(activeCourseId) : [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 relative selection:bg-blue-100 selection:text-blue-900">
      {/* Premium Subtle Dot Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(theme(colors.slate.200)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />

      {/* Glassmorphic Header */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={handleBackToHome}
          >
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:bg-blue-600 transition-colors duration-300">
              <span className="text-white font-bold text-sm tracking-tighter">CC</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
              Carrycode
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Workspace</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Settings</span>
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
               <span className="text-xs font-bold text-slate-500">A</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Route Transitions */}
      <main className="px-6 relative z-10 min-h-[calc(100vh-64px)] pb-24">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <HomeView onSelectCategory={handleSelectCategory} />
            </motion.div>
          )}
          
          {currentView === 'category' && activeCategory && (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <CategoryView 
                category={activeCategory} 
                lessonGroups={lessonGroupsForCategory} 
                onBack={handleBackToHome}
                onSelectCourse={handleSelectCourse}
              />
            </motion.div>
          )}
          
          {currentView === 'course' && activeCategory && activeCourse && (
            <motion.div
              key="course"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <CourseView 
                category={activeCategory}
                course={activeCourse}
                files={filesForCourse}
                onBack={handleBackToCategory}
                onPreview={setPreviewFile}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Premium Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <PreviewModal 
            file={previewFile} 
            onClose={() => setPreviewFile(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
