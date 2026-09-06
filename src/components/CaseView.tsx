import { ArrowLeft, ArrowUpRight, BookOpen, Code, Download, Eye, FileSpreadsheet, FileText, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { caseTypeLabels, getCaseLocation, resourceGroupLabels, resourceGroups } from '../data';
import { assetUrl, casePath, categoryPath, formatBytes, lessonPath, resourcePath } from '../lib/urls';
import type { CaseStudy, Category, Lesson, ResourceItem } from '../types';
import { CopyLinkButton } from './CopyLinkButton';

interface CaseViewProps {
  category: Category;
  lesson: Lesson;
  caseStudy: CaseStudy;
  resources: ResourceItem[];
}

const previewTypes = new Set(['html', 'pdf', 'md', 'csv', 'json', 'txt']);
const actionClass = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

function ResourceIcon({ type }: { type: ResourceItem['type'] }) {
  if (type === 'html') return <span className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shrink-0"><Code size={22} aria-hidden="true" /></span>;
  if (type === 'xlsx' || type === 'csv') return <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0"><FileSpreadsheet size={22} aria-hidden="true" /></span>;
  return <span className={`p-3 rounded-xl border shrink-0 ${type === 'pdf' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}><FileText size={22} aria-hidden="true" /></span>;
}

export function CaseView({ category, lesson, caseStudy, resources }: CaseViewProps) {
  const relatedCases = (caseStudy.relatedCaseIds ?? []).flatMap(id => {
    const location = getCaseLocation(id);
    return location ? [location] : [];
  });

  return (
    <div className="max-w-5xl mx-auto pt-8 md:pt-12 pb-24">
      <Link to={lessonPath(category.id, lesson.id)} className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-5 transition-colors w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
        <span className="p-1 rounded-md bg-slate-100 group-hover:bg-slate-200"><ArrowLeft size={16} aria-hidden="true" /></span>
        返回{lesson.title}
      </Link>
      <nav aria-label="当前位置" className="mb-6 text-xs md:text-sm text-slate-400">
        <ol className="flex flex-wrap gap-x-2 gap-y-1">
          <li><Link to={categoryPath(category.id)} className="hover:text-blue-600 underline-offset-4 hover:underline">{category.title}</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to={lessonPath(category.id, lesson.id)} className="hover:text-blue-600 underline-offset-4 hover:underline">{lesson.title}</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-mono text-slate-500">{caseStudy.id}</li>
        </ol>
      </nav>

      <header className="mb-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{caseStudy.id}</span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{caseTypeLabels[caseStudy.type]}</span>
            {(caseStudy.durationMinutes ?? 0) > 0 && <span className="text-xs text-slate-400">{caseStudy.durationMinutes} 分钟</span>}
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight leading-snug">{caseStudy.title}</h1>
          {caseStudy.description && <p className="text-slate-500 text-base md:text-lg leading-relaxed">{caseStudy.description}</p>}
          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><FolderOpen size={16} aria-hidden="true" />{resources.length ? `${resources.length} 份案例资料` : '案例资料待更新'}</div>
        </div>
      </header>

      {resources.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 md:p-16 text-center">
          <FolderOpen size={36} aria-hidden="true" className="mx-auto text-slate-300 mb-4" />
          <h2 className="font-semibold text-lg text-slate-600">本案例资料待更新</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">资料发布后，可在这里查看训练网页、任务说明和相关文件。</p>
          <Link to={lessonPath(category.id, lesson.id)} className={`${actionClass} mt-6 text-blue-700 bg-blue-50 hover:bg-blue-100`}>查看本次课其他案例<ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
      ) : (
        <div className="space-y-6">
          {resourceGroups.map(group => {
            const groupResources = resources.filter(resource => resource.group === group);
            if (!groupResources.length) return null;
            return (
              <section key={group} aria-labelledby={`resource-group-${group}`} className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
                  <h2 id={`resource-group-${group}`} className="text-base font-bold text-slate-800">{resourceGroupLabels[group]}</h2>
                  <span className="text-xs text-slate-400 font-medium">{groupResources.length} 份资料</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {groupResources.map(resource => {
                    const canPreview = previewTypes.has(resource.type);
                    const url = assetUrl(resource.path);
                    const previewUrl = resourcePath(category.id, lesson.id, caseStudy.id, resource.id);
                    const updatedDate = resource.updatedAt.slice(0, 10);
                    return (
                      <li key={resource.id} className="p-5 md:px-6 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-start gap-3 md:gap-4">
                          <ResourceIcon type={resource.type} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <h3 className="text-base font-semibold text-slate-900 break-words">
                                {canPreview ? <Link to={previewUrl} className="hover:text-blue-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{resource.title}</Link> : <a href={url} download className="hover:text-blue-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{resource.title}</a>}
                              </h3>
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded tracking-wide">{resource.type}</span>
                            </div>
                            {resource.description && <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{resource.description}</p>}
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 mt-2">
                              <span>{formatBytes(resource.sizeBytes)}</span>
                              {updatedDate && <span>更新于 <time dateTime={resource.updatedAt}>{updatedDate}</time></span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-4 sm:pl-16">
                          {canPreview && <Link to={previewUrl} aria-label={`在线查看${resource.title}`} className={`${actionClass} text-white bg-blue-600 hover:bg-blue-700 shadow-sm`}><Eye size={15} aria-hidden="true" />在线查看</Link>}
                          {canPreview && <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`在新标签页打开${resource.title}`} className={`${actionClass} text-slate-600 bg-slate-100 hover:bg-slate-200`}><ArrowUpRight size={15} aria-hidden="true" />独立打开</a>}
                          <a href={url} download aria-label={`下载${resource.title}`} className={`${actionClass} text-slate-600 hover:bg-slate-100 ${canPreview ? '' : 'bg-slate-100'}`}><Download size={15} aria-hidden="true" />下载</a>
                          {resource.type === 'html' && <CopyLinkButton url={url} label="复制网页地址" className={`${actionClass} text-slate-600 hover:bg-slate-100`} />}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {(relatedCases.length > 0 || caseStudy.relatedCaseNote) && (
        <section aria-labelledby="related-cases-heading" className="mt-8 p-6 bg-blue-50/60 border border-blue-100 rounded-3xl">
          <h2 id="related-cases-heading" className="flex items-center gap-2 font-bold text-slate-800"><BookOpen size={18} aria-hidden="true" />关联案例</h2>
          {caseStudy.relatedCaseNote && <p className="text-sm text-slate-500 mt-2 leading-relaxed">{caseStudy.relatedCaseNote}</p>}
          {relatedCases.length > 0 && <ul className="grid gap-2 mt-4">{relatedCases.map(location => <li key={location.caseStudy.id}><Link to={casePath(location.category.id, location.lesson.id, location.caseStudy.id)} className="flex items-start gap-2 text-sm text-blue-700 hover:text-blue-900 rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><span className="font-mono shrink-0">{location.caseStudy.id}</span><span>{location.caseStudy.title}</span><ArrowUpRight size={14} aria-hidden="true" className="shrink-0 mt-0.5" /></Link></li>)}</ul>}
        </section>
      )}
    </div>
  );
}
