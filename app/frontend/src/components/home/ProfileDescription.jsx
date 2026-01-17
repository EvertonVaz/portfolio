import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';

const ProfileDescription = () => {
    const { t } = useTranslation();

    return (
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 font-mono leading-relaxed">
            <Trans i18nKey="hero.description">
                Engenheiro de Software apaixonado por sistemas complexos, <span className="text-accent-pink font-bold italic">fractais</span> e a
                estética da cultura <span className="text-accent-green font-bold">indie</span>. Ex-empreendedor com olhar pragmático e curioso,
                explorando a interseção entre tecnologia, ciência e filosofia para construir soluções de impacto.
            </Trans>
        </p>
    );
};

export default ProfileDescription;
