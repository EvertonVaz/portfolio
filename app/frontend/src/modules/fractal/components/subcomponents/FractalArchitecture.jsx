import React from 'react';
import { useTranslation } from 'react-i18next';
import ArchitectureLayer from '../../../../shared/ui/Architecture/ArchitectureLayer';
import ArchitectureConnector from '../../../../shared/ui/Architecture/ArchitectureConnector';

/**
 * FractalArchitecture - Explicação visual da estrutura do projeto de Fractais.
 */
const FractalArchitecture = () => {
    const { t } = useTranslation();

    return (
        <div className="py-16">
            {/* Título da Seção */}
            <div className="max-w-4xl mx-auto text-center mb-16">
                <div className="inline-block px-3 py-1 bg-accent-blue/10 border border-accent-blue/20 rounded-full mb-4">
                    <span className="text-[10px] font-mono text-accent-blue uppercase tracking-[0.2em]">
                        graphics_pipeline
                    </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 uppercase tracking-tighter">
                    {t('fractals.architecture_title')}
                </h3>
                <p className="text-white/50 font-mono text-xs italic max-w-lg mx-auto">
                    {t('fractals.architecture_subtitle')}
                </p>
            </div>

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
            <div className="mt-16 max-w-2xl mx-auto p-4 bg-white/5 border-l-2 border-accent-blue font-mono text-[10px] text-white/40 leading-relaxed uppercase tracking-tighter text-justify">
                {t('fractals.architecture_info_footer')}
            </div>
        </div>
    );
};

export default FractalArchitecture;
