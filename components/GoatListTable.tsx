"use client";

import { useState } from "react";
import { X } from "lucide-react";
import GoatDeleteButton from "@/components/GoatDeleteButton";

export default function GoatListTable({
  goats,
  t,
  lang,
  user,
  isAdmin,
}: {
  goats: any[];
  t: any;
  lang: string;
  user: any;
  isAdmin: boolean;
}) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <>
      {/* ── IMAGE PREVIEW MODAL ── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl overflow-hidden relative max-w-[90vw] max-h-[90vh] flex flex-col"
            style={{ backgroundColor: "#ffffff", opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/60 hover:bg-black rounded-full flex items-center justify-center text-white transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain"
              style={{ opacity: 1, display: "block" }}
            />
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      <div className="overflow-hidden border border-gray-300 shadow-sm transition-all duration-300">
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar">
          <table className="w-full text-left border-collapse table-auto min-w-[1200px]">
            <thead className="sticky top-0 z-30 shadow-sm transition-all duration-300">
              <tr className="text-[10px] font-black uppercase tracking-tight text-white bg-[#4D2C1A] text-center h-10 border-b border-gray-400">
                <th className="p-2 border-r border-white/10 w-64 col-sticky-md bg-[#491907]">
                  {t.goats.nickname}
                </th>
                <th className="p-2 border-r border-white/10 w-24 text-[#B5E6FF]">
                  Σ %
                </th>
                <th className="p-2 border-r border-white/10 w-40">
                  {t.goats.uniqueCode}
                </th>
                <th className="p-2 border-r border-white/10 w-32">
                  {t.goats.sex}
                </th>
                <th className="p-2 border-r border-white/10 w-48">
                  {t.goats.breed}
                </th>
                <th className="p-2 border-r border-white/10 w-56 text-[#E2F0D9]">
                  {t.goats.offspringPlus}
                </th>
                <th className="p-2 border-r border-white/10 w-40">
                  {t.goats.added}
                </th>
                <th className="p-2 border-r border-white/10 w-40">
                  {t.goats.operator}
                </th>
                {isAdmin && <th className="p-2 w-20">{t.goats.managementShort}</th>}
              </tr>
            </thead>
            <tbody className="text-[10px] uppercase font-bold text-gray-700 bg-white">
              {goats.map((goat: any, idx: number) => {
                const uniqueCode =
                  (goat.is_reg ? "R" : "X") + (10000 + Number(goat.id));
                let rowBg = "bg-white";
                if (goat.status === 0) rowBg = "bg-[#EF9A9A]/60";
                else if (goat.is_reg) rowBg = "bg-[#D7FDB5]/60";
                else rowBg = "bg-[#E3F2FD]/60";

                const photoSrc = goat.main_photo
                  ? `/api/uploads/${goat.main_photo}`
                  : null;

                return (
                  <tr
                    key={goat.id}
                    className={`h-11 border-b border-gray-200 hover:bg-blue-100 transition-all ${rowBg}`}
                  >
                    {/* NICKNAME + THUMBNAIL (sticky on md+) */}
                    <td className="p-1 border-r border-gray-100 flex items-center gap-3 col-sticky-md bg-inherit shadow-[1px_0_0_0_rgba(0,0,0,0.05)] h-full">
                      {/* Thumbnail — clickable */}
                      <div
                        className={`w-9 h-9 border border-gray-300 rounded overflow-hidden flex-shrink-0 bg-white shadow-sm ml-1 ${photoSrc ? "cursor-zoom-in" : ""}`}
                        onClick={() => photoSrc && setPreviewImage(photoSrc)}
                        title={photoSrc ? "Click to enlarge" : undefined}
                      >
                        {photoSrc ? (
                          <img
                            src={photoSrc}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-[8px]">
                            NO IMG
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex items-center gap-2">
                        {(() => {
                          const canAccess = user && user.role >= 10;
                          if (!canAccess) {
                            return (
                              <span className="text-[#491907] text-lg font-bold">
                                {goat.name}
                              </span>
                            );
                          }
                          return (
                            <a
                              href={`/goats/${goat.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-amber-900 text-lg underline underline-offset-2 overflow-hidden text-ellipsis whitespace-nowrap font-bold"
                            >
                              {goat.name}
                            </a>
                          );
                        })()}
                      </div>
                    </td>

                    <td className="p-2 border-r text-md border-gray-100 text-center font-black text-blue-700 bg-blue-50/20">
                      {goat.blood_percent ? `${goat.blood_percent}%` : "-"}
                    </td>
                    <td className="p-2 border-r text-lg border-gray-100 text-center font-mono text-gray-800 font-bold">
                      {uniqueCode}
                    </td>
                    <td className="p-2 border-r text-md border-gray-100 text-center font-black">
                      {goat.sex === 1 ? t.goats.maleShort : t.goats.femaleShort}
                    </td>
                    <td className="p-2 border-r text-md border-gray-100 text-center font-black opacity-80">
                      {goat.breed_alias || goat.breed_name}
                    </td>
                    <td className="p-2 border-r text-md border-gray-100 text-center flex items-center justify-center gap-4 h-full">
                      {(() => {
                        const canAccess = user && user.role >= 10;
                        if (!canAccess) {
                          return (
                            <>
                              <span className="text-gray-500">{t.goats.sonPlus}</span>
                              <span className="text-gray-500">{t.goats.daughterPlus}</span>
                            </>
                          );
                        }
                        return (
                          <>
                            <a href={`/goats/${goat.id}/offspring?sex=male`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {t.goats.sonPlus}
                            </a>
                            <a href={`/goats/${goat.id}/offspring?sex=female`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {t.goats.daughterPlus}
                            </a>
                          </>
                        );
                      })()}
                    </td>
                    <td className="p-2 border-r text-md border-gray-100 text-center opacity-60 font-mono">
                      {goat.time_added
                        ? new Date(goat.time_added).toLocaleDateString(
                            lang === "ru" ? "ru-RU" : "en-US",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "-"}
                    </td>
                    <td className="p-2 border-r text-md border-gray-100 text-center text-gray-400 font-black">
                      {goat.operator || "SYSTEM"}
                    </td>
                    {isAdmin && (
                      <td className="p-2 text-center flex items-center justify-center gap-1.5 h-full">
                        <a
                          href={`/catalog/goats/fix/${goat.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-sm hover:border-amber-900 hover:text-amber-900 transition-colors shadow-sm font-black text-xs text-blue-600"
                          title="Management / Edit"
                        >
                          P
                        </a>
                        <GoatDeleteButton
                          goatId={goat.id}
                          confirmMsg={
                            t.manage?.deleteGoatConfirm ||
                            "Are you sure you want to delete this goat?"
                          }
                          titleText={t.common?.remove || "Delete"}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
              {goats.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 9 : 8}
                    className="p-32 text-center text-gray-200 font-black uppercase tracking-[1em] text-2xl"
                  >
                    {t.goats.emptyRegistry}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
