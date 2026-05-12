'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, X, ChevronLeft, Save, Trash2, Image as ImageIcon, Check } from 'lucide-react';
import { updateBreedAction } from '@/lib/actions';

interface Breed {
  id: number;
  name: string;
  alias: string;
  id_family: number;
  place: number;
  ico: string;
}

interface BreedEditFormProps {
  breed: Breed;
  t: any;
}

export default function BreedEditForm({ breed, t }: BreedEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: breed.name,
    alias: breed.alias,
    id_family: breed.id_family,
    place: breed.place,
    ico: breed.ico
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!t) return <div>Loading...</div>;
  const m = t.breedManage || {};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      data.append('id', breed.id.toString());
      data.append('name', formData.name);
      data.append('alias', formData.alias);
      data.append('id_family', formData.id_family.toString());
      data.append('place', formData.place.toString());
      data.append('ico', formData.ico);

      if (selectedFile) {
        data.append('file', selectedFile);
      }

      const result = await updateBreedAction(data);

      if (result.success) {
        setMessage({ type: 'success', text: t.common.toast?.updated || 'Successfully updated!' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.error || 'Update failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* FORM HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/catalog/breeds"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-[#491907] hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-[#491907] uppercase tracking-tighter leading-none">
              {m.editTitle}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
              {m.updatingBreed}: <span className="text-[#491907]">{breed.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/catalog/breeds"
            className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#491907] transition-colors"
          >
            {m.backToList}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-[#491907] text-white rounded-sm font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-[#491907]/10 disabled:opacity-50"
          >
            <Save size={16} className={loading ? "animate-spin" : ""} />
            {loading ? (t.common.saving || 'SAVING...') : m.updateRegistry}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-sm font-bold text-xs uppercase tracking-widest border ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN: IDENTITY */}
        <div className="lg:col-span-7 space-y-12">
          {/* SECTION: CORE IDENTITY */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-[#491907] pl-4">
              <h3 className="text-[13px] font-black text-[#491907] uppercase tracking-[0.2em]">{m.coreIdentity}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.breedName}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 text-sm font-bold transition-all outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.alias}</label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={e => setFormData({ ...formData, alias: e.target.value })}
                  className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 text-sm font-bold transition-all outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION: SYSTEM PARAMETERS */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-[#491907] pl-4">
              <h3 className="text-[13px] font-black text-[#491907] uppercase tracking-[0.2em]">{m.systemParams}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.family}</label>
                <input
                  type="number"
                  value={formData.id_family}
                  onChange={e => setFormData({ ...formData, id_family: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 text-sm font-bold transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.place}</label>
                <input
                  type="number"
                  value={formData.place}
                  onChange={e => setFormData({ ...formData, place: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 text-sm font-bold transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: VISUAL IDENTITY */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-[#491907] pl-4">
            <h3 className="text-[13px] font-black text-[#491907] uppercase tracking-[0.2em]">{m.visualIdentity}</h3>
          </div>

          <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm space-y-8">
            {/* CURRENT IMAGE */}
            <div className="space-y-3 text-center">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t.common.currentPhoto || "CURRENT ICON"}</label>
              <div className="aspect-square w-48 mx-auto bg-gray-50 border border-gray-100 rounded-sm overflow-hidden flex items-center justify-center p-4">
                {breed.ico ? (
                  <img 
                    src={breed.ico.startsWith('breed_') ? `/uploads/${breed.ico}` : `/breedimage/${breed.ico}`} 
                    className="max-w-full max-h-full object-contain"
                    alt={breed.name}
                  />
                ) : (
                  <ImageIcon size={48} className="text-gray-200" />
                )}
              </div>
              <p className="text-[10px] font-mono text-gray-400">{breed.ico || 'no-icon-assigned'}</p>
            </div>

            {/* UPLOAD NEW */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{m.icon}</label>
              <div className="space-y-4">
                {!selectedFile ? (
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="image/*"
                    />
                    <div className="bg-white border-2 border-dashed border-gray-300 p-8 text-center rounded-sm group-hover:border-[#491907] transition-all">
                      <Upload className="mx-auto text-gray-400 group-hover:text-[#491907] mb-2" size={32} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.common.selectPhoto || "Click to browse files"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-[#DCFCE7] border border-black p-4 rounded-sm">
                    <Check className="text-green-700" size={24} />
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-green-800 uppercase tracking-widest">{t.common.fileSelected || "Ready for upload"}</p>
                      <p className="text-xs font-bold text-gray-900 truncate">{selectedFile.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="text-red-600 hover:text-black"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">{t.catalog.photoFormats}</span>
                  <input
                    type="text"
                    placeholder="Or manual filename..."
                    value={formData.ico}
                    onChange={e => setFormData({ ...formData, ico: e.target.value })}
                    className="w-full bg-[#F9F9F9] border-transparent border-b p-2 text-[10px] font-mono outline-none focus:border-[#491907]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
