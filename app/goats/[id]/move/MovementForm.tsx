'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MovementForm({ 
  goatId, 
  currentFarmId, 
  currentFarmName: propFarmName,
  targetFarmId,
  farms, 
  t 
}: { 
  goatId: string, 
  currentFarmId: number, 
  currentFarmName?: string,
  targetFarmId?: string | number,
  farms: any[], 
  t: any 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Pre-select target farm if it's not the same as current
  const initialTarget = targetFarmId && Number(targetFarmId) !== currentFarmId ? String(targetFarmId) : '';

  const [formData, setFormData] = useState({
    id_farm_of: currentFarmId,
    id_farm_on: initialTarget,
    id_reason: 0,
    date_return: '',
    info: ''
  });

  const currentFarmName = propFarmName || farms.find(f => f.id === currentFarmId)?.name || (currentFarmId === 0 ? t.goatForm.noFarm : "Unknown Farm");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_farm_on) {
      alert(t.goatForm.move.selectDestAlert);
      return;
    }
    setLoading(true);
    
    try {
      const res = await fetch(`/api/goats/${goatId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push(`/goats/${goatId}`);
        router.refresh();
      } else {
        const err = await res.json();
        alert(t.goatForm.move.errorMove + ': ' + err.error);
      }
    } catch (error) {
      console.error(error);
      alert(t.goatForm.move.errorMove);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-[#491907] p-8 text-white relative">
        <h2 className="text-2xl font-black uppercase relative z-10">{t.goatForm.move.title}</h2>
        <p className="text-white/40 text-[10px] font-black mt-1 uppercase tracking-widest relative z-10">{t.goatForm.move.subtitle}</p>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="space-y-6">
          {/* MOVING FROM */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
               <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{t.goats.farm || "CURRENT LOCATION"}</label>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-[#491907]/5 rounded-2xl blur-xl group-hover:bg-[#491907]/10 transition-all"></div>
              <div className="relative text-[13px] font-black text-[#491907] p-6 bg-white border-2 border-[#491907]/10 rounded-2xl flex items-center justify-between shadow-sm">
                 <span className="uppercase tracking-tight">
                   {currentFarmId === 0 ? (t.goats.withoutFarm || "Without a farm") : currentFarmName}
                 </span>
                 <div className="px-3 py-1 bg-[#491907] text-white text-[8px] font-black rounded-full uppercase tracking-widest">
                    Origin
                 </div>
              </div>
            </div>
          </div>

          {/* DESTINATION FARM */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] mb-1 block">DESTINATION FARM</label>
            <select 
              value={formData.id_farm_on}
              onChange={e => setFormData({...formData, id_farm_on: e.target.value})}
              required
              className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-[11px] font-black outline-none focus:border-[#491907] focus:ring-4 focus:ring-[#491907]/5 transition-all shadow-sm cursor-pointer"
            >
              <option value="">Select destination...</option>
              {farms.filter(f => f.id !== currentFarmId).map(farm => (
                <option key={farm.id} value={farm.id}>{farm.name}</option>
              ))}
            </select>
          </div>

          {/* DATE */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] mb-1 block">DATE OF MOVEMENT</label>
            <input 
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-[11px] font-black outline-none focus:border-[#491907] focus:ring-4 focus:ring-[#491907]/5 transition-all shadow-sm"
              required
            />
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50 text-center">
           <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-4">Confirm the transfer details before saving</p>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#491907] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-[#491907]/20 hover:bg-black hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? "PROCESSING..." : "REGISTER MOVEMENT"}
          </button>
        </div>
      </form>
    </div>
  );
}
