import React from 'react';
import { useTranslation } from 'react-i18next';
import Terminal from '../components/Terminal';
import { GithubCTA } from '../../../shared/ui/GithubCTA';
import MinishellArchitecture from '../components/MinishellArchitecture';

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
 * Página do TerminalLab.
 * SRP: Apenas orquestra o Cabeçalho, o Terminal e o CTA.
 */
const TerminalPage = () => {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-8">
        <TerminalHeader />
        <Terminal />
        <MinishellArchitecture />
        <GithubCTA url="https://github.com/evertonvaz/minishell" />
      </div>
    </section>
  );
};

export default TerminalPage;
