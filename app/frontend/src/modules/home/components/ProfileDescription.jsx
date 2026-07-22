import React from 'react';
import { Trans } from 'react-i18next';

const ProfileDescription = () => {

    return (
        <div className="max-w-2xl mx-auto mb-12 flex flex-col gap-6">
            {/* Creative Bio */}
            <p className="text-lg md:text-xl text-white/70 font-mono leading-relaxed">
                <Trans i18nKey="hero.description">
                    Engenheiro de Software apaixonado por sistemas complexos, <span className="text-accent-pink font-bold italic">fractais</span> e a
                    estética da cultura <span className="text-accent-green font-bold">indie</span>. Ex-empreendedor com olhar pragmático e curioso,
                    explorando a interseção entre tecnologia, ciência e filosofia para construir soluções de impacto.
                </Trans>
            </p>

            {/* Professional Bio */}
            <div className="h-px w-12 bg-accent-green/30 self-center md:self-start"></div>

            <p className="text-sm md:text-base text-white/50 font-mono leading-relaxed border-l-2 border-accent-green/20 pl-6">
                <Trans i18nKey="hero.professional_desc">
                    Desenvolvedor backend. No último ano, atuei como fullstack construindo uma plataforma de educação e empregabilidade para a <span className="text-accent-green">ONG Despertar</span>. Formado pela <span className="text-white">42 São Paulo</span>.
                </Trans>
            </p>
        </div>
    );
};

export default ProfileDescription;
