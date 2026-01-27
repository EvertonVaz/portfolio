import React from 'react';
import { useTranslation } from 'react-i18next';
import Terminal from '../components/Terminal';
import MinishellArchitecture from '../components/MinishellArchitecture';
import { GithubCTA } from '../../../shared/ui/social/GithubCTA';
import ConnectionStatus from '../../../shared/ui/status/ConnectionStatus';
import { useTerminalSocket } from '../hooks/useTerminalSocket';

/**
 * Componente de Cabeçalho da página Terminal.
 */
const TerminalHeader = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto text-center mb-4 relative">
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-[120px] font-black text-white/5 pointer-events-none select-none">
        TERM
      </div>
      <h2 className="text-4xl md:text-5xl font-black uppercase mb-6 flex items-center justify-center gap-4 text-punk-green tracking-tighter">
        <span className="animate-pulse">_</span> terminal_lab
      </h2>
      <p className="font-mono text-white/80 mb-4 text-lg border-l-2 border-punk-green pl-4 text-left md:text-center md:border-l-0 md:border-b-2 md:pb-4 border-white/10 inline-block">
        {t('terminal.lab_description')}
      </p>
      <p className="font-mono text-punk-green/60 text-xs uppercase tracking-widest mt-2">
        // {t('terminal.lab_obs')}
      </p>
    </div>
  );
};

/**
 * Página do TerminalLab.
 * SRP: Apenas orquestra o Cabeçalho, o Terminal e o CTA.
 */
const TerminalPage = () => {
  const { isConnected } = useTerminalSocket();

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-8">
        <TerminalHeader />

        <div className="flex justify-center">
          <ConnectionStatus isConnected={isConnected} />
        </div>

        <Terminal />
        <MinishellArchitecture />
        <GithubCTA url="https://github.com/evertonvaz/minishell" />
      </div>
    </section>
  );
};

export default TerminalPage;
