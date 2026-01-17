import React from 'react';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 flex flex-col items-center justify-center text-center">
      <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8">
        {t('contact.title')}
      </h2>
      <a href="mailto:etovaz.web@gmail.com" className="text-2xl md:text-4xl font-mono text-accent-pink hover:bg-white hover:text-black px-4 transition-all">
        etovaz.web@gmail.com
      </a>
    </section>
  );
};

export default ContactPage;
