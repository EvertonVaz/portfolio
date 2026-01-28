import React from 'react';
import { useTranslation } from 'react-i18next';
import Work from '../components/Work';

const WorkPage = () => {
  const { t } = useTranslation();

  return (
    <section className="">
      <Work />
    </section>
  );
};

export default WorkPage;
