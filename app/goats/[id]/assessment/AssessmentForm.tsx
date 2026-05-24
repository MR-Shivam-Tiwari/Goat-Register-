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
        alert(t.goatForm.assessment.errorSave);
      }
    } catch (error) {
      console.error(error);
      alert(t.goatForm.assessment.errorSave);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-[#FCFAF2] rounded-lg border border-[#491907] p-8 shadow-sm font-sans text-left">
      <h2 className="text-[#491907] font-extrabold text-2xl mb-6 tracking-tight">
        {lang === 'ru' ? 'Экспертная оценка' : 'Expert assessment'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Expert Name */}
        <p>
          <input 
            type="text" 
            value={formData.who_expert}
            onChange={e => setFormData({...formData, who_expert: e.target.value})}
            className="w-[420px] max-w-full border border-gray-400 bg-white rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-amber-950 font-sans text-black"
            placeholder={t.goatForm.assessment.expertName}
          />
        </p>

        {/* Date of certification */}
        <p>
          <input 
            type="text" 
            value={formData.date_test}
            onChange={e => setFormData({...formData, date_test: e.target.value})}
            className="w-[420px] max-w-full border border-gray-400 bg-white rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-amber-950 font-sans text-black"
            placeholder={t.goatForm.assessment.certDate}
          />
        </p>

        {/* Type of certification Dropdown & Label */}
        <p className="flex items-center gap-3 flex-wrap">
          <select 
            value={formData.test_type}
            onChange={e => setFormData({...formData, test_type: parseInt(e.target.value)})}
            className="border border-gray-400 bg-white rounded-[4px] px-3 py-1 text-sm focus:outline-none focus:border-amber-950 font-sans text-black"
          >
            <option value={0}>{t.goatForm.assessment.notHeld}</option>
            <option value={1}>{t.goatForm.assessment.classical}</option>
            <option value={2}>{t.goatForm.assessment.young}</option>
          </select>
          <span className="text-amber-950 text-xs font-semibold font-sans">
            {lang === 'ru' 
              ? 'Тип аттестации (не проведена/классическая углубленная/аттест молодняка)' 
              : 'Type of certification (not conducted/classical depth/young animals certification)'
            }
          </span>
        </p>

        {/* Stats fields */}
        {[
          { f: 'par_1', l: t.goatForm.assessment.heightWithers, v: formData.par_1 },
          { f: 'par_2', l: t.goatForm.assessment.heightSacrum, v: formData.par_2 },
          { f: 'par_3', l: t.goatForm.assessment.chestCircum, v: formData.par_3 },
          { f: 'par_4', l: t.goatForm.assessment.bodyLength, v: formData.par_4 },
          { f: 'weight', l: t.goatForm.assessment.weight, v: formData.weight },
          { f: 'score_total', l: t.goatForm.assessment.finalScore, v: formData.score_total },
          { f: 'class_val', l: t.goatForm.assessment.class, v: formData.class_val },
          { f: 'category', l: t.goatForm.assessment.category, v: formData.category },
        ].map((item) => (
          <p key={item.f}>
            <input 
              type="text"
              value={item.v}
              onChange={e => setFormData({...formData, [item.f]: e.target.value})}
              className="w-[420px] max-w-full border border-gray-400 bg-white rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-amber-950 font-sans text-black"
              placeholder={item.l}
            />
          </p>
        ))}

        {/* Submit button */}
        <p className="pt-2">
          <button 
            type="submit"
            disabled={loading}
            className="border border-gray-400 bg-gray-200 text-black px-4 py-1.5 rounded-[4px] text-xs font-bold hover:bg-gray-300 active:bg-gray-400 transition-colors font-sans cursor-pointer disabled:opacity-50"
          >
            {loading ? t.goatForm.assessment.processing : t.goatForm.assessment.save}
          </button>
        </p>
      </form>
    </div>
  );
}
