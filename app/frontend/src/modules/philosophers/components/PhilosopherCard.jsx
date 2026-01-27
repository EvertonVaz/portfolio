import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Brain, Utensils, Moon, Skull, CheckCircle2 } from 'lucide-react';

export default function PhilosopherCard({ data, simulationStopped }) {
    const { t } = useTranslation();
    const { id, status, lastAction } = data;

    const STATUS_CONFIG = {
        thinking: { color: 'text-punk-cyan', border: 'border-punk-cyan/20', glow: 'shadow-[0_0_10px_rgba(0,255,255,0.1)]', icon: Brain, label: t('philosophers.card_status_thinking') },
        eating: { color: 'text-punk-green', border: 'border-punk-green/30', glow: 'shadow-[0_0_15px_rgba(57,255,20,0.2)]', icon: Utensils, label: t('philosophers.card_status_eating') },
        sleeping: { color: 'text-punk-pink', border: 'border-punk-pink/20', glow: 'shadow-[0_0_10px_rgba(255,0,255,0.1)]', icon: Moon, label: t('philosophers.card_status_sleeping') },
        dead: { color: 'text-red-500', border: 'border-red-500/50', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]', icon: Skull, label: t('philosophers.card_status_dead') },
        satisfied: { color: 'text-punk-green', border: 'border-punk-green/50', glow: 'shadow-[0_0_20px_rgba(57,255,20,0.3)]', icon: CheckCircle2, label: t('philosophers.card_status_satisfied') }
    };

    const config = STATUS_CONFIG[status] || STATUS_CONFIG.thinking;
    const Icon = config.icon;

    // Movement stops if global simulation stopped, or if self is dead/satisfied
    const isStationary = simulationStopped || status === 'dead' || status === 'satisfied';
    const isEating = status === 'eating' && !isStationary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative p-5 punk-card-glass ${config.border} border bg-punk-bg/60 ${config.glow} transition-all duration-500 group overflow-hidden ${simulationStopped && status !== 'dead' && 'grayscale-[0.5] opacity-80'}`}
        >
            {/* Visual scanline effect for active eating/dead philosophers */}
            {(status === 'eating' || status === 'dead' || status === 'satisfied') && (
                <div className={`absolute inset-0 pointer-events-none opacity-[0.05] ${status === 'dead' ? 'bg-red-500/10' : 'bg-punk-cyan/5'} scanline`}></div>
            )}

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-1">Process_Node</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-white">0{id}</span>
                        <div className={`px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest border ${config.border} ${config.color} bg-black/40 shadow-inner`}>
                            {config.label}
                        </div>
                    </div>
                </div>
                <div className={`p-2 rounded-lg bg-black/40 border ${config.border} transition-transform duration-300 ${isEating ? 'scale-110 shadow-[0_0_10px_rgba(0,255,0,0.2)]' : ''}`}>
                    <Icon className={`w-4 h-4 ${config.color} ${isEating && 'animate-bounce'}`} />
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                <div className="h-[3px] w-full bg-white/5 overflow-hidden rounded-full">
                    <motion.div
                        className={`h-full ${config.color.replace('text-', 'bg-')}`}
                        animate={{
                            x: isEating ? ['-100%', '100%'] : '0%',
                            opacity: isEating ? [0.6, 1, 0.6] : 1
                        }}
                        transition={{
                            x: { duration: 0.8, repeat: isEating ? Infinity : 0, ease: "linear" },
                            opacity: { duration: 1.2, repeat: isEating ? Infinity : 0 }
                        }}
                        style={{ width: '100%' }}
                    />
                </div>
                <p className={`text-[10px] font-mono ${status === 'dead' ? 'text-red-400' : config.color} opacity-70 truncate italic`}>
                    {"> "} {lastAction || t('philosophers.card_initializing')}
                </p>
            </div>
        </motion.div>
    );
}
