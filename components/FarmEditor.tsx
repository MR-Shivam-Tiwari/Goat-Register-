'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function FarmEditor({ defaultValue, onChange }: { defaultValue: string, onChange?: (val: string) => void }) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  return (
    <div className="farm-editor-container bg-bg-site/50 rounded-xl overflow-hidden border-2 border-primary/5 focus-within:border-secondary transition-all">
      <ReactQuill 
        theme="snow"
        defaultValue={defaultValue}
        onChange={onChange}
        modules={modules}
        className="h-64 font-mono text-primary"
      />
      <style jsx global>{`
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid rgba(var(--color-primary), 0.1) !important; background: rgba(var(--color-primary), 0.05); }
        .ql-container.ql-snow { border: none !important; font-size: 16px; }
        .ql-editor { min-height: 200px; padding: 2rem; }
      `}</style>
    </div>
  );
}
