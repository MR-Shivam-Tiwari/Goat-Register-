import { query } from '@/lib/db';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

async function getBreedData(alias: string) {
  const result = await query('SELECT id, name, alias FROM breeds WHERE TRIM(alias) ILIKE TRIM($1)', [alias]);
  return result.rows[0];
}

async function getBreedPictures(alias: string) {
    const result = await query('SELECT sex, file FROM pictures WHERE TRIM(alias) ILIKE TRIM($1)', [alias]);
    const pics: Record<number, string> = {};
    result.rows.forEach(p => pics[p.sex] = p.file);
    return pics;
}

export default async function BreedPage({ params: paramsPromise }: { params: Promise<{ alias: string }> }) {
  const params = await paramsPromise;
  const breed = await getBreedData(params.alias);
  
  if (!breed) return <div className="p-40 text-center text-4xl font-black text-primary uppercase tracking-[1em]">Breed not found</div>;

  const pics = await getBreedPictures(params.alias);

  const categories = [
    { id: 'female', name: 'Does (Females)', sex: 0, desc: 'View Stock', img: pics[0] || 'noimage.gif' },
    { id: 'male', name: 'Bucks (Males)', sex: 1, desc: 'View Stock', img: pics[1] || 'noimage.gif' },
    { id: 'child', name: 'Kids (Young)', sex: 2, desc: 'View Stock', img: pics[2] || 'noimage.gif' }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-6 px-4 md:px-12 lg:px-24 tracking-tight">
      <div className="max-w-4xl mx-auto space-y-8">
        <Breadcrumbs items={[{ label: 'Catalog', href: '/catalog/goats' }, { label: breed.name }]} />

        <header className="border-b border-gray-100 pb-3">
            <h1 className="text-2xl font-black text-primary tracking-tighter uppercase leading-none italic">
              {breed.name} STOCK
            </h1>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-60">
              Select category to view genetic database and records
            </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link 
              key={cat.id}
              href={`/catalog/goats/${breed.alias.trim()}/${cat.id}`}
              className="group flex flex-col bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-black transition-all hover:shadow-xl"
            >
              <div className="aspect-[3/2] bg-gray-50 flex items-center justify-center p-3 border-b border-gray-100">
                 <img 
                    src={`/img/${cat.img}`} 
                    alt={cat.name} 
                    className="w-full h-full object-contain opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-4 flex flex-col flex-1 bg-[#E2F0D9]/5">
                <h3 className="text-sm font-black text-primary uppercase tracking-tighter group-hover:text-blue-800 transition-colors italic leading-none">{cat.name}</h3>
                <p className="text-[7px] font-black uppercase tracking-widest text-gray-300 mt-2 mb-4 italic leading-none">{cat.desc}</p>
                
                <div className="mt-auto">
                   <div className="inline-block px-4 py-2 bg-primary text-secondary font-black text-[8px] uppercase tracking-widest rounded-sm hover:bg-black w-full text-center transition-colors shadow-sm italic">
                     ENTER ➔
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-12 grid grid-cols-4 gap-4 border-t border-gray-100 pt-6 text-center">
            {[
              { label: 'Registered', val: '12K+' },
              { label: 'Farms', val: '450' },
              { label: 'Data', val: '100%' },
              { label: 'Standards', val: 'PRO' }
            ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-2 filter grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
                    <span className="block text-sm font-black text-primary mb-0.5 uppercase tracking-tighter leading-none italic">{s.val}</span>
                    <span className="text-[7px] font-black text-secondary tracking-widest uppercase font-mono italic whitespace-nowrap">{s.label}</span>
                </div>
            ))}
        </section>
      </div>
    </div>
  );
}
