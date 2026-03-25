'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AssessmentForm({ 
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
    who_expert: initialData?.Who_expert || initialData?.who_expert || '',
    date_test: initialData?.date_test ? new Date(initialData.date_test).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    test_type: initialData?.test_type || 1,
    par_1: initialData?.par_1 || initialData?.Par_1 || '',
    par_2: initialData?.par_2 || initialData?.Par_2 || '',
    par_3: initialData?.par_3 || initialData?.Par_3 || '',
    par_4: initialData?.par_4 || initialData?.Par_4 || '',
    weight: initialData?.weight || initialData?.Weight || '',
    score_total: initialData?.score_total || initialData?.Score_total || '',
    class_val: initialData?.class || initialData?.Class || '',
    category: initialData?.category || initialData?.Category || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/goats/${goatId}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push(`/goats/${goatId}`);
        router.refresh();
      } else {
        alert('Failed to save assessment');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-[#491907] p-8 text-white relative overflow-hidden">
         <div className="relative z-10">
            <h1 className="text-2xl font-black uppercase tracking-tight">{t.goats.expertAssessment}</h1>
            <p className="text-[#E2F0D9]/60 text-xs font-bold mt-1 uppercase">Breeding Registry Official Documentation</p>
         </div>
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-3">
           {/* Expert Name */}
           <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-[#491907]/60 tracking-wider">Full name of the Expert</label>
              <input 
                type="text" 
                required
                value={formData.who_expert}
                onChange={e => setFormData({...formData, who_expert: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-[10px] font-bold focus:ring-1 focus:ring-[#491907]/20 outline-none transition-all"
                placeholder="Full name of the Expert"
              />
           </div>

           {/* Date & Type */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-[#491907]/60 tracking-wider">Date of certification</label>
                 <input 
                   type="date" 
                   required
                   value={formData.date_test}
                   onChange={e => setFormData({...formData, date_test: e.target.value})}
                   className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-[10px] font-bold focus:ring-1 focus:ring-[#491907]/20 outline-none transition-all"
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-[#491907]/60 tracking-wider">Type of certification</label>
                 <div className="flex flex-col gap-1">
                    <select 
                      value={formData.test_type}
                      onChange={e => setFormData({...formData, test_type: parseInt(e.target.value)})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-[10px] font-bold focus:ring-1 focus:ring-[#491907]/20 outline-none transition-all appearance-none"
                    >
                      <option value={0}>Not held</option>
                      <option value={1}>Classical in-depth</option>
                      <option value={2}>Certification of young animals</option>
                    </select>
                    <span className="text-[8px] text-orange-800 font-bold">(not conducted/classical in-depth/certification of young animals)</span>
                 </div>
              </div>
           </div>

           {/* Stats One by One like screenshot */}
           <div className="space-y-3">
              {[
                { l: 'Height at withers', f: 'par_1', v: formData.par_1 },
                { l: 'Height at the sacrum', f: 'par_2', v: formData.par_2 },
                { l: 'Chest circumference at the heart lin', f: 'par_3', v: formData.par_3 },
                { l: 'Oblique body length', f: 'par_4', v: formData.par_4 },
                { l: 'Animal weight', f: 'weight', v: formData.weight },
                { l: 'Final score', f: 'score_total', v: formData.score_total },
                { l: 'Class', f: 'class_val', v: formData.class_val },
                { l: 'Category', f: 'category', v: formData.category },
              ].map((item) => (
                <div key={item.f} className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-[#491907]/60 tracking-wider">{item.l}</label>
                   <input 
                     type={item.f === 'class_val' || item.f === 'category' || item.f === 'score_total' ? 'text' : 'number'}
                     step="0.01"
                     value={item.v}
                     onChange={e => setFormData({...formData, [item.f]: e.target.value})}
                     className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-[10px] font-black outline-none focus:border-[#491907] transition-all"
                     placeholder={item.l}
                   />
                </div>
              ))}
           </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex gap-4">
           <button 
             type="button"
             onClick={() => router.back()}
             className="flex-1 bg-gray-50 text-gray-400 px-4 py-3 rounded-xl font-black uppercase text-[9px] hover:bg-gray-100 transition-all"
           >
             Cancel
           </button>
           <button 
             type="submit"
             disabled={loading}
             className="flex-[2] bg-[#491907] text-white px-4 py-3 rounded-xl font-black uppercase text-[9px] hover:bg-black transition-all shadow-md disabled:opacity-50"
           >
             {loading ? 'Processing...' : 'Write down'}
           </button>
        </div>
      </form>
    </div>
  );
}
