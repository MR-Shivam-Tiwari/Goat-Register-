'use client';

export default function PrintButton({ label, className }: { label: string, className?: string }) {
    return (
        <button 
            onClick={() => window.print()} 
            // className={className || "bg-black text-white px-8 py-2 rounded-lg font-bold hover:bg-gray-800 transition-all"}
        >
            {/* {label} */}
        </button>
    );
}
