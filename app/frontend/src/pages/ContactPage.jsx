import React from 'react';

const ContactPage = () => {
  return (
    <section className="py-32 flex flex-col items-center justify-center text-center">
      <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8">
        get in touch
      </h2>
      <a href="mailto:etovaz.web@google.com" className="text-2xl md:text-4xl font-mono text-accent-pink hover:bg-white hover:text-black px-4 transition-all">
        etovaz.web@google.com
      </a>
    </section>
  );
};

export default ContactPage;
