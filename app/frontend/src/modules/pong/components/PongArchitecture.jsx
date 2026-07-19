import React from 'react';
import { useTranslation } from 'react-i18next';
import ArchitectureLayer from '../../../shared/ui/Architecture/ArchitectureLayer';
import ArchitectureConnector from '../../../shared/ui/Architecture/ArchitectureConnector';
import ArchitectureHeader from '../../../shared/ui/Architecture/ArchitectureHeader';
import InfoBox from '../../../shared/ui/info/InfoBox';

/**
 * PongArchitecture - Estrutura do projeto Pong: React ↔ Elixir ↔ IA em Python.
 */
const PongArchitecture = () => {
    const { t } = useTranslation();

    return (
        <div className="mt-20 mb-6">
            <ArchitectureHeader
                theme="pong"
                subtitleKey="pong.architecture_subtitle"
            />

            {/* Diagrama de Arquitetura Reutilizável */}
            <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-10 md:gap-4 lg:gap-8 px-4">

                <ArchitectureLayer
                    title={t('pong.architecture_frontend')}
                    description={t('pong.architecture_desc_frontend')}
                    iconLabel="UI"
                    hexIndex="0x01"
                    theme="pink"
                    tags={['REACT', 'CANVAS', 'CHANNELS']}
                />

                <ArchitectureConnector
                    label="phoenix_channels"
                    gradient="pink-green"
                />

                <ArchitectureLayer
                    title={t('pong.architecture_backend')}
                    description={t('pong.architecture_desc_backend')}
                    iconLabel="EX"
                    hexIndex="0x02"
                    theme="green"
                    highlight={true}
                    tags={['ELIXIR', 'GENSERVER', 'RABBITMQ']}
                />

                <ArchitectureConnector
                    label="amqp_bridge"
                    gradient="green-white"
                />

                <ArchitectureLayer
                    title={t('pong.architecture_ai')}
                    description={t('pong.architecture_desc_ai')}
                    iconLabel="AI"
                    hexIndex="0x03"
                    theme="white"
                    tags={['PYTHON', 'PYTORCH', 'GA / PPO']}
                />

            </div>

            {/* Nota Informativa Inferior */}
            <InfoBox
                theme="pong"
                contentKey="pong.architecture_info_footer"
            />
        </div>
    );
};

export default PongArchitecture;
