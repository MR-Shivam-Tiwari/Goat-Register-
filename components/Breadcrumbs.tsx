import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="modern-breadcrumb flex items-center gap-2 text-[10px] mb-6 py-2 px-4 bg-[#491907]/5 rounded-lg w-fit uppercase font-bold tracking-widest">
      <Link href="/" className="text-[#491907] hover:text-[#CFA979] transition-colors flex items-center gap-1.5 opacity-60 hover:opacity-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Home
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-gray-300 font-light select-none text-[8px]">/</span>
          {item.href ? (
            <Link href={item.href} className="text-[#491907] hover:text-[#CFA979] transition-all opacity-60 hover:opacity-100 italic">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#491907] font-black">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
