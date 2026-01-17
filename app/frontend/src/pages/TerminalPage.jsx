import React from 'react';
import { useTranslation } from 'react-i18next';
import Terminal from '../components/Terminal/Terminal';

/**
 * Componente de Cabeçalho da página Terminal.
 */
const TerminalHeader = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto text-center mb-12">
      <h2 className="section-title">
        <span className="text-accent-green">_</span> terminal_lab
      </h2>
      <p className="font-mono text-white/80 mb-4">
        {t('terminal.lab_description')}
      </p>
      <p className="font-mono text-white/60 text-sm">
        {t('terminal.lab_obs')}
      </p>
    </div>
  );
};

/**
 * Componente de link para o GitHub no rodapé da seção.
 */
const GithubCTA = () => {
  const { t } = useTranslation();
  return (
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
  );
};

/**
 * Página do TerminalLab.
 * SRP: Apenas orquestra o Cabeçalho, o Terminal e o CTA.
 */
const TerminalPage = () => {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-8">
        <TerminalHeader />
        <Terminal />
        <GithubCTA />
      </div>
    </section>
  );
};

export default TerminalPage;
