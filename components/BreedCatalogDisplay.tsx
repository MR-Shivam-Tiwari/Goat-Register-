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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {breeds.map((breed) => (
        <Link 
          key={breed.id} 
          href={`/catalog/goats/${breed.alias.trim()}`}
          className="group bg-white border border-gray-100 rounded-[32px] overflow-hidden hover:border-[#491907] hover:shadow-[0_20px_50px_rgba(73,25,7,0.15)] transition-all duration-500 flex flex-col shadow-md relative h-full"
        >
          {/* IMAGE SECTION */}
          <div className="aspect-[4/5] w-full overflow-hidden bg-white relative border-b border-gray-50 p-6 flex items-center justify-center rounded-2xl">
             <img 
                src={
                  breed.name.includes('Альпийская') ? '/breedimage/Альпийская.jpg' :
                  breed.name.includes('Бурская') ? '/breedimage/Бурская.jpg' :
                  breed.name.includes('Ла-Манча') ? '/breedimage/ЛаМанча.jpg' :
                  breed.name.includes('Украинская короткоухая') ? '/breedimage/Украинскаякороткоухая.jpg' :
                  breed.name.includes('Украинская цветная') ? '/breedimage/УкраїнськаСтроката.jpg' :
                  breed.name.includes('Карликовая группа') ? '/breedimage/Карликоваягруппакоз.jpg' :
                  breed.name.includes('Тюринг') ? '/breedimage/ТюрингскаяЛеснаяКоза.jpg' :
                  breed.name.includes('Англо-нубийская') ? '/breedimage/anglo_nubian_gen.png' :
                  `/img/breeds/${breed.alias.trim()}.png`
                } 
                alt={breed.name} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/img/breeds/default.png';
                }}
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out rounded-lg shadow-sm"
            />
            
            {/* ALIAS LABEL */}
            <div className="absolute top-6 left-6">
              <span className="bg-white/90 backdrop-blur-md text-[#491907] font-mono text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#491907]/10 shadow-sm">
                {breed.alias}
              </span>
            </div>

            {/* HOVER GLOW overlay */}
            <div className="absolute inset-0 bg-[#491907]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* CONTENT SECTION */}
          <div className="p-8 flex flex-col flex-1">
            <h3 className="text-xl font-black text-primary uppercase tracking-tight leading-tight group-hover:text-[#491907] transition-colors italic mb-6 min-h-[3rem] flex items-center">
                {breed.name}
            </h3>

            <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-5">
              <div className="flex flex-col">
                  <span className="text-lg font-black text-primary leading-none tracking-tighter italic">{breed.total_animals}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 opacity-60">{t.catalog.total}</span>
              </div>
              <div className="flex flex-col items-end">
                  <span className="text-lg font-black text-green-600 leading-none tracking-tighter italic">{breed.living_animals}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 opacity-60">{t.catalog.live}</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#491907]/30 group-hover:text-[#491907] transition-all">
                  {t.catalog.launch} ➔
                </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
