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
  
  if (!breed) return <div className="p-40 text-center text-5xl font-black text-primary uppercase">Breed not found</div>;

  const pics = await getBreedPictures(params.alias);

  const categories = [
    { id: 'female', name: 'Does (Females)', sex: 0, desc: 'Registered adult females and productivity records.', img: pics[0] || 'noimage.gif' },
    { id: 'male', name: 'Bucks (Males)', sex: 1, desc: 'Registered breeding sires and genetic lines.', img: pics[1] || 'noimage.gif' },
    { id: 'child', name: 'Kids (Young Stock)', sex: 2, desc: 'Kids, yearlings and upcoming breeding potential.', img: pics[2] || 'noimage.gif' }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto space-y-16">
        <Breadcrumbs items={[{ label: 'Catalog', href: '/catalog/goats' }, { label: breed.name }]} />

        <header className="border-b border-primary/10 pb-12">
            <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase mb-4 leading-tight italic">
              {breed.name} Registry
            </h1>
            <p className="text-xl text-primary/80 font-medium leading-relaxed max-w-3xl">
              Explore the official records for purebred {breed.name} goats. View genetic standards, productivity, and farm provenance.
            </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {categories.map((cat) => (
            <Link 
              key={cat.id}
              href={`/catalog/goats/${breed.alias.trim()}/${cat.id}`}
              className="group flex flex-col bg-white border-2 border-primary/10 rounded-2xl overflow-hidden hover:border-secondary transition-colors"
            >
              <div className="aspect-square bg-white flex items-center justify-center p-8 border-b-2 border-primary/10">
                 <img 
                    src={`/img/${cat.img}`} 
                    alt={cat.name} 
                    className="w-full h-full object-contain"
                />
              </div>

              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-black text-primary mb-3 uppercase tracking-tight">{cat.name}</h3>
                <p className="text-lg text-primary/70 mb-8 leading-snug">{cat.desc}</p>
                
                <div className="mt-auto">
                   <div className="inline-block px-8 py-4 bg-primary text-secondary font-black text-sm uppercase tracking-widest rounded-xl hover:bg-black w-full text-center transition-colors">
                     VIEW CATEGORY ➔
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-primary/10 pt-16 text-center">
            {[
              { label: 'Registered', val: '12k+' },
              { label: 'Farms', val: '450' },
              { label: 'Authenticated', val: '100%' },
              { label: 'Standard', val: 'Global' }
            ].map((s, i) => (
                <div key={i} className="bg-primary/5 rounded-2xl p-8">
                    <span className="block text-4xl md:text-5xl font-black text-primary mb-2">{s.val}</span>
                    <span className="text-sm font-black text-secondary uppercase tracking-widest">{s.label}</span>
                </div>
            ))}
        </section>
      </div>
    </div>
  );
}
