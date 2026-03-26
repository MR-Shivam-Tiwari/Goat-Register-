'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTranslation, Locale } from '@/lib/translations';

export default function AddGoatForm({ breeds, farms, lang }: { breeds: any[], farms: any[], lang: Locale }) {
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const t = getTranslation(lang);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push('/catalog/goats/list?success=1');
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-8 md:p-12 shadow-sm font-sans">
            <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-8 gap-4">
                 <div>
                     <h2 className="text-2xl font-bold text-gray-800">{t.goats.addTitle}</h2>
                     <p className="text-sm text-gray-500 mt-1">{t.goats.officialDetails}</p>
                 </div>
                 <Link href="/catalog/goats" className="text-sm font-semibold text-[#491907] hover:text-[#6D260D] bg-amber-50 px-5 py-2.5 rounded-xl transition-all active:scale-95 whitespace-nowrap">
                     ← {t.nav.catalog}
                 </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* General Info */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">{t.goats.nickname}</label>
                            <input 
                                name="nickname"
                                type="text" 
                                placeholder={t.goats.nickname}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#491907]/20 focus:border-[#491907] transition-shadow"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">{t.goats.breed}</label>
                            <select name="breed" className="w-full border border-gray-300 rounded-md px-4 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm">
                                {breeds.map((breed: any) => (
                                    <option key={breed.id} value={breed.id}>{breed.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">{t.goats.farm}</label>
                            <select name="farm" className="w-full border border-gray-300 rounded-md px-4 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm">
                                <option value="0">{t.goats.withoutFarm}</option>
                                {farms.map((farm: any) => (
                                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Status & Type */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">{t.goats.sex}</label>
                            <select name="sex" className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                                <option value="female">{t.goats.female}</option>
                                <option value="male">{t.goats.male}</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">{t.goats.studbook}</label>
                            <select name="studbook" className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                                <option value="main">{t.goats.mainRegister}</option>
                                <option value="f1">{t.goats.rcbF1}</option>
                                <option value="ex">{t.goats.experimental}</option>
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1.5 flex-1">
                                <label className="text-sm font-semibold text-gray-700">{t.goats.status}</label>
                                <select name="status" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option value="no_info">{t.goats.noInfo}</option>
                                    <option value="alive">{t.goats.alive}</option>
                                    <option value="dead">{t.goats.dead}</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                                <label className="text-sm font-semibold text-gray-700">{t.goats.abgMember}</label>
                                <select name="abg" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option value="no">{t.users.no}</option>
                                    <option value="yes">{t.users.yes}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                    <h3 className="text-base font-bold text-gray-800 mb-4">{t.goats.assessmentDates}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                             <label className="text-sm font-medium text-gray-600">{t.goats.birthDate}</label>
                             <input type="text" placeholder="DD.MM.YYYY" className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                             <label className="text-sm font-medium text-gray-600">{t.goats.deathDate}</label>
                             <input type="text" placeholder="DD.MM.YYYY" className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                             <label className="text-sm font-medium text-gray-600">{t.goats.birthWeight}</label>
                             <input type="text" placeholder="e.g. 3500" className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                             <label className="text-sm font-medium text-gray-600">{t.goats.score}</label>
                             <input type="text" placeholder={t.goats.score} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                    <h3 className="text-base font-bold text-gray-800 mb-4">{t.goats.ownershipId}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-1.5">
                             <label className="text-sm font-medium text-gray-600">{t.goats.breeder}</label>
                             <input type="text" placeholder={t.goats.breeder} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                             <label className="text-sm font-medium text-gray-600">{t.goats.owner}</label>
                             <input type="text" placeholder={t.goats.owner} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder={t.goats.idUa} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                        <input type="text" placeholder={t.goats.idAbg} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                        <input type="text" placeholder={t.goats.chipId} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                        <input type="text" placeholder={t.goats.idInt} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                        <input type="text" placeholder={t.goats.certSeries} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                        <input type="text" placeholder={t.goats.certNum} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">{t.goats.genetic}</label>
                        <textarea placeholder={t.goats.genetic} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none shadow-sm"></textarea>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">{t.goats.source}</label>
                        <textarea placeholder={t.goats.source} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none shadow-sm"></textarea>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">{t.goats.notes}</label>
                        <textarea placeholder={t.goats.notes} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none shadow-sm"></textarea>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                    <label className="text-sm font-semibold text-gray-800 block mb-2">{t.goats.photo}</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {!selectedFile ? (
                            <input 
                                type="file" 
                                onChange={handleFileChange} 
                                className="block w-full sm:w-auto text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer shadow-sm transition-colors"
                            />
                        ) : (
                            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-2 rounded-md">
                                <span className="text-sm font-medium text-blue-800 max-w-[200px] truncate">{selectedFile.name}</span>
                                <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors font-bold text-lg leading-none cursor-pointer" title="Remove image">
                                    &times;
                                </button>
                            </div>
                        )}
                        <span className="text-xs text-gray-400">{t.goats.photoFormats}</span>
                    </div>
                </div>

                <div className="pt-8 flex justify-center border-t border-gray-100">
                    <button type="submit" className="bg-[#491907] hover:bg-[#6D260D] text-white font-bold py-4 px-16 rounded-xl shadow-lg transition-all active:scale-95 text-lg tracking-wide uppercase">
                        {t.goats.addToRegistry}
                    </button>
                </div>

            </form>
        </div>
    );
}
