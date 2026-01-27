import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePhilosophersSocket } from '../hooks/usePhilosophersSocket';
import PhilosopherCard from '../components/PhilosopherCard';
import SimulationControl from '../components/SimulationControl';
import PhilosophersArchitecture from '../components/PhilosophersArchitecture';
import { GithubCTA } from '../../../shared/ui/social/GithubCTA';
import ConnectionStatus from '../../../shared/ui/status/ConnectionStatus';
import ScrollSection from '../../../shared/ui/ScrollSection';

/**
 * Cabeçalho estilizado para PhilosophersLab.
 */
const PhilosophersHeader = () => {
    const { t } = useTranslation();
    return (
        <div className="max-w-3xl mx-auto text-center mb-12 relative">
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-[100px] font-black text-white/5 pointer-events-none select-none uppercase tracking-tighter">
                Logic
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-6 flex items-center justify-center gap-4 text-punk-cyan tracking-tighter">
                <span className="animate-pulse">/</span> philosophers_lab
            </h2>
            <div className="punk-card-glass p-6 border-l-4 border-l-punk-cyan text-left mb-4">
                <p className="font-mono text-white/80 text-sm leading-relaxed mb-4">
                    {t('philosophers.lab_intro') || "O Dilema dos Filósofos Comilões é uma metáfora sobre a coexistência digital. Proposto por Dijkstra em '65, este quebra-cabeça de sincronização revela a fragilidade dos sistemas quando o egoísmo do recurso gera o silêncio do deadlock. Aqui, cada clique é um processo, cada garfo é um semáforo, e a sobrevivência depende da elegância do algoritmo contra a fome eterna."}
                </p>
                <p className="font-mono text-punk-cyan/60 text-[10px] uppercase tracking-[0.2em]">
                    // {t('philosophers.lab_obs') || "OS_SINC_CHALLENGE // C_LANGUAGE_IMPLEMENTATION"}
                </p>
            </div>
        </div>
    );
};

export default function PhilosophersPage() {
    const { t } = useTranslation();
    const { isConnected, startSimulation, philosophers } = usePhilosophersSocket();

    return (
        <ScrollSection id="philosophers" className="py-24 text-white">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <PhilosophersHeader />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-24">

                    {/* Monitoring Grid - Left (wider) or Top */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-punk-cyan shadow-[0_0_8px_var(--color-punk-cyan)]"></div>
                                <h4 className="font-mono text-xs uppercase tracking-widest text-white/60">
                                    {t('philosophers.monitoring_status') || "Real-time Monitoring"}
                                </h4>
                            </div>
                            <ConnectionStatus isConnected={isConnected} />
                        </div>

                        {/* Philosophers Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(() => {
                                const philosopherList = Object.values(philosophers);
                                const anyDead = philosopherList.some(p => p.status === 'dead');
                                return philosopherList.map(philo => (
                                    <PhilosopherCard
                                        key={philo.id}
                                        data={philo}
                                        simulationStopped={anyDead}
                                    />
                                ));
                            })()}
                            {Object.keys(philosophers).length === 0 && (
                                <div className="col-span-2 punk-card-glass h-64 flex flex-col items-center justify-center text-white/20 border-dashed border-white/10">
                                    <span className="font-mono text-xs uppercase tracking-[0.3em] mb-4">
                                        {t('philosophers.no_processes')}
                                    </span>
                                    <div className="w-12 h-[1px] bg-white/10"></div>
                                </div>
                            )}
                        </div>

                        {/* Legend section */}
                        <div className="punk-card-glass p-6 bg-punk-bg/40">
                            <h4 className="font-mono text-[10px] uppercase tracking-widest mb-4 text-white/40 border-b border-white/5 pb-2">
                                {t('philosophers.legend_title')}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 font-mono text-[9px] uppercase tracking-widest text-white/60">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 bg-punk-cyan shadow-[0_0_5px_var(--color-punk-cyan)]"></span> {t('philosophers.legend_thinking')}</span>
                                <span className="flex items-center gap-2"><span className="w-2 h-2 bg-punk-green shadow-[0_0_5px_var(--color-punk-green)]"></span> {t('philosophers.legend_eating')}</span>
                                <span className="flex items-center gap-2"><span className="w-2 h-2 bg-punk-pink shadow-[0_0_5px_var(--color-punk-pink)]"></span> {t('philosophers.legend_sleeping')}</span>
                                <span className="flex items-center gap-2"><span className="w-2 h-2 bg-punk-green shadow-[0_0_5px_var(--color-punk-green)]"></span> {t('philosophers.legend_terminated') || 'SATISFIED'}</span>
                                <span className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span> {t('philosophers.legend_died') || 'DIED'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Controls */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        <SimulationControl onStart={startSimulation} disabled={!isConnected} />
                    </div>

                </div>

                {/* Technical Specs & Github Area */}
                <PhilosophersArchitecture />
                <GithubCTA url="https://github.com/evertonvaz/philosophers" />
            </div>
        </ScrollSection>
    );
}
