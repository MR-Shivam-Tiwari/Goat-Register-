import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="modern-breadcrumb flex items-center gap-3 text-sm mb-10 py-3 px-6 bg-[#491907]/5 rounded-2xl w-fit">
      <Link href="/" className="text-[#491907] font-medium hover:text-[#CFA979] transition-colors flex items-center gap-1.5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Home
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-gray-300 font-light select-none">/</span>
          {item.href ? (
            <Link href={item.href} className="text-[#491907] font-medium hover:text-[#CFA979] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#CFA979] font-bold">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
