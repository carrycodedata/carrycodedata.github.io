import { useEffect } from 'react';
import { HashRouter, Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { CategoryView } from './components/CategoryView';
import { CaseView } from './components/CaseView';
import { HomeView } from './components/HomeView';
import { ResourceView } from './components/ResourceView';
import { categories, getResourcesForCase } from './data';
import { casePath, categoryPath } from './lib/urls';

function PageTitle({ title }: { title: string }) {
  useEffect(() => { document.title = `${title} · Carrycode 资料库`; }, [title]);
  return null;
}

function NotFound({ message, backTo = '/', backLabel = '返回资料库首页' }: {
  message: string; backTo?: string; backLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl py-24 text-center">
      <PageTitle title="未找到资料" />
      <BookOpen className="mx-auto mb-6 text-slate-300" size={48} />
      <h1 className="text-3xl font-bold text-slate-900">未找到对应内容</h1>
      <p className="my-5 text-slate-500">{message}</p>
      <Link to={backTo} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
        {backLabel}<ChevronRight size={16} />
      </Link>
    </div>
  );
}

function CatalogRoute() {
  const { categoryId, lessonId } = useParams();
  const category = categories.find(item => item.id === categoryId);
  if (!category) return <NotFound message="该业务分类不存在，请从首页选择分类。" />;
  const lesson = category.lessons.find(item => item.id === lessonId);
  if (lessonId && !lesson) return <NotFound message="该课次不属于当前分类，或链接已变更。" backTo={categoryPath(category.id)} backLabel="返回课程目录" />;
  return <><PageTitle title={lesson?.title ?? category.title} /><CategoryView key={category.id} category={category} selectedLessonId={lessonId} /></>;
}

function CaseRoute() {
  const { categoryId, lessonId, caseId, resourceId } = useParams();
  const category = categories.find(item => item.id === categoryId);
  const lesson = category?.lessons.find(item => item.id === lessonId);
  const caseStudy = lesson?.cases.find(item => item.id === caseId);
  if (!category || !lesson || !caseStudy) {
    return <NotFound message="请检查案例编号及其所属课次。" backTo={category ? categoryPath(category.id) : '/'} backLabel={category ? '返回课程目录' : '返回资料库首页'} />;
  }
  const resources = getResourcesForCase(caseStudy.id);
  if (resourceId) {
    const resource = resources.find(item => item.id === resourceId);
    if (!resource) return <NotFound message="这份资料尚未发布，或资料链接已变更。" backTo={casePath(category.id, lesson.id, caseStudy.id)} backLabel="返回案例资料" />;
    return <><PageTitle title={resource.title} /><ResourceView key={`${caseStudy.id}/${resource.id}`} category={category} lesson={lesson} caseStudy={caseStudy} resource={resource} /></>;
  }
  return <><PageTitle title={caseStudy.title} /><CaseView key={caseStudy.id} category={category} lesson={lesson} caseStudy={caseStudy} resources={resources} /></>;
}

function SiteLayout() {
  const location = useLocation();
  useEffect(() => {
    // CategoryView owns scrolling to an explicitly linked lesson.
    if (!/^\/[^/]+\/lessons\/[^/]+\/?$/.test(location.pathname)) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault(); document.getElementById('main-content')?.focus();
      }}>跳转到主要内容</a>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-3" aria-label="Carrycode 资料库首页">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold tracking-tighter text-white transition-colors group-hover:bg-blue-600">CC</span>
            <span className="text-xl font-extrabold tracking-tight group-hover:text-blue-600">Carrycode</span>
          </Link>
          <nav aria-label="主导航" className="flex items-center gap-4 text-sm font-medium text-slate-500 sm:gap-6">
            <Link to="/" className="hover:text-blue-600">资料库首页</Link>
            <Link to={categoryPath('sales')} className="hover:text-blue-600">销售课程</Link>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="relative z-10 min-h-[calc(100vh-64px)] px-4 pb-16 outline-none sm:px-6">
        <Routes>
          <Route path="/" element={<><PageTitle title="课程与案例" /><HomeView /></>} />
          <Route path="/:categoryId" element={<CatalogRoute />} />
          <Route path="/:categoryId/lessons/:lessonId" element={<CatalogRoute />} />
          <Route path="/:categoryId/lessons/:lessonId/cases/:caseId" element={<CaseRoute />} />
          <Route path="/:categoryId/lessons/:lessonId/cases/:caseId/resources/:resourceId" element={<CaseRoute />} />
          <Route path="*" element={<NotFound message="该链接不存在，请从课程目录重新选择。" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <HashRouter><MotionConfig reducedMotion="user"><SiteLayout /></MotionConfig></HashRouter>;
}
