import React from 'react';
import { useTranslation } from 'react-i18next';
import Work from '../components/Work';

const WorkPage = () => {
  const { t } = useTranslation();

  return (
    <section className="">
      <div className="max-w-6xl mx-auto px-8">
        <h2 className="section-title">
          {t('work.title')} <span className="text-xs font-mono text-white/30">{t('work.items_count', { count: 3 })}</span>
        </h2>
        <Work />
      </div>
    </section>
  );
};

export default WorkPage;
