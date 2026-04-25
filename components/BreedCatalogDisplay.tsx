"use client";

import Link from "next/link";

interface Breed {
  id: number;
  name: string;
  alias: string;
  total_animals: string | number;
  living_animals: string | number;
}

interface BreedCatalogGridProps {
  breeds: Breed[];
  t: any;
}

export default function BreedCatalogDisplay({
  breeds,
  t,
}: BreedCatalogGridProps) {
  // Predefined order by name
  const order = [
    "Тюрингская Лесная Коза",
    "Англо-нубийская",
    "Зааненская",
    "Альпийская",
    "Тоггенбургская",
    "Ла-Манча",
    "Бурская",
    "Оберхазли",
    "Карликовая группа коз",
    "Украинская Белая",
    "Украинская цветная", // We'll rename this in the map
    "Украинская Пёстрая",
    "Украинская Короткоухая",
  ];

  const sortedBreeds = [...(breeds || [])]
    .filter((b) => b && b.name !== "Чешская бурая" && b.alias?.trim() !== "CHB")
    .sort((a, b) => {
      const cleanName = (name: string) =>
        name.toLowerCase().trim().replace(/ё/g, "е");

      const getIndex = (name: string) => {
        const cleaned = cleanName(name);
        // Special case for Thuringian variations
        if (cleaned.includes("тюринг")) return 0;

        return order.findIndex((o) => {
          const oClean = cleanName(o);
          return (
            oClean === cleaned ||
            (name === "Украинская цветная" && oClean === "украинская пестрая")
          );
        });
      };

      const indexA = getIndex(a.name);
      const indexB = getIndex(b.name);

      if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
      suppressHydrationWarning
    >
      {sortedBreeds.map((breed) => {
        // Rename logic
        const displayName =
          breed.name === "Украинская цветная"
            ? "Украинская Пёстрая"
            : breed.name;

        return (
          <Link
            key={breed.id}
            href={`/catalog/goats/${breed.alias?.trim()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white border border-[#491907]/5 rounded-xl overflow-hidden hover:border-[#491907]/30 hover:shadow-[0_15px_40px_rgba(73,25,7,0.08)] transition-all duration-500 flex flex-col shadow-sm relative h-full"
          >
            {/* IMAGE SECTION */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#D88D33] relative border-b border-gray-100 flex items-center justify-center p-3">
              <img
                src={
                  breed.name.toLowerCase().includes("альпийская")
                    ? "/breedimage/Альпийская.png"
                    : breed.name.toLowerCase().includes("зааненская")
                      ? "/breedimage/Зааненская.png"
                      : breed.name.toLowerCase().includes("англо-нубийская")
                        ? "/breedimage/Англо-нубийская.png"
                        : breed.name.toLowerCase().includes("тоггенбургская")
                          ? "/breedimage/Тоггенбургская.png"
                          : breed.name
                                .toLowerCase()
                                .includes("карликовая группа")
                            ? "/breedimage/Карликоваягруппакоз.png"
                            : breed.name.toLowerCase().includes("оберхазли")
                              ? "/breedimage/Оберхазли.jpg"
                              : breed.name
                                    .toLowerCase()
                                    .includes("украинская белая")
                                ? "/breedimage/Украинскаябелая.png"
                                : breed.name
                                      .toLowerCase()
                                      .includes("украинская цветная")
                                  ? "/breedimage/Украинскаякороткоухая.jpg"
                                  : breed.name
                                        .toLowerCase()
                                        .includes("украинская короткоухая")
                                    ? "/breedimage/Украинская_короткоухая.jpg"
                                    : breed.name
                                          .toLowerCase()
                                          .includes("тюринг")
                                      ? "/breedimage/ТюрингскаяЛеснаяКоза.jpg"
                                      : breed.name
                                            .toLowerCase()
                                            .includes("бурская")
                                        ? "/breedimage/Бурская.jpg"
                                        : breed.name
                                              .toLowerCase()
                                              .includes("ла-манча")
                                          ? "/breedimage/ЛаМанча.jpg"
                                          : `/img/breeds/${breed.alias?.trim()}.png`
                }
                alt={displayName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/img/breeds/default.png";
                }}
                className="w-full h-full mb-2 object-cover group-hover:scale-105 transition-transform duration-700 ease-out rounded-xl border border-[#491907]/10 shadow-sm"
              />

              {/* ALIAS LABEL */}
              <div className="absolute top-6 right-6">
                <span className="bg-white/90 backdrop-blur-md text-[#491907] font-mono text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#491907]/10 shadow-sm">
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
        );
      })}
    </div>
  );
}
