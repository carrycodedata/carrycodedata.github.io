import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyLinkButtonProps {
  url: string;
  label?: string;
  className?: string;
}

export function CopyLinkButton({ url, label = '复制链接', className = '' }: CopyLinkButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'manual'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const absoluteUrl = new URL(url, window.location.href).href;

  useEffect(() => {
    setStatus('idle');
  }, [absoluteUrl]);

  useEffect(() => {
    if (status === 'copied') {
      const timeout = window.setTimeout(() => setStatus('idle'), 2500);
      return () => window.clearTimeout(timeout);
    }
    if (status === 'manual') {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [status]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setStatus('copied');
    } catch {
      setStatus('manual');
    }
  }

  return (
    <div className="inline-flex max-w-full flex-col items-start gap-2">
      <button
        type="button"
        onClick={copyLink}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${className}`}
      >
        {status === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        <span aria-live="polite">{status === 'copied' ? '已复制' : label}</span>
      </button>
      {status === 'manual' && (
        <div className="w-full min-w-0 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:w-80">
          <p role="status" className="mb-2 text-xs leading-relaxed text-amber-800">
            浏览器未允许自动复制，请选中下面的链接手动复制。
          </p>
          <input
            ref={inputRef}
            type="text"
            readOnly
            aria-label="可手动复制的完整链接"
            value={absoluteUrl}
            onFocus={(event) => event.currentTarget.select()}
            className="w-full min-w-0 rounded-md border border-amber-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-blue-600"
          />
        </div>
      )}
    </div>
  );
}
