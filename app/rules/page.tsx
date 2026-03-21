import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

export default function RulesPage() {
  const sections = [
    { title: 'ОСНОВНОЙ РЕЕСТР (RHB)', desc: 'Для чистопородных животных с документально подтвержденным происхождением и высокой генетической ценностью в соответствии с международными стандартами.', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { title: 'УЛУЧШАЮЩИЙ (RCB)', desc: 'Для животных , полученных в результате специальных программ скрещивания , нацеленных на поколения от F1 до F7.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { title: 'ФЕНОТИП (RFB)', desc: 'Регистрация на основе тщательной оценки физических характеристик на соответствие стандартам породы.', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { title: 'ЭКСПЕРИМЕНТАЛЬНЫЙ (RExB)', desc: 'Документация новых линий крови , специализированных пользовательских кроссов и генетических экспериментов.', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.415-3.414l5-5A2 2 0 009 10.172V5L8 4z' }
  ];

  return (
    <div className="min-h-screen bg-bg-site py-20 px-6 lg:px-24">
      <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000">
        <Breadcrumbs items={[{ label: 'ПРАВИЛА И СТАНДАРТЫ' }]} />

        <header className="mb-24 text-center max-w-4xl mx-auto space-y-8">
            <h1 className="text-6xl lg:text-8xl font-black text-primary tracking-tighter uppercase mb-6 leading-none italic drop-shadow-2xl">ПРОТОКОЛ <br/> РАЗВЕДЕНИЯ.</h1>
            <div className="h-2 w-32 bg-secondary mx-auto rounded-full mb-8"></div>
            <p className="text-primary/40 font-black text-xl lg:text-2xl leading-relaxed uppercase tracking-widest italic tracking-tighter uppercase px-12">
              Наши официальные стандарты определяют превосходство молочного козоводства и классификацию реестра по всему миру.
            </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {sections.map((section, i) => (
            <div key={i} className="bg-white p-12 rounded-xl group hover:bg-primary transition-all duration-700 shadow-4xl border border-primary/5 hover:border-secondary flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-primary/5 rounded-xl flex items-center justify-center mb-8 group-hover:bg-white group-hover:rotate-12 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={section.icon} />
                    </svg>
                </div>
                <div className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4 group-hover:text-white/40 transition-colors">СЕКЦИЯ ПРОТОКОЛА 0{i+1}</div>
                <h3 className="text-3xl font-black text-primary mb-6 tracking-tighter uppercase group-hover:text-white transition-colors">{section.title}</h3>
                <p className="text-primary/40 font-bold text-lg leading-relaxed mb-10 group-hover:text-white/60 transition-colors uppercase italic">{section.desc}</p>
                <div className="h-1.5 w-16 bg-secondary/20 rounded-full group-hover:w-full transition-all duration-1000"></div>
            </div>
          ))}
        </div>

        <div className="mt-32 p-16 lg:p-24 bg-primary rounded-xl text-center text-white shadow-5xl overflow-hidden relative border-t-8 border-secondary group hover:bg-black transition-colors duration-700">
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/5 rounded-full -mr-64 -mt-64 group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-5xl lg:text-7xl font-black mb-8 uppercase tracking-tighter leading-none italic">ПОДАТЬ ЗАЯВКУ НА <br/> ВЕРИФИКАЦИЮ.</h2>
                <p className="text-white/40 max-w-2xl mx-auto mb-16 text-xl font-black italic leading-relaxed uppercase tracking-widest px-12">Обеспечьте соответствие ваших животных международным стандартам для официальной аутентификации и генетической сертификации.</p>
                <Link href="/register" className="inline-block px-16 py-8 bg-secondary text-primary font-black text-lg rounded-xl hover:bg-white transition-all transform hover:-translate-y-4 shadow-4xl active:scale-95 duration-500 uppercase tracking-widest italic">
                    ПОРТАЛ АССОЦИАЦИИ ➔
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
