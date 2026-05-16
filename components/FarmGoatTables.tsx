"use client";

import { useState } from "react";
import Link from "next/link";
import { Truck, X, Pencil } from "lucide-react";

export default function FarmGoatTables({ 
    goats, 
    displaced, 
    t, 
    lang, 
    sessionUser, 
    farmId 
}: { 
    goats: any[], 
    displaced: any[], 
    t: any, 
    lang: string, 
    sessionUser: any, 
    farmId: string 
}) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const isAdmin = sessionUser && sessionUser.role >= 10;

    const renderTable = (data: any[], title: string, colorClass: string, rowBgColor: string, headerBg: string, actionColor: string) => (
        <div className="space-y-4">
            <header className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                    {title}
                </h2>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    {data.length} RECORDS FOUND
                </div>
            </header>

            <div className="flex-1 min-h-[150px] overflow-auto bg-white border border-black relative">
                <table className="w-full text-left border-collapse table-auto min-w-[1300px] text-[10.5px] font-normal leading-none">
                    <thead className="sticky top-0 z-30 shadow-sm">
                        <tr className={`text-[9px] font-bold uppercase tracking-tight text-white ${headerBg} border-b border-black`}>
                            <th colSpan={11} className="p-1.5 text-center border-r border-black uppercase tracking-widest">
                                {title}
                            </th>
                        </tr>
                        <tr className={`text-[9px] font-bold uppercase tracking-tight text-gray-900 border-b border-black ${colorClass}`}>
                            <th className="p-1 px-4 border-r border-black text-center w-12">IMG</th>
                            <th className={`p-1 px-4 border-r border-black sticky left-0 ${colorClass} z-40 w-64`}>{t.goats.nickname}</th>
                            <th className="p-1 px-4 border-r border-black text-center">{t.goats.breed}</th>
                            <th className="p-1 px-4 border-r border-black text-center w-24">Σ %</th>
                            <th className="p-1 px-4 border-r border-black text-center w-24">{t.goats.sex} (Floor)</th>
                            <th className="p-1 px-4 border-r border-black text-center w-24">{t.goats.idAbg}</th>
                            <th className="p-1 px-4 border-r border-black text-center">{t.goats.farm}</th>
                            <th className="p-1 px-4 border-r border-black text-center">{t.goats.breeder}</th>
                            <th className="p-1 px-4 border-r border-black text-center">{t.goats.owner}</th>
                            <th className="p-1 px-4 border-r border-black text-center w-36">{t.goats.birthDate || "Born"}</th>
                            <th className="p-1 px-4 border-black text-center w-24">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black bg-white">
                        {data.map((goat, idx) => {
                            const hasAccess = sessionUser && (sessionUser.role >= 10 || sessionUser.id === goat.id_user);
                            const bg = idx % 2 === 0 ? "#FFFFFF" : rowBgColor;
                            return (
                                <tr key={goat.id} style={{ backgroundColor: bg }} className="divide-x divide-black h-8 hover:opacity-90 transition-opacity">
                                    <td className="p-0 border-r border-black text-center">
                                        <div 
                                            className="w-10 h-10 mx-auto bg-gray-50 flex items-center justify-center overflow-hidden cursor-zoom-in"
                                            onClick={() => goat.main_photo && setPreviewImage(`/uploads/${goat.main_photo}`)}
                                        >
                                            {goat.main_photo ? (
                                                <img src={`/uploads/${goat.main_photo}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[7px] text-gray-300">NO IMG</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ backgroundColor: bg }} className={`p-1 px-4 sticky left-0 z-20 border-r border-black font-bold whitespace-nowrap`}>
                                        {hasAccess ? (
                                            <a href={`/goats/${goat.id}`} target="_blank" rel="noopener noreferrer" className={`hover:underline flex items-center gap-2 ${actionColor.replace('bg-', 'text-')}`}>
                                                <span className="opacity-30">➔</span>{goat.name}
                                            </a>
                                        ) : (
                                            <span className={`flex items-center gap-2 opacity-50 ${actionColor.replace('bg-', 'text-')}`}>
                                                <span className="opacity-30">➔</span>{goat.name}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-1 px-4 text-center uppercase opacity-80">{goat.breed_name}</td>
                                    <td className="p-1 px-4 text-center font-bold text-blue-900">{goat.blood_percent ? `${goat.blood_percent}%` : "-"}</td>
                                    <td className="p-1 px-4 text-center uppercase font-bold">{goat.sex === 1 ? "BUCK" : "DOE"}</td>
                                    <td className="p-1 px-4 text-center font-bold">{goat.is_abg === 1 ? t.users.yes : t.users.no}</td>
                                    <td className="p-1 px-4 text-center truncate max-w-[200px] opacity-70">
                                        {goat.id_farm === 0 || !goat.id_farm ? (t.goats.withoutFarm || "Without a farm") : (goat.current_farm_name || "-")}
                                    </td>
                                    <td className="p-1 px-4 truncate max-w-[250px] uppercase">{goat.manuf}</td>
                                    <td className="p-1 px-4 truncate max-w-[250px] uppercase">{goat.owner}</td>
                                    <td className="p-1 px-4 text-center font-mono tabular-nums border-r border-black">
                                        {goat.date_born ? new Date(goat.date_born).toLocaleDateString("ru-RU") : "-"}
                                    </td>
                                    <td className="p-1 px-4 text-center flex items-center justify-center gap-1">
                                        {isAdmin && (
                                            <Link 
                                                href={`/catalog/goats/fix/${goat.id}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#491907] text-white rounded-md font-black text-[10px] uppercase hover:bg-black transition-all shadow-md group"
                                            >
                                                <Pencil size={12} className="group-hover:scale-110 transition-transform" />
                                                <span>{t.common.edit || "EDIT"}</span>
                                            </Link>
                                        )}
                                        <Link 
                                            href={`/goats/${goat.id}/move?mode=add&targetFarm=${farmId}`}
                                            target="_blank"
                                            className={`inline-flex items-center justify-center p-1.5 ${actionColor} text-white rounded-sm hover:bg-black transition-all shadow-sm`}
                                            title={t.goats.animalMovement}
                                        >
                                            <Truck size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 gap-12 pt-12">
            {/* IMAGE PREVIEW MODAL */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="bg-white p-2 rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh] relative">
                        <button 
                            className="absolute -top-10 right-0 text-white flex items-center gap-2 font-bold uppercase text-xs"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X size={20} /> Close
                        </button>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-[80vh] object-contain rounded"
                        />
                    </div>
                </div>
            )}

            {renderTable(goats, t.farms.activeStock || "ACTIVE STOCK REGISTRY", "bg-[#DCFCE7]", "#DCFCE7", "bg-[#491907]", "bg-[#491907]")}
            {displaced.length > 0 && renderTable(displaced, t.farms.displacedStock || "DISPLACED STOCK", "bg-red-50", "#FEF2F2", "bg-red-950", "bg-red-950")}
        </div>
    );
}
