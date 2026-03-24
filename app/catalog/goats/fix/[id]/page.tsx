import { query } from '@/lib/db';
import { getTranslation, Locale } from '@/lib/translations';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EditGoatForm from './EditGoatForm';

async function getGoat(id: string) {
    const result = await query(`
        SELECT 
            A.id, A.name, A.sex, A.status, A.id_mother, A.id_father, A.id_farm, A.id_user, A.time_added,
            Di.id_breed, Di.id_stoodbook, Di.is_abg, Di.date_born, Di.born_weight, Di.born_qty, Di.horns_type,
            Di.have_gen, Di.gen_mat, Di.code_ua, Di.code_abg, Di.code_farm, Di.code_chip, Di.code_int, Di.code_brand,
            Di.source, Di.special, Di.cert_serial, Di.cert_no, Di.manuf, Di.owner,
            (SELECT file FROM goats_pic WHERE id_goat = A.id ORDER BY time_added DESC LIMIT 1) as main_photo
        FROM animals A
        JOIN goats_data Di ON A.id = Di.id_goat
        WHERE A.id = $1
    `, [id]);
    return result.rows[0];
}

async function getBreeds() {
    const res = await query('SELECT id, name FROM breeds ORDER BY name ASC');
    return res.rows;
}

async function getFarms() {
    const res = await query('SELECT id, name FROM farms ORDER BY name ASC');
    return res.rows;
}

async function getStoodbooks() {
    const res = await query('SELECT id, name FROM stoodbook ORDER BY id ASC');
    return res.rows;
}

export default async function EditGoatPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const { id } = await paramsPromise;
    const goat = await getGoat(id);
    if (!goat) notFound();

    const [breeds, farms, stoodbooks] = await Promise.all([
        getBreeds(),
        getFarms(),
        getStoodbooks()
    ]);

    const cookieStore = await cookies();
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    const t = getTranslation(lang);

    return (
        <div className="min-h-screen bg-[#FDFDFD] py-12 px-2 md:px-6 lg:px-12 font-sans tracking-tight">
            <div className="max-w-[1200px] mx-auto bg-white p-10 rounded shadow-sm border border-gray-100">
                <div className="mb-6">
                    <Link href="/goats" className="text-blue-600 hover:text-amber-900 font-bold uppercase tracking-widest text-[10px]">
                        ← Назад
                    </Link>
                </div>

                <header className="mb-10 border-b border-gray-100 pb-6">
                    <h1 className="text-3xl font-black text-primary uppercase tracking-tighter italic italic">
                        Редактирование: {goat.name}
                    </h1>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2 font-mono">
                        Animal Record #EX-{goat.id}
                    </p>
                </header>

                <EditGoatForm 
                    goat={goat} 
                    breeds={breeds} 
                    farms={farms} 
                    stoodbooks={stoodbooks} 
                    lang={lang} 
                    t={t} 
                />
            </div>
        </div>
    );
}
