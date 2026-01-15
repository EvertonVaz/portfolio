import React, { useState } from 'react'
import Layout from './components/Layout'
import Terminal from './components/Terminal'
import Work from './components/Work'
import Hacklog from './components/Hacklog'

function Home() {
  return (
    <>
      {/* Home / Hero Section */}
      <section id="home" className="flex flex-col items-center justify-center p-8 text-center min-h-[90vh]">
        <div className="max-w-4xl w-full">
          {/* <h1 className="hero-title">
            code is<br />resistence
          </h1> */}

          <div className="flex items-center justify-center gap-6 mb-16">
            <span className="h-[2px] flex-1 bg-white opacity-20"></span>
            <p className="text-2xl md:text-3xl font-mono text-accent-green font-bold uppercase tracking-widest">
              born2code
            </p>
            <span className="h-[2px] flex-1 bg-white opacity-20"></span>
          </div>

          {/* <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="punk-card max-w-sm text-left group">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent-pink group-hover:h-full transition-all duration-500 opacity-10"></div>
              <p className="font-mono text-lg relative z-10 leading-tight">
                <span className="text-accent-pink font-bold text-sm block mb-1"># DISCIPLINE:</span>
                PUNK. HARDCORE. INDEPENDENT.
              </p>
            </div>

            <div className="punk-card max-w-sm text-left group">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent-green group-hover:h-full transition-all duration-500 opacity-10"></div>
              <p className="font-mono text-lg relative z-10 leading-tight">
                <span className="text-accent-green font-bold text-sm block mb-1"># LOGIC:</span>
                MATH. PHYSICS. FRACTALS.
              </p>
            </div>
          </div> */}
        </div>
      </section>

      {/* Terminal Section */}
      <section id="terminal" className="py-24 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="section-title">
            <span className="text-accent-green">_</span> terminal_lab
          </h2>
          <Terminal />
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="section-title">
            work.archives <span className="text-xs font-mono text-white/30">(03 items)</span>
          </h2>
          <Work />
        </div>
      </section>

      {/* Hacklog Section */}
      <section id="hacklog" className="py-24 bg-white/5 border-y border-white/10">
        <Hacklog />
      </section>

      {/* Contact Placeholder */}
      <section id="contact" className="py-32 flex flex-col items-center justify-center text-center">
        <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8">
          get in touch
        </h2>
        <a href="mailto:hello@born2code.me" className="text-2xl md:text-4xl font-mono text-accent-pink hover:bg-white hover:text-black px-4 transition-all">
          etovaz.web@google.com
        </a>
      </section>
      </>
    )
}

export default Home
