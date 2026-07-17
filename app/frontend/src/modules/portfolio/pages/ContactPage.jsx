import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const EMAIL = 'etovaz.web@gmail.com';
const COPIED_TIMEOUT_MS = 3000;

const ContactPage = () => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Clipboard API indisponível (http, browser antigo): fallback via seleção
      const input = document.createElement('input');
      input.value = EMAIL;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), COPIED_TIMEOUT_MS);
  };

  return (
    <section className="flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[50vh]">

      <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-12 relative z-10 text-white mix-blend-difference hover:scale-105 transition-transform duration-300 select-none">
        {t('contact.title')}
      </h2>

      <div className="relative group z-10">
        <div className={`absolute -inset-1 blur transition duration-1000 group-hover:duration-200 ${copied ? 'bg-punk-green opacity-50' : 'bg-punk-pink opacity-25 group-hover:opacity-75'}`}></div>
        <button
          type="button"
          onClick={copyEmail}
          className={`relative block w-full text-xl md:text-3xl font-mono text-white bg-black border-2 px-8 py-4 transition-all duration-300 tracking-widest cursor-pointer ${
            copied
              ? 'border-punk-green'
              : 'border-punk-pink hover:bg-punk-pink hover:text-black uppercase'
          }`}
        >
          {copied ? EMAIL : '> send_signal(etovaz)'}
        </button>
      </div>

      <p className={`font-mono text-xs text-punk-green mt-4 z-10 transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0'}`} aria-live="polite">
        {t('contact.copied')}
      </p>
    </section>
  );
};

export default ContactPage;
