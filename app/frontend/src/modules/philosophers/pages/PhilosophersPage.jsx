import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePhilosophersSocket } from '../hooks/usePhilosophersSocket';
import PhilosopherCard from '../components/PhilosopherCard';
import SimulationControl from '../components/SimulationControl';
import LogStream from '../components/LogStream';
import { motion } from 'framer-motion';
import ConnectionStatus from '../../../shared/ui/status/ConnectionStatus';

export default function PhilosophersPage() {
    const { t } = useTranslation();
    const { isConnected, startSimulation, logs, philosophers } = usePhilosophersSocket();

    return (
        <div className="min-h-screen bg-black text-gray-200 p-6 md:p-12 font-sans pt-24">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Monitoring Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-end border-b border-gray-800 pb-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500">
                                {t('philosophers.title')}
                            </h1>
                            <p className="text-gray-500 font-mono text-sm mt-1">
                                {t('philosophers.subtitle')}
                            </p>
                        </div>
                        <ConnectionStatus isConnected={isConnected} />
                    </div>

                    {/* Grid of Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.values(philosophers).map(philo => (
                            <PhilosopherCard key={philo.id} data={philo} />
                        ))}
                        {Object.keys(philosophers).length === 0 && (
                            <div className="col-span-2 h-64 flex items-center justify-center border border-dashed border-gray-800 rounded-lg text-gray-600 font-mono text-sm">
                                {t('philosophers.no_processes')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Controls & Logs */}
                <div className="space-y-6">
                    <SimulationControl onStart={startSimulation} disabled={!isConnected} />
                    <LogStream logs={logs} />

                    <div className="p-4 rounded border border-gray-800 bg-gray-900/30 text-xs font-mono text-gray-500">
                        <h4 className="uppercase tracking-wider mb-2 text-gray-400">{t('philosophers.legend_title')}</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> {t('philosophers.legend_thinking')}</span>
                            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> {t('philosophers.legend_eating')}</span>
                            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> {t('philosophers.legend_waiting')}</span>
                            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span> {t('philosophers.legend_terminated')}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
