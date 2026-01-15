import React from 'react';
import Work from '../components/Work';

const WorkPage = () => {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-8">
        <h2 className="section-title">
          work.archives <span className="text-xs font-mono text-white/30">(03 items)</span>
        </h2>
        <Work />
      </div>
    </section>
  );
};

export default WorkPage;
