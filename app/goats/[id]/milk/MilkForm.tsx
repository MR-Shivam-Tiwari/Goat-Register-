'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MilkForm({ 
  goatId, 
  initialData, 
  t 
}: { 
  goatId: string, 
  initialData?: any, 
  t: any 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    par_0: initialData?.par_0 || '', // Lactation number
    par_1: initialData?.par_1 || '', // Days
    par_2: initialData?.par_2 || '', // Milk yield
    par_3: initialData?.par_3 || '', // Fat
    par_4: initialData?.par_4 || '', // Protein
    par_5: initialData?.par_5 || '', // Lactose
    par_6: initialData?.par_6 || '', // Peak yield
    par_7: initialData?.par_7 || '', // Avg yield
    par_8: initialData?.par_8 || '', // Density
    par_9: initialData?.par_9 || '', // Flow rate
    source: initialData?.source || '',
    have_graph: initialData?.have_graph || 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/goats/${goatId}/milk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push(`/goats/${goatId}`);
        router.refresh();
      } else {
        const err = await res.json();
        alert('Failed to save milk data: ' + err.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error saving milk data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-[#FDFBF7] rounded-3xl shadow-2xl border border-amber-900/5 overflow-hidden">
      <div className="bg-[#491907] p-10 text-white relative overflow-hidden">
         <div className="relative z-10">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Milk productivity</h1>
            <p className="text-[#E2F0D9]/40 text-[10px] font-black mt-2 uppercase tracking-widest">Official Production Registry</p>
         </div>
         <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="space-y-4">
           {/* Form Fields mapped to par_0...par_9 in 2-column grid */}
           <div className="grid grid-cols-2 gap-x-4 gap-y-4">
             {[
               { l: t.goats.lactNo, f: 'par_0', type: 'number' },
               { l: t.goats.lactDays, f: 'par_1', type: 'text' },
               { l: t.goats.lactMilk, f: 'par_2', type: 'number' },
               { l: t.goats.lactFat, f: 'par_3', type: 'number' },
               { l: t.goats.lactProtein, f: 'par_4', type: 'number' },
               { l: t.goats.lactose, f: 'par_5', type: 'number' },
               { l: t.goats.peakMilk, f: 'par_6', type: 'number' },
               { l: t.goats.lactMilkDay, f: 'par_7', type: 'number' },
               { l: t.goats.density, f: 'par_8', type: 'number' },
               { l: t.goats.flowRate, f: 'par_9', type: 'number' },
             ].map((item) => (
               <div key={item.f} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[#491907]/40 tracking-[0.2em]">{item.l}</label>
                  <input 
                    type={item.type}
                    step="0.001"
                    required={item.f === 'par_0'}
                    value={formData[item.f as keyof typeof formData]}
                    onChange={e => setFormData({...formData, [item.f]: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-[11px] font-black outline-none focus:border-[#491907] focus:ring-4 focus:ring-[#491907]/5 transition-all shadow-sm"
                    placeholder={item.l}
                  />
               </div>
             ))}
           </div>

           {/* Source */}
           <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-[#491907]/40 tracking-[0.2em]">{t.goats.source}</label>
              <textarea 
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-[11px] font-black outline-none focus:border-[#491907] focus:ring-4 focus:ring-[#491907]/5 transition-all shadow-sm min-h-[100px]"
                placeholder={t.goats.source + "..."}
              />
           </div>

           {/* Graph Select */}
           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-black uppercase text-[#491907]/60 tracking-widest">{t.goats.lactGraphShort}</span>
              <select 
                value={formData.have_graph}
                onChange={e => setFormData({...formData, have_graph: parseInt(e.target.value)})}
                className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-[10px] font-black outline-none focus:ring-2 focus:ring-[#491907]/20"
              >
                <option value={0}>{t.users.no}</option>
                <option value={1}>{t.users.yes}</option>
              </select>
           </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex gap-4">
           <button 
             type="button"
             onClick={() => router.back()}
             className="flex-1 bg-white border border-gray-200 text-gray-400 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all"
           >
             Cancel
           </button>
           <button 
             type="submit"
             disabled={loading}
             className="flex-[2] bg-[#491907] text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl shadow-[#491907]/10 disabled:opacity-50"
           >
             {loading ? 'Processing...' : 'Write down'}
           </button>
        </div>
      </form>
    </div>
  );
}
