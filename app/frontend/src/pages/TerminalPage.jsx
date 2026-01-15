import React from 'react';
import { useTranslation } from 'react-i18next';
import Terminal from '../components/Terminal/Terminal';

const TerminalPage = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-8">
        <h2 className="section-title">
          <span className="text-accent-green">_</span> terminal_lab
        </h2>
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="font-mono text-white/80 mb-4">
            {t('terminal.lab_description')}
          </p>
          <p className="font-mono text-white/60 text-sm">
            {t('terminal.lab_obs')}
          </p>
        </div>
        <Terminal />
      </div>
      <div className="max-w-6xl mx-auto px-8 mt-12 text-center">
        <a
          href="https://github.com/evertonvaz/minishell"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 bg-accent-green text-black font-mono font-bold rounded hover:bg-opacity-90 transition"
        >
          {t('terminal.github_link')}
        </a>
      </div>
    </section>
  );
};

export default TerminalPage;
