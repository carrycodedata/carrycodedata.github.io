import { ArrowLeft, BookOpen, ChevronRight, FolderOpen, Layers, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { caseTypeLabels, getResourcesForCase } from '../data';
import { casePath } from '../lib/urls';
import type { Category } from '../types';

interface CategoryViewProps {
  category: Category;
  selectedLessonId?: string;
}

export function CategoryView({ category, selectedLessonId }: CategoryViewProps) {
  const [query, setQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>(() => ({
    [selectedLessonId ?? category.lessons[0]?.id ?? '']: true,
  }));

  const lessons = useMemo(() => category.lessons.map(lesson => ({
    lesson,
    cases: lesson.cases.map(caseStudy => ({
      caseStudy,
      resourceCount: getResourcesForCase(caseStudy.id).length,
    })),
  })), [category]);
  const caseCount = lessons.reduce((total, entry) => total + entry.cases.length, 0);
  const availableCaseCount = lessons.reduce(
    (total, entry) => total + entry.cases.filter(item => item.resourceCount > 0).length, 0,
  );
  const searchTerm = query.trim().toLocaleLowerCase();
  const visibleLessons = lessons.map(entry => ({
    ...entry,
    cases: entry.cases.filter(({ caseStudy, resourceCount }) => {
      const searchable = `${entry.lesson.id} ${entry.lesson.title} ${caseStudy.id} ${caseStudy.title} ${caseTypeLabels[caseStudy.type]}`;
      return (!availableOnly || resourceCount > 0) && searchable.toLocaleLowerCase().includes(searchTerm);
    }),
  })).filter(entry => entry.cases.length > 0);
  const visibleCaseCount = visibleLessons.reduce((total, entry) => total + entry.cases.length, 0);

  useEffect(() => {
    setQuery('');
    setAvailableOnly(false);
    setExpandedLessons({ [selectedLessonId ?? category.lessons[0]?.id ?? '']: true });
    if (!selectedLessonId) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(`lesson-${category.id}-${selectedLessonId}`)?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [category.id, selectedLessonId]);

  useEffect(() => {
    if (searchTerm || availableOnly) {
      setExpandedLessons(Object.fromEntries(category.lessons.map(lesson => [lesson.id, true])));
    }
  }, [searchTerm, availableOnly, category]);

  return (
    <div className="max-w-5xl mx-auto pt-8 md:pt-12 pb-24">
      <div className="mb-8 md:mb-10">
        <Link to="/" className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-5 w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
          <span className="p-1 rounded-md bg-slate-100 group-hover:bg-slate-200"><ArrowLeft size={16} aria-hidden="true" /></span>
          返回资料库
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{category.title}</h1>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">{category.lessons.length} 次课 · {caseCount} 个案例</span>
        </div>
        <p className="text-slate-500 text-base md:text-lg leading-relaxed">{category.description}</p>
        <p className="text-sm text-slate-500 mt-3">{availableCaseCount} 个案例已发布资料，选择课次查看对应案例。</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="relative flex-1">
          <Search size={18} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <label className="sr-only" htmlFor="case-search">搜索课次、案例名称或编号</label>
          <input id="case-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索课次、案例名称或编号" className="w-full rounded-xl bg-slate-50 border border-slate-200 py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 [&::-webkit-search-cancel-button]:appearance-none" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="清除搜索" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600"><X size={16} aria-hidden="true" /></button>}
        </div>
        <label className="flex items-center gap-2.5 text-sm font-medium text-slate-600 cursor-pointer px-1 py-2 shrink-0">
          <input type="checkbox" checked={availableOnly} onChange={event => setAvailableOnly(event.target.checked)} className="w-4 h-4 accent-blue-600" />
          仅显示有资料的案例
        </label>
      </div>

      {(searchTerm || availableOnly) && <p role="status" className="text-sm text-slate-500 mb-4">找到 {visibleCaseCount} 个案例，分布在 {visibleLessons.length} 次课中</p>}

      <div className="space-y-4">
        {visibleLessons.length === 0 ? (
          <div className="p-10 md:p-16 flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-3xl border-dashed">
            <Layers className="w-12 h-12 mb-4 text-slate-300" aria-hidden="true" />
            <p className="font-semibold text-lg text-slate-600">{category.lessons.length === 0 ? '课程资料待更新' : '没有找到符合条件的案例'}</p>
            <p className="text-sm text-slate-500 mt-2">{category.lessons.length === 0 ? '课程发布后，可在这里查看各课次与案例资料。' : '试试其他名称或编号，或取消资料筛选。'}</p>
            {(searchTerm || availableOnly) && <button type="button" onClick={() => { setQuery(''); setAvailableOnly(false); }} className="mt-5 px-4 py-2 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">重置筛选</button>}
          </div>
        ) : visibleLessons.map(({ lesson, cases }) => {
          const isExpanded = Boolean(expandedLessons[lesson.id]);
          const panelId = `cases-${category.id}-${lesson.id}`;
          const headingId = `heading-${category.id}-${lesson.id}`;
          return (
            <section key={lesson.id} id={`lesson-${category.id}-${lesson.id}`} aria-labelledby={headingId} className={`scroll-mt-28 bg-white border rounded-3xl overflow-hidden transition-shadow ${isExpanded ? 'border-blue-200 shadow-xl shadow-blue-900/5 ring-4 ring-blue-50/50' : 'border-slate-200/80 shadow-sm hover:shadow-md'}`}>
              <h2>
                <button type="button" id={headingId} aria-expanded={isExpanded} aria-controls={panelId} onClick={() => setExpandedLessons(previous => ({ ...previous, [lesson.id]: !previous[lesson.id] }))} className="relative w-full text-left flex items-center justify-between gap-4 p-5 md:p-8 group/header focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-blue-600">
                  {isExpanded && <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" aria-hidden="true" />}
                  <span className="flex items-start md:items-center gap-4 md:gap-5 min-w-0">
                    <span className={`p-3 rounded-xl shrink-0 transition-colors ${isExpanded ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'bg-slate-100 text-slate-500 group-hover/header:bg-slate-200'}`}><BookOpen size={24} aria-hidden="true" /></span>
                    <span className="min-w-0">
                      <span className="block text-lg md:text-2xl font-bold text-slate-900 tracking-tight">{lesson.title}</span>
                      {lesson.description && <span className="block text-sm md:text-base text-slate-500 mt-1.5 font-medium">{lesson.description}</span>}
                      <span className="block text-xs text-slate-400 mt-2 font-medium">{lesson.hours > 0 ? `${lesson.hours} 小时 · ` : ''}{lesson.cases.length} 个案例</span>
                    </span>
                  </span>
                  <span className={`p-2 rounded-full shrink-0 transition-colors ${isExpanded ? 'bg-blue-50 text-blue-600' : 'text-slate-400 group-hover/header:bg-slate-100'}`}><ChevronRight size={20} aria-hidden="true" className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} /></span>
                </button>
              </h2>
              <div id={panelId} hidden={!isExpanded} className="px-4 md:px-8 pb-5 md:pb-8 pt-1">
                <ul className="flex flex-col gap-2">
                  {cases.map(({ caseStudy, resourceCount }) => (
                    <li key={caseStudy.id}>
                      <Link to={casePath(category.id, lesson.id, caseStudy.id)} className="group/item flex items-center justify-between gap-3 p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-blue-200 rounded-2xl transition-colors hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        <span className="flex items-center gap-3 md:gap-4 min-w-0">
                          <span className="hidden sm:block p-2.5 bg-white border border-slate-200/60 rounded-lg text-slate-400 group-hover/item:text-blue-600 group-hover/item:border-blue-200 shadow-sm shrink-0"><FolderOpen size={18} aria-hidden="true" /></span>
                          <span className="min-w-0">
                            <span className="flex flex-wrap gap-2 items-center mb-1.5">
                              <span className="font-mono text-xs font-semibold text-slate-500 px-2 py-0.5 bg-slate-200/50 rounded">{caseStudy.id}</span>
                              <span className="text-xs text-slate-400">{caseTypeLabels[caseStudy.type]}</span>
                            </span>
                            <span className="block font-semibold text-sm md:text-base text-slate-700 group-hover/item:text-slate-900 leading-relaxed">{caseStudy.title}</span>
                            <span className={`block mt-1.5 text-xs ${resourceCount ? 'text-blue-600' : 'text-slate-400'}`}>{resourceCount ? `${resourceCount} 份资料 · 查看资料` : '资料待更新'}</span>
                          </span>
                        </span>
                        <ChevronRight size={18} aria-hidden="true" className="text-slate-300 group-hover/item:text-blue-600 shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
