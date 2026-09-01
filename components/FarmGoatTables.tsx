"use client";

import { useState } from "react";
import Link from "next/link";
import { Truck, X, Pencil, Trash2 } from "lucide-react";
import { deleteGoatAction } from "@/lib/actions";
import { useRouter } from "next/navigation";

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
    const router = useRouter();

    const isAdmin = sessionUser && sessionUser.role >= 10;

    const renderTable = (data: any[], title: string, colorClass: string, rowBgColor: string, headerBg: string, actionColor: string) => (
        <div className="space-y-3">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                <h2 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tighter">
                    {title}
                </h2>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    {data.length} RECORDS FOUND
                </div>
            </header>

            <div className="flex-1 min-h-[150px] overflow-x-auto bg-white border border-black relative">
                <table className="w-full text-left border-collapse table-auto min-w-[1000px] md:min-w-[1300px] text-[13px] md:text-[15px] font-semibold leading-none text-gray-900">
                    <thead className="sticky top-0 z-30 shadow-sm">
                        <tr className={`text-[12px] md:text-[14px] font-black uppercase tracking-widest text-white ${headerBg} border-b border-black`}>
                            <th colSpan={isAdmin ? 11 : 10} className="p-2 md:p-4 text-center border-r border-black uppercase tracking-widest">
                                {title}
                            </th>
                        </tr>
                        <tr className={`text-[11px] md:text-[13px] font-black uppercase tracking-wider text-gray-900 border-b border-black ${colorClass}`}>
                            <th className="p-2 md:p-3.5 px-2 md:px-4 border-r border-black text-center w-12 md:w-16">IMG</th>
                            <th className="p-2 md:p-3.5 px-2 md:px-4 border-r border-black text-center col-sticky-md bg-inherit w-40 md:w-64">{t.goats.nickname}</th>
                            <th className="p-2 md:p-3.5 px-2 md:px-4 border-r border-black text-center">{t.goats.breed}</th>
                            <th className="p-2 md:p-3.5 px-2 md:px-4 border-r border-black text-center w-16 md:w-24">Σ %</th>
                            <th className="p-2 md:p-3.5 px-2 md:px-4 border-r border-black text-center w-20 md:w-24">{t.goats.sex}</th>
                            <th className="p-2 md:p-3.5 px-2 md:px-4 border-r border-black text-center w-20 md:w-24">{t.goats.idAbg}</th>
                            <th className="p-2 md:p-3.5 px-2 md:px-4 border-r border-black text-center">{t.goats.farm}</th>
                            <th className="p-2 md:p-3.5 px-2 md:px-4 border-r border-black text-center">{t.goats.breeder}</th>
                            <th className="p-2 md:p-3.5 px-2 md:px-4 border-r border-black text-center">{t.goats.owner}</th>
                            <th className="p-2 md:p-3.5 px-2 md:px-4 border-r border-black text-center w-28 md:w-36">{t.goats.birthDate || "Born"}</th>
                            {isAdmin && <th className="p-2 md:p-3.5 px-2 md:px-4 border-black text-center w-40 md:w-56">ACTIONS</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black bg-white">
                        {data.map((goat, idx) => {
                            const isFarmOwner = sessionUser?.farms 
                                ? String(sessionUser.farms).split(',').map(f => f.trim()).includes(String(farmId))
                                : false;
                            const hasAccess = sessionUser && (sessionUser.role >= 10 || sessionUser.id === goat.id_user || isFarmOwner);
                            const bg = idx % 2 === 0 ? "#FFFFFF" : rowBgColor;
                            return (
                                <tr key={goat.id} style={{ backgroundColor: bg }} className="divide-x divide-black hover:opacity-95 transition-opacity">
                                    <td className="p-2 md:p-3.5 md:px-4 border-r border-black text-center">
                                        <div 
                                            className="w-10 h-10 md:w-14 md:h-14 mx-auto bg-gray-50 flex items-center justify-center overflow-hidden cursor-zoom-in border border-gray-200 rounded-sm shadow-sm"
                                            onClick={() => goat.main_photo && setPreviewImage(`/api/uploads/${goat.main_photo}`)}
                                        >
                                            {goat.main_photo ? (
                                                <img src={`/api/uploads/${goat.main_photo}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[9px] text-gray-300 font-bold uppercase">NO IMG</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-2 md:p-3.5 md:px-4 border-r border-black font-extrabold text-[13px] md:text-[15px] whitespace-nowrap col-sticky-md" style={{ backgroundColor: bg }}>
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
                                    <td className="p-2 md:p-3.5 md:px-4 text-center uppercase font-bold opacity-90">{goat.breed_name}</td>
                                    <td className="p-2 md:p-3.5 md:px-4 text-center font-black text-blue-900 text-[13px] md:text-[15px]">{goat.blood_percent ? `${goat.blood_percent}%` : "-"}</td>
                                    <td className="p-2 md:p-3.5 md:px-4 text-center uppercase font-black">{goat.sex === 1 ? "BUCK" : "DOE"}</td>
                                    <td className="p-2 md:p-3.5 md:px-4 text-center font-black">{goat.is_abg === 1 ? t.users.yes : t.users.no}</td>
                                    <td className="p-2 md:p-3.5 md:px-4 text-center truncate max-w-[150px] md:max-w-[200px] font-semibold opacity-85">
                                        {goat.id_farm === 0 || !goat.id_farm ? (t.goats.withoutFarm || "Without a farm") : (goat.current_farm_name || "-")}
                                    </td>
                                    <td className="p-2 md:p-3.5 md:px-4 truncate max-w-[150px] md:max-w-[250px] uppercase font-semibold">{goat.manuf}</td>
                                    <td className="p-2 md:p-3.5 md:px-4 truncate max-w-[150px] md:max-w-[250px] uppercase font-semibold">{goat.owner}</td>
                                    <td className="p-2 md:p-3.5 md:px-4 text-center font-mono font-bold tabular-nums border-r border-black">
                                        {goat.date_born ? new Date(goat.date_born).toLocaleDateString("ru-RU") : "-"}
                                    </td>
                                    {isAdmin && (
                                        <td className="p-2 md:p-3.5 md:px-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 md:gap-2.5 flex-wrap">
                                            <Link 
                                                href={`/catalog/goats/fix/${goat.id}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 bg-[#491907] text-white rounded-md font-black text-[10px] md:text-[12.5px] uppercase hover:bg-black transition-all shadow-md group"
                                            >
                                                <Pencil size={11} className="group-hover:scale-110 transition-transform" />
                                                <span className="hidden sm:inline">{t.common.edit || "EDIT"}</span>
                                            </Link>
                                            <button 
                                                onClick={async () => {
                                                    if (window.confirm(t.common.deleteGoatConfirm || "Are you sure you want to delete this goat?")) {
                                                        const res = await deleteGoatAction(goat.id);
                                                        if (res.success) {
                                                            router.refresh();
                                                        } else {
                                                            alert(res.error || "Failed to delete goat");
                                                        }
                                                    }
                                                }}
                                                className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 bg-[#491907] text-white rounded-md font-black text-[10px] md:text-[12.5px] uppercase hover:bg-black transition-all shadow-md group cursor-pointer"
                                                title={t.common.delete || "Delete"}
                                            >
                                                <Trash2 size={11} className="group-hover:scale-110 transition-transform" />
                                                <span className="hidden sm:inline">{t.common.delete || "DELETE"}</span>
                                            </button>
                                            <Link 
                                                href={`/goats/${goat.id}/move?mode=add&targetFarm=${farmId}`}
                                                target="_blank"
                                                className={`inline-flex items-center justify-center p-2 md:p-2.5 rounded-md text-white hover:bg-black transition-all shadow-md bg-[#491907]`}
                                                title={t.goats.animalMovement}
                                            >
                                                <Truck size={14} />
                                            </Link>
                                            </div>
                                        </td>
                                    )}

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
                    <div 
                        className="bg-white p-2 rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh] relative"
                        style={{ backgroundColor: "#ffffff", opacity: 1 }}
                    >
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
                            style={{ opacity: 1, display: "block" }}
                        />
                    </div>
                </div>
            )}

            {renderTable(goats, t.farms.activeStock || "ACTIVE STOCK REGISTRY", "bg-[#DCFCE7]", "#DCFCE7", "bg-[#491907]", "bg-[#491907]")}
            {displaced.length > 0 && renderTable(displaced, t.farms.displacedStock || "DISPLACED STOCK", "bg-red-50", "#FEF2F2", "bg-red-950", "bg-red-950")}
        </div>
    );
}
