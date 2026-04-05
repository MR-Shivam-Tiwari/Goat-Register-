'use client';

import { useState } from 'react';
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
    const t = getTranslation(lang);

    const filteredGoats = goats.filter(g => 
        g.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.breed_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.farm_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFarms = farms.filter(f => 
        f.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            {/* Tab Switched & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-4 p-2 bg-white rounded-sm border border-gray-100 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('goats')}
                        className={`px-8 py-3 rounded-sm text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'goats' ? 'bg-[#491907] text-white' : 'hover:bg-gray-50 text-gray-400'}`}
                    >
                        <Table size={16} /> {t.manage.goats} ({filteredGoats.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('farms')}
                        className={`px-8 py-3 rounded-sm text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'farms' ? 'bg-[#491907] text-white' : 'hover:bg-gray-50 text-gray-400'}`}
                    >
                        <Layout size={16} /> {t.manage.farms} ({filteredFarms.length})
                    </button>
                </div>

                <div className="w-full md:w-64">
                    <input 
                        type="text"
                        placeholder={t.manage.searchRecords}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-sm text-xs font-bold uppercase tracking-widest outline-none focus:border-[#491907] transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="bg-white rounded-sm border border-gray-100 shadow-xl overflow-hidden min-h-[500px]">
                {activeTab === 'goats' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-[11px] font-black uppercase tracking-widest text-gray-500 border-b">
                                    <th className="p-4">{t.goats.nickname}</th>
                                    <th className="p-4">{t.goats.breed}</th>
                                    <th className="p-4">{t.goats.farm}</th>
                                    <th className="p-4 text-right">{t.manage.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-bold divide-y divide-gray-50">
                                {filteredGoats.map((goat) => (
                                    <tr key={goat.id} className="hover:bg-amber-50/20 transition-all group">
                                        <td className="p-4 text-[#491907] font-black italic">{goat.nickname}</td>
                                        <td className="p-4 opacity-60">{goat.breed_name || '-'}</td>
                                        <td className="p-4 opacity-60 font-mono text-[10px]">{goat.farm_name || t.goats.individual}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <Link href={`/catalog/goats/fix/${goat.id}`} className="inline-flex p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-sm transition-all shadow-sm">
                                                <Pencil size={14} />
                                            </Link>
                                            <button 
                                                onClick={() => handleDeleteGoat(goat.id)}
                                                disabled={isDeleting === goat.id}
                                                className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-sm transition-all shadow-sm disabled:opacity-30"
                                            >
                                                {isDeleting === goat.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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
                                <tr className="bg-gray-50 text-[11px] font-black uppercase tracking-widest text-gray-500 border-b">
                                    <th className="p-4">{t.manage.farmName}</th>
                                    <th className="p-4">{t.manage.ownerRef}</th>
                                    <th className="p-4 text-right">{t.manage.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-bold divide-y divide-gray-50">
                                {filteredFarms.map((farm) => (
                                    <tr key={farm.id} className="hover:bg-emerald-50/20 transition-all group">
                                        <td className="p-4 text-[#491907] font-black italic uppercase">{farm.name}</td>
                                        <td className="p-4 opacity-30 font-mono text-[10px]"># {farm.id}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <Link href={`/farms/${farm.id}/edit`} className="inline-flex p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-sm transition-all shadow-sm">
                                                <Pencil size={14} />
                                            </Link>
                                            <button 
                                                onClick={() => handleDeleteFarm(farm.id)}
                                                disabled={isDeleting === farm.id}
                                                className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-sm transition-all shadow-sm disabled:opacity-30"
                                            >
                                                {isDeleting === farm.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
