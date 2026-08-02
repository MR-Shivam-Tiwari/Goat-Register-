'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, UserPlus, Shield, User, Mail, Phone, Lock, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { createUserAction } from '@/lib/actions';

export default function UserAddForm({ t }: { t: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await createUserAction(formData);
            if (result.success) {
                setMessage({ type: 'success', text: t.common.toast?.created || 'User created successfully!' });
                setTimeout(() => {
                    router.push('/users');
                    router.refresh();
                }, 1200);
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to create user' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.message || 'Something went wrong' });
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
                            {t.users.createTitle || 'Create User'}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                            {t.users.createDesc || 'Fill in details to create a new system user'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/users"
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-sm font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                        {t.common.cancel || 'CANCEL'}
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-[#491907] text-white rounded-sm font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-[#491907]/10 disabled:opacity-50"
                    >
                        <UserPlus size={16} className={loading ? "animate-spin" : ""} />
                        {loading ? (t.common.saving || 'SAVING...') : (t.users.addUser || 'CREATE USER')}
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-sm font-bold text-xs uppercase tracking-widest border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* LEFT COLUMN: PRIMARY INFO */}
                <div className="lg:col-span-8 space-y-12">
                    {/* SECTION: ACCESS & ROLE */}
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
                                    defaultValue="1"
                                    className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 text-sm font-bold transition-all outline-none appearance-none"
                                >
                                    <option value="1">{t.auth.memberRole || 'Member'}</option>
                                    <option value="10">{t.auth.adminRole || 'Administrator'}</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.users.memberApk}</label>
                                <select 
                                    name="is_apk"
                                    defaultValue="0"
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.users.login} *</label>
                                    <input
                                        name="login"
                                        type="text"
                                        placeholder="username"
                                        className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 text-sm font-bold transition-all outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.users.fullName}</label>
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.users.email} *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="user@example.com"
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
                        <h3 className="text-[13px] font-black text-[#491907] uppercase tracking-[0.2em]">{t.auth.passLabel || 'SECURITY'}</h3>
                    </div>

                    <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t.auth.passLabel} *</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 pr-10 text-sm font-bold transition-all outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t.auth.confirmPassLabel || 'Confirm Password'} *</label>
                            <div className="relative">
                                <input
                                    name="confirm_password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full bg-[#F9F9F9] border-b-2 border-transparent focus:border-[#491907] p-4 pr-10 text-sm font-bold transition-all outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-50 flex items-center gap-3 text-amber-600">
                             <Shield size={14} />
                             <span className="text-[9px] font-black uppercase tracking-widest">Admin Privileges Required</span>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
