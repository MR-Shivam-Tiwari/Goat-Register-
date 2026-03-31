'use client';

import { useFormStatus } from 'react-dom';

export default function ProfileSubmitButton({ label, savingLabel }: { label: string, savingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button 
        type="submit" 
        disabled={pending}
        className={`w-full sm:w-auto px-10 py-3.5 bg-[#491907] text-white font-bold rounded-xl text-[10px] uppercase tracking-[0.2em] hover:bg-[#6D260D] transition-all shadow-md active:scale-95 duration-200 flex items-center justify-center gap-3 ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
        {pending ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>{savingLabel}</span>
          </>
        ) : (
          label
        )}
    </button>
  );
}
