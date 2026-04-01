'use client';

import Link from 'next/link';

interface Breed {
  id: number;
  name: string;
  alias: string;
  total_animals: string | number;
  living_animals: string | number;
}

interface BreedCatalogGridProps {
  breeds: Breed[];
  t: any;
}

export default function BreedCatalogDisplay({ breeds, t }: BreedCatalogGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
      {breeds.map((breed) => (
        <Link 
          key={breed.id} 
          href={`/catalog/goats/${breed.alias.trim()}`}
          className="group bg-white border border-gray-100 rounded-[24px] overflow-hidden hover:border-[#491907] hover:shadow-[0_15px_40px_rgba(73,25,7,0.12)] transition-all duration-500 flex flex-col shadow-sm relative h-full"
        >
          {/* IMAGE SECTION - COMPACT (70% FEEL) */}
          <div className="aspect-[4/5] w-full overflow-hidden bg-gray-50 relative border-b border-gray-50">
             <img 
                src={`/img/breeds/${breed.alias.trim()}.png`} 
                alt={breed.name} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/img/breeds/default.png';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            
            {/* ALIAS LABEL */}
            <div className="absolute top-4 left-4">
              <span className="bg-white/80 backdrop-blur-md text-[#491907] font-mono text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-[#491907]/10 shadow-sm">
                {breed.alias}
              </span>
            </div>

            {/* HOVER GLOW overlay */}
            <div className="absolute inset-0 bg-[#491907]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* CONTENT SECTION */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="text-sm font-black text-primary uppercase tracking-tight leading-tight group-hover:text-[#491907] transition-colors italic mb-4 min-h-[2.5rem] flex items-center">
                {breed.name}
            </h3>

            <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
              <div className="flex flex-col">
                  <span className="text-xs font-black text-primary leading-none tracking-tighter italic">{breed.total_animals}</span>
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-60">{t.catalog.total}</span>
              </div>
              <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-green-600 leading-none tracking-tighter italic">{breed.living_animals}</span>
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-60">{t.catalog.live}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-center">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#491907]/30 group-hover:text-[#491907] transition-all">
                  {t.catalog.launch} ➔
                </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
