'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MovementForm({ 
  goatId, 
  currentFarmId, 
  farms, 
  t 
}: { 
  goatId: string, 
  currentFarmId: number, 
  farms: any[], 
  t: any 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_farm_of: currentFarmId,
    id_farm_on: '',
    id_reason: 0,
    date_return: '',
    info: ''
  });

  const currentFarmName = farms.find(f => f.id === currentFarmId)?.name || (currentFarmId === 0 ? "The farm no longer exists" : "Unknown Farm");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_farm_on) {
      alert('Please select a destination farm');
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
        alert('Failed to record movement: ' + err.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error recording movement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-[#491907] p-8 text-white relative">
        <h2 className="text-2xl font-black uppercase italic relative z-10">Animal movement</h2>
        <p className="text-white/40 text-[10px] font-black mt-1 uppercase tracking-widest relative z-10">Record a new transfer</p>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] mb-1 block">Moving from</label>
            <div className="text-[11px] font-black text-[#491907] p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
               "{currentFarmName}"
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] mb-1 block">Destination Farm</label>
            <select 
              value={formData.id_farm_on}
              onChange={e => setFormData({...formData, id_farm_on: e.target.value})}
              required
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-[11px] font-black outline-none focus:border-[#491907] focus:ring-4 focus:ring-[#491907]/5 transition-all shadow-sm cursor-pointer"
            >
              <option value="">Select destination...</option>
              {farms.filter(f => f.id !== currentFarmId).map(farm => (
                <option key={farm.id} value={farm.id}>{farm.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] mb-1 block">Return date (rental)</label>
            <input 
              type="date"
              value={formData.date_return}
              onChange={e => setFormData({...formData, date_return: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-[11px] font-black outline-none focus:border-[#491907] focus:ring-4 focus:ring-[#491907]/5 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] mb-1 block">Additional information</label>
            <textarea 
              value={formData.info}
              onChange={e => setFormData({...formData, info: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-[11px] font-black outline-none focus:border-[#491907] focus:ring-4 focus:ring-[#491907]/5 transition-all shadow-sm min-h-[140px] resize-none"
              placeholder="E.g. Reason for movement, conditions..."
            />
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50">
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#491907] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-[#491907]/20 hover:bg-black hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? 'Processing...' : 'Write down'}
          </button>
        </div>
      </form>
    </div>
  );
}
