import React from 'react';
import { useTranslation } from 'react-i18next';
import ArchitectureLayer from '../../../shared/ui/Architecture/ArchitectureLayer';
import ArchitectureConnector from '../../../shared/ui/Architecture/ArchitectureConnector';
import ArchitectureHeader from '../../../shared/ui/Architecture/ArchitectureHeader';
import InfoBox from '../../../shared/ui/info/InfoBox';

/**
 * PhilosophersArchitecture - Explicação visual da estrutura do desafio de sincronização.
 */
const PhilosophersArchitecture = () => {
    const { t } = useTranslation();

    return (
        <div className="">
            <ArchitectureHeader
                theme="philosophers"
                subtitleKey="philosophers.architecture_subtitle"
            />

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
            <InfoBox
                theme="philosophers"
                contentKey="philosophers.architecture_info_footer"
            />
        </div>
    );
};

export default PhilosophersArchitecture;
