"use client";

import Link from "next/link";
import { ImageIcon, Pencil } from "lucide-react";

interface Breed {
  id: number;
  name: string;
  alias: string;
  id_family: number;
  place: number;
  ico: string;
  total_animals: string | number;
  living_animals: string | number;
}

interface BreedCatalogGridProps {
  breeds: Breed[];
  t: any;
  isAdmin?: boolean;
}

export default function BreedCatalogDisplay({
  breeds,
  t,
  isAdmin = false,
}: BreedCatalogGridProps) {
  // Sort solely by database 'place' and then name
  const sortedBreeds = [...(breeds || [])]
    .filter((b) => b && b.alias?.trim() !== "CHB")
    .sort((a, b) => (a.place - b.place) || a.name.localeCompare(b.name));

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
      suppressHydrationWarning
    >
      {sortedBreeds.map((breed) => {
        const displayName = breed.name;
        const hasImage = breed.ico && breed.ico.trim() !== "";

        return (
          <div key={breed.id} className="relative group">
            <Link
              href={`/catalog/goats/${breed.alias?.trim()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-[#491907]/5 rounded-xl overflow-hidden hover:border-[#491907]/30 hover:shadow-[0_15px_40px_rgba(73,25,7,0.08)] transition-all duration-500 flex flex-col shadow-sm h-full"
            >
              {/* IMAGE SECTION */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F5F4F0] relative flex items-center justify-center p-2.5 rounded-t-xl border-b border-[#491907]/5">
                {hasImage ? (
                  <img
                    src={breed.ico.startsWith('breed_') ? `/uploads/${breed.ico}` : `/breedimage/${breed.ico}`}
                    alt={displayName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      // Show icon if image fails
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out rounded-lg border border-[#491907]/10 shadow-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300 gap-3">
                    <ImageIcon size={48} strokeWidth={1} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">No Image Found</span>
                  </div>
                )}

                {/* ALIAS LABEL */}
                <div className="absolute top-4 right-4">
                  <span className="bg-white/80 backdrop-blur-md text-[#491907] font-mono text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-[#491907]/10 shadow-sm">
                    {breed.alias}
                  </span>
                </div>
              </div>

              {/* CONTENT SECTION */}
              <div className="p-5 flex flex-col flex-1 items-center justify-center text-center">
                <h3 className="text-xl font-black text-[#491907] uppercase tracking-tight leading-tight transition-colors min-h-[2.5rem] flex items-center">
                  {displayName}
                </h3>
              </div>
            </Link>

            {/* ADMIN EDIT BUTTON */}
            {isAdmin && (
              <div className="absolute top-4 left-4 z-50">
                <Link
                  href={`/catalog/breeds/${breed.id}/edit`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#491907] text-white rounded-md font-black text-[10px] uppercase hover:bg-black transition-all shadow-md group"
                >
                  <Pencil size={12} className="group-hover:scale-110 transition-transform" />
                  <span>{t.common.edit || "EDIT"}</span>
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
