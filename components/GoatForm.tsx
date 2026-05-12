"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTranslation, Locale } from "@/lib/translations";
import { addGoatAction, updateGoatAction } from "@/lib/actions";
import { Upload, X, ChevronLeft, Save } from "lucide-react";

export default function GoatForm({
  breeds,
  farms,
  lang,
  initialData,
}: {
  breeds: any[];
  farms: any[];
  lang: Locale;
  initialData?: any;
}) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const t = getTranslation(lang);
  const isEdit = !!initialData;

  const REVERSE_STUD_MAP: Record<number, string> = {
    1: "rhb",
    2: "f1",
    3: "f2",
    4: "f3",
    5: "f4",
    6: "f5",
    7: "f6",
    8: "f7",
    13: "f8",
    9: "rfb",
    10: "ex1",
    11: "ex2",
    12: "ex3",
  };
  const currentStud = initialData?.id_stoodbook
    ? REVERSE_STUD_MAP[initialData.id_stoodbook]
    : "rhb";

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
    const formData = new FormData(e.currentTarget);
    if (selectedFile) {
      formData.set("photo", selectedFile);
    }
    if (isEdit) {
      formData.set("goatId", initialData.id.toString());
    }

    try {
      setError(null);
      setSuccess(false);
      setFieldErrors({});
      setIsSubmitting(true);

      const newFieldErrors: Record<string, string> = {};
      const nickname = formData.get('nickname') as string;
      const breed = formData.get('breed') as string;
      const farm = formData.get('farm') as string;
      const sex = formData.get('sex') as string;
      const birthDate = formData.get('birthDate') as string;
      const bornQty = formData.get('bornQty') as string;

      if (!nickname) newFieldErrors.nickname = t.errors.nicknameRequired;
      if (!breed) newFieldErrors.breed = t.errors.breedRequired;
      if (!farm && farm !== '0') newFieldErrors.farm = t.errors.farmRequired;
      if (!sex) newFieldErrors.sex = t.errors.sexRequired;
      if (!birthDate) newFieldErrors.birthDate = t.errors.birthDateRequired;
      if (!bornQty) newFieldErrors.bornQty = t.errors.bornQtyRequired;

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const action = isEdit ? updateGoatAction : addGoatAction;
      const result = await action(formData);

      if (result.success) {
        setSuccess(true);
        setIsSubmitting(false);
        if (!isEdit && formRef.current) {
           formRef.current.reset();
           setSelectedFile(null);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          router.push(isEdit ? `/goats/${initialData.id}` : "/goats?success=1");
        }, 1500);
      } else {
        setError(result.error || t.errors.somethingWrong);
        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(err.message || t.errors.unexpectedError);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  return (
    <div className="bg-white border-2 border-gray-100 rounded-sm p-4 md:p-8 font-sans max-w-4xl mx-auto text-gray-900 shadow-sm">
      <div className="border-b-2 border-gray-100 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-[#491907]">
            {isEdit ? t.goats.editTitle : t.goats.addTitle}
          </h2>
          {isEdit && (
            <span className="text-xs text-gray-400 font-mono">
              ID: #{initialData.id}
            </span>
          )}
        </div>
        <Link
          href="/goats"
          className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
        >
          <ChevronLeft size={16} /> {t.common.back}
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 mb-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="bg-red-500 text-white rounded-full p-1">
              <svg size="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            <p className="text-red-800 font-bold text-sm uppercase tracking-tight">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="bg-green-500 text-white rounded-full p-1">
              <svg size="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <p className="text-green-800 font-bold text-sm uppercase tracking-tight">
              {isEdit ? t.common.toast.updated : t.common.toast.registered}
            </p>
          </div>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 border-l-4 border-[#491907] pl-3 py-1">
            {t.goats.basicInformation}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goats.nickname} <span className="text-red-500">*</span>
              </label>
              <input
                name="nickname"
                type="text"
                defaultValue={initialData?.name}
                className={`w-full border-2 rounded-sm px-4 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none transition-all placeholder:text-gray-300 bg-[#FDFBF7]/40 h-11 text-sm shadow-sm ${fieldErrors.nickname ? 'border-red-500' : 'border-gray-200'}`}
              />
              {fieldErrors.nickname && (
                <p className="text-red-600 text-[10px] font-bold uppercase mt-1">
                  {fieldErrors.nickname}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goats.breed} <span className="text-red-500">*</span>
              </label>
              <select
                name="breed"
                defaultValue={initialData?.id_breed}
                className={`w-full border-2 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none cursor-pointer bg-[#FDFBF7]/40 h-11 text-sm shadow-sm ${fieldErrors.breed ? 'border-red-500' : 'border-gray-200'}`}
              >
                <option value="">{t.catalog.allBreeds}</option>
                {breeds.map((breed: any) => (
                  <option key={breed.id} value={breed.id}>
                    {breed.name}
                  </option>
                ))}
              </select>
              {fieldErrors.breed && (
                <p className="text-red-600 text-[10px] font-bold uppercase mt-1">
                  {fieldErrors.breed}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goats.farm} <span className="text-red-500">*</span>
              </label>
              <select
                name="farm"
                defaultValue={initialData?.id_farm || "0"}
                className={`w-full border-2 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none cursor-pointer bg-[#FDFBF7]/40 h-11 text-sm shadow-sm ${fieldErrors.farm ? 'border-red-500' : 'border-gray-200'}`}
              >
                <option value="0">{t.goats.withoutFarm}</option>
                {farms.filter(f => Number(f.id) !== 0).map((farm: any) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
              {fieldErrors.farm && (
                <p className="text-red-600 text-[10px] font-bold uppercase mt-1">
                  {fieldErrors.farm}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goats.sex}
              </label>
              <select
                name="sex"
                defaultValue={initialData?.sex === 1 ? "male" : "female"}
                className={`w-full border-2 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none cursor-pointer bg-[#FDFBF7]/40 h-11 text-sm shadow-sm ${fieldErrors.sex ? 'border-red-500' : 'border-gray-200'}`}
              >
                <option value="female">{t.goats.female}</option>
                <option value="male">{t.goats.male}</option>
              </select>
              {fieldErrors.sex && (
                <p className="text-red-600 text-[10px] font-bold uppercase mt-1">
                  {fieldErrors.sex}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goatForm.recordType}
              </label>
              <select
                name="is_reg"
                defaultValue={
                  initialData?.is_reg !== undefined &&
                  initialData?.is_reg !== null
                    ? String(initialData.is_reg)
                    : "1"
                }
                className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none cursor-pointer bg-[#FDFBF7]/40 h-11 text-sm shadow-sm"
              >
                <option value="0">{t.goatForm.pedigreeOption}</option>
                <option value="1">{t.goatForm.registryOption}</option>
              </select>
            </div>
          </div>

          {/* Row 3: 3 fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goats.studbook}
              </label>
              <select
                name="studbook"
                defaultValue={currentStud}
                className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none cursor-pointer bg-[#FDFBF7]/40 h-11 text-sm shadow-sm"
              >
                <option value="rhb">{t.goats.mainRegister}</option>
                <option value="f1">RCB F1</option>
                <option value="f2">RCB F2</option>
                <option value="f3">RCB F3</option>
                <option value="f4">RCB F4</option>
                <option value="f5">RCB F5</option>
                <option value="f6">RCB F6</option>
                <option value="f7">RCB F7</option>
                <option value="f8">RCB F8</option>
                <option value="rfb">Phenotype (RFB)</option>
                <option value="ex1">Experimental (up to 50%)</option>
                <option value="ex2">Experimental (51-75%)</option>
                <option value="ex3">Experimental (76-98%)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goats.status}
              </label>
              <select
                name="status"
                defaultValue={
                  initialData?.status === 1
                    ? "alive"
                    : initialData?.status === 0
                      ? "dead"
                      : "no_info"
                }
                className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none cursor-pointer bg-[#FDFBF7]/40 h-11 text-sm shadow-sm"
              >
                <option value="alive">{t.goats.alive}</option>
                <option value="dead">{t.goats.dead}</option>
                <option value="no_info">{t.goats.noInfo}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goats.abgMember}
              </label>
              <select
                name="abg"
                defaultValue={initialData?.is_abg ? "yes" : "no"}
                className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none cursor-pointer bg-[#FDFBF7]/40 h-11 text-sm shadow-sm"
              >
                <option value="no">{t.users.no}</option>
                <option value="yes">{t.users.yes}</option>
              </select>
            </div>
          </div>
        </section>

        {/* 2. Important Dates */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 border-l-4 border-[#491907] pl-3 py-1">
            {t.goats.datesAndWeight}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goats.birthDate} <span className="text-red-500">*</span>
              </label>
              <input
                name="birthDate"
                type="date"
                defaultValue={formatDate(initialData?.date_born)}
                className={`w-full border-2 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none ${fieldErrors.birthDate ? 'border-red-500' : 'border-gray-200'}`}
              />
              {fieldErrors.birthDate && (
                <p className="text-red-600 text-[10px] font-bold uppercase mt-1">
                  {fieldErrors.birthDate}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goats.deathDate}
              </label>
              <input
                name="deathDate"
                type="date"
                defaultValue={formatDate(initialData?.date_dead)}
                className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goats.weightG}
              </label>
              <input
                name="birthWeight"
                type="number"
                defaultValue={initialData?.born_weight}
                placeholder="3500"
                className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goats.bornQty} <span className="text-red-500">*</span>
              </label>
              <input
                name="bornQty"
                type="number"
                defaultValue={initialData?.born_qty}
                placeholder="1"
                className={`w-full border-2 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none ${fieldErrors.bornQty ? 'border-red-500' : 'border-gray-200'}`}
              />
              {fieldErrors.bornQty && (
                <p className="text-red-600 text-[10px] font-bold uppercase mt-1">
                  {fieldErrors.bornQty}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goats.score}
              </label>
              <input
                name="score"
                type="text"
                defaultValue={initialData?.score_total}
                placeholder="0.0"
                className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 text-blue-600 uppercase text-[10px]">
                {t.goats.totalBloodPercent || "Total Bloodline %"}
              </label>
              <input
                name="totalPercent"
                type="text"
                defaultValue={initialData?.blood_percent}
                placeholder="62.5"
                className="w-full border-2 border-blue-100 rounded-sm px-3 py-2 font-bold text-blue-900 focus:border-blue-600 outline-none bg-blue-50/30"
              />
            </div>
          </div>
        </section>

        {/* 3. Ownership / Codes */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 border-l-4 border-[#491907] pl-3 py-1">
            {t.goats.ownershipAndCodes}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 text-sm">
              <label className="font-bold text-gray-700">
                {t.goats.breeder}
              </label>
              <input
                name="breeder"
                type="text"
                defaultValue={initialData?.manuf}
                className="w-full border-2 border-gray-200 rounded-sm px-4 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none"
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-bold text-gray-700">{t.goats.owner}</label>
              <input
                name="owner"
                type="text"
                defaultValue={initialData?.owner}
                className="w-full border-2 border-gray-200 rounded-sm px-4 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "idUa",
              "idAbg",
              "idFx",
              "chipId",
              "idInt",
              "brand",
              "certSeries",
              "certNum",
            ].map((f) => (
              <div key={f} className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">
                  {(t.goats as any)[f]}
                </label>
                <input
                  name={f}
                  type="text"
                  defaultValue={
                    initialData?.[
                      f === "idUa"
                        ? "code_ua"
                        : f === "idAbg"
                          ? "code_abg"
                          : f === "idFx"
                            ? "code_farm"
                            : f === "chipId"
                              ? "code_chip"
                              : f === "idInt"
                                ? "code_int"
                                : f === "brand"
                                  ? "code_brand"
                                  : f === "certSeries"
                                    ? "cert_serial"
                                    : "cert_no"
                    ]
                  }
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm font-bold bg-gray-50 focus:border-[#491907] outline-none"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goatForm.horns}
              </label>
              <select
                name="horns_type"
                defaultValue={
                  initialData?.horns_type !== undefined &&
                  initialData?.horns_type !== null
                    ? String(initialData.horns_type)
                    : "1"
                }
                className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none cursor-pointer"
              >
                <option value="1">{t.goatForm.polled}</option>
                <option value="2">{t.goatForm.dehorned}</option>
                <option value="3">{t.goatForm.horned}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {t.goatForm.genPassport}
              </label>
              <select
                name="have_gen"
                defaultValue={
                  initialData?.have_gen !== undefined &&
                  initialData?.have_gen !== null
                    ? String(initialData.have_gen)
                    : "0"
                }
                className="w-full border-2 border-gray-200 rounded-sm px-3 py-2 font-bold text-gray-900 focus:border-[#491907] outline-none cursor-pointer"
              >
                <option value="0">{t.goatForm.no}</option>
                <option value="1">{t.goatForm.yes}</option>
              </select>
            </div>
          </div>
        </section>

        {/* 4. Notes */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">
              {t.goats.genetics}
            </label>
            <textarea
              name="genetic"
              defaultValue={initialData?.gen_mat}
              rows={3}
              className="w-full border border-gray-300 rounded-sm p-3 text-sm resize-none"
            ></textarea>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">
              {t.goats.source}
            </label>
            <textarea
              name="source"
              defaultValue={initialData?.source}
              rows={3}
              className="w-full border border-gray-300 rounded-sm p-3 text-sm resize-none"
            ></textarea>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">
              {t.goats.notes}
            </label>
            <textarea
              name="notes"
              defaultValue={initialData?.special}
              rows={3}
              className="w-full border border-gray-300 rounded-sm p-3 text-sm resize-none"
            ></textarea>
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
                <button
                  type="button"
                  className="bg-[#491907] text-white font-bold py-3 px-8 rounded-sm text-xs tracking-widest uppercase hover:bg-black transition-all flex items-center gap-3"
                >
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
                  <span className="text-[9px] font-black uppercase text-gray-400">
                    {t.common.fileSelected}
                  </span>
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
                <img
                  src={`/uploads/${initialData.ava}`}
                  className="w-16 h-12 object-cover"
                />
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  {t.common.currentPhoto}
                </span>
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
                <span>
                  {isEdit ? t.common.updateExisting : t.common.establishNew}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
