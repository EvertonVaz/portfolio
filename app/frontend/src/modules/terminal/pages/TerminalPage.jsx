import React from 'react';
import { useTranslation } from 'react-i18next';
import Terminal from '../components/Terminal';
import MinishellArchitecture from '../components/MinishellArchitecture';
import { GithubCTA } from '../../../shared/ui/social/GithubCTA';
import ConnectionStatus from '../../../shared/ui/status/ConnectionStatus';
import { useTerminalSocket } from '../hooks/useTerminalSocket';

import ModuleHeader from '../../../shared/ui/layout/ModuleHeader';

/**
 * Página do TerminalLab.
 * SRP: Apenas orquestra o Cabeçalho, o Terminal e o CTA.
 */
const TerminalPage = () => {
  const { isConnected } = useTerminalSocket();

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-8">
        <ModuleHeader
          theme="terminal"
          titleKey="terminal.title"
          introKey="terminal.lab_description"
          obsKey="terminal.lab_obs"
        />

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
