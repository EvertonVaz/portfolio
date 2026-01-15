import React from 'react';
import Terminal from '../components/Terminal/Terminal';

const TerminalPage = () => {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-8">
        <h2 className="section-title">
          <span className="text-accent-green">_</span> terminal_lab
        </h2>
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="font-mono text-white/80 mb-4">
            Este projeto é uma implementação de um shell Unix minimalista desenvolvido em C,
            como parte do currículo da 42. O objetivo é replicar o funcionamento básico do Bash,
            lidando com a leitura de comandos, parsing, execução e gerenciamento de processos.
          </p>
          <p className="font-mono text-white/60 text-sm">
            Obs.: Poucos comandos estão liberados no backend, digite help para ver a lista completa.
          </p>
        </div>
        <Terminal />
      </div>
    </section>
  );
};

export default TerminalPage;
