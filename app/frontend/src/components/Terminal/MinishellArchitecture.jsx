import React from 'react';
import { useTranslation } from 'react-i18next';
import ArchitectureLayer from '../UI/Architecture/ArchitectureLayer';
import ArchitectureConnector from '../UI/Architecture/ArchitectureConnector';

/**
 * MinishellArchitecture - Explicação visual da estrutura do projeto.
 * Refatorado para usar componentes reutilizáveis (SRP).
 */
const MinishellArchitecture = () => {
    const { t } = useTranslation();

    return (
        <div className="py-16">
            {/* Título da Seção */}
            <div className="max-w-4xl mx-auto text-center mb-16">
                <div className="inline-block px-3 py-1 bg-accent-green/10 border border-accent-green/20 rounded-full mb-4">
                    <span className="text-[10px] font-mono text-accent-green uppercase tracking-[0.2em]">
                        technical_specs
                    </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 uppercase tracking-tighter">
                    {t('terminal.architecture_title')}
                </h3>
                <p className="text-white/50 font-mono text-xs italic max-w-lg mx-auto">
                    {t('terminal.architecture_subtitle')}
                </p>
            </div>

            {/* Diagrama de Arquitetura Reutilizável */}
            <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-10 md:gap-4 lg:gap-8 px-4">

                <ArchitectureLayer
                    title={t('terminal.architecture_frontend')}
                    description={t('terminal.architecture_desc_frontend')}
                    iconLabel="FE"
                    hexIndex="0x01"
                    theme="pink"
                    tags={['REACT', 'WEBSOCKET_API']}
                />

                <ArchitectureConnector
                    label="realtime_binary_stream"
                    gradient="pink-green"
                />

                <ArchitectureLayer
                    title={t('terminal.architecture_bff')}
                    description={t('terminal.architecture_desc_bff')}
                    iconLabel="BFF"
                    hexIndex="0x02"
                    theme="green"
                    highlight={true}
                    tags={['ELIXIR', 'PHOENIX_CHANNELS']}
                />

                <ArchitectureConnector
                    label="process_pipe_spawn"
                    gradient="green-white"
                />

                <ArchitectureLayer
                    title={t('terminal.architecture_core')}
                    description={t('terminal.architecture_desc_core')}
                    iconLabel="CORE"
                    hexIndex="0x03"
                    theme="white"
                    tags={['C / CLANG', 'UNIX_SYSTEM_CALLS']}
                />

            </div>

            {/* Nota Informativa Inferior */}
            <div className="mt-16 max-w-2xl mx-auto p-4 bg-white/5 border-l-2 border-accent-green font-mono text-[10px] text-white/40 leading-relaxed uppercase tracking-tighter">
                {t('terminal.architecture_info_footer')}
            </div>
        </div>
    );
};

export default MinishellArchitecture;
