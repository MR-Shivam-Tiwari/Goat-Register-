'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTranslation, Locale } from '@/lib/translations';
import { addGoatAction, updateGoatAction } from '@/lib/actions';
import { Upload, X, ChevronLeft, Save } from 'lucide-react';

export default function GoatForm({ 
    breeds, 
    farms, 
    lang, 
    initialData 
}: { 
    breeds: any[], 
    farms: any[], 
    lang: Locale,
    initialData?: any 
}) {
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const t = getTranslation(lang);

    const isEdit = !!initialData;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        if (selectedFile) {
            formData.set('photo', selectedFile);
        }
        if (isEdit) {
            formData.set('goatId', initialData.id.toString());
        }

        try {
            const action = isEdit ? updateGoatAction : addGoatAction;
            const result = await action(formData);
            
            if (result.success) {
                router.push(isEdit ? `/goats/${initialData.id}` : '/goats?success=1');
                router.refresh();
            } else {
                setError(result.error || 'Something went wrong');
                setIsSubmitting(false);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    return (
        <div className="bg-white border-2 border-gray-100 rounded-sm p-4 md:p-8 font-sans max-w-4xl mx-auto text-gray-900 shadow-sm">
            {/* Simple Header */}
             <div className="border-b-2 border-gray-100 pb-4 mb-6 flex justify-between items-center">
                  <div>
                      <h2 className="text-xl font-bold uppercase tracking-tight text-[#491907]">
                         {isEdit ? t.goats.editTitle : t.goats.addTitle}
                      </h2>
                      {isEdit && <span className="text-xs text-gray-400 font-mono">ID: #{initialData.id}</span>}
                  </div>
                  <Link href="/goats" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                      <ChevronLeft size={16} /> {t.common.back}
                  </Link>
             </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-sm text-sm font-bold">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Basic Information */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-gray-400 border-l-4 border-[#491907] pl-3 py-1">Основная информация</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">{t.goats.nickname}</label>
                            <input 
                                name="nickname"
                                type="text" 
                                defaultValue={initialData?.name}
                                className="w-full border-2 border-gray-200 rounded-sm px-4 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none transition-all placeholder:text-gray-300"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">{t.goats.breed}</label>
                                <select 
                                    name="breed" 
                                    defaultValue={initialData?.id_breed}
                                    className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none cursor-pointer"
                                >
                                    {breeds.map((breed: any) => (
                                        <option key={breed.id} value={breed.id}>{breed.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Ферма</label>
                                <select 
                                    name="farm" 
                                    defaultValue={initialData?.id_farm || "0"}
                                    className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none cursor-pointer"
                                >
                                    <option value="0">Без хозяйства</option>
                                    {farms.map((farm: any) => (
                                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Пол</label>
                            <select name="sex" defaultValue={initialData?.sex === 1 ? 'male' : 'female'} className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none">
                                <option value="female">{t.goats.female}</option>
                                <option value="male">{t.goats.male}</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Племкнига</label>
                            <select name="studbook" defaultValue={initialData?.id_stoodbook || "main"} className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none">
                                <option value="main">{t.goats.mainRegister}</option>
                                <option value="f1">{t.goats.rcbF1}</option>
                                <option value="ex">{t.goats.experimental}</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Статус</label>
                            <select name="status" defaultValue={initialData?.status === 1 ? 'alive' : initialData?.status === 0 ? 'dead' : 'no_info'} className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none">
                                <option value="alive">Жив</option>
                                <option value="dead">Павшее</option>
                                <option value="no_info">Нет данных</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Член ABG</label>
                            <select name="abg" defaultValue={initialData?.is_abg ? 'yes' : 'no'} className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none">
                                <option value="no">Нет</option>
                                <option value="yes">Да</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* 2. Important Dates */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-gray-400 border-l-4 border-[#491907] pl-3 py-1">Даты и Вес</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                             <label className="text-sm font-bold text-gray-700">Дата рождения</label>
                             <input name="birthDate" type="date" defaultValue={formatDate(initialData?.date_born)} className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none" />
                        </div>
                        <div className="space-y-1">
                             <label className="text-sm font-bold text-gray-700">Дата смерти</label>
                             <input name="deathDate" type="date" defaultValue={formatDate(initialData?.date_dead)} className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none" />
                        </div>
                        <div className="space-y-1">
                             <label className="text-sm font-bold text-gray-700">Вес (гр)</label>
                             <input name="birthWeight" type="number" defaultValue={initialData?.born_weight} placeholder="3500" className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none" />
                        </div>
                        <div className="space-y-1">
                             <label className="text-sm font-bold text-gray-700">Оценка</label>
                             <input name="score" type="text" defaultValue={initialData?.score_total} placeholder="0.0" className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none" />
                        </div>
                    </div>
                </section>

                {/* 3. Ownership / Codes */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-gray-400 border-l-4 border-[#491907] pl-3 py-1">Владение и Номера</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 text-sm">
                             <label className="font-bold text-gray-700">{t.goats.breeder}</label>
                             <input name="breeder" type="text" defaultValue={initialData?.manuf} className="w-full border-2 border-gray-200 rounded-sm px-4 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none" />
                        </div>
                        <div className="space-y-1 text-sm">
                             <label className="font-bold text-gray-700">{t.goats.owner}</label>
                             <input name="owner" type="text" defaultValue={initialData?.owner} className="w-full border-2 border-gray-200 rounded-sm px-4 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['idUa', 'idAbg', 'chipId', 'idInt', 'certSeries', 'certNum'].map((f) => (
                             <div key={f} className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase">{(t.goats as any)[f]}</label>
                                <input 
                                    name={f} 
                                    type="text" 
                                    defaultValue={initialData?.[f === 'idUa' ? 'code_ua' : f === 'idAbg' ? 'code_abg' : f === 'chipId' ? 'code_chip' : f === 'idInt' ? 'code_int' : f === 'certSeries' ? 'cert_serial' : 'cert_no']} 
                                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm font-bold bg-gray-50"
                                />
                             </div>
                        ))}
                    </div>
                </section>

                {/* 4. Notes */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600 uppercase">Генетика</label>
                        <textarea name="genetic" defaultValue={initialData?.gen_mat} rows={3} className="w-full border border-gray-300 rounded-sm p-3 text-sm resize-none"></textarea>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600 uppercase">Источник</label>
                        <textarea name="source" defaultValue={initialData?.source} rows={3} className="w-full border border-gray-300 rounded-sm p-3 text-sm resize-none"></textarea>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600 uppercase">Особые отметки</label>
                        <textarea name="notes" defaultValue={initialData?.special} rows={3} className="w-full border border-gray-300 rounded-sm p-3 text-sm resize-none"></textarea>
                    </div>
                </section>

                {/* 5. Photo Upload Section - SIMPLE WITH ICON & TRANSLATIONS */}
                <section className="bg-gray-50 p-6 border-2 border-gray-200 rounded-sm space-y-4">
                    <label className="text-sm font-bold text-gray-700 block uppercase tracking-tight">
                         {t.goats.photo} ({t.goats.noInfo.toLowerCase()})
                    </label>
                    
                    <div className="flex flex-col items-start gap-4">
                        {!selectedFile ? (
                            <div className="relative">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    accept="image/*"
                                />
                                <button type="button" className="bg-[#491907] text-white font-bold py-3 px-8 rounded-sm text-xs tracking-widest uppercase hover:bg-black transition-all flex items-center gap-3">
                                    <Upload size={18} />
                                    {t.common.selectPhoto}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-white border-2 border-[#491907] p-2 pr-4 rounded-sm">
                                <div className="bg-[#491907] text-white p-2">
                                    <Upload size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase text-gray-400">{t.common.fileSelected}</span>
                                    <span className="text-sm font-bold text-gray-800 truncate max-w-[200px]">
                                        {selectedFile.name}
                                    </span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={removeFile} 
                                    className="ml-4 text-red-600 hover:text-red-800 font-black text-xs uppercase underline tracking-tighter"
                                >
                                    {t.common.remove}
                                </button>
                            </div>
                        )}
                        
                        {isEdit && initialData.ava && !selectedFile && (
                            <div className="flex items-center gap-4 border border-gray-200 p-2 bg-white">
                                <img src={`/uploads/${initialData.ava}`} className="w-16 h-12 object-cover" />
                                <span className="text-[10px] text-gray-400 font-bold uppercase italic">{t.common.currentPhoto}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Submit Action */}
                <div className="pt-6 flex justify-center pb-10">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full md:w-auto min-w-[300px] bg-[#491907] hover:bg-black text-white font-black py-4 px-12 rounded-sm text-sm tracking-[0.2em] uppercase disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-xl active:translate-y-0.5"
                    >
                        {isSubmitting ? (
                             <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{t.common.saving}</span>
                             </>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>{isEdit ? t.common.updateExisting : t.common.establishNew}</span>
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
