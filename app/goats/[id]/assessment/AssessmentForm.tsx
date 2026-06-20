'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AssessmentForm({ 
  goatId, 
  initialData, 
  t,
  lang
}: { 
  goatId: string, 
  initialData?: any, 
  t: any,
  lang: string
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const formatDate = (d: any) => {
    if (!d) return '';
    try {
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return String(d);
      return dateObj.toISOString().split('T')[0];
    } catch {
      return String(d);
    }
  };

  const [formData, setFormData] = useState({
    who_expert: initialData?.who_expert || initialData?.Who_expert || '',
    date_test: initialData?.date_test || initialData?.Date_test ? formatDate(initialData.date_test || initialData.Date_test) : '',
    test_type: initialData?.test_type !== undefined ? Number(initialData.test_type) : 0,
    par_1: initialData?.par_1 || initialData?.Par_1 || '',
    par_2: initialData?.par_2 || initialData?.Par_2 || '',
    par_3: initialData?.par_3 || initialData?.Par_3 || '',
    par_4: initialData?.par_4 || initialData?.Par_4 || '',
    weight: initialData?.weight || initialData?.Weight || '',
    score_total: initialData?.score_total || initialData?.Score_total || '',
    class_val: initialData?.class || initialData?.Class || '',
    category: initialData?.category || initialData?.Category || '',
    mark_wh: initialData?.mark_wh || '',
    mark_wk: initialData?.mark_wk || '',
    mark_og: initialData?.mark_og || '',
    mark_gg: initialData?.mark_gg || '',
    mark_kd: initialData?.mark_kd || '',
    mark_dev: initialData?.mark_dev || '',
    mark_hsp: initialData?.mark_hsp || '',
    mark_chest: initialData?.mark_chest || '',
    mark_krts: initialData?.mark_krts || '',
    mark_kti: initialData?.mark_kti || '',
    mark_hooves: initialData?.mark_hooves || '',
    mark_udder: initialData?.mark_udder || '',
    mark_udder_f: initialData?.mark_udder_f || '',
    mark_udder_b: initialData?.mark_udder_b || '',
    mark_teats: initialData?.mark_teats || '',
    mark_scrotum: initialData?.mark_scrotum || ''
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
        alert(t.goatForm.assessment.errorSave || 'Error');
      }
    } catch (error) {
      console.error(error);
      alert(t.goatForm.assessment.errorSave || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg border border-[#491907] p-8 shadow-sm font-sans text-left">
      <h2 className="text-[#491907] font-extrabold text-2xl mb-6 tracking-tight">
        {lang === 'ru' ? 'Экспертная оценка' : 'Expert assessment'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Info section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expert Name */}
          <div>
            <label className="block text-amber-950 text-xs font-semibold mb-1">
              {t.goatForm.assessment?.expertName || 'ФИО эксперта'}
            </label>
            <input 
              type="text" 
              value={formData.who_expert}
              onChange={e => setFormData({...formData, who_expert: e.target.value})}
              className="w-full border border-gray-400 bg-white rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-amber-950 font-sans text-black"
              placeholder=""
            />
          </div>

          {/* Date of certification */}
          <div>
            <label className="block text-amber-950 text-xs font-semibold mb-1">
              {t.goatForm.assessment?.certDate || 'Дата проведения'}
            </label>
            <input 
              type="date" 
              value={formData.date_test}
              onChange={e => setFormData({...formData, date_test: e.target.value})}
              className="w-full border border-gray-400 bg-white rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-amber-950 font-sans text-black"
              placeholder=""
            />
          </div>

          {/* 1. Type of certification Dropdown */}
          <div className="md:col-span-2">
            <label className="block text-amber-950 text-xs font-semibold mb-1">
              {lang === 'ru' ? 'Тип аттестации' : 'Type of assessment'}
            </label>
            <select 
              value={formData.test_type}
              onChange={e => setFormData({...formData, test_type: parseInt(e.target.value)})}
              className="w-full md:w-1/2 border border-gray-400 bg-white rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-amber-950 font-sans text-black"
            >
              <option value={0}>{t.goatForm.assessment?.notHeld || 'Не проведена'}</option>
              <option value={3}>{t.goatForm.assessment?.classicalStd || 'Классическая'}</option>
              <option value={1}>{t.goatForm.assessment?.classical || 'Классическая углубленная'}</option>
              <option value={2}>{t.goatForm.assessment?.young || 'Аттест. молодняка'}</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6"></div>

        {/* Stats fields - the 18 specific items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
          {[
            { f: 'mark_wh', l: lang === 'ru' ? 'ВХ' : 'WH' },
            { f: 'mark_wk', l: lang === 'ru' ? 'ВК' : 'WK' },
            { f: 'mark_og', l: lang === 'ru' ? 'ОГ' : 'OG' },
            { f: 'mark_gg', l: lang === 'ru' ? 'ГГ' : 'GG' },
            { f: 'mark_kd', l: lang === 'ru' ? 'КД' : 'KD' },
            { f: 'mark_dev', l: lang === 'ru' ? 'Об. Развитие' : 'General Dev.' },
            { f: 'mark_hsp', l: lang === 'ru' ? 'Х,С,П,Ср.Ч' : 'H,S,P,Sr.Ch' },
            { f: 'mark_chest', l: lang === 'ru' ? 'Грудь' : 'Chest' },
            { f: 'mark_krts', l: lang === 'ru' ? 'Кр-ц' : 'Kr-ts' },
            { f: 'mark_kti', l: lang === 'ru' ? 'К-ти' : 'K-ti' },
            { f: 'mark_hooves', l: lang === 'ru' ? 'Копыта' : 'Hooves' },
            { f: 'mark_udder', l: lang === 'ru' ? 'Вымя' : 'Udder' },
            { f: 'mark_udder_f', l: lang === 'ru' ? 'Вымя спереди' : 'Udder front' },
            { f: 'mark_udder_b', l: lang === 'ru' ? 'Вымя сзади' : 'Udder behind' },
            { f: 'mark_teats', l: lang === 'ru' ? 'Соски' : 'Teats' },
            { f: 'mark_scrotum', l: lang === 'ru' ? 'Мошонка' : 'Scrotum' },
            { f: 'score_total', l: lang === 'ru' ? 'Средний балл' : 'Avg score' },
            { f: 'class_val', l: lang === 'ru' ? 'Класс' : 'Class' },
          ].map((item) => (
            <div key={item.f} className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                {item.l}
              </label>
              <input 
                type="text"
                value={(formData as any)[item.f]}
                onChange={e => setFormData({...formData, [item.f]: e.target.value})}
                className="w-full h-9 border border-gray-300 bg-white rounded-[4px] px-3 text-sm focus:outline-none focus:border-amber-950 focus:ring-1 focus:ring-amber-950 font-sans text-black"
                placeholder=""
                maxLength={10}
              />
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div className="pt-6 border-t border-gray-200 mt-6">
          <button 
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto border border-gray-400 bg-[#491907] text-white px-8 py-2 rounded-[4px] text-sm font-bold hover:bg-[#60250b] active:bg-[#491907] transition-colors font-sans cursor-pointer disabled:opacity-50"
          >
            {loading ? (t.goatForm.assessment?.processing || 'Сохранение...') : (t.goatForm.assessment?.save || 'Сохранить')}
          </button>
        </div>
      </form>
    </div>
  );
}

