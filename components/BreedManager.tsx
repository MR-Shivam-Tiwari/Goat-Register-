'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, X, Check, Image as ImageIcon, SortAsc, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Breed {
  id: number;
  name: string;
  alias: string;
  id_family: number;
  place: number;
  ico: string;
}

export default function BreedManager({ initialBreeds, t }: { initialBreeds: Breed[], t: any }) {
  const [breeds, setBreeds] = useState<Breed[]>(initialBreeds);
  const [loading, setLoading] = useState(false);

  const m = t.breedManage;

  const handleDelete = async (id: number) => {
    if (!confirm(m.confirmDelete || 'Are you sure you want to delete this breed?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/breeds/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBreeds(breeds.filter(b => b.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete breed');
      }
    } catch (error) {
      alert('Error deleting breed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#491907] uppercase tracking-tighter">{m.title}</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            {m.modifyRegistry}
          </p>
        </div>
        <Link
          href="/catalog/breeds/add"
          target="_blank"
          className="inline-flex items-center gap-3 px-10 py-4 bg-[#491907] text-white rounded-sm font-black text-[12px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-[#491907]/20 border border-[#491907]"
        >
          {m.addNew} +
        </Link>
      </div>

      <div className="overflow-x-auto bg-white border border-black rounded-sm">
        <table className="w-full text-left border-collapse min-w-[1000px] text-[11px]">
          <thead>
            <tr className="bg-[#491907] text-white">
               <th colSpan={7} className="p-2 text-center uppercase tracking-[0.3em] font-black border-b border-black">
                 {m.registryAdmin}
               </th>
            </tr>
            <tr className="bg-[#DCFCE7] text-gray-900 border-b border-black">
              <th className="p-3 px-6 border-r border-black font-black uppercase">ID</th>
              <th className="p-3 px-6 border-r border-black font-black uppercase w-20 text-center">{m.place}</th>
              <th className="p-3 px-6 border-r border-black font-black uppercase">{m.breedName}</th>
              <th className="p-3 px-6 border-r border-black font-black uppercase w-24 text-center">{m.alias}</th>
              <th className="p-3 px-6 border-r border-black font-black uppercase w-20 text-center">{m.family}</th>
              <th className="p-3 px-6 border-r border-black font-black uppercase">{m.icon}</th>
              <th className="p-3 px-6 font-black uppercase text-center w-32">{m.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black bg-white">
            {breeds.map((breed, idx) => {
              const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#DCFCE7";
              return (
                <tr key={breed.id} style={{ backgroundColor: rowBg }} className="divide-x divide-black h-10 hover:opacity-90">
                  <td className="p-2 px-6 font-bold text-gray-400">#{breed.id}</td>
                  <td className="p-2 px-6 text-center">
                    <span className="font-black text-[#491907]">{breed.place ?? 0}</span>
                  </td>
                  <td className="p-2 px-6">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-[#491907] uppercase">{breed.name}</span>
                      <Link href={`/catalog/goats/${breed.alias}`} target="_blank" className="text-blue-600 hover:text-black opacity-30 hover:opacity-100 transition-opacity">
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </td>
                  <td className="p-2 px-6 text-center">
                    <span className="font-black opacity-50 uppercase">{breed.alias}</span>
                  </td>
                  <td className="p-2 px-6 text-center">
                    <span className="font-black text-[#491907]">{breed.id_family ?? 0}</span>
                  </td>
                  <td className="p-2 px-6 flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-6 bg-white border border-black/10 rounded-sm overflow-hidden flex items-center justify-center flex-shrink-0">
                      {breed.ico ? (
                        <img 
                          src={breed.ico.startsWith('breed_') ? `/uploads/${breed.ico}` : `/breedimage/${breed.ico}`} 
                          className="w-full h-full object-contain p-0.5" 
                          alt=""
                        />
                      ) : (
                        <ImageIcon size={10} className="text-gray-200" />
                      )}
                    </div>
                    <span className="font-mono opacity-40 truncate">{breed.ico || '-'}</span>
                  </td>
                  <td className="p-2 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/catalog/breeds/${breed.id}/edit`}
                        target="_blank"
                        className="p-1.5 bg-gray-100 text-gray-400 rounded-sm hover:bg-[#491907] hover:text-white transition-all"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(breed.id)}
                        className="p-1.5 bg-gray-100 text-gray-400 rounded-sm hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
