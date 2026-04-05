'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditGoatForm({ goat, breeds, farms, stoodbooks, lang, t }: { goat: any, breeds: any[], farms: any[], stoodbooks: any[], lang: string, t: any }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: goat.name || '',
        sex: goat.sex || 1,
        status: goat.status || 1,
        id_stoodbook: goat.id_stoodbook || 1,
        is_abg: goat.is_abg || false,
        id_breed: goat.id_breed || 1,
        id_farm: goat.id_farm || '',
        date_born: goat.date_born ? new Date(goat.date_born).toISOString().split('T')[0] : '',
        date_dead: goat.date_dead ? new Date(goat.date_dead).toISOString().split('T')[0] : '',
        born_weight: goat.born_weight || '',
        born_qty: goat.born_qty || '',
        manuf: goat.manuf || '',
        owner: goat.owner || '',
        code_ua: goat.code_ua || '',
        code_abg: goat.code_abg || '',
        code_farm: goat.code_farm || '',
        code_chip: goat.code_chip || '',
        code_int: goat.code_int || '',
        code_brand: goat.code_brand || '',
        cert_serial: goat.cert_serial || '',
        cert_no: goat.cert_no || '',
        horns_type: goat.horns_type || '',
        have_gen: goat.have_gen || '',
        gen_mat: goat.gen_mat || '',
        source: goat.source || '',
        special: goat.special || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would implement the server action or api call
        console.log('UPDATING GOAT:', formData);
        alert(lang === 'ru' ? 'Запись обновлена!' : 'Record updated!');
        router.push('/catalog/goats');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-sm font-bold text-gray-700">
            {/* ROW 1: Name */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded shadow-sm outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900/10 font-black h-10"
                        placeholder={t.goatForm.namePlaceholder}
                    />
                </div>
            </div>

            {/* ROW 2: Sex */}
            <div className="flex items-center gap-4">
                <div className="w-1/2">
                    <select 
                        name="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded shadow-sm outline-none h-10"
                    >
                        <option value="1">{t.goatForm.male}</option>
                        <option value="2">{t.goatForm.female}</option>
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">{t.goatForm.sex}</div>
            </div>

            {/* ROW 3: Status */}
            <div className="flex items-center gap-4">
                <div className="w-1/2">
                    <select 
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded shadow-sm outline-none h-10"
                    >
                        <option value="1">{t.catalog.live}</option>
                        <option value="2">{t.goats.dead}</option>
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">{t.goatForm.status}</div>
            </div>

            {/* ROW 4: Type (Stoodbook) */}
            <div className="flex items-center gap-4">
                <div className="w-1/2">
                    <select 
                        name="id_stoodbook"
                        value={formData.id_stoodbook}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded shadow-sm outline-none h-10"
                    >
                        {stoodbooks.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">{t.goatForm.recordType}</div>
            </div>

            {/* ROW 5: ABG Membership */}
            <div className="flex items-center gap-4">
                <div className="w-1/2">
                    <select 
                        name="is_abg"
                        value={formData.is_abg ? 'true' : 'false'}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_abg: e.target.value === 'true' }))}
                        className="w-full p-2 border border-gray-300 rounded shadow-sm outline-none h-10"
                    >
                        <option value="true">{t.goatForm.yes}</option>
                        <option value="false">{t.goatForm.no}</option>
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">{t.goatForm.abgMembership}</div>
            </div>

            {/* ROW 6: Breed */}
            <div className="flex items-center gap-4">
                <div className="w-1/2">
                    <select 
                        name="id_breed"
                        value={formData.id_breed}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded shadow-sm outline-none h-10"
                    >
                        {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">{t.goatForm.breed}</div>
            </div>

            {/* ROW 8: Farm */}
            <div className="flex items-center gap-4">
                <div className="w-1/2">
                    <select 
                        name="id_farm"
                        value={formData.id_farm}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded shadow-sm outline-none h-10"
                    >
                        <option value="">{t.goatForm.noFarm}</option>
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">{t.goatForm.farm}</div>
            </div>

            {/* ROW 9: Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <input 
                        type="date" 
                        name="date_born"
                        value={formData.date_born}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded h-10"
                    />
                    <span className="text-[10px] uppercase font-black text-gray-400">{t.goatForm.bornDate}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <input 
                        type="date" 
                        name="date_dead"
                        value={formData.date_dead}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded h-10"
                    />
                    <span className="text-[10px] uppercase font-black text-gray-400">{t.goatForm.deathDate}</span>
                </div>
            </div>

            {/* ROW 10: Birth Details */}
            <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                    <input 
                        type="text" 
                        name="born_weight"
                        value={formData.born_weight}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded h-10"
                        placeholder="3000"
                    />
                    <span className="text-[10px] uppercase font-black text-gray-400">{t.goatForm.bornWeight}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <input 
                        type="text" 
                        name="born_qty"
                        value={formData.born_qty}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded h-10"
                        placeholder="3"
                    />
                    <span className="text-[10px] uppercase font-black text-gray-400">{t.goatForm.bornQty}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded h-10"
                        placeholder="..."
                    />
                    <span className="text-[10px] uppercase font-black text-gray-400">...</span>
                </div>
            </div>

            {/* ROW 11: Breeder/Owner */}
            <div className="grid grid-cols-2 gap-4">
                <input 
                    type="text" 
                    name="manuf"
                    value={formData.manuf}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded h-10"
                    placeholder={t.goatForm.breeder}
                />
                <input 
                    type="text" 
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded h-10"
                    placeholder={t.goatForm.owner}
                />
            </div>

            {/* IDs */}
            <div className="grid grid-cols-3 gap-4">
                <input type="text" name="code_ua" value={formData.code_ua} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder={t.goatForm.idUa} />
                <input type="text" name="code_abg" value={formData.code_abg} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder={t.goatForm.idAbg} />
                <input type="text" name="code_farm" value={formData.code_farm} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder={t.goatForm.idFarm} />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <input type="text" name="code_chip" value={formData.code_chip} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder={t.goatForm.idChip} />
                <input type="text" name="code_int" value={formData.code_int} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder={t.goatForm.idInt} />
                <input type="text" name="code_brand" value={formData.code_brand} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder={t.goatForm.brand} />
            </div>

            {/* Cert */}
            <div className="grid grid-cols-2 gap-4">
                <input type="text" name="cert_serial" value={formData.cert_serial} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder={t.goatForm.certSerial} />
                <input type="text" name="cert_no" value={formData.cert_no} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder={t.goatForm.certNo} />
            </div>

            {/* Horns/Gen */}
            <div className="flex items-center gap-4">
                <div className="w-1/2">
                    <select name="horns_type" value={formData.horns_type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded shadow-sm h-10">
                        <option value="">-- select --</option>
                        <option value="Комолый">{t.goatForm.polled}</option>
                        <option value="Рогатый">{t.goatForm.horned}</option>
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">{t.goatForm.horns}</div>
            </div>

            <div className="flex items-center gap-4">
                <div className="w-1/2">
                    <select name="have_gen" value={formData.have_gen} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded shadow-sm h-10">
                        <option value="Да">{t.goatForm.yes}</option>
                        <option value="Нет">{t.goatForm.no}</option>
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">{t.goatForm.genPassport}</div>
            </div>

            {/* Textareas */}
            <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                    <textarea 
                        name="gen_mat"
                        value={formData.gen_mat}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded h-24"
                        placeholder="Genetic material"
                    ></textarea>
                </div>
                <div className="flex flex-col gap-1">
                    <textarea 
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded h-24"
                        placeholder="Information source"
                    ></textarea>
                </div>
                <div className="flex flex-col gap-1">
                    <textarea 
                        name="special"
                        value={formData.special}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded h-24"
                        placeholder="Special notes"
                    ></textarea>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <input type="file" className="text-[10px] font-black uppercase text-amber-900" />
                </div>
                <button 
                    type="submit"
                    className="px-8 py-2 bg-gray-200 border border-gray-300 rounded text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all"
                >
                    {t.goatForm.save}
                </button>
            </div>
        </form>
    );
}
