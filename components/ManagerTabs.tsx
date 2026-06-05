'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Layout, Table, Loader2 } from 'lucide-react';
import { deleteGoatAction, deleteFarmAction } from '@/lib/actions';
import { getTranslation, Locale } from '@/lib/translations';

interface ManagerTabsProps {
    initialFarms: any[];
    initialGoats: any[];
    lang: Locale;
}

export default function ManagerTabs({ initialFarms, initialGoats, lang }: ManagerTabsProps) {
    const [activeTab, setActiveTab] = useState<'goats' | 'farms'>('goats');
    const [farms, setFarms] = useState(initialFarms);
    const [goats, setGoats] = useState(initialGoats);
    const [isDeleting, setIsDeleting] = useState<number | string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBreed, setSelectedBreed] = useState('');
    const [selectedFarm, setSelectedFarm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const t = getTranslation(lang);

    // Reset page on filter/search/tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedBreed, selectedFarm, activeTab]);

    // Get unique breeds and farms for dropdown filters
    const uniqueBreeds = Array.from(new Set(goats.map(g => g.breed_name).filter(Boolean))).sort() as string[];
    const uniqueFarms = Array.from(new Set(goats.map(g => g.farm_name).filter(Boolean))).sort() as string[];

    const filteredGoats = goats.filter(g => {
        const matchesSearch = !searchTerm ? true : (
            g.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.breed_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.farm_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesBreed = !selectedBreed ? true : g.breed_name === selectedBreed;
        const matchesFarm = !selectedFarm ? true : g.farm_name === selectedFarm;
        return matchesSearch && matchesBreed && matchesFarm;
    });

    const filteredFarms = farms.filter(f => 
        !searchTerm ? true : f.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = activeTab === 'goats' ? filteredGoats.length : filteredFarms.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const paginatedGoats = filteredGoats.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const paginatedFarms = filteredFarms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDeleteGoat = async (id: number) => {
        if (!confirm(t.manage.deleteGoatConfirm)) return;
        setIsDeleting(id);
        const res = await deleteGoatAction(id);
        if (res?.success) {
            setGoats(goats.filter(g => g.id !== id));
        } else {
            alert(res?.error || t.errors.deleteFailed);
        }
        setIsDeleting(null);
    };

    const handleDeleteFarm = async (id: number) => {
        if (!confirm(t.manage.deleteFarmConfirm)) return;
        setIsDeleting(id);
        const res = await deleteFarmAction(id);
        if (res?.success) {
            setFarms(farms.filter(f => f.id !== id));
        } else {
            alert(res?.error || t.errors.deleteFailed);
        }
        setIsDeleting(null);
    };

    return (
        <div className="space-y-6">
            {/* Tab Switched & Search / Filters */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
                <div className="flex gap-2 p-2 bg-gray-100/80 rounded-xl border border-gray-200 shadow-inner self-start">
                    <button 
                        onClick={() => {
                            setActiveTab('goats');
                            setSelectedBreed('');
                            setSelectedFarm('');
                        }}
                        className={`px-8 py-3.5 rounded-lg text-base md:text-lg font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'goats' ? 'bg-[#491907] text-white shadow-md' : 'hover:bg-gray-200/50 text-gray-500'}`}
                    >
                        <Table size={20} /> {t.manage.goats} ({filteredGoats.length})
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('farms');
                            setSelectedBreed('');
                            setSelectedFarm('');
                        }}
                        className={`px-8 py-3.5 rounded-lg text-base md:text-lg font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'farms' ? 'bg-[#491907] text-white shadow-md' : 'hover:bg-gray-200/50 text-gray-500'}`}
                    >
                        <Layout size={20} /> {t.manage.farms} ({filteredFarms.length})
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
                    {/* Search Field */}
                    <div className="relative flex-1 sm:flex-initial sm:w-64">
                        <input 
                            type="text"
                            placeholder={t.manage.searchRecords}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium outline-none focus:border-[#491907] focus:ring-1 focus:ring-[#491907] transition-all shadow-sm"
                        />
                    </div>

                    {/* Breed & Farm Filters for Goats */}
                    {activeTab === 'goats' && (
                        <>
                            <select
                                value={selectedBreed}
                                onChange={(e) => setSelectedBreed(e.target.value)}
                                className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium outline-none focus:border-[#491907] focus:ring-1 focus:ring-[#491907] transition-all shadow-sm cursor-pointer"
                            >
                                <option value="">{lang === 'ru' ? 'Все породы' : lang === 'uk' ? 'Усі породи' : 'All Breeds'}</option>
                                {uniqueBreeds.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>

                            <select
                                value={selectedFarm}
                                onChange={(e) => setSelectedFarm(e.target.value)}
                                className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium outline-none focus:border-[#491907] focus:ring-1 focus:ring-[#491907] transition-all shadow-sm cursor-pointer"
                            >
                                <option value="">{lang === 'ru' ? 'Все хозяйства' : lang === 'uk' ? 'Усі господарства' : 'All Farms'}</option>
                                {uniqueFarms.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </>
                    )}

                    {(searchTerm || selectedBreed || selectedFarm) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedBreed('');
                                setSelectedFarm('');
                            }}
                            className="px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 text-sm font-semibold rounded-lg border border-amber-200 transition-all text-center"
                        >
                            {lang === 'ru' ? 'Сбросить' : lang === 'uk' ? 'Скинути' : 'Reset'}
                        </button>
                    )}
                </div>
            </div>

            {/* List Content */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden min-h-[500px] flex flex-col justify-between">
                <div>
                    {activeTab === 'goats' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100/50 text-sm md:text-base font-extrabold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                                        <th className="p-6">{t.goats.nickname}</th>
                                        <th className="p-6">{t.goats.breed}</th>
                                        <th className="p-6">{t.goats.farm}</th>
                                        <th className="p-6 text-right">{t.manage.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedGoats.map((goat) => (
                                        <tr key={goat.id} className="hover:bg-amber-50/10 transition-all group">
                                            <td className="p-6 text-[#491907] font-black text-xl md:text-2xl tracking-tight">{goat.nickname}</td>
                                            <td className="p-6 text-gray-800 font-semibold text-sm md:text-base">{goat.breed_name || '-'}</td>
                                            <td className="p-6 text-gray-700 font-semibold text-sm md:text-base">{goat.farm_name || t.goats.individual}</td>
                                            <td className="p-6 text-right space-x-2 whitespace-nowrap">
                                                <Link href={`/catalog/goats/fix/${goat.id}`} className="inline-flex p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm">
                                                    <Pencil size={18} />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDeleteGoat(goat.id)}
                                                    disabled={isDeleting === goat.id}
                                                    className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-sm disabled:opacity-30"
                                                >
                                                    {isDeleting === goat.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100/50 text-sm md:text-base font-extrabold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                                        <th className="p-6">{t.manage.farmName}</th>
                                        <th className="p-6">{t.manage.ownerRef}</th>
                                        <th className="p-6 text-right">{t.manage.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedFarms.map((farm) => (
                                        <tr key={farm.id} className="hover:bg-emerald-50/10 transition-all group">
                                            <td className="p-6 text-[#491907] font-black text-xl md:text-2xl uppercase tracking-tight">{farm.name}</td>
                                            <td className="p-6 text-gray-500 font-mono text-sm"># {farm.id}</td>
                                            <td className="p-6 text-right space-x-2 whitespace-nowrap">
                                                <Link href={`/farms/${farm.id}/edit`} className="inline-flex p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm">
                                                    <Pencil size={18} />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDeleteFarm(farm.id)}
                                                    disabled={isDeleting === farm.id}
                                                    className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-sm disabled:opacity-30"
                                                >
                                                    {isDeleting === farm.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-6 py-5 rounded-b-2xl">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                &larr; {lang === 'ru' ? 'Назад' : lang === 'uk' ? 'Назад' : 'Prev'}
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {lang === 'ru' ? 'Вперед' : lang === 'uk' ? 'Вперед' : 'Next'} &rarr;
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-base text-gray-700">
                                    {lang === 'ru' ? 'Показано с' : lang === 'uk' ? 'Показано з' : 'Showing'}{' '}
                                    <span className="font-extrabold">{((currentPage - 1) * itemsPerPage) + 1}</span>{' '}
                                    {lang === 'ru' ? 'по' : lang === 'uk' ? 'по' : 'to'}{' '}
                                    <span className="font-extrabold">{Math.min(currentPage * itemsPerPage, totalItems)}</span>{' '}
                                    {lang === 'ru' ? 'из' : lang === 'uk' ? 'з' : 'of'}{' '}
                                    <span className="font-extrabold">{totalItems}</span>{' '}
                                    {lang === 'ru' ? 'записей' : lang === 'uk' ? 'записів' : 'results'}
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-l-md px-4 py-2.5 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        &larr;
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        // limit shown pages if too many
                                        if (totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                                            if (page === 2 || page === totalPages - 1) {
                                                return <span key={page} className="relative inline-flex items-center px-4 py-2.5 text-base font-bold text-gray-700 ring-1 ring-inset ring-gray-300">...</span>;
                                            }
                                            return null;
                                        }
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`relative inline-flex items-center px-5 py-2.5 text-base font-extrabold focus:z-20 cursor-pointer ${
                                                    currentPage === page
                                                        ? 'z-10 bg-[#491907] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#491907]'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center rounded-r-md px-4 py-2.5 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        &rarr;
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
