import React from 'react';
import { useTranslation } from 'react-i18next';
import ArchitectureLayer from '../../../../shared/ui/Architecture/ArchitectureLayer';
import ArchitectureConnector from '../../../../shared/ui/Architecture/ArchitectureConnector';
import ArchitectureHeader from '../../../../shared/ui/Architecture/ArchitectureHeader';
import InfoBox from '../../../../shared/ui/info/InfoBox';

/**
 * FractalArchitecture - Explicação visual da estrutura do projeto de Fractais.
 */
const FractalArchitecture = () => {
    const { t } = useTranslation();

    return (
        <div className="mt-20 mb-6">
            <ArchitectureHeader
                theme="fractals"
                subtitleKey="fractals.architecture_subtitle"
            />

            {/* Diagrama de Arquitetura Reutilizável */}
            <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-10 md:gap-4 lg:gap-8 px-4">

                <ArchitectureLayer
                    title={t('fractals.architecture_frontend')}
                    description={t('fractals.architecture_desc_frontend')}
                    iconLabel="UI"
                    hexIndex="0x01"
                    theme="pink"
                    tags={['REACT', 'HOOKS', 'CONTEXT']}
                />

                <ArchitectureConnector
                    label="param_uniform_stream"
                    gradient="pink-green"
                />

                <ArchitectureLayer
                    title={t('fractals.architecture_engine')}
                    description={t('fractals.architecture_desc_engine')}
                    iconLabel="GPU"
                    hexIndex="0x02"
                    theme="green"
                    highlight={true}
                    tags={['GLSL', 'WEBGL', 'FP64_EMU']}
                />

                <ArchitectureConnector
                    label="legacy_transition"
                    gradient="green-white"
                />

                <ArchitectureLayer
                    title={t('fractals.architecture_core')}
                    description={t('fractals.architecture_desc_core')}
                    iconLabel="C"
                    hexIndex="0x03"
                    theme="white"
                    tags={['C / CLANG', 'MINILIBX', 'MATH']}
                />

            </div>

            {/* Nota Informativa Inferior */}
            <InfoBox
                theme="fractals"
                contentKey="fractals.architecture_info_footer"
            />
        </div>
    );
};

export default FractalArchitecture;
