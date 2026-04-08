'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import pool from '@/lib/db';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { getTranslation, Locale } from '@/lib/translations';

async function getT() {
    const cookieStore = await cookies();
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    return getTranslation(lang);
}

async function saveFile(file: File, prefix: string): Promise<string | null> {
    if (!file || file.size === 0) return null;
    
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }
        
        // Sanitize: remove non-alphanumeric except dot, underscore, dash
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${prefix}_${Date.now()}_${sanitizedName}`;
        const filePath = path.join(uploadDir, fileName);
        
        await fs.writeFile(filePath, buffer);
        return fileName;
    } catch (err) {
        console.error('File Save Error:', err);
        return null;
    }
}

export async function loginAction(prevState: any, formData: FormData) {
  const t = await getT();
  const loginInput = formData.get('login') as string;
  const password = formData.get('password') as string;

  // MD5 Hashing (Standard for 32-char hashes)
  const hash = crypto.createHash('md5').update(password).digest('hex');
  
  try {
    // Check both login and email
    const result = await query(
        'SELECT * FROM users WHERE (login = $1 OR email = $1) AND pass = $2', 
        [loginInput, hash]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const cookieStore = await cookies();
      cookieStore.set('uid_token', user.token, { httpOnly: true, secure: false, path: '/' });
      cookieStore.set('user_login', user.login, { httpOnly: true, secure: false, path: '/' });
      return { success: true };
    }

    return { error: t.errors.invalidLogin };
  } catch (e: any) {
    console.error('Login Error:', e.message);
    return { error: t.errors.dbError + e.message };
  }
}

export async function registerAction(prevState: any, formData: FormData) {
    const t = await getT();
    const login = formData.get('login') as string;
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password !== confirmPassword) {
      return { error: t.errors.passMismatch };
    }

    const checkRes = await query('SELECT id FROM users WHERE email = $1 OR login = $2', [email, login]);
    if (checkRes.rows.length > 0) {
      return { error: t.errors.userExists };
    }

    // MD5 Hashing 
    const hash = crypto.createHash('md5').update(password).digest('hex');
    
    // Constraints according to schema: secret: varchar(18) UNIQUE, token: varchar(19) UNIQUE
    const secret = crypto.randomBytes(8).toString('hex').substring(0, 16);
    const token = crypto.randomBytes(8).toString('hex').substring(0, 18);

    try {
      await query(
        'INSERT INTO users (login, email, name, phone, pass, secret, token, is_apk, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [login, email, name, phone, hash, secret, token, 0, 1]
      );
      return { success: true };
    } catch (e: any) {
      console.error('Registration Error:', e.message);
      return { error: t.errors.dbError + e.message };
    }
}

export async function setLanguage(lang: string) {
    const cookieStore = await cookies();
    cookieStore.set('nxt-lang', lang, { 
      path: '/', 
      maxAge: 31536000, 
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production' 
    });
    revalidatePath('/', 'layout');
}

export async function addGoatAction(formData: FormData) {
    const t = await getT();
    const cookieStore = await cookies();
    const username = cookieStore.get('user_login')?.value;

    if (!username) {
        return { error: t.errors.authRequired };
    }

    // 1. Get User ID
    const userRes = await query('SELECT id FROM users WHERE login = $1', [username]);
    if (userRes.rows.length === 0) return { error: t.errors.userNotFound };
    const userId = userRes.rows[0].id;
    
    // ... rest same ...
    const nickname = formData.get('nickname') as string;
    const breedId = parseInt(formData.get('breed') as string);
    const farmId = parseInt(formData.get('farm') as string);
    const sex = formData.get('sex') === 'male' ? 1 : 0;
    const studbook = formData.get('studbook') as string; // needs mapping
    const statusVal = formData.get('status') as string;
    const abg = formData.get('abg') === 'yes' ? 1 : 0;
    
    // Dates
    const birthDate = formData.get('birthDate') as string || null;
    const deathDate = formData.get('deathDate') as string || null;
    
    // Other fields
    const birthWeight = parseInt(formData.get('birthWeight') as string) || null;
    const score = parseFloat(formData.get('score') as string) || null;
    const totalPercent = parseFloat(formData.get('totalPercent') as string) || null;
    const breeder = formData.get('breeder') as string || null;
    const owner = formData.get('owner') as string || null;
    const idUa = formData.get('idUa') as string || null;
    const idAbg = formData.get('idAbg') as string || null;
    const chipId = formData.get('chipId') as string || null;
    const idInt = formData.get('idInt') as string || null;
    const certSeries = formData.get('certSeries') as string || null;
    const certNo = formData.get('certNum') as string || null;
    const genetic = formData.get('genetic') as string || null;
    const source = formData.get('source') as string || null;
    const notes = formData.get('notes') as string || null;

    // Photo
    const photoFile = formData.get('photo') as File | null;
    const photoName = photoFile ? await saveFile(photoFile, 'goat') : null;

    // Mapping studbook
    const studbookMap: Record<string, number> = { 
        'main': 1, 'rhb': 1, 
        'f1': 2, 'f2': 3, 'f3': 4, 'f4': 5, 'f5': 6, 'f6': 7, 'f7': 8, 'f8': 13,
        'rfb': 9, 'ex1': 10, 'ex2': 11, 'ex3': 12, 'ex': 10 
    };
    const studbookId = studbookMap[studbook] || 1;

    // Mapping status
    const statusMap: Record<string, number | null> = { 'alive': 1, 'dead': 0, 'no_info': null };
    const status = statusMap[statusVal];

    // 3. Database Transaction
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert into animals
        const animalRes = await client.query(
            `INSERT INTO animals (id_family, id_farm, id_mother, id_father, is_reg, name, sex, status, id_user) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [1, farmId, 0, 0, 1, nickname, sex, status, userId]
        );
        const goatId = animalRes.rows[0].id;

        // Insert into goats_data
        await client.query(
            `INSERT INTO goats_data (
                id_goat, id_breed, id_stoodbook, is_abg, date_born, date_dead, 
                born_weight, manuf, owner, ava, score, code_ua, code_abg, 
                code_chip, code_int, cert_serial, cert_no, gen_mat, source, special, blood_percent
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
            [
                goatId, breedId, studbookId, abg, birthDate, deathDate,
                birthWeight, breeder, owner, photoName, score, idUa, idAbg,
                chipId, idInt, certSeries, certNo, genetic, source, notes, totalPercent
            ]
        );

        // Insert into goats_pic if photo exists
        if (photoName) {
            await client.query(
                `INSERT INTO goats_pic (id_goat, file) VALUES ($1, $2)`,
                [goatId, photoName]
            );
        }

        await client.query('COMMIT');
        return { success: true };
    } catch (e: any) {
        await client.query('ROLLBACK');
        console.error('Add Goat Error:', e.message);
        return { error: t.errors.dbError + e.message };
    } finally {
        client.release();
    }
}

export async function addPhotoAction(formData: FormData) {
    const t = await getT();
    const photoFile = formData.get('photo') as File | null;
    const goatId = parseInt(formData.get('goatId') as string);

    if (!photoFile || photoFile.size === 0 || !goatId) {
        return { error: t.errors.invalidData };
    }

    const photoName = await saveFile(photoFile, `goat_${goatId}`);
    if (!photoName) {
        return { error: t.errors.uploadFailed };
    }

    try {
        await query(
            'INSERT INTO goats_pic (id_goat, file) VALUES ($1, $2)',
            [goatId, photoName]
        );

        revalidatePath(`/goats/${goatId}`);
        revalidatePath(`/goats`);
        return { success: true };
    } catch (e: any) {
        console.error('Add Photo Action DB Error:', e.message);
        return { error: t.errors.uploadFailed + e.message };
    }
}

export async function deletePhotoAction(fileName: string, goatId?: string | number) {
    const t = await getT();
    if (!fileName) return { error: t.errors.noFilename };

    try {
        const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
        if (existsSync(filePath)) {
            await fs.unlink(filePath);
        }

        await query('DELETE FROM goats_pic WHERE file = $1', [fileName]);
        
        if (goatId) {
            revalidatePath(`/goats/${goatId}`);
        }
        revalidatePath(`/goats`);
        
        return { success: true };
    } catch (e: any) {
        console.error('Delete Photo Error:', e.message);
        return { error: t.errors.deleteFailed + e.message };
    }
}

export async function deleteGoatAction(goatId: number | string) {
    const t = await getT();
    if (!goatId) return { error: t.errors.invalidData };

    try {
        // Order is important to avoid foreign key constraints (if any)
        await query('DELETE FROM goats_pic WHERE id_goat = $1', [goatId]);
        await query('DELETE FROM goats_test WHERE id_goat = $1', [goatId]);
        await query('DELETE FROM goats_lact WHERE id_goat = $1', [goatId]);
        await query('DELETE FROM goats_data WHERE id_goat = $1', [goatId]);
        await query('DELETE FROM animals WHERE id = $1', [goatId]);

        revalidatePath('/goats');
        revalidatePath('/manager');
        return { success: true };
    } catch (e: any) {
        console.error('Delete Goat Error:', e.message);
        return { error: t.errors.deleteFailed + e.message };
    }
}

export async function updateGoatAction(formData: FormData) {
    const t = await getT();
    const goatId = formData.get('goatId') as string;
    if (!goatId) return { error: t.errors.invalidData };

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // ... rest same ...
        const nickname = formData.get('nickname') as string;
        const breed = formData.get('breed') as string;
        const farm = formData.get('farm') as string;
        const sex = formData.get('sex') === 'male' ? 1 : 0;
        const status = formData.get('status') === 'alive' ? 1 : formData.get('status') === 'dead' ? 0 : 2;
        const isAbg = formData.get('abg') === 'yes' ? 1 : 0;
        const dateBorn = formData.get('birthDate') as string || null;
        const dateDeath = formData.get('deathDate') as string || null;
        const birthWeight = formData.get('birthWeight') as string || null;
        const score = formData.get('score') as string || null;
        const totalPercent = formData.get('totalPercent') as string || null;
        const breeder = formData.get('breeder') as string;
        const owner = formData.get('owner') as string;
        
        const idUa = formData.get('idUa') as string;
        const idAbg = formData.get('idAbg') as string;
        const chipId = formData.get('chipId') as string;
        const idInt = formData.get('idInt') as string;
        const certSeries = formData.get('certSeries') as string;
        const certNum = formData.get('certNum') as string;
        
        const genetic = formData.get('genetic') as string;
        const source = formData.get('source') as string;
        const notes = formData.get('notes') as string;
        const studbook = formData.get('studbook') as string;

        const studbookMap: Record<string, number> = { 
            'main': 1, 'rhb': 1, 
            'f1': 2, 'f2': 3, 'f3': 4, 'f4': 5, 'f5': 6, 'f6': 7, 'f7': 8, 'f8': 13,
            'rfb': 9, 'ex1': 10, 'ex2': 11, 'ex3': 12, 'ex': 10 
        };
        const studbookId = studbookMap[studbook] || 1;

        // 1. Update animals table
        await client.query(
            'UPDATE animals SET name = $1, sex = $2, status = $3, id_farm = $4 WHERE id = $5',
            [nickname, sex, status, parseInt(farm) || null, goatId]
        );

        // Update goats_data
        const photoFile = formData.get('photo') as File | null;
        const photoName = photoFile ? await saveFile(photoFile, `goat_${goatId}`) : null;

        const dataUpdateFields = [
            'id_breed = $1', 'is_abg = $2', 'manuf = $3', 'owner = $4', 
            'date_born = $5', 'date_dead = $6', 'born_weight = $7',
            'code_ua = $8', 'code_abg = $9', 'code_chip = $10', 'code_int = $11',
            'cert_serial = $12', 'cert_no = $13', 'special = $14', 'source = $15', 'gen_mat = $16',
            'score = $17', 'blood_percent = $18', 'id_stoodbook = $19'
        ];
        const dataValues = [
            parseInt(breed), isAbg, breeder, owner, 
            dateBorn, dateDeath, birthWeight,
            idUa, idAbg, chipId, idInt,
            certSeries, certNum, notes, source, genetic,
            score,
            totalPercent,
            studbookId
        ];

        if (photoName) {
            dataUpdateFields.push('ava = $' + (dataValues.length + 1));
            dataValues.push(photoName);
        }
        dataValues.push(goatId);

        await client.query(
            `UPDATE goats_data SET ${dataUpdateFields.join(', ')} WHERE id_goat = $${dataValues.length}`,
            dataValues
        );

        await client.query('COMMIT');
        revalidatePath(`/goats/${goatId}`);
        revalidatePath(`/goats`);
        return { success: true };
    } catch (e: any) {
        await client.query('ROLLBACK');
        console.error('Update Error:', e.message);
        return { error: t.errors.deleteFailed + e.message }; // Using deleteFailed as a generic error base
    } finally {
        client.release();
    }
}

export async function addFarmAction(formData: FormData) {
    const t = await getT();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const pic1File = formData.get('pic1') as File | null;
    const pic2File = formData.get('pic2') as File | null;

    if (!name) return { error: t.errors.farmNameReq };

    try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

        const pic1 = await saveFile(formData.get('pic1') as File, 'farm_p1');
        const pic2 = await saveFile(formData.get('pic2') as File, 'farm_p2');

        await query(
            'INSERT INTO farms (name, tmpl, pic1, pic2) VALUES ($1, $2, $3, $4)',
            [name, description, pic1 || 'no_pic.png', pic2]
        );

        revalidatePath('/farms');
        return { success: true };
    } catch (e: any) {
        console.error('Add Farm Error:', e.message);
        return { error: t.errors.dbError + e.message };
    }
}

export async function updateFarmAction(formData: FormData) {
    const t = await getT();
    const id = formData.get('farmId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const pic1File = formData.get('pic1') as File | null;
    const pic2File = formData.get('pic2') as File | null;

    if (!id || !name) return { error: t.errors.farmIdNameReq };

    try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

        const updateFields = ['name = $1', 'tmpl = $2'];
        const values: any[] = [name, description];

        if (pic1File && pic1File.size > 0) {
            const pic1 = await saveFile(pic1File, 'farm_p1');
            if (pic1) {
                updateFields.push(`pic1 = $${values.length + 1}`);
                values.push(pic1);
            }
        }
        if (pic2File && pic2File.size > 0) {
            const pic2 = await saveFile(pic2File, 'farm_p2');
            if (pic2) {
                updateFields.push(`pic2 = $${values.length + 1}`);
                values.push(pic2);
            }
        }

        values.push(id);
        await query(
            `UPDATE farms SET ${updateFields.join(', ')} WHERE id = $${values.length}`,
            values
        );

        revalidatePath('/farms');
        return { success: true };
    } catch (e: any) {
        console.error('Update Farm Error:', e.message);
        return { error: t.errors.dbError + e.message };
    }
}

export async function deleteFarmAction(farmId: number | string) {
    const t = await getT();
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get('uid_token')?.value;
    if (!isAdmin) return { error: t.errors.unauthorized };

    try {
        await query('DELETE FROM farms WHERE id = $1', [farmId]);
        revalidatePath('/farms');
        return { success: true };
    } catch (e: any) {
        return { error: t.errors.deleteFailed + e.message };
    }
}






