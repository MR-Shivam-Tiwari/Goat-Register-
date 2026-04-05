import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';

export default async function FeedbackPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-bg-site py-24 px-10 lg:px-24 font-inter">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ label: t.feedback.adminSupport }]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 mt-24 items-center">
            <div>
                <header className="mb-20 text-left relative group">
                    <h2 className="text-8xl font-black text-primary tracking-tighter uppercase mb-8 leading-none group-hover:text-secondary group-hover:translate-x-4 transition-all duration-700 underline decoration-secondary decoration-8 underline-offset-[1.5rem] whitespace-pre-line">{t.feedback.getInTouch}</h2>
                    <div className="h-5 w-40 mb-12"></div>
                    <p className="text-gray-500 font-bold text-2xl leading-[1.8] max-w-lg italic">
                    {t.feedback.connectDesc}
                    </p>
                </header>
                
                <div className="space-y-16 pt-16 border-t-8 border-primary/5">
                   <div className="flex items-center gap-10 group cursor-pointer">
                      <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary transition-all shadow-xl group-hover:shadow-primary/40 duration-500 group-hover:rotate-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <span className="block text-[11px] font-black uppercase text-secondary tracking-[0.6em] mb-2 scale-110 origin-left">{t.feedback.primaryContact}</span>
                        <span className="text-4xl font-black text-primary group-hover:translate-x-2 block transition-all tracking-tighter leading-none">{t.common.phoneNumber}</span>
                      </div>
                   </div>

                   <div className="flex items-center gap-10 group cursor-pointer">
                      <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary transition-all shadow-xl group-hover:shadow-primary/40 duration-500 group-hover:-rotate-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                        </svg>
                      </div>
                      <div>
                        <span className="block text-[11px] font-black uppercase text-secondary tracking-[0.6em] mb-2 scale-110 origin-left">{t.feedback.adminSupportLabel}</span>
                        <span className="text-4xl font-black text-primary group-hover:translate-x-2 block transition-all tracking-tighter leading-none lowercase">support@breedinggoats.org</span>
                      </div>
                   </div>
                </div>
            </div>

            <div className="w-full bg-white/95 rounded-[4rem] shadow-4xl p-20 lg:p-24 border border-primary/5 transform lg:rotate-2 relative overflow-hidden group hover:rotate-0 transition-transform duration-1000">
                <div className="absolute top-0 left-0 w-full h-12 bg-primary group-hover:bg-secondary transition-colors duration-1000"></div>
                <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] select-none pointer-events-none text-[30rem] font-black italic scale-150 rotate-12 transition-all group-hover:opacity-10 group-hover:scale-125 group-hover:text-secondary group-hover:rotate-0">?</div>
                
                <h3 className="text-4xl font-black text-primary mb-12 uppercase tracking-tighter leading-none mt-4 relative z-10 transition-all duration-700 group-hover:scale-110 group-hover:text-secondary origin-left">{t.feedback.requestForm}</h3>
                <form className="space-y-12 relative z-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-primary/40 tracking-[0.5em] pl-6 uppercase">{t.feedback.fullName}</label>
                        <input type="text" className="w-full bg-primary/5 border-none px-8 py-6 rounded-3xl focus:ring-4 focus:ring-secondary/20 focus:bg-white transition-all font-black text-primary text-xl shadow-inner placeholder:text-primary/10" placeholder={t.feedback.identityVerification} required />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-primary/40 tracking-[0.5em] pl-6 uppercase">{t.feedback.emailAddress}</label>
                        <input type="email" className="w-full bg-primary/5 border-none px-8 py-6 rounded-3xl focus:ring-4 focus:ring-secondary/20 focus:bg-white transition-all font-black text-primary text-xl shadow-inner placeholder:text-primary/10" placeholder={t.feedback.officialCorrespondence} required />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-primary/40 tracking-[0.5em] pl-6 uppercase">{t.feedback.messageProtocol}</label>
                        <textarea rows={5} className="w-full bg-primary/5 border-none px-8 py-6 rounded-3xl focus:ring-4 focus:ring-secondary/20 focus:bg-white transition-all font-black text-primary text-xl shadow-inner placeholder:text-primary/10" placeholder={t.feedback.inquiryPlaceholder} required></textarea>
                    </div>
                    <button type="submit" className="w-full bg-primary text-secondary py-8 rounded-[2.5rem] font-black text-xl shadow-3xl hover:bg-secondary hover:text-primary transition-all duration-1000 transform hover:-translate-y-4 active:scale-95 uppercase tracking-[0.3em]">
                        {t.feedback.dispatchRequest}
                    </button>
                    <p className="text-center text-[10px] font-black text-primary/30 uppercase tracking-[0.4em] pt-4 italic">{t.feedback.responseTime}</p>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}
