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
        alert('Goat updated! (Logic would go here)');
        router.push('/goats');
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
                        placeholder="Кличка"
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
                        <option value="1">Мужской</option>
                        <option value="2">Женский</option>
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">Пол</div>
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
                        <option value="1">Alive</option>
                        <option value="2">Dead</option>
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">Статус</div>
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
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">Тип записи</div>
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
                        <option value="true">Да</option>
                        <option value="false">Нет</option>
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">Членство в ABG</div>
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
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">Порода</div>
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
                        <option value="">Без хозяйства</option>
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">Ферма</div>
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
                    <span className="text-[10px] uppercase font-black text-gray-400">Дата рождения</span>
                </div>
                <div className="flex flex-col gap-1">
                    <input 
                        type="date" 
                        name="date_dead"
                        value={formData.date_dead}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded h-10"
                    />
                    <span className="text-[10px] uppercase font-black text-gray-400">Дата смерти</span>
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
                    <span className="text-[10px] uppercase font-black text-gray-400">Вес при рождении</span>
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
                    <span className="text-[10px] uppercase font-black text-gray-400">Родился в количестве</span>
                </div>
                <div className="flex flex-col gap-1">
                    <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded h-10"
                        placeholder="5"
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
                    placeholder="Заводчик"
                />
                <input 
                    type="text" 
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded h-10"
                    placeholder="Владелец"
                />
            </div>

            {/* IDs */}
            <div className="grid grid-cols-3 gap-4">
                <input type="text" name="code_ua" value={formData.code_ua} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder="ID UA" />
                <input type="text" name="code_abg" value={formData.code_abg} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder="ID ABG" />
                <input type="text" name="code_farm" value={formData.code_farm} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder="ID по ФХ" />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <input type="text" name="code_chip" value={formData.code_chip} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder="ID Chip" />
                <input type="text" name="code_int" value={formData.code_int} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder="ID Int" />
                <input type="text" name="code_brand" value={formData.code_brand} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder="Клеймо" />
            </div>

            {/* Cert */}
            <div className="grid grid-cols-2 gap-4">
                <input type="text" name="cert_serial" value={formData.cert_serial} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder="Сертификат/Серия" />
                <input type="text" name="cert_no" value={formData.cert_no} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded h-10" placeholder="Сертификат/Номер" />
            </div>

            {/* Horns/Gen */}
            <div className="flex items-center gap-4">
                <div className="w-1/2">
                    <select name="horns_type" value={formData.horns_type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded shadow-sm h-10">
                        <option value="">-- select --</option>
                        <option value="Комолый">Комолый</option>
                        <option value="Рогатый">Рогатый</option>
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">Рогатость</div>
            </div>

            <div className="flex items-center gap-4">
                <div className="w-1/2">
                    <select name="have_gen" value={formData.have_gen} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded shadow-sm h-10">
                        <option value="Да">Да</option>
                        <option value="Нет">Нет</option>
                    </select>
                </div>
                <div className="w-1/2 text-[10px] uppercase font-black text-gray-400">Генетический паспорт</div>
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
                    Записать
                </button>
            </div>
        </form>
    );
}
