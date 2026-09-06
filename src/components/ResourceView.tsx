import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AlertCircle, ArrowLeft, ChevronRight, Download, ExternalLink, FileDown, LoaderCircle, RefreshCw } from 'lucide-react';
import type { Category, Lesson, CaseStudy, ResourceItem } from '../types';
import { assetUrl, casePath, categoryPath, formatBytes, lessonPath } from '../lib/urls';
import { CopyLinkButton } from './CopyLinkButton';

interface ResourceViewProps {
  category: Category;
  lesson: Lesson;
  caseStudy: CaseStudy;
  resource: ResourceItem;
}

interface PreviewState {
  key: string;
  status: 'loading' | 'ready' | 'error';
  text?: string;
  error?: string;
}

const textTypes = new Set(['md', 'csv', 'json', 'txt']);
const actionClassName = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

function isAppFallback(text: string) {
  const document = new DOMParser().parseFromString(text, 'text/html');
  if (document.querySelector('meta[name="carrycode-app"][content="catalog"]')) return true;
  const root = document.querySelector('#root');
  return root !== null && root.childElementCount === 0 && Array.from(document.querySelectorAll('script[type="module"][src]')).some((script) =>
    /\/(?:src\/main\.[jt]sx?|assets\/index-[^/]+\.js)(?:\?|$)/.test(script.getAttribute('src') ?? ''),
  );
}

function resolveMarkdownUrl(value: string, documentUrl: string) {
  const safeUrl = defaultUrlTransform(value);
  if (!safeUrl) return '';
  try {
    // Resolve fragments against the source document too, so they cannot overwrite the app's hash route.
    return new URL(safeUrl, documentUrl).href;
  } catch {
    return '';
  }
}

export function ResourceView({ category, lesson, caseStudy, resource }: ResourceViewProps) {
  const url = assetUrl(resource.path);
  const absoluteUrl = new URL(url, window.location.href).href;
  const previewKey = `${resource.type}:${url}`;
  const isFrame = resource.type === 'html' || resource.type === 'pdf';
  const canPreview = isFrame || textTypes.has(resource.type);
  const [attempt, setAttempt] = useState(0);
  const [preview, setPreview] = useState<PreviewState>({ key: previewKey, status: 'loading' });
  const [frameState, setFrameState] = useState<{ key: string; status: 'loading' | 'loaded' | 'slow' }>({ key: '', status: 'loading' });
  const state: PreviewState = preview.key === previewKey ? preview : { key: previewKey, status: 'loading' };
  const frameStatus = frameState.key === `${previewKey}:${attempt}` ? frameState.status : 'loading';

  useEffect(() => {
    if (!canPreview) {
      setPreview({ key: previewKey, status: 'ready' });
      return;
    }

    const controller = new AbortController();
    let timedOut = false;
    let active = true;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);
    setPreview({ key: previewKey, status: 'loading' });

    async function loadPreview() {
      try {
        let response = await fetch(url, {
          method: resource.type === 'pdf' ? 'HEAD' : 'GET',
          signal: controller.signal,
        });
        if (resource.type === 'pdf' && (response.status === 405 || response.status === 501)) {
          response = await fetch(url, { signal: controller.signal });
        }
        if (!response.ok) {
          throw new Error(response.status === 404 ? '这份资料暂时无法找到，可能尚未发布或路径已变更。' : `资料加载失败（HTTP ${response.status}），请稍后重试。`);
        }
        const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
        if (resource.type === 'pdf') {
          await response.body?.cancel();
          if (contentType && !['application/pdf', 'application/octet-stream'].includes(contentType)) {
            throw new Error('服务器未返回 PDF 文件，请确认资料已正确发布。');
          }
          if (active) setPreview({ key: previewKey, status: 'ready' });
          return;
        }

        let text = await response.text();
        if (isAppFallback(text)) throw new Error('这份资料尚未发布，服务器返回了网站首页。请返回案例选择其他资料。');
        if (resource.type === 'html') {
          if (contentType && !['text/html', 'application/xhtml+xml'].includes(contentType)) {
            throw new Error('服务器未返回 HTML 网页，请确认资料路径。');
          }
        } else {
          if (['text/html', 'application/xhtml+xml'].includes(contentType)) {
            throw new Error('服务器返回了网页，未能读取这份资料。请确认资料已正确发布。');
          }
          if (resource.type === 'json') {
            try {
              text = JSON.stringify(JSON.parse(text), null, 2);
            } catch {
              throw new Error('这份 JSON 资料的格式有误，暂时无法预览。可以下载原文件检查。');
            }
          }
        }
        if (active) setPreview({ key: previewKey, status: 'ready', text });
      } catch (error) {
        if (!active) return;
        setPreview({
          key: previewKey,
          status: 'error',
          error: timedOut ? '加载时间较长，请检查网络后重试，也可以独立打开资料。' : error instanceof Error ? error.message : '资料加载失败，请重试或独立打开。',
        });
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void loadPreview();
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [previewKey, url, resource.type, canPreview, attempt]);

  useEffect(() => {
    if (!isFrame || state.status !== 'ready') return;
    const key = `${previewKey}:${attempt}`;
    setFrameState({ key, status: 'loading' });
    const timeout = window.setTimeout(() => {
      setFrameState((current) => current.key === key && current.status === 'loading' ? { key, status: 'slow' } : current);
    }, 15000);
    return () => window.clearTimeout(timeout);
  }, [isFrame, state.status, previewKey, attempt]);

  return (
    <div className="mx-auto max-w-7xl pb-16 pt-6 sm:pt-10">
      <nav aria-label="当前位置" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-slate-500">
        <Link to="/" className="rounded hover:text-blue-600 focus-visible:outline-blue-600">首页</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link to={categoryPath(category.id)} className="rounded hover:text-blue-600 focus-visible:outline-blue-600">{category.title}</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link to={lessonPath(category.id, lesson.id)} className="rounded hover:text-blue-600 focus-visible:outline-blue-600">{lesson.title}</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link to={casePath(category.id, lesson.id, caseStudy.id)} className="rounded font-mono hover:text-blue-600 focus-visible:outline-blue-600">{caseStudy.id}</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page" className="font-medium text-slate-700">{resource.title}</span>
      </nav>

      <section className="mb-5 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <Link to={casePath(category.id, lesson.id, caseStudy.id)} className="mb-5 inline-flex items-center gap-2 rounded text-sm font-semibold text-slate-500 hover:text-blue-600 focus-visible:outline-blue-600">
          <ArrowLeft size={16} aria-hidden="true" /> 返回案例资料
        </Link>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-md bg-blue-50 px-2.5 py-1 uppercase tracking-wide text-blue-700">{resource.type}</span>
              <span className="text-slate-400">{formatBytes(resource.sizeBytes)}</span>
              <span className="text-slate-400">更新于 {resource.updatedAt}</span>
            </div>
            <h1 className="break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{resource.title}</h1>
            {resource.description && <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">{resource.description}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap items-start gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer" className={actionClassName}>
              <ExternalLink size={16} aria-hidden="true" /> 独立打开
            </a>
            <a href={url} download className={actionClassName}>
              <Download size={16} aria-hidden="true" /> 下载
            </a>
            <CopyLinkButton url={url} label="复制原始链接" />
          </div>
        </div>
      </section>

      <section aria-label={`${resource.title}预览`} aria-busy={state.status === 'loading'} className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        {!canPreview ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 py-16 text-center">
            <FileDown size={40} className="mb-5 text-blue-500" aria-hidden="true" />
            <h2 className="mb-2 text-xl font-bold text-slate-800">下载这份资料</h2>
            <p className="mb-6 max-w-md text-sm leading-7 text-slate-500">{resource.type === 'xlsx' ? '这是一份 Excel 工作簿，请下载后使用表格软件查看和练习。' : '这份资料暂不支持站内预览，可以下载原文件查看。'}</p>
            <a href={url} download className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              <Download size={17} aria-hidden="true" /> 下载原文件
            </a>
          </div>
        ) : state.status === 'loading' ? (
          <div role="status" className="flex min-h-80 items-center justify-center gap-3 p-8 text-sm text-slate-500">
            <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> 正在加载资料…
          </div>
        ) : state.status === 'error' ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center">
            <AlertCircle size={34} className="mb-4 text-amber-500" aria-hidden="true" />
            <h2 className="mb-3 text-lg font-bold text-slate-800">暂时无法预览</h2>
            <p role="alert" className="mb-6 max-w-lg text-sm leading-7 text-slate-500">{state.error}</p>
            <button type="button" onClick={() => setAttempt((value) => value + 1)} className={actionClassName}>
              <RefreshCw size={16} aria-hidden="true" /> 重新加载
            </button>
          </div>
        ) : isFrame ? (
          <>
            <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500 sm:px-6">
              <p>{resource.type === 'html' ? '网页可以直接操作；课堂练习可复制原始链接使用。' : '如浏览器未显示 PDF，可独立打开或下载查看。'}</p>
              {frameStatus === 'loading' && <span role="status" className="inline-flex items-center gap-2"><LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> 正在打开预览…</span>}
              {frameStatus === 'slow' && <span role="status" className="text-amber-700">预览加载较慢，可使用上方“独立打开”。</span>}
            </div>
            {/* These are curated, same-origin training pages. Keep their scripts and relative JSON requests working. */}
            <iframe
              key={`${previewKey}:${attempt}`}
              src={url}
              title={resource.title}
              onLoad={() => setFrameState({ key: `${previewKey}:${attempt}`, status: 'loaded' })}
              className="block h-[72dvh] min-h-[420px] w-full border-0 bg-white sm:h-[78dvh]"
            />
          </>
        ) : resource.type === 'md' ? (
          <article className="mx-auto max-w-4xl break-words px-5 py-8 text-sm leading-8 text-slate-700 sm:px-10 sm:py-12 sm:text-base [&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:bg-blue-50/50 [&_blockquote]:px-5 [&_blockquote]:py-1 [&_h1]:mb-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-bold [&_h4]:mb-2 [&_h4]:mt-6 [&_h4]:font-bold [&_hr]:my-8 [&_hr]:border-slate-200 [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:p-5 [&_pre]:text-sm [&_pre]:text-slate-100 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              urlTransform={(value) => resolveMarkdownUrl(value, absoluteUrl)}
              components={{
                a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 underline decoration-blue-200 underline-offset-4 hover:text-blue-800" />,
                img: ({ node: _node, ...props }) => <img {...props} loading="lazy" className="my-5 max-w-full rounded-xl" />,
                table: ({ node: _node, ...props }) => <div className="my-6 overflow-x-auto"><table {...props} className="w-full border-collapse text-left text-sm [&_td]:border [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-2 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-2" /></div>,
              }}
            >
              {state.text ?? ''}
            </ReactMarkdown>
          </article>
        ) : (
          <div className="p-4 sm:p-7">
            <pre className="max-h-[78dvh] overflow-auto rounded-2xl bg-slate-50 p-4 text-xs leading-7 text-slate-700 sm:p-6 sm:text-sm"><code>{state.text}</code></pre>
          </div>
        )}
      </section>
    </div>
  );
}
