import React from 'react';
import { useTranslation } from 'react-i18next';
import ArchitectureLayer from '../../../shared/ui/Architecture/ArchitectureLayer';
import ArchitectureConnector from '../../../shared/ui/Architecture/ArchitectureConnector';
import ArchitectureHeader from '../../../shared/ui/Architecture/ArchitectureHeader';
import InfoBox from '../../../shared/ui/info/InfoBox';

/**
 * MinishellArchitecture - Explicação visual da estrutura do projeto.
 * Refatorado para usar componentes reutilizáveis (SRP).
 */
const MinishellArchitecture = () => {
    const { t } = useTranslation();

    return (
        <div className="mt-20 mb-6">
            <ArchitectureHeader
                theme="terminal"
                subtitleKey="terminal.architecture_subtitle"
            />

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
            <InfoBox
                theme="terminal"
                contentKey="terminal.architecture_info_footer"
            />
        </div>
    );
};

export default MinishellArchitecture;
