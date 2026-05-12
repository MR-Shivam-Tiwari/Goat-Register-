'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Trash2, Check, X, Shield, User, Mail, Phone, Lock } from 'lucide-react';
import { updateUserAction, deleteUserAction } from '@/lib/actions';

interface UserData {
    id: number;
    login: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: number;
    is_apk: number;
}

export default function UserEditForm({ user, t }: { user: UserData; t: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await updateUserAction(formData);
            if (result.success) {
                setMessage({ type: 'success', text: t.common.toast?.updated || 'User updated successfully!' });
                router.refresh();
                setTimeout(() => router.push('/users'), 1500);
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update user' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!confirm(t.breedManage?.confirmDelete || 'Are you sure you want to delete this user?')) return;
        
        setLoading(true);
        try {
            const result = await deleteUserAction(user.id);
            if (result.success) {
                router.push('/users');
                router.refresh();
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to delete user' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-12">
            {/* FORM HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/users"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-[#491907] hover:text-white transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-black text-[#491907] uppercase tracking-tighter leading-none">
                            {t.users.editTitle}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                            {t.users.login}: <span className="text-[#491907]">{user.login}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-sm font-black text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    >
                        <Trash2 size={16} />
                        {t.common.remove}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-[#491907] text-white rounded-sm font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-[#491907]/10 disabled:opacity-50"
                    >
                        <Save size={16} className={loading ? "animate-spin" : ""} />
                        {loading ? (t.common.saving || 'SAVING...') : t.common.save}
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-sm font-bold text-xs uppercase tracking-widest border animate-in fade-in slide-in-from-top-2 duration-300 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            <input type="hidden" name="id" value={user.id} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* LEFT COLUMN: PRIMARY INFO */}
                <div className="lg:col-span-8 space-y-12">
                    {/* SECTION: ACCESS & IDENTITY */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-[#491907] pl-4">
                            <Shield className="text-[#491907]" size={18} />
                            <h3 className="text-[13px] font-black text-[#491907] uppercase tracking-[0.2em]">{t.auth.roleLabel || 'ACCESS CONTROL'}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.auth.roleLabel}</label>
                                <select 
                                    name="role"
                                    defaultValue={user.role}
                                    className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 text-sm font-bold transition-all outline-none appearance-none"
                                >
                                    <option value="1">{t.auth.memberRole}</option>
                                    <option value="10">{t.auth.adminRole}</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.users.memberApk}</label>
                                <select 
                                    name="is_apk"
                                    defaultValue={user.is_apk}
                                    className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 text-sm font-bold transition-all outline-none appearance-none"
                                >
                                    <option value="0">{t.users.no}</option>
                                    <option value="1">{t.users.yes}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: PERSONAL DETAILS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-[#491907] pl-4">
                            <User className="text-[#491907]" size={18} />
                            <h3 className="text-[13px] font-black text-[#491907] uppercase tracking-[0.2em]">{t.users.fullName}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.users.fullName}</label>
                                <input
                                    name="name"
                                    type="text"
                                    defaultValue={user.name || ''}
                                    className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 text-sm font-bold transition-all outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.users.email}</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input
                                            name="email"
                                            type="email"
                                            defaultValue={user.email}
                                            className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 pl-12 text-sm font-bold transition-all outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.users.phone}</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input
                                            name="phone"
                                            type="text"
                                            defaultValue={user.phone || ''}
                                            placeholder="+380..."
                                            className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 pl-12 text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: SECURITY */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-3 border-l-4 border-[#491907] pl-4">
                        <Lock className="text-[#491907]" size={18} />
                        <h3 className="text-[13px] font-black text-[#491907] uppercase tracking-[0.2em]">{t.users.password || 'SECURITY'}</h3>
                    </div>

                    <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t.users.password}</label>
                            <input
                                name="password"
                                type="password"
                                placeholder={t.users.passwordHelp || 'Leave blank to keep current'}
                                className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 text-sm font-bold transition-all outline-none"
                            />
                            <p className="text-[9px] text-gray-400 leading-relaxed uppercase tracking-tighter">
                                {t.users.passwordHelp || 'Change user password securely. MD5 encryption is applied automatically.'}
                            </p>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-50 flex items-center gap-3 text-amber-600">
                             <Shield size={14} />
                             <span className="text-[9px] font-black uppercase tracking-widest">Administrative Override</span>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
