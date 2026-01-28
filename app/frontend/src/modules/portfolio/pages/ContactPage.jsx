import React from 'react';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[50vh]">

      <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-12 relative z-10 text-white mix-blend-difference hover:scale-105 transition-transform duration-300 select-none">
        {t('contact.title')}
      </h2>

      <div className="relative group z-10">
        <div className="absolute -inset-1 bg-punk-pink blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <a href="mailto:etovaz.web@gmail.com" className="relative block text-xl md:text-3xl font-mono text-white bg-black border-2 border-punk-pink px-8 py-4 hover:bg-punk-pink hover:text-black transition-all duration-300 uppercase tracking-widest">
          &gt; send_signal(etovaz)
        </a>
      </div>
    </section>
  );
};

export default ContactPage;
