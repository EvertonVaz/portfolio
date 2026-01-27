import React from 'react';
import { useTranslation } from 'react-i18next';
import ArchitectureLayer from '../../../shared/ui/Architecture/ArchitectureLayer';
import ArchitectureConnector from '../../../shared/ui/Architecture/ArchitectureConnector';

/**
 * PhilosophersArchitecture - Explicação visual da estrutura do desafio de sincronização.
 */
const PhilosophersArchitecture = () => {
    const { t } = useTranslation();

    return (
        <div className="">
            {/* Título da Seção */}
            <div className="max-w-4xl mx-auto text-center mb-16">
                <div className="inline-block px-3 py-1 bg-punk-cyan/10 border border-punk-cyan/20 rounded-full mb-4">
                    <span className="text-[10px] font-mono text-punk-cyan uppercase tracking-[0.2em]">
                        technical_specs
                    </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 uppercase tracking-tighter">
                    {t('philosophers.architecture_title') || "Deadlock-Free Architecture"}
                </h3>
                <p className="text-white/50 font-mono text-xs italic max-w-lg mx-auto">
                    {t('philosophers.architecture_subtitle') || "A Triad of Safety: C, Elixir, and React"}
                </p>
            </div>

            {/* Diagrama de Arquitetura */}
            <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-10 md:gap-4 lg:gap-8 px-4">

                <ArchitectureLayer
                    title={t('philosophers.architecture_frontend')}
                    description={t('philosophers.architecture_desc_frontend')}
                    iconLabel="FE"
                    hexIndex="0x0A"
                    theme="cyan"
                    tags={['REACT', 'WEBSOCKET_JSON']}
                />

                <ArchitectureConnector
                    label="state_pulse_stream"
                    gradient="cyan-green"
                />

                <ArchitectureLayer
                    title={t('philosophers.architecture_bff')}
                    description={t('philosophers.architecture_desc_bff')}
                    iconLabel="SUP"
                    hexIndex="0x0B"
                    theme="green"
                    highlight={true}
                    tags={['ELIXIR', 'GENSERVER']}
                />

                <ArchitectureConnector
                    label="binary_port_pipe"
                    gradient="green-white"
                />

                <ArchitectureLayer
                    title={t('philosophers.architecture_core')}
                    description={t('philosophers.architecture_desc_core')}
                    iconLabel="OS"
                    hexIndex="0x0C"
                    theme="white"
                    tags={['C / POSIX', 'THREADS & MUTEX']}
                />

            </div>

            {/* Nota Informativa Inferior */}
            <div className="mt-16 max-w-2xl mx-auto p-4 bg-white/5 border-l-2 border-punk-cyan font-mono text-[10px] text-white/40 leading-relaxed uppercase tracking-tighter">
                {t('philosophers.architecture_info_footer')}
            </div>
        </div>
    );
};

export default PhilosophersArchitecture;
